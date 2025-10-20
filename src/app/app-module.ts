import { NgModule } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { App } from './app';
import { AppRoutingModule } from './app-routing-module';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    App
  ],
  providers: [provideHttpClient(withFetch())]
})
export class AppModule {}
