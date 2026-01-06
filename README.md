# Sistema de Trazabilidad Agrícola

Un sistema completo de trazabilidad agrícola desarrollado con arquitectura de 3 capas para rastrear productos agrícolas desde la cosecha hasta el supermercado.

## Arquitectura

El sistema está organizado en tres capas principales:

### 🗄️ Capa de Datos (`src/data/`)
- **db.js**: Gestión de la conexión con SQLite
- **models.js**: Definición de las tablas y operaciones CRUD

### 🧠 Capa de Lógica de Negocio (`src/business/`)
- **logic.js**: Validación de datos y reglas de negocio

### 🎨 Capa de Presentación (`src/presentation/`)
- **index.html**: Interfaz de usuario con Tailwind CSS
- **style.css**: Estilos personalizados
- **script.js**: Lógica del frontend

### 🚀 Backend (`server.js`)
Servidor Express.js que conecta todas las capas.

## Base de Datos

El sistema utiliza SQLite con tres tablas principales:

1. **Origen**: Almacena información del lote y fecha de cosecha
2. **Transformación**: Registra procesos de lavado, empaquetado y control de calidad
3. **Logística**: Controla temperatura durante transporte y fecha de entrega

## Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar el servidor
npm start

# Para desarrollo (con nodemon)
npm run dev
```

### Acceso
Una vez iniciado, acceder a `http://localhost:3000`

## Uso del Sistema

### 1. Registrar Origen
- Ingresar el lote del producto
- Seleccionar fecha de cosecha
- El sistema valida que no existan lotes duplicados

### 2. Registrar Transformación
- Seleccionar un origen disponible
- Describir procesos de lavado, empaquetado y control de calidad
- Solo se permite una transformación por origen

### 3. Registrar Logística
- Seleccionar una transformación pendiente
- Ingresar temperatura de transporte (-50°C a 50°C)
- Definir fecha de entrega (no anterior a fecha de cosecha)
- Solo se permite una logística por transformación

### 4. Ver Trazabilidad
- Visualizar todos los productos con su cadena completa de trazabilidad
- Información organizada por origen, transformación y logística

## Validaciones Implementadas

- ✅ Lotes únicos
- ✅ Fechas de cosecha no futuras
- ✅ Temperaturas de transporte en rango válido
- ✅ Fechas de entrega no anteriores a cosecha
- ✅ Relaciones uno-a-uno entre tablas
- ✅ Campos obligatorios

## API Endpoints

- `POST /agregar-origen` - Registrar origen
- `POST /agregar-transformacion` - Registrar transformación
- `POST /agregar-logistica` - Registrar logística
- `GET /origenes-disponibles` - Obtener origenes sin transformación
- `GET /transformaciones-disponibles` - Obtener transformaciones sin logística
- `GET /trazabilidad` - Obtener trazabilidad completa

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: SQLite3
- **Frontend**: HTML5, Tailwind CSS, JavaScript (Vanilla)
- **Arquitectura**: 3 capas (Datos, Negocio, Presentación)

## Estructura del Proyecto
```
/
├── src/
│   ├── data/
│   │   ├── db.js
│   │   └── models.js
│   ├── business/
│   │   └── logic.js
│   └── presentation/
│       ├── index.html
│       ├── style.css
│       └── script.js
├── server.js
├── package.json
└── README.md
```

## Características

- ✅ Arquitectura modular y escalable
- ✅ Validaciones robustas de datos
- ✅ Interfaz responsive y amigable
- ✅ Gestión completa de errores
- ✅ Base de datos relacional con integridad referencial
- ✅ API RESTful
- ✅ Actualización en tiempo real de la interfaz
