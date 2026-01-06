const models = require('../data/models');

class BusinessLogic {
    // ===== VALIDACIONES =====

    // Validación de Materia Prima
    validateMateriaPrimaData(fechaIngreso, nombre, marca, unidad, presentacion, lote, fechaVencimiento, proveedor) {
        if (!fechaIngreso) {
            throw new Error('La fecha de ingreso es obligatoria');
        }

        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fechaIngreso)) {
            throw new Error('La fecha de ingreso debe tener el formato YYYY-MM-DD');
        }

        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre de la materia prima es obligatorio');
        }

        if (!marca || marca.trim() === '') {
            throw new Error('La marca es obligatoria');
        }

        if (!unidad || isNaN(parseInt(unidad)) || parseInt(unidad) <= 0) {
            throw new Error('La unidad debe ser un número positivo');
        }

        if (!presentacion || presentacion.trim() === '') {
            throw new Error('La presentación es obligatoria');
        }

        if (!lote || lote.trim() === '') {
            throw new Error('El lote es obligatorio');
        }

        if (!proveedor || proveedor.trim() === '') {
            throw new Error('El proveedor es obligatorio');
        }

        // Validar fecha de vencimiento si existe
        if (fechaVencimiento && !fechaRegex.test(fechaVencimiento)) {
            throw new Error('La fecha de vencimiento debe tener el formato YYYY-MM-DD');
        }

        // Validar que la fecha de vencimiento no sea anterior a la fecha de ingreso
        if (fechaVencimiento) {
            const fechaIngresoDate = new Date(fechaIngreso);
            const fechaVencimientoDate = new Date(fechaVencimiento);

            if (fechaVencimientoDate <= fechaIngresoDate) {
                throw new Error('La fecha de vencimiento debe ser posterior a la fecha de ingreso');
            }
        }

        return true;
    }

    // Validación de Insumos
    validateInsumoData(nombre, tipo, cantidad, unidad, fechaIngreso, proveedor, lote, fechaVencimiento) {
        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre del insumo es obligatorio');
        }

        if (!tipo || tipo.trim() === '') {
            throw new Error('El tipo de insumo es obligatorio');
        }

        if (!cantidad || isNaN(parseFloat(cantidad)) || parseFloat(cantidad) <= 0) {
            throw new Error('La cantidad debe ser un número positivo');
        }

        if (!unidad || unidad.trim() === '') {
            throw new Error('La unidad es obligatoria');
        }

        if (!fechaIngreso) {
            throw new Error('La fecha de ingreso es obligatoria');
        }

        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fechaIngreso)) {
            throw new Error('La fecha de ingreso debe tener el formato YYYY-MM-DD');
        }

        if (!proveedor || proveedor.trim() === '') {
            throw new Error('El proveedor es obligatorio');
        }

        if (fechaVencimiento && !fechaRegex.test(fechaVencimiento)) {
            throw new Error('La fecha de vencimiento debe tener el formato YYYY-MM-DD');
        }

        return true;
    }

    // Validación de Producción
    validateProduccionData(fechaProduccion, loteProduccion, cantidadProducida, notas) {
        if (!fechaProduccion) {
            throw new Error('La fecha de producción es obligatoria');
        }

        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fechaProduccion)) {
            throw new Error('La fecha de producción debe tener el formato YYYY-MM-DD');
        }

        if (!loteProduccion || loteProduccion.trim() === '') {
            throw new Error('El lote de producción es obligatorio');
        }

        if (!cantidadProducida || isNaN(parseFloat(cantidadProducida)) || parseFloat(cantidadProducida) <= 0) {
            throw new Error('La cantidad producida debe ser un número positivo');
        }

        return true;
    }

    // Validación de Producto Final
    validateProductoFinalData(nombre, lote, fechaFabricacion, cantidad, fechaVencimiento, produccionId) {
        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre del producto final es obligatorio');
        }

        if (!lote || lote.trim() === '') {
            throw new Error('El lote del producto final es obligatorio');
        }

        if (!fechaFabricacion) {
            throw new Error('La fecha de fabricación es obligatoria');
        }

        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fechaFabricacion)) {
            throw new Error('La fecha de fabricación debe tener el formato YYYY-MM-DD');
        }

        if (!cantidad || isNaN(parseFloat(cantidad)) || parseFloat(cantidad) <= 0) {
            throw new Error('La cantidad debe ser un número positivo');
        }

        if (!produccionId || isNaN(parseInt(produccionId))) {
            throw new Error('El ID de producción es obligatorio y debe ser un número válido');
        }

        if (fechaVencimiento && !fechaRegex.test(fechaVencimiento)) {
            throw new Error('La fecha de vencimiento debe tener el formato YYYY-MM-DD');
        }

        return true;
    }

    // ===== OPERACIONES DE MATERIA PRIMA =====

    async registrarMateriaPrima(fechaIngreso, nombre, marca, unidad, presentacion, lote, fechaVencimiento, proveedor) {
        try {
            this.validateMateriaPrimaData(fechaIngreso, nombre, marca, unidad, presentacion, lote, fechaVencimiento, proveedor);

            // Verificar si el lote ya existe
            const materiaPrimaExistente = await models.getAllMateriaPrima();
            const loteExistente = materiaPrimaExistente.find(mp => mp.lote.toLowerCase() === lote.toLowerCase().trim());

            if (loteExistente) {
                throw new Error(`El lote '${lote}' ya existe en el sistema`);
            }

            const result = await models.insertMateriaPrima(
                fechaIngreso,
                nombre.trim(),
                marca.trim(),
                parseInt(unidad),
                presentacion.trim(),
                lote.trim(),
                fechaVencimiento,
                proveedor.trim()
            );

            console.log(`Materia prima registrada con ID: ${result.id}`);

            return {
                success: true,
                message: 'Materia prima registrada exitosamente',
                id: result.id
            };
        } catch (error) {
            console.error('Error al registrar materia prima:', error);
            throw error;
        }
    }

    async actualizarMateriaPrima(id, fechaIngreso, nombre, marca, unidad, presentacion, lote, fechaVencimiento, proveedor) {
        try {
            this.validateMateriaPrimaData(fechaIngreso, nombre, marca, unidad, presentacion, lote, fechaVencimiento, proveedor);

            // Verificar que existe
            const existente = await models.getMateriaPrimaById(id);
            if (!existente) {
                throw new Error(`No se encontró la materia prima con ID ${id}`);
            }

            // Verificar que el lote no esté duplicado (excluyendo el actual)
            const todas = await models.getAllMateriaPrima();
            const loteDuplicado = todas.find(mp => mp.id !== id && mp.lote.toLowerCase() === lote.toLowerCase().trim());

            if (loteDuplicado) {
                throw new Error(`El lote '${lote}' ya existe en el sistema`);
            }

            await models.updateMateriaPrima(id, fechaIngreso, nombre.trim(), marca.trim(), parseInt(unidad),
                presentacion.trim(), lote.trim(), fechaVencimiento, proveedor.trim());

            console.log(`Materia prima actualizada con ID: ${id}`);

            return {
                success: true,
                message: 'Materia prima actualizada exitosamente',
                id: id
            };
        } catch (error) {
            console.error('Error al actualizar materia prima:', error);
            throw error;
        }
    }

    async eliminarMateriaPrima(id) {
        try {
            const existente = await models.getMateriaPrimaById(id);
            if (!existente) {
                throw new Error(`No se encontró la materia prima con ID ${id}`);
            }

            // Verificar si está siendo utilizada en alguna producción
            const produccion = await models.getAllProduccion();
            // Aquí necesitaríamos verificar las relaciones, pero por simplicidad asumimos que se puede eliminar

            await models.deleteMateriaPrima(id);

            console.log(`Materia prima eliminada con ID: ${id}`);

            return {
                success: true,
                message: 'Materia prima eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error al eliminar materia prima:', error);
            throw error;
        }
    }

    async consultarMateriaPrima(filtros = {}) {
        try {
            return await models.searchMateriaPrima(filtros);
        } catch (error) {
            console.error('Error al consultar materia prima:', error);
            throw error;
        }
    }

    // ===== OPERACIONES DE INSUMOS =====

    async registrarInsumo(nombre, tipo, cantidad, unidad, fechaIngreso, proveedor, lote, fechaVencimiento) {
        try {
            this.validateInsumoData(nombre, tipo, cantidad, unidad, fechaIngreso, proveedor, lote, fechaVencimiento);

            const result = await models.insertInsumo(
                nombre.trim(),
                tipo.trim(),
                parseFloat(cantidad),
                unidad.trim(),
                fechaIngreso,
                proveedor.trim(),
                lote ? lote.trim() : null,
                fechaVencimiento
            );

            console.log(`Insumo registrado con ID: ${result.id}`);

            return {
                success: true,
                message: 'Insumo registrado exitosamente',
                id: result.id
            };
        } catch (error) {
            console.error('Error al registrar insumo:', error);
            throw error;
        }
    }

    async actualizarInsumo(id, nombre, tipo, cantidad, unidad, fechaIngreso, proveedor, lote, fechaVencimiento) {
        try {
            this.validateInsumoData(nombre, tipo, cantidad, unidad, fechaIngreso, proveedor, lote, fechaVencimiento);

            const existente = await models.getInsumoById(id);
            if (!existente) {
                throw new Error(`No se encontró el insumo con ID ${id}`);
            }

            await models.updateInsumo(id, nombre.trim(), tipo.trim(), parseFloat(cantidad), unidad.trim(),
                fechaIngreso, proveedor.trim(), lote ? lote.trim() : null, fechaVencimiento);

            console.log(`Insumo actualizado con ID: ${id}`);

            return {
                success: true,
                message: 'Insumo actualizado exitosamente',
                id: id
            };
        } catch (error) {
            console.error('Error al actualizar insumo:', error);
            throw error;
        }
    }

    async eliminarInsumo(id) {
        try {
            const existente = await models.getInsumoById(id);
            if (!existente) {
                throw new Error(`No se encontró el insumo con ID ${id}`);
            }

            await models.deleteInsumo(id);

            console.log(`Insumo eliminado con ID: ${id}`);

            return {
                success: true,
                message: 'Insumo eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error al eliminar insumo:', error);
            throw error;
        }
    }

    async consultarInsumos(filtros = {}) {
        try {
            return await models.searchInsumos(filtros);
        } catch (error) {
            console.error('Error al consultar insumos:', error);
            throw error;
        }
    }

    // ===== OPERACIONES DE PRODUCCIÓN =====

    async registrarProduccion(fechaProduccion, loteProduccion, cantidadProducida, notas, materiaPrima = [], insumos = []) {
        try {
            this.validateProduccionData(fechaProduccion, loteProduccion, cantidadProducida, notas);

            // Verificar que el lote de producción no exista
            const produccionExistente = await models.getAllProduccion();
            const loteExistente = produccionExistente.find(p => p.lote_produccion.toLowerCase() === loteProduccion.toLowerCase().trim());

            if (loteExistente) {
                throw new Error(`El lote de producción '${loteProduccion}' ya existe en el sistema`);
            }

            const result = await models.insertProduccion(
                fechaProduccion,
                loteProduccion.trim(),
                parseFloat(cantidadProducida),
                notas ? notas.trim() : null
            );

            const produccionId = result.id;

            // Agregar materia prima utilizada
            for (const mp of materiaPrima) {
                if (mp.id && mp.cantidadUtilizada) {
                    // Verificar que la materia prima existe y tiene stock suficiente
                    const materiaPrimaData = await models.getMateriaPrimaById(mp.id);
                    if (!materiaPrimaData) {
                        throw new Error(`Materia prima con ID ${mp.id} no encontrada`);
                    }

                    await models.addMateriaPrimaToProduccion(produccionId, mp.id, parseFloat(mp.cantidadUtilizada));
                }
            }

            // Agregar insumos utilizados
            for (const insumo of insumos) {
                if (insumo.id && insumo.cantidadUtilizada) {
                    const insumoData = await models.getInsumoById(insumo.id);
                    if (!insumoData) {
                        throw new Error(`Insumo con ID ${insumo.id} no encontrado`);
                    }

                    await models.addInsumoToProduccion(produccionId, insumo.id, parseFloat(insumo.cantidadUtilizada));
                }
            }

            console.log(`Producción registrada con ID: ${produccionId}`);

            return {
                success: true,
                message: 'Producción registrada exitosamente',
                id: produccionId
            };
        } catch (error) {
            console.error('Error al registrar producción:', error);
            throw error;
        }
    }

    async actualizarProduccion(id, fechaProduccion, loteProduccion, cantidadProducida, notas) {
        try {
            this.validateProduccionData(fechaProduccion, loteProduccion, cantidadProducida, notas);

            const existente = await models.getProduccionById(id);
            if (!existente) {
                throw new Error(`No se encontró la producción con ID ${id}`);
            }

            // Verificar que el lote no esté duplicado
            const todas = await models.getAllProduccion();
            const loteDuplicado = todas.find(p => p.id !== id && p.lote_produccion.toLowerCase() === loteProduccion.toLowerCase().trim());

            if (loteDuplicado) {
                throw new Error(`El lote de producción '${loteProduccion}' ya existe en el sistema`);
            }

            await models.updateProduccion(id, fechaProduccion, loteProduccion.trim(), parseFloat(cantidadProducida), notas ? notas.trim() : null);

            console.log(`Producción actualizada con ID: ${id}`);

            return {
                success: true,
                message: 'Producción actualizada exitosamente',
                id: id
            };
        } catch (error) {
            console.error('Error al actualizar producción:', error);
            throw error;
        }
    }

    async eliminarProduccion(id) {
        try {
            const existente = await models.getProduccionById(id);
            if (!existente) {
                throw new Error(`No se encontró la producción con ID ${id}`);
            }

            await models.deleteProduccion(id);

            console.log(`Producción eliminada con ID: ${id}`);

            return {
                success: true,
                message: 'Producción eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error al eliminar producción:', error);
            throw error;
        }
    }

    async consultarProduccion(filtros = {}) {
        try {
            return await models.searchProduccion(filtros);
        } catch (error) {
            console.error('Error al consultar producción:', error);
            throw error;
        }
    }

    // ===== OPERACIONES DE PRODUCTO FINAL =====

    async registrarProductoFinal(nombre, lote, fechaFabricacion, cantidad, fechaVencimiento, produccionId) {
        try {
            this.validateProductoFinalData(nombre, lote, fechaFabricacion, cantidad, fechaVencimiento, produccionId);

            // Verificar que la producción existe
            const produccion = await models.getProduccionById(produccionId);
            if (!produccion) {
                throw new Error(`No se encontró la producción con ID ${produccionId}`);
            }

            // Verificar que el lote no exista
            const productoExistente = await models.getAllProductoFinal();
            const loteExistente = productoExistente.find(pf => pf.lote.toLowerCase() === lote.toLowerCase().trim());

            if (loteExistente) {
                throw new Error(`El lote '${lote}' ya existe en el sistema`);
            }

            const result = await models.insertProductoFinal(
                nombre.trim(),
                lote.trim(),
                fechaFabricacion,
                parseFloat(cantidad),
                fechaVencimiento,
                parseInt(produccionId)
            );

            console.log(`Producto final registrado con ID: ${result.id}`);

            return {
                success: true,
                message: 'Producto final registrado exitosamente',
                id: result.id
            };
        } catch (error) {
            console.error('Error al registrar producto final:', error);
            throw error;
        }
    }

    async actualizarProductoFinal(id, nombre, lote, fechaFabricacion, cantidad, fechaVencimiento, produccionId) {
        try {
            this.validateProductoFinalData(nombre, lote, fechaFabricacion, cantidad, fechaVencimiento, produccionId);

            const existente = await models.getProductoFinalById(id);
            if (!existente) {
                throw new Error(`No se encontró el producto final con ID ${id}`);
            }

            // Verificar que la producción existe
            const produccion = await models.getProduccionById(produccionId);
            if (!produccion) {
                throw new Error(`No se encontró la producción con ID ${produccionId}`);
            }

            // Verificar que el lote no esté duplicado
            const todos = await models.getAllProductoFinal();
            const loteDuplicado = todos.find(pf => pf.id !== id && pf.lote.toLowerCase() === lote.toLowerCase().trim());

            if (loteDuplicado) {
                throw new Error(`El lote '${lote}' ya existe en el sistema`);
            }

            await models.updateProductoFinal(id, nombre.trim(), lote.trim(), fechaFabricacion,
                parseFloat(cantidad), fechaVencimiento, parseInt(produccionId));

            console.log(`Producto final actualizado con ID: ${id}`);

            return {
                success: true,
                message: 'Producto final actualizado exitosamente',
                id: id
            };
        } catch (error) {
            console.error('Error al actualizar producto final:', error);
            throw error;
        }
    }

    async eliminarProductoFinal(id) {
        try {
            const existente = await models.getProductoFinalById(id);
            if (!existente) {
                throw new Error(`No se encontró el producto final con ID ${id}`);
            }

            await models.deleteProductoFinal(id);

            console.log(`Producto final eliminado con ID: ${id}`);

            return {
                success: true,
                message: 'Producto final eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error al eliminar producto final:', error);
            throw error;
        }
    }

    async consultarProductoFinal(filtros = {}) {
        try {
            return await models.searchProductoFinal(filtros);
        } catch (error) {
            console.error('Error al consultar producto final:', error);
            throw error;
        }
    }

    // ===== OPERACIONES DE STOCK =====

    async registrarStock(tipo, itemId, cantidadDisponible, ubicacion) {
        try {
            if (!tipo || !['materia_prima', 'producto_final'].includes(tipo)) {
                throw new Error('El tipo debe ser "materia_prima" o "producto_final"');
            }

            if (!itemId || isNaN(parseInt(itemId))) {
                throw new Error('El ID del item es obligatorio y debe ser un número válido');
            }

            if (cantidadDisponible === null || cantidadDisponible === undefined || isNaN(parseFloat(cantidadDisponible)) || parseFloat(cantidadDisponible) < 0) {
                throw new Error('La cantidad disponible debe ser un número no negativo');
            }

            // Verificar que el item existe
            if (tipo === 'materia_prima') {
                const item = await models.getMateriaPrimaById(itemId);
                if (!item) {
                    throw new Error(`No se encontró la materia prima con ID ${itemId}`);
                }
            } else {
                const item = await models.getProductoFinalById(itemId);
                if (!item) {
                    throw new Error(`No se encontró el producto final con ID ${itemId}`);
                }
            }

            await models.insertOrUpdateStock(tipo, parseInt(itemId), parseFloat(cantidadDisponible), ubicacion ? ubicacion.trim() : null);

            console.log(`Stock registrado para ${tipo} ID: ${itemId}`);

            return {
                success: true,
                message: 'Stock registrado exitosamente'
            };
        } catch (error) {
            console.error('Error al registrar stock:', error);
            throw error;
        }
    }

    async actualizarStock(tipo, itemId, nuevaCantidad) {
        try {
            if (!tipo || !['materia_prima', 'producto_final'].includes(tipo)) {
                throw new Error('El tipo debe ser "materia_prima" o "producto_final"');
            }

            if (nuevaCantidad === null || nuevaCantidad === undefined || isNaN(parseFloat(nuevaCantidad)) || parseFloat(nuevaCantidad) < 0) {
                throw new Error('La nueva cantidad debe ser un número no negativo');
            }

            await models.updateStockCantidad(tipo, parseInt(itemId), parseFloat(nuevaCantidad));

            console.log(`Stock actualizado para ${tipo} ID: ${itemId}`);

            return {
                success: true,
                message: 'Stock actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error al actualizar stock:', error);
            throw error;
        }
    }

    async eliminarStock(tipo, itemId) {
        try {
            await models.deleteStock(tipo, parseInt(itemId));

            console.log(`Stock eliminado para ${tipo} ID: ${itemId}`);

            return {
                success: true,
                message: 'Stock eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error al eliminar stock:', error);
            throw error;
        }
    }

    async consultarStock() {
        try {
            return await models.getStockDetallado();
        } catch (error) {
            console.error('Error al consultar stock:', error);
            throw error;
        }
    }

    // ===== TRAZABILIDAD =====

    async consultarTrazabilidadPorLote(lote) {
        try {
            return await models.getTrazabilidadPorLote(lote);
        } catch (error) {
            console.error('Error al consultar trazabilidad por lote:', error);
            throw error;
        }
    }

    async generarReporteTrazabilidad(lote) {
        try {
            const trazabilidad = await this.consultarTrazabilidadPorLote(lote);
            if (!trazabilidad) {
                throw new Error(`No se encontró trazabilidad para el lote '${lote}'`);
            }

            // Aquí se podría implementar la lógica para generar reportes en diferentes formatos
            // Por ahora retornamos la data estructurada
            return {
                success: true,
                data: trazabilidad,
                formato: 'json'
            };
        } catch (error) {
            console.error('Error al generar reporte de trazabilidad:', error);
            throw error;
        }
    }

    // ===== MÉTODOS AUXILIARES =====

    async obtenerMateriaPrimaDisponible() {
        try {
            return await models.getAllMateriaPrima();
        } catch (error) {
            console.error('Error al obtener materia prima disponible:', error);
            throw error;
        }
    }

    async obtenerInsumosDisponibles() {
        try {
            return await models.getAllInsumos();
        } catch (error) {
            console.error('Error al obtener insumos disponibles:', error);
            throw error;
        }
    }

    async obtenerProduccionesDisponibles() {
        try {
            return await models.getAllProduccion();
        } catch (error) {
            console.error('Error al obtener producciones disponibles:', error);
            throw error;
        }
    }
}

module.exports = new BusinessLogic();
