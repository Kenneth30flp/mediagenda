# Sistema Web de Gestion de Citas Medicas

Proyecto full stack simple y modular para gestionar autenticacion, pacientes, doctores, dashboard y agendamiento de citas medicas.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router.
- Backend: Node.js, Express, JWT, Zod, PostgreSQL.
- Base de datos: PostgreSQL.

## Estructura

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routes
│   │   ├── schemas
│   │   └── utils
│   ├── .env.example
│   └── package.json
├── database
│   └── schema.sql
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── lib
│   │   └── pages
│   ├── .env.example
│   └── package.json
└── README.md
```

## Instalacion

1. Crear la base de datos PostgreSQL:

```bash
createdb medical_appointments
psql -d medical_appointments -f database/schema.sql
```

En Windows, si `psql` no se reconoce, instala PostgreSQL desde https://www.postgresql.org/download/windows/ y agrega la carpeta `bin` al PATH. Normalmente es similar a `C:\Program Files\PostgreSQL\16\bin`.

2. Configurar backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

3. Configurar frontend en otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

4. Abrir la aplicacion:

```text
http://localhost:5173
```

## Usuario Demo

```text
Correo: admin@clinica.com
Contrasena: Admin123
```

## Seguridad Aplicada

- Rutas privadas protegidas por JWT.
- Validacion de datos con Zod.
- Consultas SQL parametrizadas para reducir riesgo de inyeccion SQL.
- Helmet, CORS restringido y rate limiting en la API.
- Eliminacion logica para pacientes y doctores mediante `is_active`.

## Endpoints Principales

- `POST /api/auth/login`
- `GET /api/dashboard/metrics`
- `GET|POST|PUT|DELETE /api/patients`
- `GET|POST|PUT|DELETE /api/doctors`
- `GET|POST /api/appointments`
- `PATCH /api/appointments/:id/status`

## Publicacion

Consulta `DEPLOYMENT.md` para publicar el frontend, backend y base de datos en servicios cloud.
