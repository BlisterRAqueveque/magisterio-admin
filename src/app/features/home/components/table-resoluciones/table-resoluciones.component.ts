import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ArticuloI, ConsideracionI, ResolucionI } from '../../models';
import { HttpParams } from '@angular/common/http';
import { UsuarioI } from '@/app/features/login/models';
import { AuthService } from '@/app/core';
import { ResolucionesService } from '../../service';
import { ConsiderandoComponent } from './considerando/considerando.component';
import { ArticulosComponent } from './articulos/articulos.component';
import {
  AddButtonComponent,
  InputComponent,
  TextareaComponent,
  PresentModal,
  LoaderService,
  DialogService,
} from '@/app/shared';

@Component({
  selector: 'm-table-resoluciones',
  standalone: true,
  imports: [
    PaginatorModule,
    TableModule,
    TooltipModule,
    CommonModule,
    AddButtonComponent,
    DialogModule,
    InputComponent,
    TextareaComponent,
    SidebarModule,
    PresentModal,
    ArticulosComponent,
  ],
  templateUrl: './table-resoluciones.component.html',
  styleUrl: './table-resoluciones.component.css',
})
export class TableResolucionesComponent {
  private readonly service = inject(ResolucionesService);
  private readonly auth = inject(AuthService);

  usuario!: UsuarioI | null;

  visible = false;

  resoluciones: ResolucionI[] = [];
  resoluciones_deletes: ResolucionI[] = [];

  params = new HttpParams();

  async ngAfterViewInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 5);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();

    /** Obtenemos los registros eliminados */
    this.service.getDeletes().subscribe((data) => {
      this.resoluciones_deletes = data;
    });
  }

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;

    this.service.getAll(this.params).subscribe({
      next: (data) => {
        this.resoluciones = data.result;
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
  resolucion: ResolucionI | undefined;
  otherAction = false;
  onRowSelect(item: any) {
    if (!this.otherAction) {
      this.visible = true;
      this.resolucion = item;
      if (this.resolucion) {
        this.resol = this.resolucion.resol;
        this.lugar = this.resolucion.lugar;
        this.fecha = this.resolucion.fecha;
        this.visto = this.resolucion.visto;
        this.resolucion.ediciones.forEach((e) => {
          if (e.descripcion.includes(' | antes: ')) {
            const jsonData = e.descripcion.split(' | antes: ');
            e.descripcion = jsonData[0];
            e.objeto = JSON.parse(jsonData[1]);
          }
        });

        this.generarComponenteCRead(this.resolucion.consideraciones);
        this.generarComponenteARead(this.resolucion.articulos);
      }
    }
    this.otherAction = false;
  }

  resetValues() {
    this.resolucion = undefined;
    this.resol = undefined;
    this.lugar = undefined;
    this.visto = undefined;
    this.fecha = undefined;

    this.activo = undefined;
    this.error = false;

    this.destruirComponentesC();
    this.destruirComponentesA();
  }
  //! DIALOG METHODS -------------------------------------------------------------------->

  //! UPLOAD METHODS --------------------------------------------------------------------->
  resol: string | undefined;
  lugar: string | undefined;
  fecha: string | undefined;
  visto: string | undefined;

  considerando: string[] | undefined;

  activo: boolean | undefined;

  private readonly dialog = inject(DialogService);
  private readonly loader = inject(LoaderService);
  error = false;
  save() {
    if (this.resol && this.lugar && this.fecha && this.visto) {
      this.error = false;
      this.dialog.present(
        'Confirmación de carga',
        '¿Está seguro/a de dar de alta la siguiente resolución?',
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
    const consideraciones: ConsideracionI[] = this.componentesC.map((c) => {
      return { consideracion: c.considerando };
    });
    const articulos: ArticuloI[] = this.componentesA.map((a) => {
      return { art: a.art, desc: a.desc };
    });
    const newResolucion: Partial<ResolucionI> = {
      resol: this.resol!,
      lugar: this.lugar,
      fecha: this.fecha,
      visto: this.visto,
      consideraciones,
      articulos,
      ediciones: [
        {
          descripcion: `Creado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
      creado_por: this.usuario!,
    };
    this.service.save(newResolucion).subscribe({
      next: (data) => {
        this.resoluciones.push(data);
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
      '¿Está seguro/a de modificar la siguiente resolución?',
      () => {
        this.loader.present();
        this.onEdit();
      }
    );
  }
  onEdit() {
    const { ediciones, ...oldResolucion } = this.resolucion!;

    const consideraciones: ConsideracionI[] = this.componentesC.map((c) => {
      return { id: c.id, consideracion: c.considerando };
    });
    const articulos: ArticuloI[] = this.componentesA.map((a) => {
      return { id: a.id, art: a.art, desc: a.desc };
    });

    const editResolucion: Partial<ResolucionI> = {
      id: this.resolucion?.id,
      resol: this.resol!,
      lugar: this.lugar,
      fecha: this.fecha,
      visto: this.visto,
      consideraciones,
      articulos,
      ediciones: [
        {
          descripcion: `Editado por: ${
            this.usuario?.nombre_completo
          } | antes: ${JSON.stringify(oldResolucion)}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.update(editResolucion).subscribe({
      next: (data) => {
        const a = this.resoluciones.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.resolucion = data;
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
    const editResolucion: Partial<ResolucionI> = {
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
    this.service.update(editResolucion).subscribe({
      next: (data) => {
        const a = this.resoluciones.find((c) => c.id === data.id);
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
  softDelete(resolucion: ResolucionI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de eliminar este registro?\n
      Tenga en cuenta que no se perderán los datos, pero el registro no se podrá recuperar para seguir utilizándose.`,
      () => {
        this.onSoftDelete(resolucion);
      }
    );
  }
  onSoftDelete(resolucion: ResolucionI) {
    this.loader.present();
    this.service.softDelete(resolucion).subscribe({
      next: (data) => {
        this.loader.dismiss();
        const resolucionDelete = this.resoluciones.find(
          (c) => c.id === resolucion.id
        );
        if (resolucionDelete) this.resoluciones_deletes.push(resolucionDelete);
        this.resoluciones = this.resoluciones.filter(
          (c) => c.id !== resolucion.id
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
  restore(resolucion: ResolucionI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de restaurar este registro?\n
      Tenga en cuenta que los datos relacionados también se restauraran.`,
      () => {
        this.onRestore(resolucion);
      }
    );
  }
  onRestore(resolucion: ResolucionI) {
    this.loader.present();
    const restoreResoluciones: Partial<ResolucionI> = {
      id: resolucion.id,
      ediciones: [
        {
          descripcion: `Restaurado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.restore(restoreResoluciones).subscribe({
      next: (data) => {
        this.loader.dismiss();
        this.resoluciones_deletes = this.resoluciones.filter(
          (c) => c.id !== resolucion.id
        );
        this.resoluciones.unshift(data);
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

  resolucionOld: ResolucionI | undefined;

  //! DISPLAY COMPONENTS ----------------------------------------------------------------->
  /**
   * @description
   * La referencia del view container
   */
  @ViewChild('consideraciones', { read: ViewContainerRef })
  contenedorC!: ViewContainerRef;
  /**
   * @description
   * La lista de componentes
   */
  componentesC: ConsiderandoComponent[] = [];

  /**
   * @description
   * Generamos componentes tipo ConsiderandoComponent
   */
  generarComponenteC() {
    //* Generamos el componente
    const component = this.contenedorC.createComponent(ConsiderandoComponent);
    //* A la instancia creada le damos el length actual de la lista (index)
    component.instance.index = this.componentesC.length;
    //* Nos suscribimos al output, para darle una acción al hacer click
    component.instance.destruir.subscribe((item) => {
      //! Removemos el componente
      this.contenedorC.remove(item);
      //! Lo eliminamos de la lista de componentes
      this.componentesC = this.componentesC.filter((i) => i.index !== item);
      //! Formateamos los que ya están para actualizar el index
      this.componentesC.forEach((item, index) => {
        item.index = index;
      });
    });
    //* Pusheamos el componente creado
    this.componentesC.push(component.instance);
  }

  generarComponenteCRead(consideraciones: ConsideracionI[]) {
    console.log(consideraciones);
    //* Pasamos una lista de los que estén creados, desde el item seleccionado
    if (consideraciones) {
      consideraciones.forEach((c) => {
        //* Generamos el componente
        const component = this.contenedorC.createComponent(
          ConsiderandoComponent
        );
        //* A la instancia creada le damos el length actual de la lista (index)
        component.instance.index = this.componentesC.length;

        component.instance.considerando = c.consideracion;
        component.instance.id = c.id!;
        //* Nos suscribimos al output, para darle una acción al hacer click
        component.instance.destruir.subscribe((item) => {
          //! Removemos el componente
          this.contenedorC.remove(item);
          //! Lo eliminamos de la lista de componentes
          this.componentesC = this.componentesC.filter((i) => i.index !== item);
          //! Formateamos los que ya están para actualizar el index
          this.componentesC.forEach((item, index) => {
            item.index = index;
          });
        });
        //* Pusheamos el componente creado
        this.componentesC.push(component.instance);
      });
    }
  }

  /**
   * @description
   * Destruimos todos los componentes creados
   */
  destruirComponentesC() {
    this.contenedorC.clear();
    this.componentesC = [];
  }

  /**
   * @description
   * La referencia del view container
   */
  @ViewChild('articulos', { read: ViewContainerRef })
  contenedorA!: ViewContainerRef;
  /**
   * @description
   * La lista de componentes
   */
  componentesA: ArticulosComponent[] = [];

  /**
   * @description
   * Generamos componentes tipo ConsiderandoComponent
   */
  generarComponenteA() {
    //* Generamos el componente
    const component = this.contenedorA.createComponent(ArticulosComponent);
    //* A la instancia creada le damos el length actual de la lista (index)
    component.instance.index = this.componentesA.length;
    //* Nos suscribimos al output, para darle una acción al hacer click
    component.instance.destruir.subscribe((item) => {
      //! Removemos el componente
      this.contenedorA.remove(item);
      //! Lo eliminamos de la lista de componentes
      this.componentesA = this.componentesA.filter((i) => i.index !== item);
      //! Formateamos los que ya están para actualizar el index
      this.componentesA.forEach((item, index) => {
        item.index = index;
      });
    });
    //* Pusheamos el componente creado
    this.componentesA.push(component.instance);
  }

  /**
   * @description
   * Generamos componentes tipo ConsiderandoComponent
   */
  generarComponenteARead(articulos: ArticuloI[]) {
    if (articulos) {
      articulos.forEach((a) => {
        //* Generamos el componente
        const component = this.contenedorA.createComponent(ArticulosComponent);
        //* A la instancia creada le damos el length actual de la lista (index)
        component.instance.index = this.componentesA.length;
        component.instance.id = a.id!;
        component.instance.art = a.art;
        component.instance.desc = a.desc;
        //* Nos suscribimos al output, para darle una acción al hacer click
        component.instance.destruir.subscribe((item) => {
          //! Removemos el componente
          this.contenedorA.remove(item);
          //! Lo eliminamos de la lista de componentes
          this.componentesA = this.componentesA.filter((i) => i.index !== item);
          //! Formateamos los que ya están para actualizar el index
          this.componentesA.forEach((item, index) => {
            item.index = index;
          });
        });
        //* Pusheamos el componente creado
        this.componentesA.push(component.instance);
      });
    }
  }

  /**
   * @description
   * Destruimos todos los componentes creados
   */
  destruirComponentesA() {
    this.contenedorA.clear();
    this.componentesA = [];
  }
  //! DISPLAY COMPONENTS ----------------------------------------------------------------->
}
