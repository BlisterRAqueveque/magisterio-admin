import { AuthService } from '@/app/core';
import { DialogService, InputComponent, LoaderService } from '@/app/shared';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'm-login-panel',
  standalone: true,
  imports: [InputComponent, RippleModule],
  templateUrl: './login-panel.component.html',
  styleUrl: './login-panel.component.css',
})
export class LoginPanelComponent {
  private readonly loading = inject(LoaderService);
  private readonly dialog = inject(DialogService);
  private readonly auth = inject(AuthService);

  usuario!: string;
  pass!: string;
  enter = false;

  login(ev?: Event) {
    ev?.preventDefault();
    if (this.usuario && this.pass) {
      this.loading.present();
      this.auth.login(this.usuario, this.pass).subscribe({
        next: (data) => {
          this.loading.dismiss();
          this.enter = false;
        },
        error: (e) => {
          this.loading.dismiss();
          console.error(e);
          if (e ? e.error : false) {
            switch (e.error.message) {
              case 'Wrong credentials': {
                this.dialog.error(
                  'Error de ingreso',
                  'Contraseña incorrecta',
                  () => {
                    this.enter = false;
                  }
                );
                break;
              }
              case 'Not found': {
                this.dialog.error(
                  'Error de ingreso',
                  'Usuario no encontrado',
                  () => {
                    this.enter = false;
                  }
                );
                break;
              }
              default: {
                this.dialog.error(
                  'Error de ingreso',
                  'Algo ocurrió con el servidor',
                  () => {
                    this.enter = false;
                  }
                );
                break;
              }
            }
          } else {
            this.dialog.error(
              'Error de ingreso',
              'Algo ocurrió con el servidor',
              () => {
                this.enter = false;
              }
            );
          }
        },
      });
    } else {
      this.dialog.error(
        'Error de ingreso',
        'Complete los campos para continuar',
        () => {
          this.enter = false;
        }
      );
    }
  }

  @ViewChild('button') button!: ElementRef<HTMLButtonElement>;
  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    // Lógica a ejecutar cuando se presiona Enter
    if (!this.enter) {
      this.button.nativeElement.click();
      this.enter = true;
    }
  }
}
