import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { DialogService } from '@/app/shared/confirm-dialog/dialog.service';
import { AuthService } from '@/app/core';
import { AddButtonComponent } from '@/app/shared/add-button/add-button.component';
import { InputComponent } from '@/app/shared/input/input.component';
import { LoaderService } from '@/app/shared/loader/loader.service';
import { PresentModal } from '@/app/shared/modal/present-modal.component';
import { SelectComponent } from '@/app/shared/select/select.component';
import { CasaMutualI } from '../../models';
import { UsuariosService, CasasMutualesService } from '../../service';
import { UsuarioI } from '@/app/features/login/models';

@Component({
  selector: 'm-table-usuarios',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    CommonModule,
    TooltipModule,
    SidebarModule,
    InputComponent,
    DialogModule,
    SelectComponent,
    AddButtonComponent,
    MultiSelectModule,
    RippleModule,
    PresentModal,
  ],
  templateUrl: './table-usuarios.component.html',
  styleUrl: './table-usuarios.component.css',
})
export class TableUsuariosComponent {
  private readonly service = inject(UsuariosService);
  private readonly auth = inject(AuthService);
  private readonly casasService = inject(CasasMutualesService);

  usuario!: UsuarioI | null;

  visible = false;

  usuarios: UsuarioI[] = [];
  usuarios_deletes: UsuarioI[] = [];

  casas_mutuales: CasaMutualI[] = [];
  selected_casas: CasaMutualI[] = [];

  params = new HttpParams();

  async ngAfterViewInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 5);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();

    this.casasService.getAll().subscribe((data) => {
      this.casas_mutuales = data.result;
    });

    this.service.getDeletes().subscribe((data) => {
      this.usuarios_deletes = data;
    });
  }

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;

    this.service.getAllUsers(this.params).subscribe({
      next: (data) => {
        this.usuarios = data.result;
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

  printCasaMutual(casas_mutual: CasaMutualI[]) {
    const casas = casas_mutual.map((a) => a.nombre).join(', ');
    return casas;
  }

  //! DIALOG METHODS -------------------------------------------------------------------->
  selectedUsuario: UsuarioI | undefined;
  otherAction = false;
  onRowSelect(item: UsuarioI) {
    if (!this.otherAction) {
      this.visible = true;
      this.selectedUsuario = item;
      if (this.selectedUsuario) {
        this._usuario = this.selectedUsuario.usuario;
        this.correo = this.selectedUsuario.correo;
        this.nombre = this.selectedUsuario.nombre;
        this.apellido = this.selectedUsuario.apellido;
        this.activo = this.selectedUsuario.activo;
        this.selected_casas = this.casas_mutuales.filter((c) =>
          this.selectedUsuario?.casa_mutual.find((cu) => cu.id === c.id)
        );
        this.selectedUsuario.ediciones.forEach((e) => {
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
    this.selectedUsuario = undefined;
    this._usuario = undefined;
    this.correo = undefined;
    this.nombre = undefined;
    this.apellido = undefined;
    this.selected_casas = [];
    this.activo = undefined;
  }
  //! DIALOG METHODS -------------------------------------------------------------------->

  //! UPLOAD METHODS --------------------------------------------------------------------->
  _usuario!: string | undefined;
  correo!: string | undefined;
  nombre!: string | undefined;
  apellido!: string | undefined;
  activo: boolean | undefined;

  private readonly dialog = inject(DialogService);
  private readonly loader = inject(LoaderService);
  error = false;
  save() {
    if (this.usuario && this.correo) {
      this.error = false;
      this.dialog.present(
        'Confirmación de carga',
        '¿Está seguro/a de dar de alta el siguiente usuario?',
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
    const newUsuario: Partial<UsuarioI> = {
      usuario: this._usuario,
      correo: this.correo,
      nombre: this.nombre,
      apellido: this.apellido,
      casa_mutual: this.selected_casas,
      ediciones: [
        {
          descripcion: `Creado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
      creado_por: this.usuario!,
    };
    this.service.save(newUsuario).subscribe({
      next: (data) => {
        this.usuarios.push(data);
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
              'Ya existe un registro con ese usuario o correo.',
              () => {
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
      '¿Está seguro/a de modificar el siguiente usuario?',
      () => {
        this.loader.present();
        this.onEdit();
      }
    );
  }
  onEdit() {
    const { ediciones, ...oldUsuario } = this.selectedUsuario!;
    const editUsuario: Partial<UsuarioI> = {
      id: this.selectedUsuario?.id,
      usuario: this._usuario,
      correo: this.correo,
      nombre: this.nombre,
      apellido: this.apellido,
      nombre_completo: `${this.nombre} ${this.apellido}`,
      casa_mutual: this.selected_casas,
      ediciones: [
        {
          descripcion: `Editado por: ${
            this.usuario?.nombre_completo
          } | antes: ${JSON.stringify(oldUsuario)}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.update(editUsuario).subscribe({
      next: (data) => {
        const a = this.usuarios.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
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
    const editUsuario: Partial<UsuarioI> = {
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
    this.service.update(editUsuario).subscribe({
      next: (data) => {
        const a = this.usuarios.find((c) => c.id === data.id);
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
  softDelete(usuario: UsuarioI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de eliminar este registro?\n
      Tenga en cuenta que no se perderán los datos, pero el registro no se podrá recuperar para seguir utilizándose.`,
      () => {
        this.onSoftDelete(usuario);
      }
    );
  }
  onSoftDelete(usuario: UsuarioI) {
    this.loader.present();
    this.service.softDelete(usuario).subscribe({
      next: (data) => {
        this.loader.dismiss();
        const usuarioDelete = this.usuarios.find((u) => u.id === usuario.id);
        if (usuarioDelete) this.usuarios_deletes.push(usuarioDelete);
        this.usuarios = this.usuarios.filter((c) => c.id !== usuario.id);
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
  restore(usuario: UsuarioI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de restaurar este registro?\n
      Tenga en cuenta que los datos relacionados también se restauraran.`,
      () => {
        this.onRestore(usuario);
      }
    );
  }
  onRestore(usuario: UsuarioI) {
    this.loader.present();
    const restoreUsuario: Partial<UsuarioI> = {
      id: usuario.id,
      ediciones: [
        {
          descripcion: `Restaurado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.restore(restoreUsuario).subscribe({
      next: (data) => {
        this.loader.dismiss();
        this.usuarios_deletes = this.usuarios.filter(
          (c) => c.id !== usuario.id
        );
        this.usuarios.unshift(data);
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

  userOld: UsuarioI | undefined;
}
