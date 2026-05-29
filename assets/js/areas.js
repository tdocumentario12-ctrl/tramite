/*
  IMPORTANTE: Ejecuta este SQL en el Editor SQL de Supabase antes de usar el módulo:
  ALTER TABLE areas ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Activa';
  UPDATE areas SET estado = 'Activa' WHERE estado IS NULL;
*/

const Areas = {
  _areas: [],
  _paginaActual: 1,
  _porPagina: 10,
  _totalRegistros: 0,
  _totalPaginas: 1,
  _editandoId: null,
  _eliminandoId: null,
  _perfil: null,

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;
    this._paginaActual = 1;

    const tituloHeader = document.getElementById('titulo-pagina');
    if (tituloHeader) {
      tituloHeader.innerHTML = `Gestión de Áreas <span style="font-size:0.9rem;font-weight:500;color:#64748B;margin-left:12px;border-left:1px solid #E2E8F0;padding-left:12px;">Administración de cargos oficiales del hospital</span>`;
    }

    contenedor.innerHTML = `
      <div class="areas-container">
        <!-- BARRA SUPERIOR -->
        <div class="areas-barra-superior">
          <div class="areas-buscador-wrapper">
            <svg class="areas-buscador-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" class="areas-buscador-input" id="areas-busqueda" placeholder="Buscar área, responsable o cargo oficial..." autocomplete="off">
          </div>

          <div class="areas-filtros-group">
            <div class="areas-select-wrapper">
              <select class="areas-select" id="filtro-estado">
                <option value="todos">Estado: Todos</option>
                <option value="Activa">Activa</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Inactiva">Inactiva</option>
              </select>
            </div>
            <div class="areas-select-wrapper">
              <select class="areas-select" id="filtro-cargo">
                <option value="todos">Cargo Oficial: Todos</option>
              </select>
            </div>
          </div>

          <button class="btn-areas-nueva" id="btn-abrir-nueva-area">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva Área
          </button>
        </div>

        <!-- TABLA -->
        <div class="areas-tabla-contenedor">
          <table class="areas-tabla">
            <thead>
              <tr>
                <th style="width:28%;">Nombre del Área / Departamento</th>
                <th style="width:24%;">Jefe de Área / Responsable</th>
                <th style="width:22%;">Cargo Oficial</th>
                <th style="width:12%;">Estado</th>
                <th style="width:14%;">Acciones</th>
              </tr>
            </thead>
            <tbody id="areas-tabla-body">
              <tr>
                <td colspan="5" style="text-align:center;padding:40px;">
                  <div class="spinner primario" style="margin:0 auto;"></div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- PAGINACIÓN -->
          <div class="areas-paginacion">
            <div class="areas-paginacion-info">
              <span>Mostrar</span>
              <span class="select-wrapper">
                <select id="areas-por-pagina">
                  <option value="5">5</option>
                  <option value="10" selected>10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </span>
              <span>registros</span>
              <span id="areas-paginacion-info-texto" style="margin-left:8px;font-weight:500;color:#1E293B;">0 registros</span>
            </div>
            <div class="areas-paginacion-botones" id="areas-paginacion-botones"></div>
          </div>
        </div>
      </div>

      <!-- MODAL CREAR / EDITAR -->
      <div class="modal-overlay-areas" id="modal-area">
        <div class="modal-card-areas">
          <div class="modal-header-areas">
            <h3 class="modal-titulo-areas">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976D2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
              </svg>
              <span id="modal-area-titulo-texto">Nueva Área</span>
            </h3>
            <button class="modal-cerrar-areas" id="btn-cerrar-modal-area">&times;</button>
          </div>
          <div class="modal-body-areas">
            <div class="area-campo-grupo">
              <label class="area-campo-label" for="area-nombre">Nombre del Área / Departamento</label>
              <input type="text" id="area-nombre" class="area-campo-input" required placeholder="Ej. Pediatría, Cardiología, Emergencia..." autocomplete="off">
            </div>
            <div class="area-campo-grupo">
              <label class="area-campo-label" for="area-responsable">Nombre Completo del Responsable (Jefe)</label>
              <input type="text" id="area-responsable" class="area-campo-input" required placeholder="Ej. M.C. VICTOR VARGAS URIBE" autocomplete="off">
            </div>
            <div class="area-campo-grupo">
              <label class="area-campo-label" for="area-cargo">Cargo Oficial</label>
              <input type="text" id="area-cargo" class="area-campo-input" required placeholder="Ej. Jefe del Departamento de Pediatría" autocomplete="off">
            </div>
            <div class="area-campo-grupo">
              <label class="area-campo-label" for="area-estado">Estado</label>
              <div class="area-select-input-wrapper">
                <select id="area-estado" class="area-campo-select">
                  <option value="Activa">Activa</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer-areas">
            <button class="btn-areas-modal-secundario" id="btn-cancelar-modal-area">Cancelar</button>
            <button class="btn-areas-modal-primario" id="btn-guardar-area">
              <span id="btn-guardar-texto-area">Guardar Área</span>
              <span class="spinner-btn" id="btn-guardar-spinner-area"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL ELIMINAR -->
      <div class="modal-overlay-areas" id="modal-eliminar-area">
        <div class="modal-card-areas" style="max-width:400px;text-align:center;padding:30px 24px;">
          <span class="areas-modal-eliminar-icono">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <h3 class="areas-modal-eliminar-titulo">¿Eliminar Área?</h3>
          <p class="areas-modal-eliminar-texto" id="texto-confirmar-eliminar">Esta acción eliminará de forma permanente el área seleccionada.</p>
          <div style="display:flex;gap:12px;justify-content:center;">
            <button class="btn-areas-modal-secundario" id="btn-cancelar-eliminar">Cancelar</button>
            <button class="btn-eliminar-confirmar" id="btn-eliminar-confirmar-area">
              <span id="btn-eliminar-texto">Eliminar</span>
              <span class="spinner-btn" id="btn-eliminar-spinner" style="border-color:rgba(255,255,255,0.3);border-top-color:#fff;"></span>
            </button>
          </div>
        </div>
      </div>
    `;

    this._vincularEventos();
    await this._poblarFiltros();
    await this.cargarAreas(1);
  },

  _vincularEventos() {
    document.getElementById('btn-abrir-nueva-area').addEventListener('click', () => {
      this._editandoId = null;
      this._limpiarModal();
      document.getElementById('modal-area-titulo-texto').textContent = 'Nueva Área';
      document.getElementById('btn-guardar-texto-area').textContent = 'Guardar Área';
      document.getElementById('modal-area').classList.add('visible');
    });

    document.getElementById('btn-cerrar-modal-area').addEventListener('click', () => this.cerrarModal());
    document.getElementById('btn-cancelar-modal-area').addEventListener('click', () => this.cerrarModal());

    document.getElementById('areas-busqueda').addEventListener('input', this._debounce(() => {
      this._aplicarFiltros();
    }, 300));

    document.getElementById('filtro-estado').addEventListener('change', () => this._aplicarFiltros());
    document.getElementById('filtro-cargo').addEventListener('change', () => this._aplicarFiltros());

    document.getElementById('areas-por-pagina').addEventListener('change', () => {
      this._porPagina = parseInt(document.getElementById('areas-por-pagina').value);
      this._paginaActual = 1;
      this.cargarAreas(1);
    });

    document.getElementById('btn-guardar-area').addEventListener('click', () => this.guardar());

    document.getElementById('btn-cancelar-eliminar').addEventListener('click', () => this.cerrarModalEliminar());
    document.getElementById('btn-eliminar-confirmar-area').addEventListener('click', () => this.confirmarEliminar());

    document.getElementById('modal-area').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.cerrarModal();
    });

    document.getElementById('modal-eliminar-area').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.cerrarModalEliminar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (document.getElementById('modal-area').classList.contains('visible')) this.cerrarModal();
        if (document.getElementById('modal-eliminar-area').classList.contains('visible')) this.cerrarModalEliminar();
      }
    });
  },

  _debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  async _poblarFiltros() {
    try {
      const { data: cargos } = await clienteSupabase
        .from('areas')
        .select('cargo')
        .order('cargo', { ascending: true });

      if (cargos) {
        const unicos = [...new Set(cargos.map(c => c.cargo).filter(Boolean))];
        const selectCargo = document.getElementById('filtro-cargo');
        unicos.forEach(cargo => {
          const opt = document.createElement('option');
          opt.value = cargo;
          opt.textContent = cargo;
          selectCargo.appendChild(opt);
        });
      }
    } catch (err) {
      console.warn('Error al poblar filtros:', err);
    }
  },

  _aplicarFiltros() {
    this._paginaActual = 1;
    this.cargarAreas(1);
  },

  _limpiarModal() {
    document.getElementById('area-nombre').value = '';
    document.getElementById('area-responsable').value = '';
    document.getElementById('area-cargo').value = '';
    document.getElementById('area-estado').value = 'Activa';
    this._editandoId = null;
  },

  cerrarModal() {
    document.getElementById('modal-area').classList.remove('visible');
    this._limpiarModal();
  },

  cerrarModalEliminar() {
    document.getElementById('modal-eliminar-area').classList.remove('visible');
    this._eliminandoId = null;
  },

  async cargarAreas(pagina) {
    this._paginaActual = pagina;
    const body = document.getElementById('areas-tabla-body');
    if (!body) return;

    body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;"><div class="spinner primario" style="margin:0 auto;"></div></td></tr>';

    try {
      const busqueda = document.getElementById('areas-busqueda').value.trim();
      const filtroEstado = document.getElementById('filtro-estado').value;
      const filtroCargo = document.getElementById('filtro-cargo').value;

      let query = clienteSupabase.from('areas').select('*', { count: 'exact' });

      const conditions = [];

      if (busqueda) {
        conditions.push(`nombre.ilike.%${busqueda}%`);
        conditions.push(`responsable.ilike.%${busqueda}%`);
        conditions.push(`cargo.ilike.%${busqueda}%`);
      }

      if (filtroEstado && filtroEstado !== 'todos') {
        conditions.push(`estado.eq.${filtroEstado}`);
      }

      if (filtroCargo && filtroCargo !== 'todos') {
        conditions.push(`cargo.eq.${filtroCargo}`);
      }

      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }

      const offset = (pagina - 1) * this._porPagina;
      const { data, count, error } = await query
        .order('nombre', { ascending: true })
        .range(offset, offset + this._porPagina - 1);

      if (error) throw error;

      this._areas = data || [];
      this._totalRegistros = count || 0;
      this._totalPaginas = Math.ceil((count || 0) / this._porPagina);

      if (data && data.length > 0) {
        body.innerHTML = '';
        data.forEach(area => {
          body.appendChild(this._crearFila(area));
        });
      } else {
        body.innerHTML = `
          <tr>
            <td colspan="5">
              <div class="areas-sin-datos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
                </svg>
                <p>${busqueda ? 'No se encontraron áreas con los filtros aplicados' : 'No hay áreas registradas'}</p>
              </div>
            </td>
          </tr>
        `;
      }

      this._actualizarInfoPaginacion();
      this._renderizarPaginacion();

    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes('estado') || err.message.includes('column'))) {
        body.innerHTML = `
          <tr><td colspan="5" style="text-align:center;padding:40px;">
            <div style="color:#E53935;font-weight:600;margin-bottom:8px;">Error: columna 'estado' no encontrada</div>
            <p style="color:#64748B;font-size:0.85rem;">
              Ejecuta este comando en el Editor SQL de Supabase:<br>
              <code style="background:#F1F5F9;padding:4px 8px;border-radius:4px;display:inline-block;margin-top:8px;font-size:0.8rem;">
                ALTER TABLE areas ADD COLUMN estado TEXT DEFAULT 'Activa';
              </code>
            </p>
          </td></tr>
        `;
      } else {
        body.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:#E53935;">Error al cargar áreas: ${err.message}</td></tr>`;
      }
      Toast.error('Error al cargar áreas: ' + err.message);
    }
  },

  _crearFila(area) {
    const tr = document.createElement('tr');

    const estado = area.estado || 'Activa';
    const estadoClass = estado === 'Activa' ? 'badge-estado--activa' :
                        estado === 'Pendiente' ? 'badge-estado--pendiente' :
                        'badge-estado--inactiva';

    const estadoIcon = estado === 'Activa'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : estado === 'Pendiente'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    tr.innerHTML = `
      <td>
        <div class="area-nombre-cell">
          <div class="area-nombre-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/>
            </svg>
          </div>
          <span class="area-nombre-texto">${this._escapeHtml(area.nombre)}</span>
        </div>
      </td>
      <td>
        <span class="badge-responsable">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          ${this._escapeHtml(area.responsable)}
        </span>
      </td>
      <td>
        <span class="badge-cargo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          ${this._escapeHtml(area.cargo)}
        </span>
      </td>
      <td>
        <span class="badge-estado ${estadoClass}">
          ${estadoIcon}
          ${estado}
        </span>
      </td>
      <td>
        <div class="areas-acciones">
          <button class="btn-accion btn-accion--editar" data-tooltip="Editar área" onclick="Areas.abrirEditar('${area.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-accion btn-accion--eliminar" data-tooltip="Eliminar área" onclick="Areas.abrirEliminar('${area.id}', '${this._escapeHtml(area.nombre).replace(/'/g, "\\'")}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </td>
    `;

    return tr;
  },

  _escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  _actualizarInfoPaginacion() {
    const inicio = ((this._paginaActual - 1) * this._porPagina) + 1;
    const fin = Math.min(this._paginaActual * this._porPagina, this._totalRegistros);
    const texto = document.getElementById('areas-paginacion-info-texto');
    if (texto) {
      if (this._totalRegistros === 0) {
        texto.textContent = '0 registros';
      } else {
        texto.textContent = `${inicio}-${fin} de ${this._totalRegistros} registros`;
      }
    }
  },

  _renderizarPaginacion() {
    const contenedor = document.getElementById('areas-paginacion-botones');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const total = this._totalPaginas;
    const actual = this._paginaActual;

    if (total <= 1) return;

    const crearBtn = (texto, pagina, clase = '') => {
      const btn = document.createElement('button');
      btn.className = `page-btn ${clase}`;
      btn.textContent = texto;
      if (pagina === actual) btn.classList.add('active');
      if (pagina !== null && pagina !== '...') {
        btn.addEventListener('click', () => this.cargarAreas(pagina));
      } else {
        btn.disabled = true;
        btn.classList.add('page-btn--ellipsis');
      }
      return btn;
    };

    // Anterior
    const prevBtn = crearBtn('‹', actual - 1);
    prevBtn.disabled = actual === 1;
    prevBtn.style.fontSize = '1.1rem';
    prevBtn.style.fontWeight = '700';
    contenedor.appendChild(prevBtn);

    // Páginas numeradas
    const rango = this._getPageRange(actual, total);
    rango.forEach(pag => {
      if (pag === '...') {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'page-btn page-btn--ellipsis';
        ellipsis.textContent = '…';
        ellipsis.disabled = true;
        contenedor.appendChild(ellipsis);
      } else {
        contenedor.appendChild(crearBtn(String(pag), pag));
      }
    });

    // Siguiente
    const nextBtn = crearBtn('›', actual + 1);
    nextBtn.disabled = actual === total;
    nextBtn.style.fontSize = '1.1rem';
    nextBtn.style.fontWeight = '700';
    contenedor.appendChild(nextBtn);
  },

  _getPageRange(actual, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const paginas = [1];

    if (actual > 3) {
      paginas.push('...');
    }

    const inicio = Math.max(2, actual - 1);
    const fin = Math.min(total - 1, actual + 1);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    if (actual < total - 2) {
      paginas.push('...');
    }

    paginas.push(total);

    return paginas;
  },

  async guardar() {
    const nombreInput = document.getElementById('area-nombre');
    const responsableInput = document.getElementById('area-responsable');
    const cargoInput = document.getElementById('area-cargo');
    const estadoInput = document.getElementById('area-estado');

    const nombre = nombreInput.value.trim();
    const responsable = responsableInput.value.trim();
    const cargo = cargoInput.value.trim();
    const estado = estadoInput.value;

    if (!nombre || !responsable || !cargo) {
      Toast.error('Por favor, complete todos los campos requeridos');
      return;
    }

    const btn = document.getElementById('btn-guardar-area');
    const spinner = document.getElementById('btn-guardar-spinner-area');
    const txt = document.getElementById('btn-guardar-texto-area');

    try {
      btn.disabled = true;
      spinner.style.display = 'inline-block';
      txt.textContent = 'Guardando...';

      const payload = { nombre, responsable, cargo, estado };

      if (this._editandoId) {
        const { error } = await clienteSupabase
          .from('areas')
          .update(payload)
          .eq('id', this._editandoId);

        if (error) throw error;
        Toast.exito('Área actualizada correctamente');
      } else {
        const { error } = await clienteSupabase
          .from('areas')
          .insert([payload]);

        if (error) throw error;
        Toast.exito('Nueva área registrada con éxito');
      }

      this.cerrarModal();
      await this._poblarFiltros();
      await this.cargarAreas(this._paginaActual);

    } catch (err) {
      console.error(err);
      Toast.error('Error al guardar: ' + err.message);
    } finally {
      btn.disabled = false;
      spinner.style.display = 'none';
      txt.textContent = this._editandoId ? 'Guardar Cambios' : 'Guardar Área';
    }
  },

  abrirEditar(id) {
    const area = this._areas.find(a => a.id === id);
    if (!area) return;

    this._editandoId = id;
    document.getElementById('area-nombre').value = area.nombre || '';
    document.getElementById('area-responsable').value = area.responsable || '';
    document.getElementById('area-cargo').value = area.cargo || '';
    document.getElementById('area-estado').value = area.estado || 'Activa';

    document.getElementById('modal-area-titulo-texto').textContent = 'Editar Área';
    document.getElementById('btn-guardar-texto-area').textContent = 'Guardar Cambios';
    document.getElementById('modal-area').classList.add('visible');
  },

  abrirEliminar(id, nombre) {
    this._eliminandoId = id;
    document.getElementById('texto-confirmar-eliminar').textContent =
      `¿Está seguro de que desea eliminar permanentemente el área "${nombre}"? Esta acción no se puede deshacer.`;
    document.getElementById('modal-eliminar-area').classList.add('visible');
  },

  async confirmarEliminar() {
    if (!this._eliminandoId) return;

    const btn = document.getElementById('btn-eliminar-confirmar-area');
    const spinner = document.getElementById('btn-eliminar-spinner');
    const txt = document.getElementById('btn-eliminar-texto');

    try {
      btn.disabled = true;
      spinner.style.display = 'inline-block';
      txt.textContent = 'Eliminando...';

      const { error } = await clienteSupabase
        .from('areas')
        .delete()
        .eq('id', this._eliminandoId);

      if (error) throw error;

      Toast.exito('Área eliminada exitosamente');
      this.cerrarModalEliminar();
      await this._poblarFiltros();
      await this.cargarAreas(1);

    } catch (err) {
      console.error(err);
      Toast.error('Error al eliminar área: ' + err.message);
    } finally {
      btn.disabled = false;
      spinner.style.display = 'none';
      txt.textContent = 'Eliminar';
    }
  },

};
