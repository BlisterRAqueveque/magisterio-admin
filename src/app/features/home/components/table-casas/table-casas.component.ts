import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { AuthService } from '../../../../core/services/auth.service';
import { AddButtonComponent } from '../../../../shared/add-button/add-button.component';
import { DialogService } from '../../../../shared/confirm-dialog/dialog.service';
import { InputComponent } from '../../../../shared/input/input.component';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { SelectComponent } from '../../../../shared/select/select.component';
import { UsuarioI } from '../../../login/models/usuario';
import { CasaMutualI } from '../../models/casa.mutual';
import { CasasMutualesService } from '../../service/casas.mutuales.service';
import { TooltipModule } from 'primeng/tooltip';
import { SidebarModule } from 'primeng/sidebar';
import { PresentModal } from '../../../../shared/modal/present-modal.component';
import { CheckboxModule } from 'primeng/checkbox';
import { months } from '../../models/months';

@Component({
  selector: 'm-table-casas',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    CommonModule,
    AddButtonComponent,
    DialogModule,
    InputComponent,
    SelectComponent,
    ConfirmDialogModule,
    TooltipModule,
    SidebarModule,
    PresentModal,
    SelectComponent,
  ],
  templateUrl: './table-casas.component.html',
  styleUrl: './table-casas.component.css',
})
export class TableCasasComponent {
  private readonly service = inject(CasasMutualesService);
  private readonly auth = inject(AuthService);

  usuario!: UsuarioI | null;

  visible = false;

  casas_mutuales: CasaMutualI[] = [];
  casas_mutuales_deletes: CasaMutualI[] = [];

  params = new HttpParams();

  async ngAfterViewInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 5);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();

    this.service.getDeletes().subscribe((data) => {
      this.casas_mutuales_deletes = data;
    });

    for (let i = 1; i <= 31; i++) {
      this.days.push({ id: i, day: i < 10 ? `0${i}` : `${i}` });
    }
  }

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;

    this.service.getAll(this.params).subscribe({
      next: (data) => {
        this.casas_mutuales = data.result;
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
  @ViewChild('dInicio') dInicio!: SelectComponent;
  @ViewChild('mInicio') mInicio!: SelectComponent;
  @ViewChild('dFin') dFin!: SelectComponent;
  @ViewChild('mFin') mFin!: SelectComponent;
  casa: CasaMutualI | undefined;
  otherAction = false;
  onRowSelect(item: any) {
    if (!this.otherAction) {
      this.visible = true;
      this.casa = item;
      if (this.casa) {
        this.nombre = this.casa.nombre;
        this.direccion = this.casa.direccion;
        this.tel = this.casa.tel;
        this.cel = this.casa.cel;
        this.correo = this.casa.correo;
        this.cp = this.casa.cp;
        this.co = this.casa.co;
        this.activo = this.casa.activo;
        if (this.casa.horarios) {
          this.show = true;
          //* Inicio periodo
          this.inicio = new Date(this.casa.horarios.inicio_periodo);
          const dInicio = this.inicio.getDate();
          const mInicio = this.inicio.getMonth() + 1;
          this.diaInicio = this.days.find((d) => d.id === dInicio);
          this.dInicio.value = dInicio.toString();
          this.mesInicio = this.months.find((m) => m.id === mInicio);
          this.mInicio.value = mInicio.toString();

          //* Fin periodo
          this.fin = new Date(this.casa.horarios.fin_periodo);
          const dFin = this.fin.getDate();
          const mFin = this.fin.getMonth() + 1;
          this.diaFin = this.days.find((d) => d.id === dFin);
          this.dFin.value = dFin.toString();
          this.mesFin = this.months.find((m) => m.id === mFin);
          this.mFin.value = mFin.toString();
        }
        this.casa.ediciones.forEach((e) => {
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

  resetValues(
    dFin: SelectComponent,
    mFin: SelectComponent,
    dInicio: SelectComponent,
    mInicio: SelectComponent
  ) {
    this.casa = undefined;
    this.nombre = undefined;
    this.direccion = undefined;
    this.tel = undefined;
    this.cel = undefined;
    this.correo = undefined;
    this.cp = undefined;
    this.co = undefined;
    this.activo = undefined;

    //! Periodo
    this.diaInicio = undefined;
    this.mesInicio = undefined;
    this.diaFin = undefined;
    this.mesFin = undefined;
    this.inicio = undefined;
    this.fin = undefined;
    this.errorMessage = '';
    this.errorPeriod = false;
    this.show = false;
    dInicio.deleteValue();
    dFin.deleteValue();
    mInicio.deleteValue();
    mFin.deleteValue();
  }
  //! DIALOG METHODS -------------------------------------------------------------------->

  //! UPLOAD METHODS --------------------------------------------------------------------->
  nombre: string | undefined;
  direccion: string | undefined;
  tel: string | undefined;
  cel: string | undefined;
  correo: string | undefined;
  cp: number | undefined;
  co: number | undefined;
  activo: boolean | undefined;

  private readonly dialog = inject(DialogService);
  private readonly loader = inject(LoaderService);
  error = false;
  save() {
    if (this.nombre && this.comprobarPeriodo()) {
      this.error = false;
      this.dialog.present(
        'Confirmación de carga',
        '¿Está seguro/a de dar de alta la siguiente casa mutual?',
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
    const newCasa: Partial<CasaMutualI> = {
      co: this.co,
      nombre: this.nombre!,
      direccion: this.direccion!,
      tel: this.tel!,
      cel: this.cel!,
      correo: this.correo!,
      cp: this.cp!,
      usuarios: [],
      habitaciones: [],
      parcelas: [],
      horarios: this.show
        ? { inicio_periodo: this.inicio!, fin_periodo: this.fin! }
        : null,
      ediciones: [
        {
          descripcion: `Creado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
      creado_por: this.usuario!,
    };
    this.service.save(newCasa).subscribe({
      next: (data) => {
        this.casas_mutuales.push(data);
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
        if (e.error ? e.error.statusCode === 409 : false) {
          setTimeout(() => {
            this.dialog.error(
              'Error de carga',
              'Ya existe un registro con ese nombre.',
              () => {
                this.nombre = undefined;
                this.error = true;
              }
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
  //! UPLOAD METHODS --------------------------------------------------------------------->

  //! UPDATE METHODS --------------------------------------------------------------------->
  edit() {
    if (this.comprobarPeriodo()) {
      this.dialog.present(
        'Confirmación de carga',
        '¿Está seguro/a de modificar la siguiente casa mutual?',
        () => {
          this.loader.present();
          this.onEdit();
        }
      );
    }
  }
  onEdit() {
    const { ediciones, ...oldCasa } = this.casa!;
    const editCasa: Partial<CasaMutualI> = {
      id: this.casa?.id,
      co: this.co,
      nombre: this.nombre!,
      direccion: this.direccion!,
      tel: this.tel!,
      cel: this.cel!,
      correo: this.correo!,
      cp: this.cp!,
      horarios: this.show
        ? { inicio_periodo: this.inicio!, fin_periodo: this.fin! }
        : null,
      ediciones: [
        {
          descripcion: `Editado por: ${
            this.usuario?.nombre_completo
          } | antes: ${JSON.stringify(oldCasa)}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.update(editCasa).subscribe({
      next: (data) => {
        const a = this.casas_mutuales.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.casa = data;
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
    const editCasa: Partial<CasaMutualI> = {
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
    this.service.update(editCasa).subscribe({
      next: (data) => {
        const a = this.casas_mutuales.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.casa = data;
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
  softDelete(casa: CasaMutualI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de eliminar este registro?\n
      Tenga en cuenta que no se perderán los datos, pero el registro no se podrá recuperar para seguir utilizándose.`,
      () => {
        this.onSoftDelete(casa);
      }
    );
  }
  onSoftDelete(casa: CasaMutualI) {
    this.loader.present();
    this.service.softDelete(casa).subscribe({
      next: (data) => {
        this.loader.dismiss();
        const casaDelete = this.casas_mutuales.find((c) => c.id === casa.id);
        if (casaDelete) this.casas_mutuales_deletes.push(casaDelete);
        this.casas_mutuales = this.casas_mutuales.filter(
          (c) => c.id !== casa.id
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
  restore(casa: CasaMutualI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de restaurar este registro?\n
      Tenga en cuenta que los datos relacionados también se restauraran.`,
      () => {
        this.onRestore(casa);
      }
    );
  }
  onRestore(casa: CasaMutualI) {
    this.loader.present();
    const restoreCasa: Partial<CasaMutualI> = {
      id: casa.id,
      ediciones: [
        {
          descripcion: `Restaurado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.restore(restoreCasa).subscribe({
      next: (data) => {
        this.loader.dismiss();
        this.casas_mutuales_deletes = this.casas_mutuales.filter(
          (c) => c.id !== casa.id
        );
        this.casas_mutuales.unshift(data);
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

  casaOld: CasaMutualI | undefined;

  show = false;

  days: { id: number; day: string }[] = [];
  months = months;

  diaInicio!: any;
  mesInicio!: any;
  diaFin!: any;
  mesFin!: any;
  inicio!: Date | undefined;
  fin!: Date | undefined;
  errorMessage!: string;
  errorPeriod = false;

  comprobarPeriodo() {
    if (this.show) {
      this.errorPeriod = false;
      this.errorMessage = '';
      if (this.diaInicio && this.mesInicio && this.diaFin && this.mesFin) {
        this.inicio = new Date(2024, this.mesInicio.id - 1, this.diaInicio.id);
        this.fin = new Date(2024, this.mesFin.id - 1, this.diaFin.id);
        if (this.inicio.getTime() < this.fin.getTime()) {
          return true;
        } else {
          this.errorPeriod = true;
          this.errorMessage = 'Los periodos son incorrectos';
          return false;
        }
      } else {
        this.errorPeriod = true;
        this.errorMessage = 'Faltan completar los campos';
        return false;
      }
    } else {
      this.errorPeriod = false;
      return true;
    }
  }
}
