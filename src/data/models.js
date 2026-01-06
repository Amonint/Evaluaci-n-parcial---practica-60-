const db = require('./db');

class Models {
    async initializeDatabase() {
        try {
            await db.connect();

            // Crear tabla Materia Prima
            await db.run(`
                CREATE TABLE IF NOT EXISTS materia_prima (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fecha_ingreso DATE NOT NULL,
                    nombre TEXT NOT NULL,
                    marca TEXT NOT NULL,
                    unidad INTEGER NOT NULL,
                    presentacion TEXT NOT NULL,
                    lote TEXT NOT NULL,
                    fecha_vencimiento DATE,
                    proveedor TEXT NOT NULL,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Crear tabla Insumos
            await db.run(`
                CREATE TABLE IF NOT EXISTS insumos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    tipo TEXT NOT NULL,
                    cantidad REAL NOT NULL,
                    unidad TEXT NOT NULL,
                    fecha_ingreso DATE NOT NULL,
                    proveedor TEXT NOT NULL,
                    lote TEXT,
                    fecha_vencimiento DATE,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Crear tabla Producción
            await db.run(`
                CREATE TABLE IF NOT EXISTS produccion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fecha_produccion DATE NOT NULL,
                    lote_produccion TEXT NOT NULL UNIQUE,
                    cantidad_producida REAL NOT NULL,
                    notas TEXT,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Crear tabla Producción - Materia Prima (relación muchos a muchos)
            await db.run(`
                CREATE TABLE IF NOT EXISTS produccion_materia_prima (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    produccion_id INTEGER NOT NULL,
                    materia_prima_id INTEGER NOT NULL,
                    cantidad_utilizada REAL NOT NULL,
                    FOREIGN KEY (produccion_id) REFERENCES produccion (id) ON DELETE CASCADE,
                    FOREIGN KEY (materia_prima_id) REFERENCES materia_prima (id) ON DELETE CASCADE,
                    UNIQUE(produccion_id, materia_prima_id)
                )
            `);

            // Crear tabla Producción - Insumos (relación muchos a muchos)
            await db.run(`
                CREATE TABLE IF NOT EXISTS produccion_insumos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    produccion_id INTEGER NOT NULL,
                    insumo_id INTEGER NOT NULL,
                    cantidad_utilizada REAL NOT NULL,
                    FOREIGN KEY (produccion_id) REFERENCES produccion (id) ON DELETE CASCADE,
                    FOREIGN KEY (insumo_id) REFERENCES insumos (id) ON DELETE CASCADE,
                    UNIQUE(produccion_id, insumo_id)
                )
            `);

            // Crear tabla Producto Final
            await db.run(`
                CREATE TABLE IF NOT EXISTS producto_final (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    lote TEXT NOT NULL UNIQUE,
                    fecha_fabricacion DATE NOT NULL,
                    cantidad REAL NOT NULL,
                    fecha_vencimiento DATE,
                    produccion_id INTEGER NOT NULL,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (produccion_id) REFERENCES produccion (id) ON DELETE CASCADE
                )
            `);

            // Crear tabla Stock
            await db.run(`
                CREATE TABLE IF NOT EXISTS stock (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tipo TEXT NOT NULL CHECK(tipo IN ('materia_prima', 'producto_final')),
                    item_id INTEGER NOT NULL,
                    cantidad_disponible REAL NOT NULL,
                    ubicacion TEXT,
                    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(tipo, item_id)
                )
            `);

            console.log('Base de datos inicializada correctamente.');
        } catch (error) {
            console.error('Error al inicializar la base de datos:', error);
            throw error;
        }
    }

    // ===== MÉTODOS PARA MATERIA PRIMA =====
    async insertMateriaPrima(fechaIngreso, nombre, marca, unidad, presentacion, lote, fechaVencimiento, proveedor) {
        const sql = `INSERT INTO materia_prima
            (fecha_ingreso, nombre, marca, unidad, presentacion, lote, fecha_vencimiento, proveedor)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        return await db.run(sql, [fechaIngreso, nombre, marca, unidad, presentacion, lote, fechaVencimiento, proveedor]);
    }

    async updateMateriaPrima(id, fechaIngreso, nombre, marca, unidad, presentacion, lote, fechaVencimiento, proveedor) {
        const sql = `UPDATE materia_prima SET
            fecha_ingreso = ?, nombre = ?, marca = ?, unidad = ?, presentacion = ?,
            lote = ?, fecha_vencimiento = ?, proveedor = ?
            WHERE id = ?`;
        return await db.run(sql, [fechaIngreso, nombre, marca, unidad, presentacion, lote, fechaVencimiento, proveedor, id]);
    }

    async deleteMateriaPrima(id) {
        const sql = 'DELETE FROM materia_prima WHERE id = ?';
        return await db.run(sql, [id]);
    }

    async getMateriaPrimaById(id) {
        const sql = 'SELECT * FROM materia_prima WHERE id = ?';
        return await db.get(sql, [id]);
    }

    async getAllMateriaPrima() {
        const sql = 'SELECT * FROM materia_prima ORDER BY fecha_creacion DESC';
        return await db.all(sql);
    }

    async searchMateriaPrima(filtros = {}) {
        let sql = 'SELECT * FROM materia_prima WHERE 1=1';
        const params = [];

        if (filtros.nombre) {
            sql += ' AND nombre LIKE ?';
            params.push(`%${filtros.nombre}%`);
        }
        if (filtros.marca) {
            sql += ' AND marca LIKE ?';
            params.push(`%${filtros.marca}%`);
        }
        if (filtros.lote) {
            sql += ' AND lote LIKE ?';
            params.push(`%${filtros.lote}%`);
        }
        if (filtros.proveedor) {
            sql += ' AND proveedor LIKE ?';
            params.push(`%${filtros.proveedor}%`);
        }
        if (filtros.fechaDesde) {
            sql += ' AND fecha_ingreso >= ?';
            params.push(filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            sql += ' AND fecha_ingreso <= ?';
            params.push(filtros.fechaHasta);
        }

        sql += ' ORDER BY fecha_creacion DESC';

        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        return await db.all(sql, params);
    }

    // ===== MÉTODOS PARA INSUMOS =====
    async insertInsumo(nombre, tipo, cantidad, unidad, fechaIngreso, proveedor, lote, fechaVencimiento) {
        const sql = `INSERT INTO insumos
            (nombre, tipo, cantidad, unidad, fecha_ingreso, proveedor, lote, fecha_vencimiento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        return await db.run(sql, [nombre, tipo, cantidad, unidad, fechaIngreso, proveedor, lote, fechaVencimiento]);
    }

    async updateInsumo(id, nombre, tipo, cantidad, unidad, fechaIngreso, proveedor, lote, fechaVencimiento) {
        const sql = `UPDATE insumos SET
            nombre = ?, tipo = ?, cantidad = ?, unidad = ?, fecha_ingreso = ?,
            proveedor = ?, lote = ?, fecha_vencimiento = ?
            WHERE id = ?`;
        return await db.run(sql, [nombre, tipo, cantidad, unidad, fechaIngreso, proveedor, lote, fechaVencimiento, id]);
    }

    async deleteInsumo(id) {
        const sql = 'DELETE FROM insumos WHERE id = ?';
        return await db.run(sql, [id]);
    }

    async getInsumoById(id) {
        const sql = 'SELECT * FROM insumos WHERE id = ?';
        return await db.get(sql, [id]);
    }

    async getAllInsumos() {
        const sql = 'SELECT * FROM insumos ORDER BY fecha_creacion DESC';
        return await db.all(sql);
    }

    async searchInsumos(filtros = {}) {
        let sql = 'SELECT * FROM insumos WHERE 1=1';
        const params = [];

        if (filtros.nombre) {
            sql += ' AND nombre LIKE ?';
            params.push(`%${filtros.nombre}%`);
        }
        if (filtros.tipo) {
            sql += ' AND tipo LIKE ?';
            params.push(`%${filtros.tipo}%`);
        }
        if (filtros.proveedor) {
            sql += ' AND proveedor LIKE ?';
            params.push(`%${filtros.proveedor}%`);
        }
        if (filtros.fechaDesde) {
            sql += ' AND fecha_ingreso >= ?';
            params.push(filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            sql += ' AND fecha_ingreso <= ?';
            params.push(filtros.fechaHasta);
        }

        sql += ' ORDER BY fecha_creacion DESC';

        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        return await db.all(sql, params);
    }

    // ===== MÉTODOS PARA PRODUCCIÓN =====
    async insertProduccion(fechaProduccion, loteProduccion, cantidadProducida, notas) {
        const sql = `INSERT INTO produccion
            (fecha_produccion, lote_produccion, cantidad_producida, notas)
            VALUES (?, ?, ?, ?)`;
        return await db.run(sql, [fechaProduccion, loteProduccion, cantidadProducida, notas]);
    }

    async updateProduccion(id, fechaProduccion, loteProduccion, cantidadProducida, notas) {
        const sql = `UPDATE produccion SET
            fecha_produccion = ?, lote_produccion = ?, cantidad_producida = ?, notas = ?
            WHERE id = ?`;
        return await db.run(sql, [fechaProduccion, loteProduccion, cantidadProducida, notas, id]);
    }

    async deleteProduccion(id) {
        const sql = 'DELETE FROM produccion WHERE id = ?';
        return await db.run(sql, [id]);
    }

    async getProduccionById(id) {
        const sql = 'SELECT * FROM produccion WHERE id = ?';
        return await db.get(sql, [id]);
    }

    async getAllProduccion() {
        const sql = 'SELECT * FROM produccion ORDER BY fecha_creacion DESC';
        return await db.all(sql);
    }

    async searchProduccion(filtros = {}) {
        let sql = 'SELECT * FROM produccion WHERE 1=1';
        const params = [];

        if (filtros.lote) {
            sql += ' AND lote_produccion LIKE ?';
            params.push(`%${filtros.lote}%`);
        }
        if (filtros.fechaDesde) {
            sql += ' AND fecha_produccion >= ?';
            params.push(filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            sql += ' AND fecha_produccion <= ?';
            params.push(filtros.fechaHasta);
        }

        sql += ' ORDER BY fecha_creacion DESC';

        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        return await db.all(sql, params);
    }

    // Métodos para relaciones de producción
    async addMateriaPrimaToProduccion(produccionId, materiaPrimaId, cantidadUtilizada) {
        const sql = `INSERT INTO produccion_materia_prima
            (produccion_id, materia_prima_id, cantidad_utilizada)
            VALUES (?, ?, ?)`;
        return await db.run(sql, [produccionId, materiaPrimaId, cantidadUtilizada]);
    }

    async addInsumoToProduccion(produccionId, insumoId, cantidadUtilizada) {
        const sql = `INSERT INTO produccion_insumos
            (produccion_id, insumo_id, cantidad_utilizada)
            VALUES (?, ?, ?)`;
        return await db.run(sql, [produccionId, insumoId, cantidadUtilizada]);
    }

    async getProduccionCompleta(id) {
        const produccion = await this.getProduccionById(id);
        if (!produccion) return null;

        // Obtener materia prima utilizada
        const sqlMateriaPrima = `
            SELECT mp.*, pmp.cantidad_utilizada
            FROM produccion_materia_prima pmp
            JOIN materia_prima mp ON pmp.materia_prima_id = mp.id
            WHERE pmp.produccion_id = ?`;
        const materiaPrima = await db.all(sqlMateriaPrima, [id]);

        // Obtener insumos utilizados
        const sqlInsumos = `
            SELECT i.*, pi.cantidad_utilizada
            FROM produccion_insumos pi
            JOIN insumos i ON pi.insumo_id = i.id
            WHERE pi.produccion_id = ?`;
        const insumos = await db.all(sqlInsumos, [id]);

        // Obtener productos finales
        const sqlProductos = `
            SELECT * FROM producto_final WHERE produccion_id = ?`;
        const productosFinales = await db.all(sqlProductos, [id]);

        return {
            ...produccion,
            materiaPrima,
            insumos,
            productosFinales
        };
    }

    // ===== MÉTODOS PARA PRODUCTO FINAL =====
    async insertProductoFinal(nombre, lote, fechaFabricacion, cantidad, fechaVencimiento, produccionId) {
        const sql = `INSERT INTO producto_final
            (nombre, lote, fecha_fabricacion, cantidad, fecha_vencimiento, produccion_id)
            VALUES (?, ?, ?, ?, ?, ?)`;
        return await db.run(sql, [nombre, lote, fechaFabricacion, cantidad, fechaVencimiento, produccionId]);
    }

    async updateProductoFinal(id, nombre, lote, fechaFabricacion, cantidad, fechaVencimiento, produccionId) {
        const sql = `UPDATE producto_final SET
            nombre = ?, lote = ?, fecha_fabricacion = ?, cantidad = ?, fecha_vencimiento = ?, produccion_id = ?
            WHERE id = ?`;
        return await db.run(sql, [nombre, lote, fechaFabricacion, cantidad, fechaVencimiento, produccionId, id]);
    }

    async deleteProductoFinal(id) {
        const sql = 'DELETE FROM producto_final WHERE id = ?';
        return await db.run(sql, [id]);
    }

    async getProductoFinalById(id) {
        const sql = 'SELECT * FROM producto_final WHERE id = ?';
        return await db.get(sql, [id]);
    }

    async getAllProductoFinal() {
        const sql = 'SELECT * FROM producto_final ORDER BY fecha_creacion DESC';
        return await db.all(sql);
    }

    async searchProductoFinal(filtros = {}) {
        let sql = 'SELECT * FROM producto_final WHERE 1=1';
        const params = [];

        if (filtros.nombre) {
            sql += ' AND nombre LIKE ?';
            params.push(`%${filtros.nombre}%`);
        }
        if (filtros.lote) {
            sql += ' AND lote LIKE ?';
            params.push(`%${filtros.lote}%`);
        }
        if (filtros.fechaDesde) {
            sql += ' AND fecha_fabricacion >= ?';
            params.push(filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            sql += ' AND fecha_fabricacion <= ?';
            params.push(filtros.fechaHasta);
        }

        sql += ' ORDER BY fecha_creacion DESC';

        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        return await db.all(sql, params);
    }

    // ===== MÉTODOS PARA STOCK =====
    async insertOrUpdateStock(tipo, itemId, cantidadDisponible, ubicacion) {
        const sql = `INSERT INTO stock (tipo, item_id, cantidad_disponible, ubicacion, fecha_actualizacion)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(tipo, item_id) DO UPDATE SET
            cantidad_disponible = excluded.cantidad_disponible,
            ubicacion = excluded.ubicacion,
            fecha_actualizacion = CURRENT_TIMESTAMP`;
        return await db.run(sql, [tipo, itemId, cantidadDisponible, ubicacion]);
    }

    async updateStockCantidad(tipo, itemId, nuevaCantidad) {
        const sql = `UPDATE stock SET
            cantidad_disponible = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE tipo = ? AND item_id = ?`;
        return await db.run(sql, [nuevaCantidad, tipo, itemId]);
    }

    async deleteStock(tipo, itemId) {
        const sql = 'DELETE FROM stock WHERE tipo = ? AND item_id = ?';
        return await db.run(sql, [tipo, itemId]);
    }

    async getStockById(tipo, itemId) {
        const sql = 'SELECT * FROM stock WHERE tipo = ? AND item_id = ?';
        return await db.get(sql, [tipo, itemId]);
    }

    async getAllStock() {
        const sql = 'SELECT * FROM stock ORDER BY fecha_actualizacion DESC';
        return await db.all(sql);
    }

    async getStockDetallado() {
        const sqlMateriaPrima = `
            SELECT 'materia_prima' as tipo, mp.id, mp.nombre, mp.marca, mp.lote,
                   COALESCE(s.cantidad_disponible, 0) as cantidad_disponible,
                   s.ubicacion, s.fecha_actualizacion
            FROM materia_prima mp
            LEFT JOIN stock s ON s.tipo = 'materia_prima' AND s.item_id = mp.id`;

        const sqlProductoFinal = `
            SELECT 'producto_final' as tipo, pf.id, pf.nombre, pf.lote, NULL as marca,
                   COALESCE(s.cantidad_disponible, 0) as cantidad_disponible,
                   s.ubicacion, s.fecha_actualizacion
            FROM producto_final pf
            LEFT JOIN stock s ON s.tipo = 'producto_final' AND s.item_id = pf.id`;

        const materiaPrimaStock = await db.all(sqlMateriaPrima);
        const productoFinalStock = await db.all(sqlProductoFinal);

        return [...materiaPrimaStock, ...productoFinalStock];
    }

    // ===== MÉTODOS PARA TRAZABILIDAD =====
    async getTrazabilidadPorLote(lote) {
        // Buscar si es un lote de producto final
        const productoFinal = await db.get(
            'SELECT * FROM producto_final WHERE lote = ?',
            [lote]
        );

        if (productoFinal) {
            return await this.getTrazabilidadCompletaProducto(productoFinal.id);
        }

        // Buscar si es un lote de producción
        const produccion = await db.get(
            'SELECT * FROM produccion WHERE lote_produccion = ?',
            [lote]
        );

        if (produccion) {
            return await this.getTrazabilidadCompletaProduccion(produccion.id);
        }

        // Buscar si es un lote de materia prima
        const materiaPrima = await db.get(
            'SELECT * FROM materia_prima WHERE lote = ?',
            [lote]
        );

        if (materiaPrima) {
            return await this.getTrazabilidadCompletaMateriaPrima(materiaPrima.id);
        }

        return null;
    }

    async getTrazabilidadCompletaProducto(productoFinalId) {
        const sql = `
            SELECT
                pf.id as producto_final_id, pf.nombre, pf.lote as lote_final, pf.fecha_fabricacion,
                pf.cantidad, pf.fecha_vencimiento,
                p.id as produccion_id, p.fecha_produccion, p.lote_produccion, p.cantidad_producida,
                mp.id as materia_prima_id, mp.nombre as nombre_mp, mp.marca, mp.unidad,
                mp.presentacion, mp.lote as lote_mp, mp.fecha_vencimiento as venc_mp, mp.proveedor,
                pmp.cantidad_utilizada as cantidad_mp_utilizada,
                i.id as insumo_id, i.nombre as nombre_insumo, i.tipo, i.unidad as unidad_insumo,
                i.proveedor as proveedor_insumo, i.lote as lote_insumo,
                pi.cantidad_utilizada as cantidad_insumo_utilizada,
                s_mp.cantidad_disponible as stock_mp, s_pf.cantidad_disponible as stock_pf
            FROM producto_final pf
            JOIN produccion p ON pf.produccion_id = p.id
            LEFT JOIN produccion_materia_prima pmp ON pmp.produccion_id = p.id
            LEFT JOIN materia_prima mp ON mp.id = pmp.materia_prima_id
            LEFT JOIN produccion_insumos pi ON pi.produccion_id = p.id
            LEFT JOIN insumos i ON i.id = pi.insumo_id
            LEFT JOIN stock s_mp ON s_mp.tipo = 'materia_prima' AND s_mp.item_id = mp.id
            LEFT JOIN stock s_pf ON s_pf.tipo = 'producto_final' AND s_pf.item_id = pf.id
            WHERE pf.id = ?`;

        const resultados = await db.all(sql, [productoFinalId]);

        if (resultados.length === 0) return null;

        const primerResultado = resultados[0];

        return {
            productoFinal: {
                id: primerResultado.producto_final_id,
                nombre: primerResultado.nombre,
                lote: primerResultado.lote_final,
                fechaFabricacion: primerResultado.fecha_fabricacion,
                cantidad: primerResultado.cantidad,
                fechaVencimiento: primerResultado.fecha_vencimiento,
                stock: primerResultado.stock_pf
            },
            produccion: {
                id: primerResultado.produccion_id,
                fechaProduccion: primerResultado.fecha_produccion,
                loteProduccion: primerResultado.lote_produccion,
                cantidadProducida: primerResultado.cantidad_producida
            },
            materiaPrima: resultados.filter(r => r.materia_prima_id).map(r => ({
                id: r.materia_prima_id,
                nombre: r.nombre_mp,
                marca: r.marca,
                unidad: r.unidad,
                presentacion: r.presentacion,
                lote: r.lote_mp,
                fechaVencimiento: r.venc_mp,
                proveedor: r.proveedor,
                cantidadUtilizada: r.cantidad_mp_utilizada,
                stock: r.stock_mp
            })),
            insumos: resultados.filter(r => r.insumo_id).map(r => ({
                id: r.insumo_id,
                nombre: r.nombre_insumo,
                tipo: r.tipo,
                unidad: r.unidad_insumo,
                proveedor: r.proveedor_insumo,
                lote: r.lote_insumo,
                cantidadUtilizada: r.cantidad_insumo_utilizada
            }))
        };
    }

    async getTrazabilidadCompletaProduccion(produccionId) {
        // Obtener datos de la producción
        const produccion = await db.get('SELECT * FROM produccion WHERE id = ?', [produccionId]);
        if (!produccion) return null;

        // Obtener materia prima utilizada
        const sqlMateriaPrima = `
            SELECT mp.*, pmp.cantidad_utilizada
            FROM produccion_materia_prima pmp
            JOIN materia_prima mp ON mp.id = pmp.materia_prima_id
            WHERE pmp.produccion_id = ?`;
        const materiaPrima = await db.all(sqlMateriaPrima, [produccionId]);

        // Obtener insumos utilizados
        const sqlInsumos = `
            SELECT i.*, pi.cantidad_utilizada
            FROM produccion_insumos pi
            JOIN insumos i ON i.id = pi.insumo_id
            WHERE pi.produccion_id = ?`;
        const insumos = await db.all(sqlInsumos, [produccionId]);

        // Obtener productos finales generados
        const sqlProductosFinales = `
            SELECT * FROM producto_final WHERE produccion_id = ?`;
        const productosFinales = await db.all(sqlProductosFinales, [produccionId]);

        return {
            produccion: {
                id: produccion.id,
                fechaProduccion: produccion.fecha_produccion,
                loteProduccion: produccion.lote_produccion,
                cantidadProducida: produccion.cantidad_producida
            },
            materiaPrima: materiaPrima.map(mp => ({
                id: mp.id,
                nombre: mp.nombre,
                marca: mp.marca,
                unidad: mp.unidad,
                presentacion: mp.presentacion,
                lote: mp.lote,
                fechaVencimiento: mp.fecha_vencimiento,
                proveedor: mp.proveedor,
                cantidadUtilizada: mp.cantidad_utilizada
            })),
            insumos: insumos.map(i => ({
                id: i.id,
                nombre: i.nombre,
                tipo: i.tipo,
                unidad: i.unidad,
                proveedor: i.proveedor,
                lote: i.lote,
                cantidadUtilizada: i.cantidad_utilizada
            })),
            productosFinales: productosFinales.map(pf => ({
                id: pf.id,
                nombre: pf.nombre,
                lote: pf.lote,
                fechaFabricacion: pf.fecha_fabricacion,
                cantidad: pf.cantidad,
                fechaVencimiento: pf.fecha_vencimiento
            }))
        };
    }

    async getTrazabilidadCompletaMateriaPrima(materiaPrimaId) {
        // Primero obtener los datos de la materia prima
        const materiaPrima = await db.get('SELECT * FROM materia_prima WHERE id = ?', [materiaPrimaId]);
        if (!materiaPrima) return null;

        // Luego obtener las producciones relacionadas
        const sqlProducciones = `
            SELECT
                p.id as produccion_id, p.fecha_produccion, p.lote_produccion, p.cantidad_producida,
                pmp.cantidad_utilizada,
                pf.id as producto_final_id, pf.nombre, pf.lote as lote_final, pf.fecha_fabricacion,
                pf.cantidad, pf.fecha_vencimiento
            FROM produccion_materia_prima pmp
            JOIN produccion p ON p.id = pmp.produccion_id
            LEFT JOIN producto_final pf ON pf.produccion_id = p.id
            WHERE pmp.materia_prima_id = ?
            ORDER BY p.fecha_produccion`;

        const resultadosProducciones = await db.all(sqlProducciones, [materiaPrimaId]);

        // Agrupar por producción
        const produccionesMap = new Map();

        resultadosProducciones.forEach(r => {
            if (!produccionesMap.has(r.produccion_id)) {
                produccionesMap.set(r.produccion_id, {
                    id: r.produccion_id,
                    fechaProduccion: r.fecha_produccion,
                    loteProduccion: r.lote_produccion,
                    cantidadProducida: r.cantidad_producida,
                    cantidadUtilizada: r.cantidad_utilizada,
                    productosFinales: []
                });
            }

            if (r.producto_final_id) {
                produccionesMap.get(r.produccion_id).productosFinales.push({
                    id: r.producto_final_id,
                    nombre: r.nombre,
                    lote: r.lote_final,
                    fechaFabricacion: r.fecha_fabricacion,
                    cantidad: r.cantidad,
                    fechaVencimiento: r.fecha_vencimiento
                });
            }
        });

        return {
            materiaPrima: {
                id: materiaPrima.id,
                fechaIngreso: materiaPrima.fecha_ingreso,
                nombre: materiaPrima.nombre,
                marca: materiaPrima.marca,
                unidad: materiaPrima.unidad,
                presentacion: materiaPrima.presentacion,
                lote: materiaPrima.lote,
                fechaVencimiento: materiaPrima.fecha_vencimiento,
                proveedor: materiaPrima.proveedor
            },
            producciones: Array.from(produccionesMap.values())
        };
    }
}

module.exports = new Models();
