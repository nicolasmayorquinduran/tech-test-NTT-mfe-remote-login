import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginDto, LoginResponseDto, UserService, HttpService } from 'shared';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly httpService = inject(HttpService);
  private readonly userService = inject(UserService);
  private readonly apiUrl = 'http://localhost:3001';

  /**
   * Realiza el login y persiste los datos del usuario
   */
  login(credentials: LoginDto): Observable<LoginResponseDto> {
    return this.httpService.post<LoginResponseDto>(
      `${this.apiUrl}/login`, 
      credentials, 
      { withCredentials: true }
    )
  }

  /**
   * Cierra sesión y limpia los datos del usuario
   */
  logout(): void {
   return
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.userService.user() !== undefined;
  }
}
