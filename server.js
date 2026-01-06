const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

// Importar las capas de la aplicación
const models = require('./src/data/models');
const businessLogic = require('./src/business/logic');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'src/presentation')));

// Inicializar base de datos al iniciar el servidor
async function inicializarServidor() {
    try {
        await models.initializeDatabase();
        console.log('Servidor inicializado correctamente');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al inicializar el servidor:', error);
        process.exit(1);
    }
}

// Rutas principales

// Ruta raíz - servir el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/presentation/index.html'));
});

// ===== RUTAS DE LA API =====

// ===== MATERIA PRIMA =====
app.get('/materia-prima', async (req, res) => {
    try {
        const filtros = req.query;
        const resultado = await businessLogic.consultarMateriaPrima(filtros);
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /materia-prima:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/materia-prima/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await models.getMateriaPrimaById(parseInt(id));
        if (!resultado) {
            return res.status(404).json({ success: false, message: 'Materia prima no encontrada' });
        }
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /materia-prima/:id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/materia-prima', async (req, res) => {
    try {
        const resultado = await businessLogic.registrarMateriaPrima(
            req.body.fechaIngreso,
            req.body.nombre,
            req.body.marca,
            req.body.unidad,
            req.body.presentacion,
            req.body.lote,
            req.body.fechaVencimiento,
            req.body.proveedor
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en POST /materia-prima:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.put('/materia-prima/:id', async (req, res) => {
    try {
        const resultado = await businessLogic.actualizarMateriaPrima(
            parseInt(req.params.id),
            req.body.fechaIngreso,
            req.body.nombre,
            req.body.marca,
            req.body.unidad,
            req.body.presentacion,
            req.body.lote,
            req.body.fechaVencimiento,
            req.body.proveedor
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en PUT /materia-prima/:id:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.delete('/materia-prima/:id', async (req, res) => {
    try {
        const resultado = await businessLogic.eliminarMateriaPrima(parseInt(req.params.id));
        res.json(resultado);
    } catch (error) {
        console.error('Error en DELETE /materia-prima/:id:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ===== INSUMOS =====
app.get('/insumos', async (req, res) => {
    try {
        const filtros = req.query;
        const resultado = await businessLogic.consultarInsumos(filtros);
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /insumos:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/insumos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await models.getInsumoById(parseInt(id));
        if (!resultado) {
            return res.status(404).json({ success: false, message: 'Insumo no encontrado' });
        }
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /insumos/:id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/insumos', async (req, res) => {
    try {
        const resultado = await businessLogic.registrarInsumo(
            req.body.nombre,
            req.body.tipo,
            req.body.cantidad,
            req.body.unidad,
            req.body.fechaIngreso,
            req.body.proveedor,
            req.body.lote,
            req.body.fechaVencimiento
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en POST /insumos:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.put('/insumos/:id', async (req, res) => {
    try {
        const resultado = await businessLogic.actualizarInsumo(
            parseInt(req.params.id),
            req.body.nombre,
            req.body.tipo,
            req.body.cantidad,
            req.body.unidad,
            req.body.fechaIngreso,
            req.body.proveedor,
            req.body.lote,
            req.body.fechaVencimiento
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en PUT /insumos/:id:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.delete('/insumos/:id', async (req, res) => {
    try {
        const resultado = await businessLogic.eliminarInsumo(parseInt(req.params.id));
        res.json(resultado);
    } catch (error) {
        console.error('Error en DELETE /insumos/:id:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ===== PRODUCCIÓN =====
app.get('/produccion', async (req, res) => {
    try {
        const filtros = req.query;
        const resultado = await businessLogic.consultarProduccion(filtros);
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /produccion:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/produccion/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await models.getProduccionCompleta(parseInt(id));
        if (!resultado) {
            return res.status(404).json({ success: false, message: 'Producción no encontrada' });
        }
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /produccion/:id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/produccion', async (req, res) => {
    try {
        const resultado = await businessLogic.registrarProduccion(
            req.body.fechaProduccion,
            req.body.loteProduccion,
            req.body.cantidadProducida,
            req.body.notas,
            req.body.materiaPrima || [],
            req.body.insumos || []
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en POST /produccion:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.put('/produccion/:id', async (req, res) => {
    try {
        const resultado = await businessLogic.actualizarProduccion(
            parseInt(req.params.id),
            req.body.fechaProduccion,
            req.body.loteProduccion,
            req.body.cantidadProducida,
            req.body.notas
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en PUT /produccion/:id:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.delete('/produccion/:id', async (req, res) => {
    try {
        const resultado = await businessLogic.eliminarProduccion(parseInt(req.params.id));
        res.json(resultado);
    } catch (error) {
        console.error('Error en DELETE /produccion/:id:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ===== PRODUCTO FINAL =====
app.get('/producto-final', async (req, res) => {
    try {
        const filtros = req.query;
        const resultado = await businessLogic.consultarProductoFinal(filtros);
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /producto-final:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/producto-final/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await models.getProductoFinalById(parseInt(id));
        if (!resultado) {
            return res.status(404).json({ success: false, message: 'Producto final no encontrado' });
        }
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /producto-final/:id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/producto-final', async (req, res) => {
    try {
        const resultado = await businessLogic.registrarProductoFinal(
            req.body.nombre,
            req.body.lote,
            req.body.fechaFabricacion,
            req.body.cantidad,
            req.body.fechaVencimiento,
            req.body.produccionId
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en POST /producto-final:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.put('/producto-final/:id', async (req, res) => {
    try {
        const resultado = await businessLogic.actualizarProductoFinal(
            parseInt(req.params.id),
            req.body.nombre,
            req.body.lote,
            req.body.fechaFabricacion,
            req.body.cantidad,
            req.body.fechaVencimiento,
            req.body.produccionId
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en PUT /producto-final/:id:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.delete('/producto-final/:id', async (req, res) => {
    try {
        const resultado = await businessLogic.eliminarProductoFinal(parseInt(req.params.id));
        res.json(resultado);
    } catch (error) {
        console.error('Error en DELETE /producto-final/:id:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ===== STOCK =====
app.get('/stock', async (req, res) => {
    try {
        const resultado = await businessLogic.consultarStock();
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /stock:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/stock', async (req, res) => {
    try {
        const resultado = await businessLogic.registrarStock(
            req.body.tipo,
            req.body.itemId,
            req.body.cantidadDisponible,
            req.body.ubicacion
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en POST /stock:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.put('/stock', async (req, res) => {
    try {
        const resultado = await businessLogic.actualizarStock(
            req.body.tipo,
            req.body.itemId,
            req.body.nuevaCantidad
        );
        res.json(resultado);
    } catch (error) {
        console.error('Error en PUT /stock:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.delete('/stock', async (req, res) => {
    try {
        const resultado = await businessLogic.eliminarStock(req.body.tipo, req.body.itemId);
        res.json(resultado);
    } catch (error) {
        console.error('Error en DELETE /stock:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ===== TRAZABILIDAD =====
app.get('/trazabilidad/:lote', async (req, res) => {
    try {
        const { lote } = req.params;
        const resultado = await businessLogic.consultarTrazabilidadPorLote(lote);
        if (!resultado) {
            return res.status(404).json({ success: false, message: 'Lote no encontrado' });
        }
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /trazabilidad/:lote:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===== REPORTES =====
app.get('/reportes/:tipo', async (req, res) => {
    try {
        const { tipo } = req.params;
        let datos;

        switch (tipo) {
            case 'materia-prima':
                datos = await models.getAllMateriaPrima();
                break;
            case 'insumos':
                datos = await models.getAllInsumos();
                break;
            case 'produccion':
                datos = await models.getAllProduccion();
                break;
            case 'producto-final':
                datos = await models.getAllProductoFinal();
                break;
            case 'stock':
                datos = await models.getStockDetallado();
                break;
            default:
                return res.status(400).json({ success: false, message: 'Tipo de reporte no válido' });
        }

        // Para este ejemplo, devolveremos los datos como JSON
        // En una implementación real, generaríamos archivos CSV, PDF, etc.
        res.json({
            success: true,
            tipo: tipo,
            formato: 'json',
            datos: datos,
            generado: new Date().toISOString(),
            totalRegistros: datos.length
        });

    } catch (error) {
        console.error('Error en GET /reportes/:tipo:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/reportes/trazabilidad', async (req, res) => {
    try {
        const { lote } = req.body;

        if (!lote) {
            return res.status(400).json({ success: false, message: 'El lote es obligatorio' });
        }

        const resultado = await businessLogic.generarReporteTrazabilidad(lote);

        res.json(resultado);

    } catch (error) {
        console.error('Error en POST /reportes/trazabilidad:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ===== DATOS PARA SELECTORES =====
app.get('/datos/materia-prima', async (req, res) => {
    try {
        const resultado = await businessLogic.obtenerMateriaPrimaDisponible();
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /datos/materia-prima:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/datos/insumos', async (req, res) => {
    try {
        const resultado = await businessLogic.obtenerInsumosDisponibles();
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /datos/insumos:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/datos/produccion', async (req, res) => {
    try {
        const resultado = await businessLogic.obtenerProduccionesDisponibles();
        res.json(resultado);
    } catch (error) {
        console.error('Error en GET /datos/produccion:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de señales para cerrar la base de datos correctamente
process.on('SIGINT', async () => {
    console.log('Cerrando servidor...');
    try {
        const db = require('./src/data/db');
        await db.close();
        console.log('Base de datos cerrada correctamente');
    } catch (error) {
        console.error('Error al cerrar la base de datos:', error);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Cerrando servidor...');
    try {
        const db = require('./src/data/db');
        await db.close();
        console.log('Base de datos cerrada correctamente');
    } catch (error) {
        console.error('Error al cerrar la base de datos:', error);
    }
    process.exit(0);
});

// Iniciar el servidor
inicializarServidor();
