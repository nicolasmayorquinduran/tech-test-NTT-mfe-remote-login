import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('login');

  handleLoginSubmit(formData: any): void {
    console.log('Datos del formulario recibidos:', formData);
    // Aquí puedes manejar el login, hacer llamadas a API, etc.
  }
}
