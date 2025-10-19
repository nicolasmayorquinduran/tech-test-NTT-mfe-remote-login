import { 
  DEFAULT_PROD_API_CONFIG, 
  DEFAULT_AUTH_CONFIG, 
  createAppConfig 
} from 'shared';

export const environment = {
  production: true
};

/**
 * Configuración de la API - usa valores compartidos por defecto
 */
export const apiConfig = DEFAULT_PROD_API_CONFIG;

/**
 * Configuración de autenticación - usa valores compartidos por defecto
 */
export const authConfig = DEFAULT_AUTH_CONFIG;

/**
 * Configuración general de la aplicación
 */
export const appConfig = createAppConfig('Login App', true);
