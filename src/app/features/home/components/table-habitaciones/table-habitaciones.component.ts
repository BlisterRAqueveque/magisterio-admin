import { AuthService } from '@/app/core';
import { AddButtonComponent } from '@/app/shared/add-button/add-button.component';
import { DialogService } from '@/app/shared/confirm-dialog/dialog.service';
import { InputComponent } from '@/app/shared/input/input.component';
import { LoaderService } from '@/app/shared/loader/loader.service';
import { PresentModal } from '@/app/shared/modal/present-modal.component';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HabitacionI, CasaMutualI } from '../../models';
import { HabitacionesService, CasasMutualesService } from '../../service';
import { UsuarioI } from '@/app/features/login/models';

@Component({
  selector: 'm-table-habitaciones',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    CommonModule,
    AddButtonComponent,
    DialogModule,
    InputComponent,
    TooltipModule,
    SidebarModule,
    PresentModal,
    DropdownModule,
    AutoCompleteModule,
  ],
  templateUrl: './table-habitaciones.component.html',
  styleUrl: './table-habitaciones.component.css',
})
export class TableHabitacionesComponent {
  private readonly service = inject(HabitacionesService);
  private readonly auth = inject(AuthService);
  private readonly casaService = inject(CasasMutualesService);

  usuario!: UsuarioI | null;

  visible = false;

  habitaciones: HabitacionI[] = [];
  habitaciones_deletes: HabitacionI[] = [];

  casas_mutuales: CasaMutualI[] = [];
  //selected_casa!: CasaMutualI;

  params = new HttpParams();

  async ngAfterViewInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 5);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();

    /** Obtenemos las casas mutuales */
    this.casaService.getAll().subscribe((data) => {
      this.casas_mutuales = data.result;
    });
    /** Obtenemos los registros eliminados */
    this.service.getDeletes().subscribe((data) => {
      this.habitaciones_deletes = data;
    });
  }

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;

    this.service.getAll(this.params).subscribe({
      next: (data) => {
        this.habitaciones = data.result;
        this.totalRecords = data.count;
        this.table.loading = false;
      },
      error: (e) => {
        this.table.loading = false;
        console.error(e);
      },
    });
  }

  filter(ev: any) {
    this.params = this.params.set(ev.key, ev.value);
    this.getHistoric();
  }

  first: number = 0;

  rows: number = 5;

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.params = this.params.set('page', event.page + 1);
    this.params = this.params.set('perPage', event.rows);
    this.getHistoric();
  }

  onSort(ev: any) {
    switch (ev.order) {
      case 1: {
        if (this.params.get('sortBy') !== 'ASC') {
          this.params = this.params.set('sortBy', 'ASC');
          this.getHistoric();
        }
        break;
      }
      case -1: {
        if (this.params.get('sortBy') !== 'DESC') {
          this.params = this.params.set('sortBy', 'DESC');
          this.getHistoric();
        }
        break;
      }
    }
  }

  returnMapData(data: string[]) {
    return data.join(', ');
  }

  //! AUTOCOMPLETE METHODS -------------------------------------------------------------->
  suggestions: string[] = [];
  search(event: AutoCompleteCompleteEvent) {
    this.suggestions = [event.query];
  }
  //! AUTOCOMPLETE METHODS -------------------------------------------------------------->

  //! DIALOG METHODS -------------------------------------------------------------------->
  habitacion: HabitacionI | undefined;
  otherAction = false;
  onRowSelect(item: any) {
    if (!this.otherAction) {
      this.visible = true;
      this.habitacion = item;
      if (this.habitacion) {
        this.nombre = this.habitacion.nombre;
        this.servicios = this.habitacion.servicios;
        this.casa_mutual = this.casas_mutuales.find(
          (c) => c.id === this.habitacion?.casa_mutual.id
        );
        this.activo = this.habitacion.activo;
        this.habitacion.ediciones.forEach((e) => {
          if (e.descripcion.includes(' | antes: ')) {
            const jsonData = e.descripcion.split(' | antes: ');
            e.descripcion = jsonData[0];
            e.objeto = JSON.parse(jsonData[1]);
          }
        });
      }
    }
    this.otherAction = false;
  }

  resetValues() {
    this.habitacion = undefined;
    this.nombre = undefined;
    this.servicios = undefined;
    this.activo = undefined;
    this.casa_mutual = undefined;
  }
  //! DIALOG METHODS -------------------------------------------------------------------->

  //! UPLOAD METHODS --------------------------------------------------------------------->
  nombre: string | undefined;
  servicios: string[] | undefined;
  casa_mutual: CasaMutualI | undefined;
  activo: boolean | undefined;

  private readonly dialog = inject(DialogService);
  private readonly loader = inject(LoaderService);
  error = false;
  save() {
    if (this.nombre) {
      this.error = false;
      this.dialog.present(
        'Confirmación de carga',
        '¿Está seguro/a de dar de alta la siguiente habitación?',
        () => {
          this.loader.present();
          this.onSave();
        }
      );
    } else {
      this.error = true;
    }
  }
  onSave() {
    const newHabitacion: Partial<HabitacionI> = {
      nombre: this.nombre!,
      servicios: this.servicios!,
      casa_mutual: this.casa_mutual,
      ediciones: [
        {
          descripcion: `Creado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
      creado_por: this.usuario!,
    };
    this.service.save(newHabitacion).subscribe({
      next: (data) => {
        this.habitaciones.push(data);
        this.loader.dismiss();
        setTimeout(() => {
          this.dialog.confirmAction(
            'Confirmación de carga',
            'El registro fue cargado correctamente',
            () => {
              this.visible = false;
            }
          );
        }, 100);
      },
      error: (e) => {
        console.error(e);
        this.loader.dismiss();
        setTimeout(() => {
          this.dialog.error(
            'Error de carga',
            'Ocurrió un error durante la carga.',
            () => {}
          );
        }, 100);
      },
    });
  }
  //! UPLOAD METHODS --------------------------------------------------------------------->

  //! UPDATE METHODS --------------------------------------------------------------------->
  edit() {
    this.dialog.present(
      'Confirmación de carga',
      '¿Está seguro/a de modificar la siguiente habitación?',
      () => {
        this.loader.present();
        this.onEdit();
      }
    );
  }
  onEdit() {
    const { ediciones, ...oldHabitacion } = this.habitacion!;
    const editHabitacion: Partial<HabitacionI> = {
      id: this.habitacion?.id,
      nombre: this.nombre!,
      servicios: this.servicios!,
      casa_mutual: this.casa_mutual,
      ediciones: [
        {
          descripcion: `Editado por: ${
            this.usuario?.nombre_completo
          } | antes: ${JSON.stringify(oldHabitacion)}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.update(editHabitacion).subscribe({
      next: (data) => {
        const a = this.habitaciones.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.habitacion = data;
        this.loader.dismiss();
        setTimeout(() => {
          this.dialog.confirmAction(
            'Confirmación de carga',
            'El registro fue editado correctamente',
            () => {
              this.visible = false;
            }
          );
        }, 100);
      },
      error: (e) => {
        console.error(e);
        this.loader.dismiss();
        if (e.error ? e.error.statusCode === 404 : false) {
          setTimeout(() => {
            this.dialog.error(
              'Error de carga',
              'No existe el registro en nuestros datos.',
              () => {}
            );
          }, 100);
        } else {
          setTimeout(() => {
            this.dialog.error(
              'Error de carga',
              'Ocurrió un error durante la carga.',
              () => {}
            );
          }, 100);
        }
      },
    });
  }
  //! UPDATE METHODS --------------------------------------------------------------------->

  //! ACTIVATE METHODS ------------------------------------------------------------------->
  changeState(activo: boolean, id: number) {
    this.dialog.present(
      'Confirmación de carga',
      `¿Está seguro/a de ${activo ? 'desactivar' : 'activar'} este registro?\n
      Tenga en cuenta que dependiendo del estado, este se muestra en las aplicaciones o no.`,
      () => {
        this.onChangeState(activo, id);
      }
    );
  }
  onChangeState(activo: boolean, id: number) {
    this.loader.present();
    const editHabitacion: Partial<HabitacionI> = {
      id,
      activo: !activo,
      ediciones: [
        {
          descripcion: `${activo ? 'Desactivado' : 'Activado'} por: ${
            this.usuario?.nombre_completo
          }`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.update(editHabitacion).subscribe({
      next: (data) => {
        const a = this.habitaciones.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.loader.dismiss();
        setTimeout(() => {
          this.dialog.confirmAction(
            'Confirmación de carga',
            `El registro fue ${
              activo ? 'desactivado' : 'activado'
            } correctamente`,
            () => {
              this.visible = false;
            }
          );
        }, 100);
      },
      error: (e) => {
        console.error(e);
        this.loader.dismiss();
        if (e.error ? e.error.statusCode === 404 : false) {
          setTimeout(() => {
            this.dialog.error(
              'Error de carga',
              'No existe el registro en nuestros datos.',
              () => {}
            );
          }, 100);
        } else {
          setTimeout(() => {
            this.dialog.error(
              'Error de carga',
              'Ocurrió un error durante la carga.',
              () => {}
            );
          }, 100);
        }
      },
    });
  }
  //! ACTIVATE METHODS ------------------------------------------------------------------->

  //! DELETE METHODS --------------------------------------------------------------------->
  softDelete(habitacion: HabitacionI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de eliminar este registro?\n
      Tenga en cuenta que no se perderán los datos, pero el registro no se podrá recuperar para seguir utilizándose.`,
      () => {
        this.onSoftDelete(habitacion);
      }
    );
  }
  onSoftDelete(habitacion: HabitacionI) {
    this.loader.present();
    this.service.softDelete(habitacion).subscribe({
      next: (data) => {
        this.loader.dismiss();
        const habitacionDelete = this.habitaciones.find(
          (c) => c.id === habitacion.id
        );
        if (habitacionDelete) this.habitaciones_deletes.push(habitacionDelete);
        this.habitaciones = this.habitaciones.filter(
          (c) => c.id !== habitacion.id
        );
        setTimeout(() => {
          this.dialog.confirmAction(
            'Confirmación de carga',
            `El registro fue eliminado correctamente`,
            () => {
              this.visible = false;
            }
          );
        }, 100);
      },
      error: (e) => {
        console.error(e);
        this.loader.dismiss();
        if (e.error ? e.error.statusCode === 404 : false) {
          setTimeout(() => {
            this.dialog.error(
              'Error de carga',
              'No existe el registro en nuestros datos.',
              () => {}
            );
          }, 100);
        } else {
          setTimeout(() => {
            this.dialog.error(
              'Error de carga',
              'Ocurrió un error durante la carga.',
              () => {}
            );
          }, 100);
        }
      },
    });
  }

  sidebarVisible = false;
  restore(habitacion: HabitacionI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de restaurar este registro?\n
      Tenga en cuenta que los datos relacionados también se restauraran.`,
      () => {
        this.onRestore(habitacion);
      }
    );
  }
  onRestore(habitacion: HabitacionI) {
    this.loader.present();
    const restoreHabitacion: Partial<HabitacionI> = {
      id: habitacion.id,
      ediciones: [
        {
          descripcion: `Restaurado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.restore(restoreHabitacion).subscribe({
      next: (data) => {
        this.loader.dismiss();
        this.habitaciones_deletes = this.habitaciones.filter(
          (c) => c.id !== habitacion.id
        );
        this.habitaciones.unshift(data);
        setTimeout(() => {
          this.dialog.confirmAction(
            'Confirmación de carga',
            `El registro fue restaurado correctamente`,
            () => {
              this.visible = false;
            }
          );
        }, 100);
      },
      error: (e) => {
        console.error(e);
        this.loader.dismiss();
        if (e.error ? e.error.statusCode === 404 : false) {
          setTimeout(() => {
            this.dialog.error(
              'Error de carga',
              'No existe el registro en nuestros datos.',
              () => {}
            );
          }, 100);
        } else {
          setTimeout(() => {
            this.dialog.error(
              'Error de carga',
              'Ocurrió un error durante la carga.',
              () => {}
            );
          }, 100);
        }
      },
    });
  }
  //! DELETE METHODS --------------------------------------------------------------------->

  habitacionOld: HabitacionI | undefined;
}
