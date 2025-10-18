import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
// import { API_CONFIG, AUTH_CONFIG, APP_CONFIG } from 'shared';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthModule } from './auth/auth.module';
// import { apiConfig, authConfig, appConfig } from '../environments/environment';

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    // Configuración de la aplicación usando tokens de shared
    // { provide: API_CONFIG, useValue: apiConfig },
    // { provide: AUTH_CONFIG, useValue: authConfig },
    // { provide: APP_CONFIG, useValue: appConfig }
  ],
  bootstrap: [App]
})
export class AppModule { }
