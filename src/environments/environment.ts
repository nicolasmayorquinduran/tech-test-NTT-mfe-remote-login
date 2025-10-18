import { ApiConfig, AuthConfig, AppConfig } from 'shared';

export const environment = {
  production: false
};

/**
 * Configuración de la API para desarrollo
 */
export const apiConfig: ApiConfig = {
  baseUrl: 'http://localhost:3001',
  timeout: 30000
};

/**
 * Configuración de autenticación
 */
export const authConfig: AuthConfig = {
  loginEndpoint: '/login',
  logoutEndpoint: '/logout',
  tokenKey: 'auth_token'
};

/**
 * Configuración general de la aplicación
 */
export const appConfig: AppConfig = {
  production: false,
  appName: 'Login App',
  version: '1.0.0'
};
