const models = require('../data/models');

class BusinessLogic {
    // Validación de datos para Origen
    validateOrigenData(lote, fechaCosecha) {
        if (!lote || lote.trim() === '') {
            throw new Error('El lote es obligatorio');
        }

        if (!fechaCosecha) {
            throw new Error('La fecha de cosecha es obligatoria');
        }

        // Validar formato de fecha (YYYY-MM-DD)
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fechaCosecha)) {
            throw new Error('La fecha debe tener el formato YYYY-MM-DD');
        }

        // Validar que la fecha no sea futura
        const fechaIngresada = new Date(fechaCosecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaIngresada > hoy) {
            throw new Error('La fecha de cosecha no puede ser futura');
        }

        return true;
    }

    // Validación de datos para Transformación
    validateTransformacionData(lavado, empaquetado, controlCalidad, origenId) {
        if (!lavado || lavado.trim() === '') {
            throw new Error('Los datos de lavado son obligatorios');
        }

        if (!empaquetado || empaquetado.trim() === '') {
            throw new Error('Los datos de empaquetado son obligatorios');
        }

        if (!controlCalidad || controlCalidad.trim() === '') {
            throw new Error('Los datos de control de calidad son obligatorios');
        }

        if (!origenId || isNaN(parseInt(origenId))) {
            throw new Error('El ID de origen es obligatorio y debe ser un número válido');
        }

        return true;
    }

    // Validación de datos para Logística
    validateLogisticaData(temperaturaTransporte, fechaEntrega, transformacionId) {
        if (temperaturaTransporte === null || temperaturaTransporte === undefined || isNaN(parseFloat(temperaturaTransporte))) {
            throw new Error('La temperatura de transporte es obligatoria y debe ser un número');
        }

        const temp = parseFloat(temperaturaTransporte);
        if (temp < -50 || temp > 50) {
            throw new Error('La temperatura debe estar entre -50°C y 50°C');
        }

        if (!fechaEntrega) {
            throw new Error('La fecha de entrega es obligatoria');
        }

        // Validar formato de fecha (YYYY-MM-DD)
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fechaEntrega)) {
            throw new Error('La fecha debe tener el formato YYYY-MM-DD');
        }

        if (!transformacionId || isNaN(parseInt(transformacionId))) {
            throw new Error('El ID de transformación es obligatorio y debe ser un número válido');
        }

        return true;
    }

    // Operaciones de negocio para Origen
    async registrarOrigen(lote, fechaCosecha) {
        try {
            this.validateOrigenData(lote, fechaCosecha);

            // Verificar si el lote ya existe
            const origenes = await models.getAllOrigen();
            const loteExistente = origenes.find(o => o.lote.toLowerCase() === lote.toLowerCase().trim());

            if (loteExistente) {
                throw new Error(`El lote '${lote}' ya existe en el sistema`);
            }

            const result = await models.insertOrigen(lote.trim(), fechaCosecha);
            console.log(`Origen registrado con ID: ${result.id}`);

            return {
                success: true,
                message: 'Origen registrado exitosamente',
                id: result.id
            };
        } catch (error) {
            console.error('Error al registrar origen:', error);
            throw error;
        }
    }

    // Operaciones de negocio para Transformación
    async registrarTransformacion(lavado, empaquetado, controlCalidad, origenId) {
        try {
            this.validateTransformacionData(lavado, empaquetado, controlCalidad, origenId);

            // Verificar que el origen existe
            const origen = await models.getOrigenById(parseInt(origenId));
            if (!origen) {
                throw new Error(`No se encontró el origen con ID ${origenId}`);
            }

            // Verificar que no exista ya una transformación para este origen
            const transformaciones = await models.getAllTransformacion();
            const transformacionExistente = transformaciones.find(t => t.origen_id === parseInt(origenId));

            if (transformacionExistente) {
                throw new Error(`Ya existe una transformación registrada para el origen ID ${origenId}`);
            }

            const result = await models.insertTransformacion(
                lavado.trim(),
                empaquetado.trim(),
                controlCalidad.trim(),
                parseInt(origenId)
            );

            console.log(`Transformación registrada con ID: ${result.id}`);

            return {
                success: true,
                message: 'Transformación registrada exitosamente',
                id: result.id
            };
        } catch (error) {
            console.error('Error al registrar transformación:', error);
            throw error;
        }
    }

    // Operaciones de negocio para Logística
    async registrarLogistica(temperaturaTransporte, fechaEntrega, transformacionId) {
        try {
            this.validateLogisticaData(temperaturaTransporte, fechaEntrega, transformacionId);

            // Verificar que la transformación existe
            const transformacion = await models.getTransformacionById(parseInt(transformacionId));
            if (!transformacion) {
                throw new Error(`No se encontró la transformación con ID ${transformacionId}`);
            }

            // Verificar que no exista ya logística para esta transformación
            const logisticas = await models.getAllLogistica();
            const logisticaExistente = logisticas.find(l => l.transformacion_id === parseInt(transformacionId));

            if (logisticaExistente) {
                throw new Error(`Ya existe logística registrada para la transformación ID ${transformacionId}`);
            }

            // Validar que la fecha de entrega no sea anterior a la fecha de cosecha
            const origen = await models.getOrigenById(transformacion.origen_id);
            const fechaCosecha = new Date(origen.fecha_cosecha);
            const fechaEntregaDate = new Date(fechaEntrega);

            if (fechaEntregaDate < fechaCosecha) {
                throw new Error('La fecha de entrega no puede ser anterior a la fecha de cosecha');
            }

            const result = await models.insertLogistica(
                parseFloat(temperaturaTransporte),
                fechaEntrega,
                parseInt(transformacionId)
            );

            console.log(`Logística registrada con ID: ${result.id}`);

            return {
                success: true,
                message: 'Logística registrada exitosamente',
                id: result.id
            };
        } catch (error) {
            console.error('Error al registrar logística:', error);
            throw error;
        }
    }

    // Obtener trazabilidad completa
    async obtenerTrazabilidadCompleta() {
        try {
            return await models.getTrazabilidadCompleta();
        } catch (error) {
            console.error('Error al obtener trazabilidad:', error);
            throw error;
        }
    }

    // Obtener lista de origenes disponibles
    async obtenerOrigenesDisponibles() {
        try {
            const origenes = await models.getAllOrigen();
            const transformaciones = await models.getAllTransformacion();

            // Filtrar origenes que no tienen transformación registrada
            const origenesConTransformacion = transformaciones.map(t => t.origen_id);
            return origenes.filter(o => !origenesConTransformacion.includes(o.id));
        } catch (error) {
            console.error('Error al obtener origenes disponibles:', error);
            throw error;
        }
    }

    // Obtener lista de transformaciones disponibles
    async obtenerTransformacionesDisponibles() {
        try {
            const transformaciones = await models.getAllTransformacion();
            const logisticas = await models.getAllLogistica();

            // Filtrar transformaciones que no tienen logística registrada
            const transformacionesConLogistica = logisticas.map(l => l.transformacion_id);
            return transformaciones.filter(t => !transformacionesConLogistica.includes(t.id));
        } catch (error) {
            console.error('Error al obtener transformaciones disponibles:', error);
            throw error;
        }
    }
}

module.exports = new BusinessLogic();
