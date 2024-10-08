import { AuthService, dataURLtoFile } from '@/app/core';
import { UsuarioI } from '@/app/features/login/models';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { NoticiaI } from '../../models';
import { NoticiasService } from '../../service';
import { environment } from '@/environments/environment';
import {
  DialogService,
  AddButtonComponent,
  InputComponent,
  TextareaComponent,
  PresentModal,
  AdjuntosComponent,
  LoaderService,
} from '@/app/shared';

@Component({
  selector: 'm-table-noticias',
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
    AdjuntosComponent,
  ],
  templateUrl: './table-noticias.component.html',
  styleUrl: './table-noticias.component.css',
})
export class TableNoticiasComponent {
  url = environment.images + 'noticias/';
  private readonly service = inject(NoticiasService);
  private readonly auth = inject(AuthService);

  usuario!: UsuarioI | null;

  visible = false;

  noticias: NoticiaI[] = [];
  noticias_deletes: NoticiaI[] = [];

  params = new HttpParams();

  async ngAfterViewInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 5);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();

    /** Obtenemos los registros eliminados */
    this.service.getDeletes().subscribe((data) => {
      this.noticias_deletes = data;
    });
  }

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;

    this.service.getAll(this.params).subscribe({
      next: (data) => {
        this.noticias = data.result;
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
  noticia: NoticiaI | undefined;
  otherAction = false;
  onRowSelect(item: any) {
    if (!this.otherAction) {
      this.visible = true;
      this.noticia = item;
      if (this.noticia) {
        this.title = this.noticia.title;
        this.subtitle = this.noticia.subtitle;
        this.news = this.noticia.news;
        this.img = {
          img: this.url + this.noticia.background,
          type: '',
        };
        this.noticia.ediciones.forEach((e) => {
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
    this.noticia = undefined;
    this.title = undefined;
    this.subtitle = undefined;
    this.news = undefined;
    this.activo = undefined;
    this.img = undefined;
    this.error = false;
  }
  //! DIALOG METHODS -------------------------------------------------------------------->

  //! UPLOAD METHODS --------------------------------------------------------------------->
  title: string | undefined;
  subtitle: string | undefined;
  news: string | undefined;
  activo: boolean | undefined;
  img: { img: string; type: string } | undefined;

  private readonly dialog = inject(DialogService);
  private readonly loader = inject(LoaderService);
  error = false;
  save() {
    if (this.title && this.subtitle && this.news) {
      this.error = false;
      this.dialog.present(
        'Confirmación de carga',
        '¿Está seguro/a de dar de alta la siguiente noticia?',
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
    const form = new FormData();
    if (this.img) {
      const img = dataURLtoFile(this.img.img, 'sample', this.img.type);
      form.append('file', img);
    }
    const newNoticia: Partial<NoticiaI> = {
      title: this.title!,
      subtitle: this.subtitle,
      news: this.news,
      ediciones: [
        {
          descripcion: `Creado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
      creado_por: this.usuario!,
    };
    form.append('form', JSON.stringify(newNoticia));
    this.service.save(form).subscribe({
      next: (data) => {
        this.noticias.push(data);
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
      '¿Está seguro/a de modificar la siguiente noticia?',
      () => {
        this.loader.present();
        this.onEdit();
      }
    );
  }
  onEdit() {
    const { ediciones, ...oldNoticia } = this.noticia!;
    const editNoticia: Partial<NoticiaI> = {
      id: this.noticia?.id,
      title: this.title!,
      subtitle: this.subtitle,
      news: this.news,
      ediciones: [
        {
          descripcion: `Editado por: ${
            this.usuario?.nombre_completo
          } | antes: ${JSON.stringify(oldNoticia)}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.update(editNoticia).subscribe({
      next: (data) => {
        const a = this.noticias.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.noticia = data;
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
    const editNoticia: Partial<NoticiaI> = {
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
    this.service.update(editNoticia).subscribe({
      next: (data) => {
        const a = this.noticias.find((c) => c.id === data.id);
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
  softDelete(noticia: NoticiaI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de eliminar este registro?\n
      Tenga en cuenta que no se perderán los datos, pero el registro no se podrá recuperar para seguir utilizándose.`,
      () => {
        this.onSoftDelete(noticia);
      }
    );
  }
  onSoftDelete(noticia: NoticiaI) {
    this.loader.present();
    this.service.softDelete(noticia).subscribe({
      next: (data) => {
        this.loader.dismiss();
        const noticiaDelete = this.noticias.find((c) => c.id === noticia.id);
        if (noticiaDelete) this.noticias_deletes.push(noticiaDelete);
        this.noticias = this.noticias.filter((c) => c.id !== noticia.id);
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
  restore(noticia: NoticiaI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de restaurar este registro?\n
      Tenga en cuenta que los datos relacionados también se restauraran.`,
      () => {
        this.onRestore(noticia);
      }
    );
  }
  onRestore(noticia: NoticiaI) {
    this.loader.present();
    const restoreNoticia: Partial<NoticiaI> = {
      id: noticia.id,
      ediciones: [
        {
          descripcion: `Restaurado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.restore(restoreNoticia).subscribe({
      next: (data) => {
        this.loader.dismiss();
        this.noticias_deletes = this.noticias.filter(
          (c) => c.id !== noticia.id
        );
        this.noticias.unshift(data);
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

  noticiaOld: NoticiaI | undefined;
}
