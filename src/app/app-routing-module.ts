import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      },
    {
        path: '',
        loadComponent: () =>
          import('./pages/login-form/login-form.component').then(m => m.LoginFormComponent)
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
