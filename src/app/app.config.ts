import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { LoaderService } from './shared/loader/loader.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DialogService } from './shared/confirm-dialog/dialog.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ModalService } from './shared/modal/modal.service';
import { HostService } from './core/services/host.service';
import { jwtInterceptor } from './core/interceptor/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    LoaderService,
    DialogService,
    ModalService,
    HostService,
  ],
};
