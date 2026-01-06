const models = require('./src/data/models');
const businessLogic = require('./src/business/logic');

async function populateDatabase() {
    try {
        console.log('Iniciando población de base de datos con datos ficticios...');

        // Inicializar la base de datos primero
        await models.initializeDatabase();
        console.log('Base de datos inicializada.');

        // ===== DATOS DE MATERIA PRIMA =====
        console.log('Insertando materia prima...');
        const materiaPrimaData = [
            {
                fechaIngreso: '2024-01-15',
                nombre: 'Mango Tommy',
                marca: 'AgroFrutas',
                unidad: 100,
                presentacion: 'Cajas de 10kg',
                lote: 'MP001-2024',
                fechaVencimiento: '2024-02-15',
                proveedor: 'Finca El Mango'
            },
            {
                fechaIngreso: '2024-01-20',
                nombre: 'Mango Kent',
                marca: 'Tropical Fruits',
                unidad: 80,
                presentacion: 'Sacos de 20kg',
                lote: 'MP002-2024',
                fechaVencimiento: '2024-02-20',
                proveedor: 'Hacienda Los Mangos'
            },
            {
                fechaIngreso: '2024-01-25',
                nombre: 'Mango Ataulfo',
                marca: 'Golden Fruits',
                unidad: 120,
                presentacion: 'Cajas de 15kg',
                lote: 'MP003-2024',
                fechaVencimiento: '2024-02-25',
                proveedor: 'Finca San José'
            },
            {
                fechaIngreso: '2024-02-01',
                nombre: 'Mango Haden',
                marca: 'Premium Fruits',
                unidad: 90,
                presentacion: 'Bolsas de 25kg',
                lote: 'MP004-2024',
                fechaVencimiento: '2024-03-01',
                proveedor: 'Cooperativa Agrícola'
            },
            {
                fechaIngreso: '2024-02-05',
                nombre: 'Mango Palmer',
                marca: 'Tropical Harvest',
                unidad: 75,
                presentacion: 'Cajas de 12kg',
                lote: 'MP005-2024',
                fechaVencimiento: '2024-03-05',
                proveedor: 'Finca La Esperanza'
            }
        ];

        const materiaPrimaIds = [];
        for (const mp of materiaPrimaData) {
            const result = await businessLogic.registrarMateriaPrima(
                mp.fechaIngreso, mp.nombre, mp.marca, mp.unidad,
                mp.presentacion, mp.lote, mp.fechaVencimiento, mp.proveedor
            );
            materiaPrimaIds.push(result.id);
            console.log(`✓ Materia prima registrada: ${mp.nombre} (ID: ${result.id})`);
        }

        // ===== DATOS DE INSUMOS =====
        console.log('Insertando insumos...');
        const insumosData = [
            {
                nombre: 'Conservante Natural E-202',
                tipo: 'Conservante',
                cantidad: 25.5,
                unidad: 'kg',
                fechaIngreso: '2024-01-10',
                proveedor: 'Química Natural S.A.',
                lote: 'INS001-2024',
                fechaVencimiento: '2025-01-10'
            },
            {
                nombre: 'Ácido Cítrico',
                tipo: 'Acidulante',
                cantidad: 15.0,
                unidad: 'kg',
                fechaIngreso: '2024-01-12',
                proveedor: 'Industria Química Ltda.',
                lote: 'INS002-2024',
                fechaVencimiento: '2025-01-12'
            },
            {
                nombre: 'Azúcar Orgánico',
                tipo: 'Edulcorante',
                cantidad: 50.0,
                unidad: 'kg',
                fechaIngreso: '2024-01-18',
                proveedor: 'Azúcares Orgánicos S.A.',
                lote: 'INS003-2024',
                fechaVencimiento: '2024-12-18'
            },
            {
                nombre: 'Vitamina C Natural',
                tipo: 'Antioxidante',
                cantidad: 10.0,
                unidad: 'kg',
                fechaIngreso: '2024-01-22',
                proveedor: 'Nutrientes Naturales',
                lote: 'INS004-2024',
                fechaVencimiento: '2024-07-22'
            },
            {
                nombre: 'Aceite Esencial de Limón',
                tipo: 'Aromatizante',
                cantidad: 5.0,
                unidad: 'litros',
                fechaIngreso: '2024-01-28',
                proveedor: 'Esencias Naturales Ltda.',
                lote: 'INS005-2024',
                fechaVencimiento: '2024-10-28'
            },
            {
                nombre: 'Emulsionante Natural',
                tipo: 'Estabilizante',
                cantidad: 8.5,
                unidad: 'kg',
                fechaIngreso: '2024-02-02',
                proveedor: 'Bioquímicos S.A.',
                lote: 'INS006-2024',
                fechaVencimiento: '2024-08-02'
            }
        ];

        const insumosIds = [];
        for (const insumo of insumosData) {
            const result = await businessLogic.registrarInsumo(
                insumo.nombre, insumo.tipo, insumo.cantidad, insumo.unidad,
                insumo.fechaIngreso, insumo.proveedor, insumo.lote, insumo.fechaVencimiento
            );
            insumosIds.push(result.id);
            console.log(`✓ Insumo registrado: ${insumo.nombre} (ID: ${result.id})`);
        }

        // ===== DATOS DE PRODUCCIÓN =====
        console.log('Insertando producciones...');
        const produccionData = [
            {
                fechaProduccion: '2024-02-10',
                loteProduccion: 'PROD001-2024',
                cantidadProducida: 500.0,
                notas: 'Primera producción del mes - Mango Tommy',
                materiaPrima: [
                    { id: materiaPrimaIds[0], cantidadUtilizada: 100 } // Mango Tommy
                ],
                insumos: [
                    { id: insumosIds[0], cantidadUtilizada: 2.5 }, // Conservante
                    { id: insumosIds[1], cantidadUtilizada: 1.0 }, // Ácido cítrico
                    { id: insumosIds[2], cantidadUtilizada: 5.0 }  // Azúcar
                ]
            },
            {
                fechaProduccion: '2024-02-15',
                loteProduccion: 'PROD002-2024',
                cantidadProducida: 450.0,
                notas: 'Producción de Mango Kent orgánico',
                materiaPrima: [
                    { id: materiaPrimaIds[1], cantidadUtilizada: 80 } // Mango Kent
                ],
                insumos: [
                    { id: insumosIds[0], cantidadUtilizada: 2.0 },
                    { id: insumosIds[3], cantidadUtilizada: 0.8 }, // Vitamina C
                    { id: insumosIds[4], cantidadUtilizada: 0.5 }  // Aceite esencial
                ]
            },
            {
                fechaProduccion: '2024-02-20',
                loteProduccion: 'PROD003-2024',
                cantidadProducida: 600.0,
                notas: 'Producción especial Mango Ataulfo premium',
                materiaPrima: [
                    { id: materiaPrimaIds[2], cantidadUtilizada: 120 } // Mango Ataulfo
                ],
                insumos: [
                    { id: insumosIds[0], cantidadUtilizada: 3.0 },
                    { id: insumosIds[1], cantidadUtilizada: 1.5 },
                    { id: insumosIds[2], cantidadUtilizada: 8.0 },
                    { id: insumosIds[3], cantidadUtilizada: 1.2 }
                ]
            },
            {
                fechaProduccion: '2024-02-25',
                loteProduccion: 'PROD004-2024',
                cantidadProducida: 400.0,
                notas: 'Producción Mango Haden para exportación',
                materiaPrima: [
                    { id: materiaPrimaIds[3], cantidadUtilizada: 90 } // Mango Haden
                ],
                insumos: [
                    { id: insumosIds[0], cantidadUtilizada: 2.2 },
                    { id: insumosIds[1], cantidadUtilizada: 1.2 },
                    { id: insumosIds[5], cantidadUtilizada: 1.0 } // Emulsionante
                ]
            },
            {
                fechaProduccion: '2024-03-01',
                loteProduccion: 'PROD005-2024',
                cantidadProducida: 350.0,
                notas: 'Producción final del trimestre',
                materiaPrima: [
                    { id: materiaPrimaIds[4], cantidadUtilizada: 75 } // Mango Palmer
                ],
                insumos: [
                    { id: insumosIds[0], cantidadUtilizada: 1.8 },
                    { id: insumosIds[2], cantidadUtilizada: 4.0 },
                    { id: insumosIds[3], cantidadUtilizada: 0.7 },
                    { id: insumosIds[4], cantidadUtilizada: 0.4 }
                ]
            }
        ];

        const produccionIds = [];
        for (const prod of produccionData) {
            const result = await businessLogic.registrarProduccion(
                prod.fechaProduccion,
                prod.loteProduccion,
                prod.cantidadProducida,
                prod.notas,
                prod.materiaPrima,
                prod.insumos
            );
            produccionIds.push(result.id);
            console.log(`✓ Producción registrada: ${prod.loteProduccion} (ID: ${result.id})`);
        }

        // ===== DATOS DE PRODUCTO FINAL =====
        console.log('Insertando productos finales...');
        const productoFinalData = [
            {
                nombre: 'Mango Tommy en Almíbar',
                lote: 'PF001-2024',
                fechaFabricacion: '2024-02-12',
                cantidad: 480.0,
                fechaVencimiento: '2024-08-12',
                produccionId: produccionIds[0]
            },
            {
                nombre: 'Mango Kent Orgánico',
                lote: 'PF002-2024',
                fechaFabricacion: '2024-02-17',
                cantidad: 420.0,
                fechaVencimiento: '2024-08-17',
                produccionId: produccionIds[1]
            },
            {
                nombre: 'Mango Ataulfo Premium',
                lote: 'PF003-2024',
                fechaFabricacion: '2024-02-22',
                cantidad: 580.0,
                fechaVencimiento: '2024-08-22',
                produccionId: produccionIds[2]
            },
            {
                nombre: 'Mango Haden Exportación',
                lote: 'PF004-2024',
                fechaFabricacion: '2024-02-27',
                cantidad: 380.0,
                fechaVencimiento: '2024-08-27',
                produccionId: produccionIds[3]
            },
            {
                nombre: 'Mango Palmer Gourmet',
                lote: 'PF005-2024',
                fechaFabricacion: '2024-03-03',
                cantidad: 330.0,
                fechaVencimiento: '2024-09-03',
                produccionId: produccionIds[4]
            },
            {
                nombre: 'Mango Tommy Rodajas',
                lote: 'PF006-2024',
                fechaFabricacion: '2024-02-14',
                cantidad: 120.0,
                fechaVencimiento: '2024-05-14',
                produccionId: produccionIds[0]
            },
            {
                nombre: 'Mango Kent en Cubos',
                lote: 'PF007-2024',
                fechaFabricacion: '2024-02-19',
                cantidad: 150.0,
                fechaVencimiento: '2024-05-19',
                produccionId: produccionIds[1]
            }
        ];

        const productoFinalIds = [];
        for (const pf of productoFinalData) {
            const result = await businessLogic.registrarProductoFinal(
                pf.nombre, pf.lote, pf.fechaFabricacion, pf.cantidad,
                pf.fechaVencimiento, pf.produccionId
            );
            productoFinalIds.push(result.id);
            console.log(`✓ Producto final registrado: ${pf.nombre} (ID: ${result.id})`);
        }

        // ===== DATOS DE STOCK =====
        console.log('Insertando datos de stock...');

        // Stock de materia prima
        for (let i = 0; i < materiaPrimaIds.length; i++) {
            const cantidadRestante = Math.max(0, materiaPrimaData[i].unidad - (produccionData[i]?.materiaPrima[0]?.cantidadUtilizada || 0));
            if (cantidadRestante > 0) {
                await businessLogic.registrarStock(
                    'materia_prima',
                    materiaPrimaIds[i],
                    cantidadRestante,
                    `Almacén Principal - Estante ${i + 1}`
                );
                console.log(`✓ Stock registrado para materia prima ID: ${materiaPrimaIds[i]} (${cantidadRestante} unidades)`);
            }
        }

        // Nota: El stock de insumos no se implementa en este sistema
        // Solo se maneja stock para materia_prima y producto_final
        console.log('ℹ️  Stock de insumos no implementado en este sistema');

        // Stock de productos finales
        const stockProductosFinales = [
            { id: productoFinalIds[0], cantidad: 450.0 },
            { id: productoFinalIds[1], cantidad: 380.0 },
            { id: productoFinalIds[2], cantidad: 520.0 },
            { id: productoFinalIds[3], cantidad: 350.0 },
            { id: productoFinalIds[4], cantidad: 300.0 },
            { id: productoFinalIds[5], cantidad: 100.0 },
            { id: productoFinalIds[6], cantidad: 120.0 }
        ];

        for (const stock of stockProductosFinales) {
            await businessLogic.registrarStock(
                'producto_final',
                stock.id,
                stock.cantidad,
                'Almacén de Productos Terminados'
            );
            console.log(`✓ Stock registrado para producto final ID: ${stock.id} (${stock.cantidad} unidades)`);
        }

        console.log('\n🎉 ¡Base de datos poblada exitosamente!');
        console.log('\n📊 Resumen de datos insertados:');
        console.log(`   - Materia Prima: ${materiaPrimaIds.length} registros`);
        console.log(`   - Insumos: ${insumosIds.length} registros`);
        console.log(`   - Producciones: ${produccionIds.length} registros`);
        console.log(`   - Productos Finales: ${productoFinalIds.length} registros`);
        console.log(`   - Registros de Stock: ${stockProductosFinales.length + materiaPrimaIds.filter((_, i) => {
            const cantidadRestante = Math.max(0, materiaPrimaData[i].unidad - (produccionData[i]?.materiaPrima[0]?.cantidadUtilizada || 0));
            return cantidadRestante > 0;
        }).length} registros`);

        console.log('\n🔍 Puedes probar la trazabilidad con estos lotes:');
        console.log('   - MP001-2024 (Materia Prima)');
        console.log('   - PROD001-2024 (Producción)');
        console.log('   - PF001-2024 (Producto Final)');
        console.log('   - INS001-2024 (Insumo)');

    } catch (error) {
        console.error('❌ Error poblando la base de datos:', error);
        process.exit(1);
    }
}

// Ejecutar la función si se llama directamente
if (require.main === module) {
    populateDatabase().then(() => {
        console.log('\n✅ Proceso completado. Puedes cerrar esta terminal.');
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

module.exports = populateDatabase;
