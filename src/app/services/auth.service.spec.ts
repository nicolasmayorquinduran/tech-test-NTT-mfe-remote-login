import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { UserService, HttpService, LoginDto, LoginResponseDto } from 'shared';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpServiceMock: jasmine.SpyObj<HttpService>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    httpServiceMock = jasmine.createSpyObj('HttpService', ['post']);
    userServiceMock = jasmine.createSpyObj('UserService', ['setUserData', 'clearUser', 'user']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpService, useValue: httpServiceMock },
        { provide: UserService, useValue: userServiceMock }
      ]
    });
    
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform login and set user data on success', () => {
    const credentials: LoginDto = { username: 'admin', password: '1234' };
    const mockResponse: LoginResponseDto = {
      ok: true,
      user: { id: '1', name: 'Admin User', email: 'admin@example.com' }
    };

    httpServiceMock.post.and.returnValue(of(mockResponse));

    service.login(credentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(userServiceMock.setUserData).toHaveBeenCalledWith(mockResponse.user);
    });

    expect(httpServiceMock.post).toHaveBeenCalledWith(
      'http://localhost:3001/login',
      credentials,
      { withCredentials: true }
    );
  });

  it('should handle login error', () => {
    const credentials: LoginDto = { username: 'admin', password: 'wrong' };
    const errorMessage = 'Credenciales inválidas';

    httpServiceMock.post.and.returnValue(throwError(() => new Error(errorMessage)));

    service.login(credentials).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toContain(errorMessage);
      }
    });

    expect(httpServiceMock.post).toHaveBeenCalled();
  });

  it('should clear user data on logout', () => {
    service.logout();
    expect(userServiceMock.clearUser).toHaveBeenCalled();
  });

  it('should return true if user is authenticated', () => {
    userServiceMock.user.and.returnValue({ id: '1', name: 'Admin', email: 'admin@test.com' });
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should return false if user is not authenticated', () => {
    userServiceMock.user.and.returnValue(undefined);
    expect(service.isAuthenticated()).toBe(false);
  });
});
