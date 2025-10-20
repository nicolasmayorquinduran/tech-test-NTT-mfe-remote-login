import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

/**
 * Interfaz para las opciones de autocompletado de members
 */
export interface MemberOption {
  id: number;
  primaryName: string;
  displayName: string; // nombre en kebab-case
  location?: string;
}

/**
 * Interfaz para la respuesta de la API de Crossref /members
 */
interface CrossrefMembersResponse {
  status: string;
  'message-type': string;
  'message-version': string;
  message: {
    items: Array<{
      id: number;
      'primary-name': string;
      location?: string;
      names?: string[];
    }>;
    'total-results': number;
    'items-per-page': number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CrossrefMembersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.crossref.org';

  /**
   * Busca members en Crossref por primary-name
   * @param query - Texto de búsqueda
   * @param rows - Número de resultados (default: 10)
   * @returns Observable con array de opciones de members
   */
  searchMembers(query: string, rows: number = 10): Observable<MemberOption[]> {
    if (!query) {
      return of([]);
    }

    const params = new HttpParams()
      .set('query', query.trim())
      .set('rows', rows.toString());

    return this.http.get<CrossrefMembersResponse>(`${this.baseUrl}/members`, { params }).pipe(
      map(response => {
        return response.message.items.map(member => ({
          id: member.id,
          primaryName: member['primary-name'],
          displayName: this.toKebabCase(member['primary-name']),
          location: member.location
        }));
      }),
      catchError(error => {
        console.error('Error searching Crossref members:', error);
        return of([]);
      })
    );
  }

  /**
   * Busca un member por ID
   * @param memberId - ID del member
   * @returns Observable con la opción del member
   */
  getMemberById(memberId: number): Observable<MemberOption | null> {
    return this.http.get<any>(`${this.baseUrl}/members/${memberId}`).pipe(
      map(response => ({
        id: response.message.id,
        primaryName: response.message['primary-name'],
        displayName: this.toKebabCase(response.message['primary-name']),
        location: response.message.location
      })),
      catchError(error => {
        console.error('Error getting Crossref member:', error);
        return of(null);
      })
    );
  }

  /**
   * Convierte un string a kebab-case
   * Ejemplo: "Annals of Family Medicine" -> "annals-of-family-medicine"
   */
  toKebabCase(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')  // Reemplaza espacios y guiones bajos con guiones
      .replace(/[^\w\-]+/g, '')  // Remueve caracteres especiales excepto guiones
      .replace(/\-\-+/g, '-')    // Reemplaza múltiples guiones con uno solo
      .replace(/^-+/, '')         // Remueve guiones al inicio
      .replace(/-+$/, '');        // Remueve guiones al final
  }

  /**
   * Crea un operador RxJS para búsqueda con debounce
   * Úsalo en el pipe de un observable del input
   */
  createSearchOperator(debounceMs: number = 300) {
    return <T>(source: Observable<T>) =>
      source.pipe(
        debounceTime(debounceMs),
        distinctUntilChanged(),
        switchMap((query: any) => this.searchMembers(query))
      );
  }
}
