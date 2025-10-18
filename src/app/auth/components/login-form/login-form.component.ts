import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  standalone: false,
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  @Output() formSubmit = new EventEmitter();

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.formSubmit.emit(response);
          console.log('Login exitoso:', response);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error al iniciar sesión';
          console.error('Error en login:', error);
        }
      });
    }
  }
}
