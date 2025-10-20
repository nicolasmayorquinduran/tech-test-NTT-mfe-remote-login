# Login con Autocomplete de Crossref Members

Esta documentación explica cómo funciona el login mejorado con autocompletado de members desde la API de Crossref.

## 🎯 Objetivo

Permitir que los usuarios hagan login seleccionando un **Crossref Member** mediante un sistema de autocompletado inteligente, enviando el **Member ID** al backend en lugar del nombre.

## 🏗️ Arquitectura

### Frontend Flow

```
1. Usuario escribe en el campo "Member"
   ↓
2. Debounce de 300ms
   ↓
3. Query a Crossref API: /members?query={texto}
   ↓
4. Mostrar resultados en kebab-case
   ↓
5. Usuario selecciona un member
   ↓
6. Guardar: memberId (número) + username (kebab-case)
   ↓
7. Enviar al backend: { username, password, memberId }
```

### Backend Requirements

El endpoint de login debe aceptar:

```typescript
{
  username: string;      // "cambridge-university-press"
  password: string;      // "********"
  memberId: number;      // 98
}
```

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

**`crossref-members.service.ts`**
```
src/app/auth/services/crossref-members.service.ts
```
Servicio que:
- Busca members en Crossref API
- Convierte nombres a kebab-case
- Implementa debounce pattern
- Maneja errores gracefully

### Archivos Modificados

**`login-form.component.ts`**
- Agregado autocompletado con debounce
- Signals para opciones y estado
- Validación de member seleccionado
- Envío de memberId al backend

**`login-form.component.html`**
- Input con eventos de autocompletado
- Dropdown de opciones estilizado
- Mensaje de confirmación de selección

**`login-form.component.scss`**
- Estilos para el dropdown
- Animaciones y hover states
- Scrollbar personalizado

## 🔧 Cómo Funciona

### 1. Búsqueda con Debounce

```typescript
// El usuario escribe "Cambridge"
onUsernameInput(event) {
  // Espera 300ms antes de buscar
  this.searchSubject.next("Cambridge");
}

// En ngOnInit:
this.searchSubject.pipe(
  debounceTime(300),  // Espera 300ms
  distinctUntilChanged(),  // Solo si cambió
  switchMap(query => this.crossrefService.searchMembers(query))
)
```

### 2. Conversión a Kebab-Case

```typescript
toKebabCase("Cambridge University Press")
// → "cambridge-university-press"

toKebabCase("Annals of Family Medicine")
// → "annals-of-family-medicine"
```

### 3. Selección de Member

Cuando el usuario selecciona una opción:

```typescript
selectMember(member) {
  // Guarda el member completo
  this.selectedMember.set(member);
  
  // Actualiza el formulario
  this.loginForm.patchValue({
    username: member.displayName,  // "cambridge-university-press"
    memberId: member.id            // 98
  });
}
```

### 4. Envío al Backend

```typescript
const credentials = {
  username: "cambridge-university-press",
  password: "password123",
  memberId: 98
};

this.authService.login(credentials);
```

## 🎨 UI/UX Features

### Placeholder
```
"Empieza a escribir para autocompletar..."
```

### Autocomplete Options
```
┌─────────────────────────────────────┐
│ cambridge-university-press     #98  │
│ Cambridge, United Kingdom           │
├─────────────────────────────────────┤
│ oxford-university-press        #286 │
│ Oxford, United Kingdom              │
└─────────────────────────────────────┘
```

### Confirmación de Selección
```
✓ Seleccionado: Cambridge University Press (ID: 98)
```

### Validación
- Mínimo 3 caracteres para buscar
- Debe seleccionar un member de la lista
- Mensaje de error si no se selecciona

## 🔐 Solución al Problema de Case-Sensitivity

### ❌ Problema Original

Si solo usáramos el username en kebab-case:

```
1. Usuario selecciona: "cambridge-university-press"
2. Backend recibe: "cambridge-university-press"
3. Backend debe convertir de vuelta: "Cambridge University Press"
   ❌ PROBLEMA: Se pierden las mayúsculas originales
4. API Crossref busca: "cambridge university press"
   ❌ PROBLEMA: Puede ser case-sensitive
```

### ✅ Solución Implementada

Usar el **Member ID numérico**:

```
1. Usuario selecciona: "cambridge-university-press"
2. Frontend guarda: memberId = 98
3. Backend recibe: { username: "...", memberId: 98 }
4. Backend usa directamente el ID: GET /members/98
   ✅ SOLUCIÓN: No hay conversión, no hay pérdida de información
```

### Beneficios del ID

- ✅ **Único e inmutable**: El ID nunca cambia
- ✅ **Sin problemas de case**: Es un número
- ✅ **Más eficiente**: API queries por ID son más rápidas
- ✅ **Futureproof**: Si el member cambia de nombre, el ID sigue válido
- ✅ **Más preciso**: Evita ambigüedades con nombres similares

## 📊 API de Crossref

### Endpoint de Búsqueda

```
GET https://api.crossref.org/members?query={texto}
```

**Parámetros:**
- `query` - Texto de búsqueda (busca en primary-name)
- `rows` - Número de resultados (default: 10)

**Respuesta:**
```json
{
  "status": "ok",
  "message": {
    "items": [
      {
        "id": 98,
        "primary-name": "Cambridge University Press",
        "location": "Cambridge, United Kingdom",
        "names": ["Cambridge University Press", "CUP"]
      }
    ]
  }
}
```

### Endpoint de Member por ID

```
GET https://api.crossref.org/members/{id}
```

**Ejemplo:**
```
GET https://api.crossref.org/members/98
```

## 🔄 Flujo Completo de Login

### 1. Usuario Busca Member

```
Escribe: "cambridge"
  ↓
Debounce 300ms
  ↓
GET /members?query=cambridge
  ↓
Muestra opciones en kebab-case
```

### 2. Usuario Selecciona

```
Selecciona: "cambridge-university-press" (#98)
  ↓
Guarda en formulario:
  username: "cambridge-university-press"
  memberId: 98
```

### 3. Usuario Hace Login

```
Click en "Ingresar"
  ↓
POST /login
{
  username: "cambridge-university-press",
  password: "********",
  memberId: 98
}
```

### 4. Backend Valida

```python
# Backend (ejemplo)
def login(username, password, member_id):
    # Obtener member de Crossref por ID
    member = get_crossref_member(member_id)  # GET /members/98
    
    # Validar password
    if validate_password(member_id, password):
        # Crear sesión con member_id
        session.user_id = member_id
        session.username = username
        return success()
```

## 💡 Ejemplos de Members

### Por Nombre

| Nombre Original | Kebab-Case | ID |
|----------------|------------|-------|
| Cambridge University Press | cambridge-university-press | 98 |
| Wiley | wiley | 311 |
| Springer Nature | springer-nature | 297 |
| Oxford University Press | oxford-university-press | 286 |
| Elsevier | elsevier | 78 |

### Por ID

```typescript
// Buscar directamente por ID
crossrefService.getMemberById(98)
// → { 
//     id: 98, 
//     primaryName: "Cambridge University Press",
//     displayName: "cambridge-university-press"
//   }
```

## 🐛 Troubleshooting

### Problema: No aparecen opciones

**Solución:**
1. Verificar que HttpClient esté configurado
2. Verificar console para errores de CORS
3. Verificar que se escribieron al menos 3 caracteres

### Problema: Error de CORS

La API de Crossref permite CORS, pero verifica:
```typescript
// En crossref-members.service.ts
private readonly baseUrl = 'https://api.crossref.org';  // ✓ Correcto
```

### Problema: Opciones no se cierran al seleccionar

```typescript
// Usar mousedown en lugar de click
(mousedown)="selectMember(member)"
```

### Problema: El backend no recibe memberId

Verificar que el formulario incluya el campo:
```typescript
this.loginForm = this.fb.group({
  username: [''],
  password: [''],
  memberId: [null]  // ← Debe existir
});
```

## 🔄 Actualizar el DTO de Login

Si usas generación automática de tipos, actualiza el DTO en el backend:

```typescript
// Antes
export type LoginDto = {
  username: string;
  password: string;
};

// Después
export type LoginDto = {
  username: string;
  password: string;
  memberId?: number;  // Opcional por compatibilidad
};
```

## 📝 Testing

### Test Manual

1. Abrir login
2. Escribir "cambridge" en el campo Member
3. Esperar que aparezcan opciones
4. Seleccionar "cambridge-university-press"
5. Verificar que aparece el mensaje de confirmación
6. Ingresar password
7. Click en "Ingresar"
8. Verificar en Network tab que se envía memberId

### Test Cases

```typescript
describe('Login with Crossref', () => {
  it('should search members with debounce', () => {
    // Escribir "cambridge"
    // Esperar 300ms
    // Verificar que se llamó la API
  });

  it('should convert names to kebab-case', () => {
    expect(toKebabCase('Cambridge University Press'))
      .toBe('cambridge-university-press');
  });

  it('should require member selection', () => {
    // Escribir texto pero no seleccionar
    // Intentar login
    // Debe mostrar error
  });

  it('should send memberId on login', () => {
    // Seleccionar member
    // Hacer login
    // Verificar que credentials.memberId existe
  });
});
```

## 🚀 Mejoras Futuras

1. **Cache de búsquedas** - Evitar búsquedas repetidas
2. **Búsqueda por ID** - Permitir buscar directamente por #ID
3. **Favoritos** - Guardar members frecuentes en localStorage
4. **Historial** - Mostrar members usados recientemente
5. **Verificación** - Badge verificado para members oficiales
6. **Multi-idioma** - Buscar en `names` alternativos del member

## 📚 Recursos

- [Crossref API Docs](https://api.crossref.org/swagger-docs)
- [Members Endpoint](https://api.crossref.org/members)
- [Crossref Member List](https://www.crossref.org/members/)
- [Angular Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [RxJS Debounce](https://rxjs.dev/api/operators/debounceTime)

---

**Fecha de Implementación:** Oct 19, 2025
**Estado:** ✅ Implementado y listo para testing
