import { ApiConfig, AuthConfig, AppConfig } from 'shared';

export const environment = {
  production: true
};

/**
 * Configuración de la API para producción
 */
export const apiConfig: ApiConfig = {
  baseUrl: 'https://api.production.com',
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
  production: true,
  appName: 'Login App',
  version: '1.0.0'
};
