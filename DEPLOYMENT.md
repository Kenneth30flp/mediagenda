# Guia de Publicacion

Recomendado para este proyecto:

- Frontend: Vercel.
- Backend: Render.
- Base de datos: Neon o Supabase PostgreSQL.
- Codigo: GitHub.

## 1. Crear Base De Datos En La Nube

1. Crea una base PostgreSQL en Neon o Supabase.
2. Copia el `DATABASE_URL`.
3. Ejecuta el contenido de `database/schema.sql` en el editor SQL de la plataforma.

## 2. Publicar Backend En Render

Configuracion del servicio:

- Runtime: Node.
- Root directory: `backend`.
- Build command: `npm install`.
- Start command: `npm start`.

Variables de entorno:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=un_secreto_largo_y_seguro
JWT_EXPIRES_IN=8h
FRONTEND_URL=https://tu-frontend.vercel.app
FRONTEND_URLS=https://tu-frontend.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

Cuando Render publique el backend, guarda la URL. Ejemplo:

```text
https://mediagenda-api.onrender.com
```

## 3. Publicar Frontend En Vercel

Configuracion del proyecto:

- Framework: Vite.
- Root directory: `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.

Variable de entorno:

```env
VITE_API_URL=https://mediagenda-api.onrender.com/api
```

## 4. Flujo Para Seguir Haciendo Cambios

Trabajas localmente, pruebas y luego subes cambios:

```bash
git add .
git commit -m "descripcion del cambio"
git push
```

Vercel y Render redeployan automaticamente si estan conectados a GitHub.

## 5. Notas Importantes

- No subas archivos `.env` reales a GitHub.
- Usa contrasenas fuertes en produccion.
- Cambia `JWT_SECRET` por un valor largo y privado.
- En produccion, no uses el usuario demo como cuenta final.
