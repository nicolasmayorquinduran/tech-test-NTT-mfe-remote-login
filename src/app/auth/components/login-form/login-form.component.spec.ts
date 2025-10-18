import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    
    await TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate username field', () => {
    const username = component.loginForm.get('username');
    expect(username?.valid).toBeFalsy();
    
    username?.setValue('admin');
    expect(username?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    const password = component.loginForm.get('password');
    expect(password?.valid).toBeFalsy();
    
    password?.setValue('123');
    expect(password?.hasError('minlength')).toBeTruthy();
    
    password?.setValue('1234');
    expect(password?.valid).toBeTruthy();
  });

  it('should call authService.login and emit formSubmit on successful login', () => {
    const mockResponse = { ok: true, user: { id: '1', name: 'Admin', email: 'admin@test.com' } };
    authServiceMock.login.and.returnValue(of(mockResponse));
    spyOn(component.formSubmit, 'emit');
    
    component.loginForm.setValue({
      username: 'admin',
      password: '1234'
    });
    
    component.onSubmit();
    
    expect(authServiceMock.login).toHaveBeenCalledWith({
      username: 'admin',
      password: '1234'
    });
    expect(component.formSubmit.emit).toHaveBeenCalledWith(mockResponse);
    expect(component.isLoading).toBeFalsy();
    expect(component.errorMessage).toBe('');
  });

  it('should handle login error', () => {
    const mockError = new Error('Credenciales inválidas');
    authServiceMock.login.and.returnValue(throwError(() => mockError));
    
    component.loginForm.setValue({
      username: 'admin',
      password: 'wrong'
    });
    
    component.onSubmit();
    
    expect(component.isLoading).toBeFalsy();
    expect(component.errorMessage).toBe('Credenciales inválidas');
  });

  it('should not call login when form is invalid', () => {
    component.onSubmit();
    
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });
});
