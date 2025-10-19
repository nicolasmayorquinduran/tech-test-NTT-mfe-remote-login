import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { EventBusService, EventTypes } from 'shared';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  standalone: false,
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly eventBus = inject(EventBusService);
  
  loginForm: FormGroup;
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if(!this.loginForm.valid){
      this.errorMessage.set('Formulario invalido');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.eventBus.emit(EventTypes.USER_LOGGED_IN, response.user);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Error al iniciar sesión');
        }
      });
  }
}
