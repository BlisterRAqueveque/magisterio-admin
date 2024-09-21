import { Component, inject, ViewChild } from '@angular/core';
import { JuntaService } from '../../service';
import { AuthService } from '@/app/core';
import { UsuarioI } from '@/app/features/login/models';
import { JuntaFiscalizacionI } from '../../models';
import { HttpParams } from '@angular/common/http';
import { Table, TableModule } from 'primeng/table';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import {
  AddButtonComponent,
  InputComponent,
  PresentModal,
  LoaderService,
  DialogService,
} from '@/app/shared';

@Component({
  selector: 'm-table-junta',
  standalone: true,
  imports: [
    PaginatorModule,
    TableModule,
    TooltipModule,
    CommonModule,
    AddButtonComponent,
    DialogModule,
    InputComponent,
    SidebarModule,
    PresentModal,
  ],
  templateUrl: './table-junta.component.html',
  styleUrl: './table-junta.component.css',
})
export class TableJuntaComponent {
  private readonly service = inject(JuntaService);
  private readonly auth = inject(AuthService);

  usuario!: UsuarioI | null;

  visible = false;

  juntas: JuntaFiscalizacionI[] = [];
  juntas_deletes: JuntaFiscalizacionI[] = [];

  params = new HttpParams();

  async ngAfterViewInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 5);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();

    /** Obtenemos los registros eliminados */
    this.service.getDeletes().subscribe((data) => {
      this.juntas_deletes = data;
    });
  }

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;

    this.service.getAll(this.params).subscribe({
      next: (data) => {
        this.juntas = data.result;
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

  //! DIALOG METHODS -------------------------------------------------------------------->
  junta: JuntaFiscalizacionI | undefined;
  otherAction = false;
  onRowSelect(item: any) {
    if (!this.otherAction) {
      this.visible = true;
      this.junta = item;
      if (this.junta) {
        this.nombre = this.junta.nombre;
        this.cargo = this.junta.cargo;
        this.n_socio = this.junta.n_socio;
        this.dni = this.junta.dni;
        this.junta.ediciones.forEach((e) => {
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
    this.junta = undefined;
    this.nombre = undefined;
    this.cargo = undefined;
    this.dni = undefined;
    this.n_socio = undefined;

    this.activo = undefined;
    this.error = false;
  }
  //! DIALOG METHODS -------------------------------------------------------------------->

  //! UPLOAD METHODS --------------------------------------------------------------------->
  nombre: string | undefined;
  cargo: string | undefined;
  n_socio: string | undefined;
  dni: string | undefined;
  activo: boolean | undefined;

  private readonly dialog = inject(DialogService);
  private readonly loader = inject(LoaderService);
  error = false;
  save() {
    if (this.nombre && this.cargo && this.n_socio && this.dni) {
      this.error = false;
      this.dialog.present(
        'Confirmación de carga',
        '¿Está seguro/a de dar de alta la siguiente junta?',
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
    const newJunta: Partial<JuntaFiscalizacionI> = {
      nombre: this.nombre!,
      cargo: this.cargo,
      n_socio: this.n_socio,
      dni: this.dni,
      ediciones: [
        {
          descripcion: `Creado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
      creado_por: this.usuario!,
    };
    this.service.save(newJunta).subscribe({
      next: (data) => {
        this.juntas.push(data);
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
      '¿Está seguro/a de modificar la siguiente junta?',
      () => {
        this.loader.present();
        this.onEdit();
      }
    );
  }
  onEdit() {
    const { ediciones, ...oldJunta } = this.junta!;
    const editJunta: Partial<JuntaFiscalizacionI> = {
      id: this.junta?.id,
      nombre: this.nombre!,
      cargo: this.cargo,
      n_socio: this.n_socio,
      dni: this.dni,
      ediciones: [
        {
          descripcion: `Editado por: ${
            this.usuario?.nombre_completo
          } | antes: ${JSON.stringify(oldJunta)}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.update(editJunta).subscribe({
      next: (data) => {
        const a = this.juntas.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.junta = data;
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
    const editJunta: Partial<JuntaFiscalizacionI> = {
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
    this.service.update(editJunta).subscribe({
      next: (data) => {
        const a = this.juntas.find((c) => c.id === data.id);
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
  softDelete(junta: JuntaFiscalizacionI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de eliminar este registro?\n
      Tenga en cuenta que no se perderán los datos, pero el registro no se podrá recuperar para seguir utilizándose.`,
      () => {
        this.onSoftDelete(junta);
      }
    );
  }
  onSoftDelete(junta: JuntaFiscalizacionI) {
    this.loader.present();
    this.service.softDelete(junta).subscribe({
      next: (data) => {
        this.loader.dismiss();
        const juntaDelete = this.juntas.find((c) => c.id === junta.id);
        if (juntaDelete) this.juntas_deletes.push(juntaDelete);
        this.juntas = this.juntas.filter((c) => c.id !== junta.id);
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
  restore(junta: JuntaFiscalizacionI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de restaurar este registro?\n
      Tenga en cuenta que los datos relacionados también se restauraran.`,
      () => {
        this.onRestore(junta);
      }
    );
  }
  onRestore(junta: JuntaFiscalizacionI) {
    this.loader.present();
    const restoreJunta: Partial<JuntaFiscalizacionI> = {
      id: junta.id,
      ediciones: [
        {
          descripcion: `Restaurado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.restore(restoreJunta).subscribe({
      next: (data) => {
        this.loader.dismiss();
        this.juntas_deletes = this.juntas.filter((c) => c.id !== junta.id);
        this.juntas.unshift(data);
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

  juntaOld: JuntaFiscalizacionI | undefined;
}
