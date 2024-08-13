import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../../core/auth.service';
import { AddButtonComponent } from '../../../../shared/add-button/add-button.component';
import { InputComponent } from '../../../../shared/input/input.component';
import { PresentModal } from '../../../../shared/modal/present-modal.component';
import { UsuarioI } from '../../../login/models/usuario';
import { CasaMutualI } from '../../models/casa.mutual';
import { ParcelaI } from '../../models/parcelas';
import { CasasMutualesService } from '../../service/casas.mutuales.service';
import { ParcelasService } from '../../service/parcelas.service';
import { DialogService } from '../../../../shared/confirm-dialog/dialog.service';
import { LoaderService } from '../../../../shared/loader/loader.service';

@Component({
  selector: 'm-table-parcelas',
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
  ],
  templateUrl: './table-parcelas.component.html',
  styleUrl: './table-parcelas.component.css',
})
export class TableParcelasComponent {
  private readonly service = inject(ParcelasService);
  private readonly auth = inject(AuthService);
  private readonly casaService = inject(CasasMutualesService);

  usuario!: UsuarioI | null;

  visible = false;

  parcelas: ParcelaI[] = [];
  parcelas_deletes: ParcelaI[] = [];

  casas_mutuales: CasaMutualI[] = [];

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
      this.parcelas_deletes = data;
    });
  }

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;

    this.service.getAll(this.params).subscribe({
      next: (data) => {
        this.parcelas = data.result;
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
  parcela: ParcelaI | undefined;
  otherAction = false;
  onRowSelect(item: ParcelaI) {
    if (!this.otherAction) {
      this.visible = true;
      this.parcela = item;
      if (this.parcela) {
        this.nombre = this.parcela.nombre;
        this.casa_mutual = this.casas_mutuales.find(
          (c) => c.id === this.parcela?.casa_mutual.id
        );
        this.activo = this.parcela.activo;
        this.parcela.ediciones.forEach((e) => {
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
    this.parcela = undefined;
    this.nombre = undefined;
    this.activo = undefined;
    this.casa_mutual = undefined;
  }
  //! DIALOG METHODS -------------------------------------------------------------------->

  //! UPLOAD METHODS --------------------------------------------------------------------->
  nombre: string | undefined;
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
        '¿Está seguro/a de dar de alta la siguiente parcela?',
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
    const newParcela: Partial<ParcelaI> = {
      nombre: this.nombre!,
      casa_mutual: this.casa_mutual,
      ediciones: [
        {
          descripcion: `Creado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
      creado_por: this.usuario!,
    };
    this.service.save(newParcela).subscribe({
      next: (data) => {
        this.parcelas.push(data);
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
      '¿Está seguro/a de modificar la siguiente parcela?',
      () => {
        this.loader.present();
        this.onEdit();
      }
    );
  }
  onEdit() {
    const { ediciones, ...oldParcela } = this.parcela!;
    const editParcela: Partial<ParcelaI> = {
      id: this.parcela?.id,
      nombre: this.nombre!,
      casa_mutual: this.casa_mutual,
      ediciones: [
        {
          descripcion: `Editado por: ${
            this.usuario?.nombre_completo
          } | antes: ${JSON.stringify(oldParcela)}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.update(editParcela).subscribe({
      next: (data) => {
        const a = this.parcelas.find((c) => c.id === data.id);
        if (a) Object.assign(a, data);
        this.parcela = data;
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
    const editParcela: Partial<ParcelaI> = {
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
    this.service.update(editParcela).subscribe({
      next: (data) => {
        const a = this.parcelas.find((c) => c.id === data.id);
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
  softDelete(parcela: ParcelaI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de eliminar este registro?\n
      Tenga en cuenta que no se perderán los datos, pero el registro no se podrá recuperar para seguir utilizándose.`,
      () => {
        this.onSoftDelete(parcela);
      }
    );
  }
  onSoftDelete(parcela: ParcelaI) {
    this.loader.present();
    this.service.softDelete(parcela).subscribe({
      next: (data) => {
        this.loader.dismiss();
        const parcelaDelete = this.parcelas.find((c) => c.id === parcela.id);
        if (parcelaDelete) this.parcelas_deletes.push(parcelaDelete);
        this.parcelas = this.parcelas.filter((c) => c.id !== parcela.id);
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
  restore(parcela: ParcelaI) {
    this.dialog.present(
      '¡Precaución!',
      `¿Está seguro/a de restaurar este registro?\n
      Tenga en cuenta que los datos relacionados también se restauraran.`,
      () => {
        this.onRestore(parcela);
      }
    );
  }
  onRestore(parcela: ParcelaI) {
    this.loader.present();
    const restoreParcela: Partial<ParcelaI> = {
      id: parcela.id,
      ediciones: [
        {
          descripcion: `Restaurado por: ${this.usuario?.nombre_completo}`,
          fecha_editado: new Date(),
        },
      ],
    };
    this.service.restore(restoreParcela).subscribe({
      next: (data) => {
        this.loader.dismiss();
        this.parcelas_deletes = this.parcelas.filter(
          (c) => c.id !== parcela.id
        );
        this.parcelas.unshift(data);
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

  parcelaOld: ParcelaI | undefined;
}
