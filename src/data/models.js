const db = require('./db');

class Models {
    async initializeDatabase() {
        try {
            await db.connect();

            // Crear tabla Origen
            await db.run(`
                CREATE TABLE IF NOT EXISTS origen (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    lote TEXT NOT NULL,
                    fecha_cosecha DATE NOT NULL
                )
            `);

            // Crear tabla Transformación
            await db.run(`
                CREATE TABLE IF NOT EXISTS transformacion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    lavado TEXT NOT NULL,
                    empaquetado TEXT NOT NULL,
                    control_calidad TEXT NOT NULL,
                    origen_id INTEGER NOT NULL,
                    FOREIGN KEY (origen_id) REFERENCES origen (id)
                )
            `);

            // Crear tabla Logística
            await db.run(`
                CREATE TABLE IF NOT EXISTS logistica (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    temperatura_transporte REAL NOT NULL,
                    fecha_entrega DATE NOT NULL,
                    transformacion_id INTEGER NOT NULL,
                    FOREIGN KEY (transformacion_id) REFERENCES transformacion (id)
                )
            `);

            console.log('Base de datos inicializada correctamente.');
        } catch (error) {
            console.error('Error al inicializar la base de datos:', error);
            throw error;
        }
    }

    // Métodos para operaciones en tabla Origen
    async insertOrigen(lote, fechaCosecha) {
        const sql = 'INSERT INTO origen (lote, fecha_cosecha) VALUES (?, ?)';
        return await db.run(sql, [lote, fechaCosecha]);
    }

    async getOrigenById(id) {
        const sql = 'SELECT * FROM origen WHERE id = ?';
        return await db.get(sql, [id]);
    }

    async getAllOrigen() {
        const sql = 'SELECT * FROM origen';
        return await db.all(sql);
    }

    // Métodos para operaciones en tabla Transformación
    async insertTransformacion(lavado, empaquetado, controlCalidad, origenId) {
        const sql = 'INSERT INTO transformacion (lavado, empaquetado, control_calidad, origen_id) VALUES (?, ?, ?, ?)';
        return await db.run(sql, [lavado, empaquetado, controlCalidad, origenId]);
    }

    async getTransformacionById(id) {
        const sql = 'SELECT * FROM transformacion WHERE id = ?';
        return await db.get(sql, [id]);
    }

    async getAllTransformacion() {
        const sql = 'SELECT * FROM transformacion';
        return await db.all(sql);
    }

    // Métodos para operaciones en tabla Logística
    async insertLogistica(temperaturaTransporte, fechaEntrega, transformacionId) {
        const sql = 'INSERT INTO logistica (temperatura_transporte, fecha_entrega, transformacion_id) VALUES (?, ?, ?)';
        return await db.run(sql, [temperaturaTransporte, fechaEntrega, transformacionId]);
    }

    async getLogisticaById(id) {
        const sql = 'SELECT * FROM logistica WHERE id = ?';
        return await db.get(sql, [id]);
    }

    async getAllLogistica() {
        const sql = 'SELECT * FROM logistica';
        return await db.all(sql);
    }

    // Método para obtener trazabilidad completa
    async getTrazabilidadCompleta() {
        const sql = `
            SELECT
                o.id as origen_id,
                o.lote,
                o.fecha_cosecha,
                t.id as transformacion_id,
                t.lavado,
                t.empaquetado,
                t.control_calidad,
                l.id as logistica_id,
                l.temperatura_transporte,
                l.fecha_entrega
            FROM origen o
            LEFT JOIN transformacion t ON o.id = t.origen_id
            LEFT JOIN logistica l ON t.id = l.transformacion_id
            ORDER BY o.id, t.id, l.id
        `;
        return await db.all(sql);
    }
}

module.exports = new Models();
