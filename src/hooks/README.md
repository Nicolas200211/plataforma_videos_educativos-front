# Custom Hooks

Esta carpeta contiene hooks personalizados reutilizables para toda la aplicación.

## Hooks Disponibles

### `useAuthQuery`

Hook personalizado para queries de React Query que requieren autenticación.

**Características:**
- Automáticamente verifica si existe un token en localStorage
- Solo ejecuta la query cuando el usuario está autenticado
- Soporta condiciones adicionales con `enabled`

**Uso básico:**

```tsx
import { useAuthQuery } from '../../hooks';

function MyComponent() {
  const { data, isLoading, error } = useAuthQuery({
    queryKey: ['my-data'],
    queryFn: () => myService.getData(),
  });

  // ...
}
```

**Con condición adicional:**

```tsx
const { data } = useAuthQuery({
  queryKey: ['video', videoId],
  queryFn: () => videosService.getById(videoId),
  enabled: !!videoId, // Solo ejecutar si hay videoId
});
```

**Ventajas:**
- ✅ No necesitas verificar manualmente el token
- ✅ Previene errores 401 durante el login
- ✅ Código más limpio y legible
- ✅ Consistente en toda la aplicación

### `useAuth`

Hook completo para manejar autenticación y estado del usuario.

**Propiedades disponibles:**

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `user` | `User \| null` | Datos del usuario autenticado |
| `isAuthenticated` | `boolean` | Si el usuario está autenticado (según el store) |
| `hasToken` | `boolean` | Si existe token en localStorage |
| `isFullyAuthenticated` | `boolean` | Token + usuario + isAuthenticated |
| `isAdmin` | `boolean` | Si el usuario es administrador |
| `isStudent` | `boolean` | Si el usuario es estudiante |
| `login()` | `function` | Función para hacer login |
| `register()` | `function` | Función para registrarse |
| `logout()` | `function` | Función para cerrar sesión |
| `isLoggingIn` | `boolean` | Estado de carga del login |
| `isRegistering` | `boolean` | Estado de carga del registro |
| `loginError` | `Error \| null` | Error del login |
| `registerError` | `Error \| null` | Error del registro |

**Uso en Login:**

```tsx
import { useAuth } from '../../hooks';

function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = (credentials) => {
    login(credentials);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button disabled={isLoggingIn}>
        {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
      {loginError && <p className="error">{loginError.message}</p>}
    </form>
  );
}
```

**Uso para verificar roles:**

```tsx
import { useAuth } from '../../hooks';

function MyComponent() {
  const { user, isAdmin, isStudent } = useAuth();

  if (isAdmin) {
    return <AdminView />;
  }

  if (isStudent) {
    return <StudentView />;
  }

  return <GuestView />;
}
```

**Uso en Navbar:**

```tsx
import { useAuth } from '../../hooks';

function Navbar() {
  const { user, logout, isStudent } = useAuth();

  return (
    <nav>
      <span>Hola, {user?.name}</span>
      {isStudent && <Link to="/student/videos">Mis Videos</Link>}
      <button onClick={logout}>Cerrar Sesión</button>
    </nav>
  );
}
```

## Mejores Prácticas

1. **Siempre usa `useAuthQuery` en lugar de `useQuery` para endpoints protegidos**
   ```tsx
   // ❌ Malo
   const { data } = useQuery({
     queryKey: ['data'],
     queryFn: () => api.get('/protected'),
     enabled: !!localStorage.getItem('access_token'),
   });

   // ✅ Bueno
   const { data } = useAuthQuery({
     queryKey: ['data'],
     queryFn: () => api.get('/protected'),
   });
   ```

2. **Usa `useQuery` normal solo para endpoints públicos**
   ```tsx
   const { data } = useQuery({
     queryKey: ['public-data'],
     queryFn: () => api.get('/public-endpoint'),
   });
   ```

3. **Combina condiciones cuando sea necesario**
   ```tsx
   const { data } = useAuthQuery({
     queryKey: ['user', userId],
     queryFn: () => usersService.getById(userId),
     enabled: !!userId, // Condición adicional
   });
   ```

## Archivo Barrel (index.ts)

Todos los hooks se exportan desde `hooks/index.ts` para facilitar las importaciones:

```tsx
// En lugar de:
import { useAuth } from '../../hooks/useAuth';
import { useAuthQuery } from '../../hooks/useAuthQuery';

// Puedes hacer:
import { useAuth, useAuthQuery } from '../../hooks';
```
