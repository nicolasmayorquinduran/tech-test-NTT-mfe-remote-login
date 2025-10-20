# Login (MFE)

Rol: Autenticación con autocomplete de members (Crossref) y cookie HttpOnly.

Solución:
- Reactive Forms con debounce + búsqueda en Crossref.
- Control flow moderno `@if/@for`.
- Oculta el formulario cuando ya existe sesión usando `GlobalStateService`.
- Emite eventos `MEMBER_LOGGED_IN` a través de `EventBus`.

Ejecutar local:
- pnpm install
- pnpm start
- Requiere API (cookie HttpOnly) y host levantados.
