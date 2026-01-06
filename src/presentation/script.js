// Sistema de Trazabilidad Agrícola - Lógica del Frontend

document.addEventListener('DOMContentLoaded', function() {
    inicializarAplicacion();
    configurarNavegacion();
    configurarEventos();
});

// ===== INICIALIZACIÓN =====
function inicializarAplicacion() {
    mostrarSeccion('dashboard');
    cargarDashboard();
}

// ===== NAVEGACIÓN =====
function configurarNavegacion() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const seccion = this.getAttribute('data-section');

            // Actualizar navegación activa
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Mostrar sección
            mostrarSeccion(seccion);
        });
    });
}

function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('.section-content');
    secciones.forEach(seccion => seccion.classList.add('hidden'));

    // Mostrar sección seleccionada
    const seccionActiva = document.getElementById(`section-${seccionId}`);
    if (seccionActiva) {
        seccionActiva.classList.remove('hidden');

        // Actualizar título de página
        actualizarTituloPagina(seccionId);

        // Cargar datos de la sección
        cargarDatosSeccion(seccionId);
    }
}

function actualizarTituloPagina(seccionId) {
    const titulos = {
        'dashboard': { titulo: 'Dashboard', subtitulo: 'Panel de control general' },
        'materia-prima': { titulo: 'Materia Prima', subtitulo: 'Gestión de materias primas' },
        'insumos': { titulo: 'Insumos', subtitulo: 'Gestión de insumos' },
        'produccion': { titulo: 'Producción', subtitulo: 'Gestión de procesos productivos' },
        'producto-final': { titulo: 'Producto Final', subtitulo: 'Gestión de productos terminados' },
        'stock': { titulo: 'Stock', subtitulo: 'Control de inventario' },
        'trazabilidad': { titulo: 'Trazabilidad', subtitulo: 'Consulta de cadena de suministro' },
        'reportes': { titulo: 'Reportes', subtitulo: 'Generación de reportes' }
    };

    const tituloData = titulos[seccionId] || titulos['dashboard'];
    document.getElementById('page-title').textContent = tituloData.titulo;
    document.getElementById('page-subtitle').textContent = tituloData.subtitulo;
}

function cargarDatosSeccion(seccionId) {
    switch(seccionId) {
        case 'dashboard':
            cargarDashboard();
            break;
        case 'materia-prima':
            cargarMateriaPrima();
            break;
        case 'insumos':
            cargarInsumos();
            break;
        case 'produccion':
            cargarProduccion();
            break;
        case 'producto-final':
            cargarProductoFinal();
            break;
        case 'stock':
            cargarStock();
            break;
    }
}

// ===== EVENTOS =====
function configurarEventos() {
    // Botón de actualizar
    document.getElementById('btn-refresh').addEventListener('click', function() {
        const seccionActiva = document.querySelector('.nav-link.active');
        if (seccionActiva) {
            const seccionId = seccionActiva.getAttribute('data-section');
            cargarDatosSeccion(seccionId);
        }
    });

    // Eventos de Materia Prima
    configurarEventosMateriaPrima();

    // Eventos de Insumos
    configurarEventosInsumos();

    // Eventos de Producción
    configurarEventosProduccion();

    // Eventos de Producto Final
    configurarEventosProductoFinal();

    // Eventos de Stock
    configurarEventosStock();

    // Eventos de Trazabilidad
    configurarEventosTrazabilidad();

    // Eventos de Reportes
    configurarEventosReportes();
}

// ===== DASHBOARD =====
async function cargarDashboard() {
    try {
        // Cargar conteos
        const [materiaPrima, insumos, produccion, productoFinal] = await Promise.all([
            consultarAPI('/materia-prima'),
            consultarAPI('/insumos'),
            consultarAPI('/produccion'),
            consultarAPI('/producto-final')
        ]);

        document.getElementById('count-materia-prima').textContent = materiaPrima.length;
        document.getElementById('count-insumos').textContent = insumos.length;
        document.getElementById('count-produccion').textContent = produccion.length;
        document.getElementById('count-producto-final').textContent = productoFinal.length;

        // Cargar actividad reciente (últimos 10 registros)
        await cargarActividadReciente();

    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

async function cargarActividadReciente() {
    try {
        const [materiaPrima, insumos, produccion, productoFinal] = await Promise.all([
            consultarAPI('/materia-prima?limit=5'),
            consultarAPI('/insumos?limit=5'),
            consultarAPI('/produccion?limit=5'),
            consultarAPI('/producto-final?limit=5')
        ]);

        // Asegurarse de que todos sean arrays
        const ensureArray = (data) => Array.isArray(data) ? data : [];
        const materiaPrimaArr = ensureArray(materiaPrima);
        const insumosArr = ensureArray(insumos);
        const produccionArr = ensureArray(produccion);
        const productoFinalArr = ensureArray(productoFinal);

        const actividad = [];

        // Combinar y ordenar por fecha
        [
            ...materiaPrimaArr.map(item => ({ ...item, tipo: 'Materia Prima', fecha: item.fecha_ingreso })),
            ...insumosArr.map(item => ({ ...item, tipo: 'Insumo', fecha: item.fecha_ingreso })),
            ...produccionArr.map(item => ({ ...item, tipo: 'Producción', fecha: item.fecha_produccion })),
            ...productoFinalArr.map(item => ({ ...item, tipo: 'Producto Final', fecha: item.fecha_fabricacion }))
        ]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 10)
        .forEach(item => {
            actividad.push(`<div class="text-sm text-gray-600">${item.tipo}: ${item.nombre || item.lote_produccion || item.lote} - ${formatearFecha(item.fecha)}</div>`);
        });

        const container = document.getElementById('actividad-reciente');
        container.innerHTML = actividad.length > 0
            ? actividad.join('')
            : '<div class="text-gray-500 text-center py-4">No hay actividad reciente</div>';

    } catch (error) {
        console.error('Error cargando actividad reciente:', error);
    }
}

// ===== MATERIA PRIMA =====
function configurarEventosMateriaPrima() {
    document.getElementById('btn-nueva-materia-prima').addEventListener('click', () => mostrarModalMateriaPrima());
    document.getElementById('btn-filtrar-mp').addEventListener('click', () => cargarMateriaPrima());
}

async function cargarMateriaPrima(filtros = {}) {
    try {
        mostrarCargando('tbody-materia-prima');

        // Obtener filtros del formulario
        const nombre = document.getElementById('filtro-mp-nombre').value.trim();
        const marca = document.getElementById('filtro-mp-marca').value.trim();
        const lote = document.getElementById('filtro-mp-lote').value.trim();

        const filtrosConsulta = {};
        if (nombre) filtrosConsulta.nombre = nombre;
        if (marca) filtrosConsulta.marca = marca;
        if (lote) filtrosConsulta.lote = lote;

        const data = await consultarAPI('/materia-prima', filtrosConsulta);

        const tbody = document.getElementById('tbody-materia-prima');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">No se encontraron registros</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.nombre}</td>
                <td>${item.marca}</td>
                <td>${item.lote}</td>
                <td>${item.proveedor}</td>
                <td>${formatearFecha(item.fecha_ingreso)}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarMateriaPrima(${item.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarMateriaPrima(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error cargando materia prima:', error);
        mostrarError('Error al cargar los datos de materia prima');
    }
}

function mostrarModalMateriaPrima(materiaPrima = null) {
    const titulo = materiaPrima ? 'Editar Materia Prima' : 'Nueva Materia Prima';

    const html = `
        <div class="modal-header">
            <h3 class="text-lg font-semibold">${titulo}</h3>
            <button onclick="cerrarModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form id="form-materia-prima" class="modal-body">
            <input type="hidden" id="mp-id" value="${materiaPrima?.id || ''}">
            <div class="form-row">
                <div class="form-group">
                    <label for="mp-nombre">Nombre *</label>
                    <input type="text" id="mp-nombre" value="${materiaPrima?.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label for="mp-marca">Marca *</label>
                    <input type="text" id="mp-marca" value="${materiaPrima?.marca || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="mp-unidad">Unidad *</label>
                    <input type="number" id="mp-unidad" value="${materiaPrima?.unidad || ''}" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="mp-presentacion">Presentación *</label>
                    <input type="text" id="mp-presentacion" value="${materiaPrima?.presentacion || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="mp-lote">Lote *</label>
                    <input type="text" id="mp-lote" value="${materiaPrima?.lote || ''}" required>
                </div>
                <div class="form-group">
                    <label for="mp-fecha-vencimiento">Fecha Vencimiento</label>
                    <input type="date" id="mp-fecha-vencimiento" value="${materiaPrima?.fecha_vencimiento || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="mp-proveedor">Proveedor *</label>
                    <input type="text" id="mp-proveedor" value="${materiaPrima?.proveedor || ''}" required>
                </div>
                <div class="form-group">
                    <label for="mp-fecha-ingreso">Fecha Ingreso *</label>
                    <input type="date" id="mp-fecha-ingreso" value="${materiaPrima?.fecha_ingreso || ''}" required>
                </div>
            </div>
        </form>
        <div class="modal-footer">
            <button type="button" onclick="cerrarModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
            </button>
            <button type="submit" form="form-materia-prima" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                ${materiaPrima ? 'Actualizar' : 'Guardar'}
            </button>
        </div>
    `;

    mostrarModal(html);

    // Configurar evento del formulario
    document.getElementById('form-materia-prima').addEventListener('submit', async function(e) {
        e.preventDefault();
        await guardarMateriaPrima();
    });
}

async function guardarMateriaPrima() {
    const id = document.getElementById('mp-id').value;
    const datos = {
        fechaIngreso: document.getElementById('mp-fecha-ingreso').value,
        nombre: document.getElementById('mp-nombre').value.trim(),
        marca: document.getElementById('mp-marca').value.trim(),
        unidad: parseInt(document.getElementById('mp-unidad').value),
        presentacion: document.getElementById('mp-presentacion').value.trim(),
        lote: document.getElementById('mp-lote').value.trim(),
        fechaVencimiento: document.getElementById('mp-fecha-vencimiento').value || null,
        proveedor: document.getElementById('mp-proveedor').value.trim()
    };

    try {
        const url = id ? `/materia-prima/${id}` : '/materia-prima';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (resultado.success) {
            cerrarModal();
            cargarMateriaPrima();
            mostrarMensajeExito(resultado.message);
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        console.error('Error guardando materia prima:', error);
        mostrarError('Error al guardar la materia prima');
    }
}

async function editarMateriaPrima(id) {
    try {
        const response = await fetch(`/materia-prima/${id}`);
        const materiaPrima = await response.json();
        mostrarModalMateriaPrima(materiaPrima);
    } catch (error) {
        console.error('Error obteniendo materia prima:', error);
        mostrarError('Error al cargar los datos');
    }
}

async function eliminarMateriaPrima(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta materia prima?')) return;

    try {
        const response = await fetch(`/materia-prima/${id}`, { method: 'DELETE' });
        const resultado = await response.json();

        if (resultado.success) {
            cargarMateriaPrima();
            mostrarMensajeExito(resultado.message);
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        console.error('Error eliminando materia prima:', error);
        mostrarError('Error al eliminar la materia prima');
    }
}

// ===== FUNCIONES AUXILIARES =====
function mostrarModal(contenido) {
    document.getElementById('modal-content').innerHTML = contenido;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

function mostrarCargando(elementId) {
    const elemento = document.getElementById(elementId);
    elemento.innerHTML = '<tr><td colspan="7" class="text-center py-8"><div class="loading"></div> Cargando...</td></tr>';
}

function mostrarMensajeExito(mensaje) {
    // Implementar toast o notificación
    alert(mensaje);
}

function mostrarError(mensaje) {
    alert('Error: ' + mensaje);
}

async function consultarAPI(endpoint, params = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url);
    return await response.json();
}

function formatearFecha(fechaString) {
    if (!fechaString) return '-';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Cerrar modal al hacer clic fuera
document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) {
        cerrarModal();
    }
});

// ===== INSUMOS =====
function configurarEventosInsumos() {
    document.getElementById('btn-nuevo-insumo').addEventListener('click', () => mostrarModalInsumo());
    document.getElementById('btn-filtrar-insumo').addEventListener('click', () => cargarInsumos());
}

async function cargarInsumos(filtros = {}) {
    try {
        mostrarCargando('tbody-insumos');

        const nombre = document.getElementById('filtro-insumo-nombre').value.trim();
        const tipo = document.getElementById('filtro-insumo-tipo').value.trim();

        const filtrosConsulta = {};
        if (nombre) filtrosConsulta.nombre = nombre;
        if (tipo) filtrosConsulta.tipo = tipo;

        const data = await consultarAPI('/insumos', filtrosConsulta);

        const tbody = document.getElementById('tbody-insumos');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">No se encontraron registros</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.nombre}</td>
                <td>${item.tipo}</td>
                <td>${item.cantidad} ${item.unidad}</td>
                <td>${item.proveedor}</td>
                <td>${formatearFecha(item.fecha_ingreso)}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarInsumo(${item.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarInsumo(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error cargando insumos:', error);
        mostrarError('Error al cargar los datos de insumos');
    }
}

function mostrarModalInsumo(insumo = null) {
    const titulo = insumo ? 'Editar Insumo' : 'Nuevo Insumo';

    const html = `
        <div class="modal-header">
            <h3 class="text-lg font-semibold">${titulo}</h3>
            <button onclick="cerrarModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form id="form-insumo" class="modal-body">
            <input type="hidden" id="insumo-id" value="${insumo?.id || ''}">
            <div class="form-row">
                <div class="form-group">
                    <label for="insumo-nombre">Nombre *</label>
                    <input type="text" id="insumo-nombre" value="${insumo?.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label for="insumo-tipo">Tipo *</label>
                    <input type="text" id="insumo-tipo" value="${insumo?.tipo || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="insumo-cantidad">Cantidad *</label>
                    <input type="number" id="insumo-cantidad" value="${insumo?.cantidad || ''}" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="insumo-unidad">Unidad *</label>
                    <input type="text" id="insumo-unidad" value="${insumo?.unidad || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="insumo-proveedor">Proveedor *</label>
                    <input type="text" id="insumo-proveedor" value="${insumo?.proveedor || ''}" required>
                </div>
                <div class="form-group">
                    <label for="insumo-lote">Lote</label>
                    <input type="text" id="insumo-lote" value="${insumo?.lote || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="insumo-fecha-ingreso">Fecha Ingreso *</label>
                    <input type="date" id="insumo-fecha-ingreso" value="${insumo?.fecha_ingreso || ''}" required>
                </div>
                <div class="form-group">
                    <label for="insumo-fecha-vencimiento">Fecha Vencimiento</label>
                    <input type="date" id="insumo-fecha-vencimiento" value="${insumo?.fecha_vencimiento || ''}">
                </div>
            </div>
        </form>
        <div class="modal-footer">
            <button type="button" onclick="cerrarModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
            </button>
            <button type="submit" form="form-insumo" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                ${insumo ? 'Actualizar' : 'Guardar'}
            </button>
        </div>
    `;

    mostrarModal(html);

    document.getElementById('form-insumo').addEventListener('submit', async function(e) {
        e.preventDefault();
        await guardarInsumo();
    });
}

async function guardarInsumo() {
    const id = document.getElementById('insumo-id').value;
    const datos = {
        nombre: document.getElementById('insumo-nombre').value.trim(),
        tipo: document.getElementById('insumo-tipo').value.trim(),
        cantidad: parseFloat(document.getElementById('insumo-cantidad').value),
        unidad: document.getElementById('insumo-unidad').value.trim(),
        fechaIngreso: document.getElementById('insumo-fecha-ingreso').value,
        proveedor: document.getElementById('insumo-proveedor').value.trim(),
        lote: document.getElementById('insumo-lote').value.trim() || null,
        fechaVencimiento: document.getElementById('insumo-fecha-vencimiento').value || null
    };

    try {
        const url = id ? `/insumos/${id}` : '/insumos';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (resultado.success) {
            cerrarModal();
            cargarInsumos();
            mostrarMensajeExito(resultado.message);
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        console.error('Error guardando insumo:', error);
        mostrarError('Error al guardar el insumo');
    }
}

async function editarInsumo(id) {
    try {
        const response = await fetch(`/insumos/${id}`);
        const insumo = await response.json();
        mostrarModalInsumo(insumo);
    } catch (error) {
        console.error('Error obteniendo insumo:', error);
        mostrarError('Error al cargar los datos');
    }
}

async function eliminarInsumo(id) {
    if (!confirm('¿Está seguro de que desea eliminar este insumo?')) return;

    try {
        const response = await fetch(`/insumos/${id}`, { method: 'DELETE' });
        const resultado = await response.json();

        if (resultado.success) {
            cargarInsumos();
            mostrarMensajeExito(resultado.message);
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        console.error('Error eliminando insumo:', error);
        mostrarError('Error al eliminar el insumo');
    }
}

// ===== PRODUCCIÓN =====
function configurarEventosProduccion() {
    document.getElementById('btn-nueva-produccion').addEventListener('click', () => mostrarModalProduccion());
    document.getElementById('btn-filtrar-produccion').addEventListener('click', () => cargarProduccion());
}

async function cargarProduccion(filtros = {}) {
    try {
        mostrarCargando('tbody-produccion');

        const lote = document.getElementById('filtro-prod-lote').value.trim();
        const fechaDesde = document.getElementById('filtro-prod-fecha-desde').value;

        const filtrosConsulta = {};
        if (lote) filtrosConsulta.lote = lote;
        if (fechaDesde) filtrosConsulta.fechaDesde = fechaDesde;

        const data = await consultarAPI('/produccion', filtrosConsulta);

        const tbody = document.getElementById('tbody-produccion');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">No se encontraron registros</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.lote_produccion}</td>
                <td>${formatearFecha(item.fecha_produccion)}</td>
                <td>${item.cantidad_producida}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarProduccion(${item.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarProduccion(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button class="btn-action btn-stock" onclick="verDetallesProduccion(${item.id})">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error cargando producción:', error);
        mostrarError('Error al cargar los datos de producción');
    }
}

function mostrarModalProduccion(produccion = null) {
    const titulo = produccion ? 'Editar Producción' : 'Nueva Producción';

    const html = `
        <div class="modal-header">
            <h3 class="text-lg font-semibold">${titulo}</h3>
            <button onclick="cerrarModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form id="form-produccion" class="modal-body">
            <input type="hidden" id="produccion-id" value="${produccion?.id || ''}">
            <div class="form-row">
                <div class="form-group">
                    <label for="prod-lote">Lote de Producción *</label>
                    <input type="text" id="prod-lote" value="${produccion?.lote_produccion || ''}" required>
                </div>
                <div class="form-group">
                    <label for="prod-fecha">Fecha de Producción *</label>
                    <input type="date" id="prod-fecha" value="${produccion?.fecha_produccion || ''}" required>
                </div>
            </div>
            <div class="form-group">
                <label for="prod-cantidad">Cantidad Producida *</label>
                <input type="number" id="prod-cantidad" value="${produccion?.cantidad_producida || ''}" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="prod-notas">Notas</label>
                <textarea id="prod-notas" rows="3">${produccion?.notas || ''}</textarea>
            </div>

            <div class="border-t pt-4 mt-4">
                <h4 class="font-semibold mb-3">Recursos Utilizados</h4>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Materia Prima</label>
                    <div id="materia-prima-seleccionada" class="space-y-2">
                        ${produccion ? '' : '<p class="text-gray-500 text-sm">Seleccione materia prima después de guardar la producción</p>'}
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Insumos</label>
                    <div id="insumos-seleccionados" class="space-y-2">
                        ${produccion ? '' : '<p class="text-gray-500 text-sm">Seleccione insumos después de guardar la producción</p>'}
                    </div>
                </div>
            </div>
        </form>
        <div class="modal-footer">
            <button type="button" onclick="cerrarModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
            </button>
            <button type="submit" form="form-produccion" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                ${produccion ? 'Actualizar' : 'Guardar'}
            </button>
        </div>
    `;

    mostrarModal(html);

    document.getElementById('form-produccion').addEventListener('submit', async function(e) {
        e.preventDefault();
        await guardarProduccion();
    });
}

async function guardarProduccion() {
    const id = document.getElementById('produccion-id').value;
    const datos = {
        fechaProduccion: document.getElementById('prod-fecha').value,
        loteProduccion: document.getElementById('prod-lote').value.trim(),
        cantidadProducida: parseFloat(document.getElementById('prod-cantidad').value),
        notas: document.getElementById('prod-notas').value.trim() || null
    };

    try {
        const url = id ? `/produccion/${id}` : '/produccion';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (resultado.success) {
            cerrarModal();
            cargarProduccion();
            mostrarMensajeExito(resultado.message);
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        console.error('Error guardando producción:', error);
        mostrarError('Error al guardar la producción');
    }
}

async function editarProduccion(id) {
    try {
        const response = await fetch(`/produccion/${id}`);
        const produccion = await response.json();
        mostrarModalProduccion(produccion);
    } catch (error) {
        console.error('Error obteniendo producción:', error);
        mostrarError('Error al cargar los datos');
    }
}

async function eliminarProduccion(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta producción?')) return;

    try {
        const response = await fetch(`/produccion/${id}`, { method: 'DELETE' });
        const resultado = await response.json();

        if (resultado.success) {
            cargarProduccion();
            mostrarMensajeExito(resultado.message);
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        console.error('Error eliminando producción:', error);
        mostrarError('Error al eliminar la producción');
    }
}

async function verDetallesProduccion(id) {
    try {
        const response = await fetch(`/produccion/${id}`);
        const produccion = await response.json();

        let detallesHtml = `
            <div class="modal-header">
                <h3 class="text-lg font-semibold">Detalles de Producción</h3>
                <button onclick="cerrarModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div><strong>Lote:</strong> ${produccion.lote_produccion}</div>
                    <div><strong>Fecha:</strong> ${formatearFecha(produccion.fecha_produccion)}</div>
                    <div><strong>Cantidad:</strong> ${produccion.cantidad_producida}</div>
                    <div><strong>Notas:</strong> ${produccion.notas || 'Sin notas'}</div>
                </div>

                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Materia Prima Utilizada</h4>
                    <div class="bg-gray-50 p-3 rounded">
        `;

        if (produccion.materiaPrima && produccion.materiaPrima.length > 0) {
            produccion.materiaPrima.forEach(mp => {
                detallesHtml += `
                    <div class="flex justify-between py-1">
                        <span>${mp.nombre} (${mp.marca}) - Lote: ${mp.lote}</span>
                        <span>${mp.cantidadUtilizada} ${mp.presentacion}</span>
                    </div>
                `;
            });
        } else {
            detallesHtml += '<p class="text-gray-500">No se registró materia prima utilizada</p>';
        }

        detallesHtml += `
                    </div>
                </div>

                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Insumos Utilizados</h4>
                    <div class="bg-gray-50 p-3 rounded">
        `;

        if (produccion.insumos && produccion.insumos.length > 0) {
            produccion.insumos.forEach(insumo => {
                detallesHtml += `
                    <div class="flex justify-between py-1">
                        <span>${insumo.nombre} (${insumo.tipo}) - Lote: ${insumo.lote || 'N/A'}</span>
                        <span>${insumo.cantidadUtilizada} ${insumo.unidad}</span>
                    </div>
                `;
            });
        } else {
            detallesHtml += '<p class="text-gray-500">No se registraron insumos utilizados</p>';
        }

        detallesHtml += `
                    </div>
                </div>

                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Productos Finales Generados</h4>
                    <div class="bg-gray-50 p-3 rounded">
        `;

        if (produccion.productosFinales && produccion.productosFinales.length > 0) {
            produccion.productosFinales.forEach(pf => {
                detallesHtml += `
                    <div class="flex justify-between py-1">
                        <span>${pf.nombre} - Lote: ${pf.lote}</span>
                        <span>Cantidad: ${pf.cantidad}</span>
                    </div>
                `;
            });
        } else {
            detallesHtml += '<p class="text-gray-500">No se generaron productos finales</p>';
        }

        detallesHtml += `
                    </div>
                </div>
            </div>
        `;

        mostrarModal(detallesHtml);

    } catch (error) {
        console.error('Error obteniendo detalles de producción:', error);
        mostrarError('Error al cargar los detalles');
    }
}

// ===== PRODUCTO FINAL =====
function configurarEventosProductoFinal() {
    document.getElementById('btn-nuevo-producto-final').addEventListener('click', () => mostrarModalProductoFinal());
    document.getElementById('btn-filtrar-producto-final').addEventListener('click', () => cargarProductoFinal());
}

async function cargarProductoFinal(filtros = {}) {
    try {
        mostrarCargando('tbody-producto-final');

        const nombre = document.getElementById('filtro-pf-nombre').value.trim();
        const lote = document.getElementById('filtro-pf-lote').value.trim();

        const filtrosConsulta = {};
        if (nombre) filtrosConsulta.nombre = nombre;
        if (lote) filtrosConsulta.lote = lote;

        const data = await consultarAPI('/producto-final', filtrosConsulta);

        const tbody = document.getElementById('tbody-producto-final');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">No se encontraron registros</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.nombre}</td>
                <td>${item.lote}</td>
                <td>${formatearFecha(item.fecha_fabricacion)}</td>
                <td>${item.cantidad}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarProductoFinal(${item.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarProductoFinal(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error cargando producto final:', error);
        mostrarError('Error al cargar los datos de productos finales');
    }
}

async function mostrarModalProductoFinal(productoFinal = null) {
    const titulo = productoFinal ? 'Editar Producto Final' : 'Nuevo Producto Final';

    // Cargar producciones disponibles para el select
    const producciones = await consultarAPI('/datos/produccion');

    const optionsProduccion = producciones.map(p =>
        `<option value="${p.id}" ${productoFinal && productoFinal.produccion_id === p.id ? 'selected' : ''}>
            ${p.lote_produccion} - ${formatearFecha(p.fecha_produccion)}
        </option>`
    ).join('');

    const html = `
        <div class="modal-header">
            <h3 class="text-lg font-semibold">${titulo}</h3>
            <button onclick="cerrarModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form id="form-producto-final" class="modal-body">
            <input type="hidden" id="pf-id" value="${productoFinal?.id || ''}">
            <div class="form-row">
                <div class="form-group">
                    <label for="pf-nombre">Nombre *</label>
                    <input type="text" id="pf-nombre" value="${productoFinal?.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label for="pf-lote">Lote *</label>
                    <input type="text" id="pf-lote" value="${productoFinal?.lote || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="pf-fecha-fabricacion">Fecha de Fabricación *</label>
                    <input type="date" id="pf-fecha-fabricacion" value="${productoFinal?.fecha_fabricacion || ''}" required>
                </div>
                <div class="form-group">
                    <label for="pf-cantidad">Cantidad *</label>
                    <input type="number" id="pf-cantidad" value="${productoFinal?.cantidad || ''}" min="0" step="0.01" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="pf-fecha-vencimiento">Fecha de Vencimiento</label>
                    <input type="date" id="pf-fecha-vencimiento" value="${productoFinal?.fecha_vencimiento || ''}">
                </div>
                <div class="form-group">
                    <label for="pf-produccion">Producción *</label>
                    <select id="pf-produccion" required>
                        <option value="">Seleccione una producción</option>
                        ${optionsProduccion}
                    </select>
                </div>
            </div>
        </form>
        <div class="modal-footer">
            <button type="button" onclick="cerrarModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
            </button>
            <button type="submit" form="form-producto-final" class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                ${productoFinal ? 'Actualizar' : 'Guardar'}
            </button>
        </div>
    `;

    mostrarModal(html);

    document.getElementById('form-producto-final').addEventListener('submit', async function(e) {
        e.preventDefault();
        await guardarProductoFinal();
    });
}

async function guardarProductoFinal() {
    const id = document.getElementById('pf-id').value;
    const datos = {
        nombre: document.getElementById('pf-nombre').value.trim(),
        lote: document.getElementById('pf-lote').value.trim(),
        fechaFabricacion: document.getElementById('pf-fecha-fabricacion').value,
        cantidad: parseFloat(document.getElementById('pf-cantidad').value),
        fechaVencimiento: document.getElementById('pf-fecha-vencimiento').value || null,
        produccionId: parseInt(document.getElementById('pf-produccion').value)
    };

    try {
        const url = id ? `/producto-final/${id}` : '/producto-final';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (resultado.success) {
            cerrarModal();
            cargarProductoFinal();
            mostrarMensajeExito(resultado.message);
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        console.error('Error guardando producto final:', error);
        mostrarError('Error al guardar el producto final');
    }
}

async function editarProductoFinal(id) {
    try {
        const response = await fetch(`/producto-final/${id}`);
        const productoFinal = await response.json();
        await mostrarModalProductoFinal(productoFinal);
    } catch (error) {
        console.error('Error obteniendo producto final:', error);
        mostrarError('Error al cargar los datos');
    }
}

async function eliminarProductoFinal(id) {
    if (!confirm('¿Está seguro de que desea eliminar este producto final?')) return;

    try {
        const response = await fetch(`/producto-final/${id}`, { method: 'DELETE' });
        const resultado = await response.json();

        if (resultado.success) {
            cargarProductoFinal();
            mostrarMensajeExito(resultado.message);
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        console.error('Error eliminando producto final:', error);
        mostrarError('Error al eliminar el producto final');
    }
}

// ===== STOCK =====
function configurarEventosStock() {
    // El stock se actualiza automáticamente, pero podemos agregar funcionalidad para editar
}

async function cargarStock() {
    try {
        mostrarCargando('tbody-stock');

        const data = await consultarAPI('/stock');

        const tbody = document.getElementById('tbody-stock');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">No se encontraron registros de stock</td></tr>';
            return;
        }

        data.forEach(item => {
            const tipoTexto = item.tipo === 'materia_prima' ? 'Materia Prima' : 'Producto Final';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tipoTexto}</td>
                <td>${item.nombre}</td>
                <td>${item.lote}</td>
                <td>${item.cantidad_disponible}</td>
                <td>${item.ubicacion || 'Sin ubicación'}</td>
                <td>${formatearFecha(item.fecha_actualizacion)}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarStock('${item.tipo}', ${item.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error cargando stock:', error);
        mostrarError('Error al cargar los datos de stock');
    }
}

async function editarStock(tipo, itemId) {
    try {
        const response = await fetch(`/stock?tipo=${tipo}&itemId=${itemId}`);
        const stock = (await response.json())[0];

        const html = `
            <div class="modal-header">
                <h3 class="text-lg font-semibold">Editar Stock</h3>
                <button onclick="cerrarModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="form-stock" class="modal-body">
                <input type="hidden" id="stock-tipo" value="${tipo}">
                <input type="hidden" id="stock-item-id" value="${itemId}">

                <div class="form-group">
                    <label>Cantidad Disponible *</label>
                    <input type="number" id="stock-cantidad" value="${stock?.cantidad_disponible || 0}" min="0" step="0.01" required>
                </div>

                <div class="form-group">
                    <label>Ubicación</label>
                    <input type="text" id="stock-ubicacion" value="${stock?.ubicacion || ''}" placeholder="Ej: Bodega A, Estante 3">
                </div>
            </form>
            <div class="modal-footer">
                <button type="button" onclick="cerrarModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" form="form-stock" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Actualizar Stock
                </button>
            </div>
        `;

        mostrarModal(html);

        document.getElementById('form-stock').addEventListener('submit', async function(e) {
            e.preventDefault();
            await guardarStock();
        });

    } catch (error) {
        console.error('Error obteniendo stock:', error);
        mostrarError('Error al cargar los datos de stock');
    }
}

async function guardarStock() {
    const tipo = document.getElementById('stock-tipo').value;
    const itemId = document.getElementById('stock-item-id').value;
    const cantidad = parseFloat(document.getElementById('stock-cantidad').value);
    const ubicacion = document.getElementById('stock-ubicacion').value.trim() || null;

    try {
        const response = await fetch('/stock', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo,
                itemId: parseInt(itemId),
                nuevaCantidad: cantidad,
                ubicacion
            })
        });

        const resultado = await response.json();

        if (resultado.success) {
            cerrarModal();
            cargarStock();
            mostrarMensajeExito('Stock actualizado exitosamente');
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        console.error('Error guardando stock:', error);
        mostrarError('Error al actualizar el stock');
    }
}

// ===== TRAZABILIDAD =====
function configurarEventosTrazabilidad() {
    document.getElementById('btn-buscar-trazabilidad').addEventListener('click', () => buscarTrazabilidad());
}

async function buscarTrazabilidad() {
    const lote = document.getElementById('input-lote-trazabilidad').value.trim();

    if (!lote) {
        mostrarError('Por favor ingrese un lote para buscar');
        return;
    }

    try {
        mostrarCargando('resultado-trazabilidad');
        document.getElementById('resultado-trazabilidad').classList.remove('hidden');

        const resultado = await consultarAPI(`/trazabilidad/${lote}`);

        if (!resultado) {
            document.getElementById('resultado-trazabilidad').innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">No se encontró trazabilidad para el lote "${lote}"</p>
                </div>
            `;
            return;
        }

        let html = '';

        if (resultado.materiaPrima) {
            html += generarHtmlTrazabilidadMateriaPrima(resultado);
        } else if (resultado.produccion) {
            html += generarHtmlTrazabilidadProduccion(resultado);
        } else if (resultado.productoFinal) {
            html += generarHtmlTrazabilidadProductoFinal(resultado);
        }

        document.getElementById('resultado-trazabilidad').innerHTML = html;

    } catch (error) {
        console.error('Error buscando trazabilidad:', error);
        document.getElementById('resultado-trazabilidad').innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <p class="text-red-600">Error al buscar trazabilidad</p>
            </div>
        `;
    }
}

function generarHtmlTrazabilidadMateriaPrima(resultado) {
    let html = `
        <div class="mb-6">
            <h3 class="text-xl font-bold mb-4">Trazabilidad de Materia Prima</h3>

            <div class="trazabilidad-card mb-4">
                <div class="trazabilidad-etapa">
                    <i class="fas fa-box"></i> Materia Prima
                </div>
                <div class="trazabilidad-datos">
                    <div><span>Nombre:</span> ${resultado.materiaPrima.nombre}</div>
                    <div><span>Marca:</span> ${resultado.materiaPrima.marca}</div>
                    <div><span>Lote:</span> ${resultado.materiaPrima.lote}</div>
                    <div><span>Proveedor:</span> ${resultado.materiaPrima.proveedor}</div>
                    <div><span>Fecha Ingreso:</span> ${formatearFecha(resultado.materiaPrima.fechaIngreso)}</div>
                    <div><span>Fecha Vencimiento:</span> ${formatearFecha(resultado.materiaPrima.fechaVencimiento)}</div>
                </div>
            </div>

            <h4 class="font-semibold mb-3">Producciones donde se utilizó esta materia prima:</h4>
    `;

    if (resultado.producciones && resultado.producciones.length > 0) {
        resultado.producciones.forEach(prod => {
            html += `
                <div class="trazabilidad-card mb-3">
                    <div class="trazabilidad-etapa">
                        <i class="fas fa-cogs"></i> Producción - Lote: ${prod.loteProduccion}
                    </div>
                    <div class="trazabilidad-datos">
                        <div><span>Fecha Producción:</span> ${formatearFecha(prod.fechaProduccion)}</div>
                        <div><span>Cantidad Utilizada:</span> ${prod.cantidadUtilizada}</div>
                        <div><span>Cantidad Producida:</span> ${prod.cantidadProducida}</div>
                    </div>

                    <div class="mt-3 pl-4 border-l-2 border-gray-200">
                        <div class="text-sm font-medium text-gray-700 mb-2">Productos Finales Generados:</div>
            `;

            if (prod.productosFinales && prod.productosFinales.length > 0) {
                prod.productosFinales.forEach(pf => {
                    html += `
                        <div class="trazabilidad-datos ml-4">
                            <div><span>Producto:</span> ${pf.nombre} - Lote: ${pf.lote}</div>
                            <div><span>Cantidad:</span> ${pf.cantidad}</div>
                            <div><span>Fecha Fabricación:</span> ${formatearFecha(pf.fechaFabricacion)}</div>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;
        });
    } else {
        html += '<p class="text-gray-500 text-center py-4">Esta materia prima no ha sido utilizada en ninguna producción</p>';
    }

    html += '</div>';
    return html;
}

function generarHtmlTrazabilidadProduccion(resultado) {
    let html = `
        <div class="mb-6">
            <h3 class="text-xl font-bold mb-4">Trazabilidad de Producción</h3>

            <div class="trazabilidad-card mb-4">
                <div class="trazabilidad-etapa">
                    <i class="fas fa-cogs"></i> Producción
                </div>
                <div class="trazabilidad-datos">
                    <div><span>Lote Producción:</span> ${resultado.produccion.loteProduccion}</div>
                    <div><span>Fecha Producción:</span> ${formatearFecha(resultado.produccion.fechaProduccion)}</div>
                    <div><span>Cantidad Producida:</span> ${resultado.produccion.cantidadProducida}</div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold mb-3">Materia Prima Utilizada:</h4>
                    ${resultado.materiaPrima && resultado.materiaPrima.length > 0 ?
                        resultado.materiaPrima.map(mp => `
                            <div class="trazabilidad-card mb-2">
                                <div class="trazabilidad-datos">
                                    <div><span>Nombre:</span> ${mp.nombre} (${mp.marca})</div>
                                    <div><span>Lote:</span> ${mp.lote}</div>
                                    <div><span>Cantidad Utilizada:</span> ${mp.cantidadUtilizada}</div>
                                </div>
                            </div>
                        `).join('') :
                        '<p class="text-gray-500">No se registró materia prima</p>'
                    }
                </div>

                <div>
                    <h4 class="font-semibold mb-3">Insumos Utilizados:</h4>
                    ${resultado.insumos && resultado.insumos.length > 0 ?
                        resultado.insumos.map(insumo => `
                            <div class="trazabilidad-card mb-2">
                                <div class="trazabilidad-datos">
                                    <div><span>Nombre:</span> ${insumo.nombre} (${insumo.tipo})</div>
                                    <div><span>Lote:</span> ${insumo.lote || 'N/A'}</div>
                                    <div><span>Cantidad Utilizada:</span> ${insumo.cantidadUtilizada}</div>
                                </div>
                            </div>
                        `).join('') :
                        '<p class="text-gray-500">No se registraron insumos</p>'
                    }
                </div>
            </div>

            <h4 class="font-semibold mb-3">Productos Finales Generados:</h4>
            ${resultado.productosFinales && resultado.productosFinales.length > 0 ?
                resultado.productosFinales.map(pf => `
                    <div class="trazabilidad-card mb-2">
                        <div class="trazabilidad-etapa">
                            <i class="fas fa-box-open"></i> Producto Final - ${pf.nombre}
                        </div>
                        <div class="trazabilidad-datos">
                            <div><span>Lote:</span> ${pf.lote}</div>
                            <div><span>Cantidad:</span> ${pf.cantidad}</div>
                            <div><span>Fecha Fabricación:</span> ${formatearFecha(pf.fechaFabricacion)}</div>
                            <div><span>Fecha Vencimiento:</span> ${formatearFecha(pf.fechaVencimiento)}</div>
                        </div>
                    </div>
                `).join('') :
                '<p class="text-gray-500 text-center py-4">No se generaron productos finales</p>'
            }
        </div>
    `;

    return html;
}

function generarHtmlTrazabilidadProductoFinal(resultado) {
    let html = `
        <div class="mb-6">
            <h3 class="text-xl font-bold mb-4">Trazabilidad Completa del Producto Final</h3>

            <div class="trazabilidad-card mb-4">
                <div class="trazabilidad-etapa">
                    <i class="fas fa-box-open"></i> Producto Final
                </div>
                <div class="trazabilidad-datos">
                    <div><span>Nombre:</span> ${resultado.productoFinal.nombre}</div>
                    <div><span>Lote:</span> ${resultado.productoFinal.lote}</div>
                    <div><span>Fecha Fabricación:</span> ${formatearFecha(resultado.productoFinal.fechaFabricacion)}</div>
                    <div><span>Cantidad:</span> ${resultado.productoFinal.cantidad}</div>
                    <div><span>Fecha Vencimiento:</span> ${formatearFecha(resultado.productoFinal.fechaVencimiento)}</div>
                    <div><span>Stock Disponible:</span> ${resultado.productoFinal.stock || 0}</div>
                </div>
            </div>

            <div class="trazabilidad-card mb-4">
                <div class="trazabilidad-etapa">
                    <i class="fas fa-cogs"></i> Producción
                </div>
                <div class="trazabilidad-datos">
                    <div><span>Lote Producción:</span> ${resultado.produccion.loteProduccion}</div>
                    <div><span>Fecha Producción:</span> ${formatearFecha(resultado.produccion.fechaProduccion)}</div>
                    <div><span>Cantidad Producida:</span> ${resultado.produccion.cantidadProducida}</div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold mb-3">Materia Prima Utilizada:</h4>
                    ${resultado.materiaPrima.map(mp => `
                        <div class="trazabilidad-card mb-2">
                            <div class="trazabilidad-datos">
                                <div><span>Nombre:</span> ${mp.nombre} (${mp.marca})</div>
                                <div><span>Lote:</span> ${mp.lote}</div>
                                <div><span>Proveedor:</span> ${mp.proveedor}</div>
                                <div><span>Cantidad Utilizada:</span> ${mp.cantidadUtilizada}</div>
                                <div><span>Stock Disponible:</span> ${mp.stock || 0}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div>
                    <h4 class="font-semibold mb-3">Insumos Utilizados:</h4>
                    ${resultado.insumos.map(insumo => `
                        <div class="trazabilidad-card mb-2">
                            <div class="trazabilidad-datos">
                                <div><span>Nombre:</span> ${insumo.nombre} (${insumo.tipo})</div>
                                <div><span>Proveedor:</span> ${insumo.proveedor}</div>
                                <div><span>Lote:</span> ${insumo.lote || 'N/A'}</div>
                                <div><span>Cantidad Utilizada:</span> ${insumo.cantidadUtilizada}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    return html;
}

// ===== REPORTES =====
function configurarEventosReportes() {
    document.getElementById('btn-generar-reporte-trazabilidad').addEventListener('click', () => generarReporteTrazabilidad());
    document.getElementById('btn-generar-reporte-general').addEventListener('click', () => generarReporteGeneral());
}

async function generarReporteTrazabilidad() {
    const lote = document.getElementById('reporte-lote').value.trim();

    if (!lote) {
        mostrarError('Por favor ingrese un lote para el reporte');
        return;
    }

    try {
        const response = await fetch('/reportes/trazabilidad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lote })
        });

        const resultado = await response.json();

        if (resultado.success) {
            // Por ahora mostramos los datos en JSON, pero en producción se descargaría un archivo
            const blob = new Blob([JSON.stringify(resultado.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-trazabilidad-${lote}.json`;
            a.click();
            URL.revokeObjectURL(url);

            mostrarMensajeExito('Reporte de trazabilidad generado exitosamente');
        } else {
            mostrarError(resultado.message);
        }

    } catch (error) {
        console.error('Error generando reporte de trazabilidad:', error);
        mostrarError('Error al generar el reporte de trazabilidad');
    }
}

async function generarReporteGeneral() {
    const tipo = document.getElementById('tipo-reporte').value;

    if (!tipo) {
        mostrarError('Por favor seleccione un tipo de reporte');
        return;
    }

    try {
        const response = await fetch(`/reportes/${tipo}`);
        const resultado = await response.json();

        if (resultado.success) {
            // Por ahora mostramos los datos en JSON, pero en producción se descargaría un archivo CSV
            const blob = new Blob([JSON.stringify(resultado.datos, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-${tipo}.json`;
            a.click();
            URL.revokeObjectURL(url);

            mostrarMensajeExito(`Reporte de ${tipo.replace('_', ' ')} generado exitosamente`);
        } else {
            mostrarError('Error al generar el reporte');
        }

    } catch (error) {
        console.error('Error generando reporte general:', error);
        mostrarError('Error al generar el reporte');
    }
}
