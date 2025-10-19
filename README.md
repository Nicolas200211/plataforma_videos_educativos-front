# Plataforma de Videos Educativos - Frontend

Plataforma educativa moderna con sistema de suscripciones y protección de contenido.

## Características

- **Autenticación segura**: Login y registro con JWT
- **Roles de usuario**: Admin y Estudiante
- **Sistema de suscripciones**: Planes configurables con diferentes duraciones
- **Reproductor protegido**: Anti-grabación de pantalla y descarga
- **Gestión de videos**: Categorías, thumbnails y metadatos
- **Panel de administración**: Gestión completa de planes, videos y usuarios
- **UI Moderna**: TailwindCSS con diseño responsivo

## Tecnologías

- **React 19** + **TypeScript**
- **Vite** para build rápido
- **React Router** para navegación
- **TanStack Query** para gestión de estado del servidor
- **Zustand** para estado global del cliente
- **Axios** para peticiones HTTP
- **TailwindCSS** para estilos
- **Lucide React** para iconos

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Edita `.env` y configura la URL del backend.

3. Ejecutar en desarrollo:
```bash
npm run dev
```

4. Build para producción:
```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── admin/         # Componentes del admin
│   └── ProtectedRoute.tsx
├── hooks/             # Custom hooks
│   └── useAuth.ts
├── lib/               # Utilidades y configuración
│   ├── axios.ts      # Cliente HTTP configurado
│   └── utils.ts      # Funciones helper
├── pages/            # Páginas de la aplicación
│   ├── admin/       # Páginas del administrador
│   ├── student/     # Páginas del estudiante
│   ├── Login.tsx
│   └── Register.tsx
├── services/        # Servicios de API
│   ├── auth.service.ts
│   ├── videos.service.ts
│   └── subscriptions.service.ts
├── store/          # Estado global (Zustand)
│   └── authStore.ts
├── types/          # TypeScript types
│   └── index.ts
├── App.tsx        # Componente principal y rutas
└── main.tsx       # Entry point
```

## Protecciones Implementadas

El reproductor de video incluye múltiples capas de seguridad:

1. **Prevención de captura de pantalla**
   - Detecta teclas PrintScreen
   - Detecta shortcuts de captura (Win+Shift+S, etc.)
   - Blur automático al detectar intento

2. **Detección de herramientas de desarrollo**
   - Pausa el video si se abren DevTools
   - Verifica dimensiones de la ventana

3. **Protección de contenido**
   - Deshabilita menú contextual (click derecho)
   - Previene drag & drop del video
   - Deshabilita Picture-in-Picture
   - Tokens de acceso con expiración

4. **Marca de agua**
   - Overlay sutil con el título del video
   - Indicador de contenido protegido

## Roles y Permisos

### Administrador
- Crear y gestionar planes de suscripción
- Subir y gestionar videos
- Ver estadísticas y dashboard
- Gestionar usuarios
- Configurar precios y duraciones

### Estudiante
- Navegar catálogo de videos
- Suscribirse a planes
- Ver videos según suscripción activa
- Filtrar por categorías

## Integración con el Backend

Asegúrate de que el backend esté corriendo en la URL configurada en `.env`. El frontend espera los siguientes endpoints:

- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /auth/profile` - Perfil del usuario
- `GET /subscription-plans` - Listar planes
- `GET /subscription-plans/active` - Planes activos
- `POST /enrollments` - Crear suscripción
- `GET /enrollments/me` - Mi suscripción
- `GET /enrollments/check-access` - Verificar acceso
- `GET /videos` - Listar videos
- `GET /videos/:id` - Obtener video

## Notas de Desarrollo

- El reproductor de video incluye protecciones que funcionan mejor en navegadores modernos
- Algunas protecciones pueden variar según el navegador y sistema operativo
- Para testing, puedes crear un usuario admin directamente en la base de datos

## Próximos Pasos

- Integrar pasarela de pagos (Stripe, PayPal)
- Añadir progreso de visualización de videos
- Sistema de certificados al completar cursos
- Chat de soporte en vivo
- Notificaciones push
# plataforma_videos_educativos-front
