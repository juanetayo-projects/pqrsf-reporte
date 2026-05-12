# PQRSF – Clínica de Alta Complejidad Santa Bárbara

App web para el registro de Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones (App 1 de 3).

## Configuración rápida

### 1. Supabase

1. Ve a [app.supabase.com](https://app.supabase.com) → proyecto **pqrsf**
2. Abre **SQL Editor** y ejecuta el contenido de `supabase-schema.sql`
3. Ve a **Settings → API** y copia:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon / public key**

### 2. Configurar credenciales

Abre `js/app.js` y reemplaza las líneas al inicio:

```js
const SUPABASE_URL      = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

### 3. Publicar en GitHub Pages

```bash
cd pqrsf-reporte
git init
git add .
git commit -m "feat: app 1 – reporte PQRSF"
git remote add origin https://github.com/TU_USUARIO/pqrsf-reporte.git
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Branch: main / root** → Save.

La URL pública será: `https://TU_USUARIO.github.io/pqrsf-reporte/`

## Estructura

```
pqrsf-reporte/
├── index.html              # App principal
├── css/styles.css          # Estilos y tema de marca
├── js/app.js               # Lógica y conexión Supabase
├── assets/
│   ├── logo.png            # Logo cuadrado
│   └── logo-wide.png       # Logo horizontal (header)
└── supabase-schema.sql     # Crear tabla en Supabase
```

## Campos del formulario

| Campo | Tipo | Fuente |
|---|---|---|
| Tipo de reporte | Dropdown | Lista fija |
| Entidad | Dropdown | Lista fija |
| Sede | Dropdown | Lista fija |
| Proceso / Servicio | Dropdown | Lista fija → auto-llena Correo |
| Fecha manifestación | Date picker | Manual |
| Fuente | Dropdown | Lista fija |
| Tipo de usuario | Radio cards | Lista fija |
| Convenio / EPS | Dropdown | Lista fija |
| Régimen | Dropdown | Lista fija |
| Nombre paciente | Texto | Manual |
| No. Identificación | Texto | Manual |
| Dirección | Texto | Manual |
| Teléfono | Tel | Manual |
| Email reportante | Email | Manual |
| Descripción | Textarea | Manual |
| Falla o atributo | Dropdown agrupado | Lista fija |
| Especialidad | Texto | Manual |
| Colaborador | Texto | Manual |
| Correo proceso | Oculto | Auto (Base de datos) |
