import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { DelegacionesService } from '../../service/delegacion.service';
import { CasaHorarioI, DelegacionI, HorarioI } from '../../models';
import { AuthService } from '@/app/core';
import { UsuarioI } from '@/app/features/login/models';
import {
  AddButtonComponent,
  InputComponent,
  SelectComponent,
  PresentModal,
  LoaderService,
  DialogService,
} from '@/app/shared';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule, Paginator } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule, Table } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HorariosComponent } from './horarios/horarios.component';

@Component({
  selector: 'm-table-delegaciones',
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
  ],
  templateUrl: './table-delegaciones.component.html',
  styleUrl: './table-delegaciones.component.css',
})
export class TableDelegacionesComponent {
  private readonly service = inject(DelegacionesService);
  private readonly auth = inject(AuthService);

  usuario!: UsuarioI | null;

  visible = false;

  delegaciones: DelegacionI[] = [];
  delegaciones_deletes: DelegacionI[] = [];

  params = new HttpParams();

  async ngAfterViewInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 5);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();

    this.service.getDeletes().subscribe((data) => {
      this.delegaciones_deletes = data;
    });
  }

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;

    this.service.getAll(this.params).subscribe({
      next: (data) => {
        this.delegaciones = data.result;
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
  delegacion: DelegacionI | undefined;
  otherAction = false;
  onRowSelect(item: any) {
    if (!this.otherAction) {
      this.visible = true;
      this.delegacion = item;
      if (this.delegacion) {
        this.nombre = this.delegacion.nombre;
        this.direccion = this.delegacion.direccion;
        this.tel = this.delegacion.tel;
        this.cel = this.delegacion.cel;
        this.correo = this.delegacion.correo;
        this.cp = this.delegacion.cp;
        this.co = this.delegacion.co;
        this.activo = this.delegacion.activo;

        this.delegacion.ediciones.forEach((e) => {
          if (e.descripcion.includes(' | antes: ')) {
            const jsonData = e.descripcion.split(' | antes: ');
            e.descripcion = jsonData[0];
            e.objeto = JSON.parse(jsonData[1]);
          }
        });

        this.generarComponenteHRead(this.delegacion.casa_horarios);
      }
    }
    this.otherAction = false;
  }

  resetValues() {
    this.delegacion = undefined;
    this.nombre = undefined;
    this.direccion = undefined;
    this.tel = undefined;
    this.cel = undefined;
    this.correo = undefined;
    this.cp = undefined;
    this.co = undefined;
    this.activo = undefined;

    this.destruirComponentesH();
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
    if (this.nombre) {
      this.error = false;
      this.dialog.present(
        'Confirmación de carga',
        '¿Está seguro/a de dar de alta la siguiente delegación?',
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
    const del_horarios: CasaHorarioI[] = this.componentesH.map((c) => {
      return { horario: c.horario };
    });
    const newDelegacion: Partial<DelegacionI> = {
      co: this.co,
      nombre: this.nombre!,
      direccion: this.direccion!,
      tel: this.tel!,
      cel: this.cel!,
      correo: this.correo!,
      cp: this.cp!,
      casa_horarios: del_horarios,
      usuarios: [],
      ediciones: [
        {
          descripcion: `Creado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
      creado_por: this.usuario!,
    };
    this.service.save(newDelegacion).subscribe({
      next: (data) => {
        this.delegaciones.push(data);
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
    this.dialog.present(
      'Confirmación de carga',
      '¿Está seguro/a de modificar la siguiente delegación?',
      () => {
        this.loader.present();
        this.onEdit();
      }
    );
  }
  onEdit() {
    const { ediciones, ...oldDelegacion } = this.delegacion!;

    const del_horarios: CasaHorarioI[] = this.componentesH.map((c) => {
      return { id: c.id, horario: c.horario };
    });

    const editDelegacion: Partial<DelegacionI> = {
      id: this.delegacion?.id,
      co: this.co,
      nombre: this.nombre!,
      direccion: this.direccion!,
      tel: this.tel!,
      cel: this.cel!,
      correo: this.correo!,
      cp: this.cp!,
      casa_horarios: del_horarios,
      ediciones: [
        {
          descripcion: `Editado por: ${
            this.usuario?.nombre_completo
          } | antes: ${JSON.stringify(oldDelegacion)}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.update(editDelegacion).subscribe({
      next: (data) => {
        const a = this.delegaciones.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.delegacion = data;
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
    const editDelegacion: Partial<DelegacionI> = {
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
    this.service.update(editDelegacion).subscribe({
      next: (data) => {
        const a = this.delegaciones.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.delegacion = data;
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
  softDelete(casa: DelegacionI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de eliminar este registro?\n
      Tenga en cuenta que no se perderán los datos, pero el registro no se podrá recuperar para seguir utilizándose.`,
      () => {
        this.onSoftDelete(casa);
      }
    );
  }
  onSoftDelete(delegacion: DelegacionI) {
    this.loader.present();
    this.service.softDelete(delegacion).subscribe({
      next: (data) => {
        this.loader.dismiss();
        const delegacionDelete = this.delegaciones.find(
          (c) => c.id === delegacion.id
        );
        if (delegacionDelete) this.delegaciones_deletes.push(delegacionDelete);
        this.delegaciones = this.delegaciones.filter(
          (c) => c.id !== delegacion.id
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
  restore(delegacion: DelegacionI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de restaurar este registro?\n
      Tenga en cuenta que los datos relacionados también se restauraran.`,
      () => {
        this.onRestore(delegacion);
      }
    );
  }
  onRestore(delegacion: DelegacionI) {
    this.loader.present();
    const restoreDelegacion: Partial<DelegacionI> = {
      id: delegacion.id,
      ediciones: [
        {
          descripcion: `Restaurado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.restore(restoreDelegacion).subscribe({
      next: (data) => {
        this.loader.dismiss();
        this.delegaciones_deletes = this.delegaciones.filter(
          (c) => c.id !== delegacion.id
        );
        this.delegaciones.unshift(data);
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

  delegacionOld: DelegacionI | undefined;

  //! DISPLAY COMPONENTS ----------------------------------------------------------------->
  /**
   * @description
   * La referencia del view container
   */
  @ViewChild('delegacionesT', { read: ViewContainerRef })
  contenedorH!: ViewContainerRef;
  /**
   * @description
   * La lista de componentes
   */
  componentesH: HorariosComponent[] = [];

  /**
   * @description
   * Generamos componentes tipo HorariosComponent
   */
  generarComponenteH() {
    //* Generamos el componente
    const component = this.contenedorH.createComponent(HorariosComponent);
    //* A la instancia creada le damos el length actual de la lista (index)
    component.instance.index = this.componentesH.length;
    //* Nos suscribimos al output, para darle una acción al hacer click
    component.instance.destruir.subscribe((item) => {
      //! Removemos el componente
      this.contenedorH.remove(item);
      //! Lo eliminamos de la lista de componentes
      this.componentesH = this.componentesH.filter((i) => i.index !== item);
      //! Formateamos los que ya están para actualizar el index
      this.componentesH.forEach((item, index) => {
        item.index = index;
      });
    });
    //* Pusheamos el componente creado
    this.componentesH.push(component.instance);
  }

  generarComponenteHRead(consideraciones: CasaHorarioI[]) {
    console.log(consideraciones);
    //* Pasamos una lista de los que estén creados, desde el item seleccionado
    if (consideraciones) {
      consideraciones.forEach((c) => {
        //* Generamos el componente
        const component = this.contenedorH.createComponent(HorariosComponent);
        //* A la instancia creada le damos el length actual de la lista (index)
        component.instance.index = this.componentesH.length;

        component.instance.horario = c.horario;
        component.instance.id = c.id!;
        //* Nos suscribimos al output, para darle una acción al hacer click
        component.instance.destruir.subscribe((item) => {
          //! Removemos el componente
          this.contenedorH.remove(item);
          //! Lo eliminamos de la lista de componentes
          this.componentesH = this.componentesH.filter((i) => i.index !== item);
          //! Formateamos los que ya están para actualizar el index
          this.componentesH.forEach((item, index) => {
            item.index = index;
          });
        });
        //* Pusheamos el componente creado
        this.componentesH.push(component.instance);
      });
    }
  }

  /**
   * @description
   * Destruimos todos los componentes creados
   */
  destruirComponentesH() {
    this.contenedorH.clear();
    this.componentesH = [];
  }
  //! DISPLAY COMPONENTS ----------------------------------------------------------------->
}
