import { Component, HostListener, inject } from '@angular/core';
import { InputComponent } from '../../../../shared/input/input.component';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { DialogService } from '../../../../shared/confirm-dialog/dialog.service';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'm-login-panel',
  standalone: true,
  imports: [InputComponent],
  templateUrl: './login-panel.component.html',
  styleUrl: './login-panel.component.css',
})
export class LoginPanelComponent {
  private readonly loading = inject(LoaderService);
  private readonly dialog = inject(DialogService);
  private readonly auth = inject(AuthService);

  usuario!: string;
  pass!: string;

  login(ev?: Event) {
    if (ev) ev.preventDefault();
    if (this.usuario && this.pass) {
      this.loading.present();
      this.auth.login(this.usuario, this.pass).subscribe({
        next: (data) => {
          this.loading.dismiss();
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
                  () => {}
                );
                break;
              }
              case 'Not found': {
                this.dialog.error(
                  'Error de ingreso',
                  'Usuario no encontrado',
                  () => {}
                );
                break;
              }
              default: {
                this.dialog.error(
                  'Error de ingreso',
                  'Algo ocurrió con el servidor',
                  () => {}
                );
                break;
              }
            }
          } else {
            this.dialog.error(
              'Error de ingreso',
              'Algo ocurrió con el servidor',
              () => {}
            );
          }
        },
      });
    } else {
      this.dialog.error(
        'Error de ingreso',
        'Complete los campos para continuar',
        () => {}
      );
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    // Lógica a ejecutar cuando se presiona Enter
    this.login();
  }
}
