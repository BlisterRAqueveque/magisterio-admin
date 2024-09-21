import { AuthService } from '@/app/core';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { ReservaI } from '../../models';
import { ReservasService } from '../../service';
import { UsuarioI } from '@/app/features/login/models';
import { DialogService, LoaderService } from '@/app/shared';

@Component({
  selector: 'm-table-reservas',
  standalone: true,
  imports: [
    PaginatorModule,
    TableModule,
    CommonModule,
    TooltipModule,
    DialogModule,
    RippleModule,
    TabViewModule,
    RouterModule,
  ],
  templateUrl: './table-reservas.component.html',
  styleUrl: './table-reservas.component.css',
})
export class TableReservasComponent {
  visible = false;
  private readonly service = inject(ReservasService);
  private readonly auth = inject(AuthService);

  usuario!: UsuarioI | null;

  params = new HttpParams();

  reservas: ReservaI[] = [];

  @ViewChild('btn1') btn!: ElementRef<HTMLButtonElement>;

  async ngAfterViewInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 5);
    this.params = this.params.set('sortBy', 'DESC');
    this.activeBtn(this.btn.nativeElement);
  }

  activeBtn(btn: HTMLButtonElement) {
    const buttons = document.querySelectorAll('.btn-reservas');
    buttons.forEach((a) => a.classList.remove('bg-gray-400', 'text-white'));
    btn.classList.add('bg-gray-400', 'text-white');
    this.params = this.params.set('estado', +btn.id);
    this.getHistoric();
  }

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;

    this.service.getAll(this.params).subscribe({
      next: (data) => {
        this.reservas = data.result;
        this.totalRecords = data.count;
        this.table.loading = false;
      },
      error: (e) => {
        this.table.loading = false;
        console.error(e);
      },
    });
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

  otherAction = false;
  reserva!: ReservaI | null;
  onRowSelect(item: ReservaI) {
    if (!this.otherAction) {
      this.reserva = item;
      this.visible = true;
    }
    this.otherAction = false;
  }

  resetValues() {
    this.reserva = null;
  }

  private readonly dialog = inject(DialogService);
  private readonly loader = inject(LoaderService);

  edit(estado: number) {
    this.dialog.present(
      'Confirmación de carga',
      `¿Está seguro/a de ${
        estado === 1 ? 'aprobar' : 'rechazar'
      } la siguiente reserva?`,
      () => {
        this.loader.present();
        this.onEdit(estado);
      }
    );
  }
  onEdit(estado: number) {
    const editReserva: Partial<ReservaI> = {
      id: this.reserva?.id,
      estado,
      usuario_aprobador: this.usuario!,
      fecha_aprobado: new Date(),
    };
    this.service.update(editReserva).subscribe({
      next: (data) => {
        this.loader.dismiss();
        setTimeout(() => {
          this.dialog.confirmAction(
            'Confirmación de carga',
            `La reserva fue ${
              estado === 1 ? 'aprobada' : 'rechazada'
            } correctamente`,
            () => {
              this.visible = false;
              this.getHistoric();
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
}
