const Documentos = {
  _documentos: [],
  _paginaActual: 1,
  _totalPaginas: 1,
  _porPagina: 10,
  _totalRegistros: 0,
  _perfil: null,

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;

    const tituloHeader = document.getElementById('titulo-pagina');
    if (tituloHeader) {
      tituloHeader.innerHTML = `GESTIÓN DE DOCUMENTOS <span style="font-size: 0.95rem; font-weight: 500; color: var(--color-texto-secundario); margin-left: 12px; border-left: 1px solid var(--color-borde); padding-left: 12px;">Registro de todos los documentos emitidos y en trámite.</span>`;
    }

    if (contenedor) contenedor.innerHTML = '<div style="padding:20px;color:#64748B;">Cargando módulo de documentos...</div>';

    const html = `<div class="doc-container">

  <!-- === TARJETAS ESTADISTICAS === -->
  <div class="doc-stats-grid">
    <div class="stat-card" data-color="blue">
      <div class="stat-icon-wrap blue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">TOTAL DOCUMENTOS</span>
        <span class="stat-value" id="stat-total">0</span>
        <span class="stat-desc">Documentos registrados</span>
      </div>
    </div>
    <div class="stat-card" data-color="orange">
      <div class="stat-icon-wrap orange">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">EN PROCESO</span>
        <span class="stat-value" id="stat-proceso">0</span>
        <span class="stat-desc">Documentos en tramite</span>
      </div>
    </div>
    <div class="stat-card" data-color="green">
      <div class="stat-icon-wrap green">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">FINALIZADOS</span>
        <span class="stat-value" id="stat-finalizado">0</span>
        <span class="stat-desc">Documentos concluidos</span>
      </div>
    </div>
  </div>

  <!-- === PANEL DE FILTROS === -->
  <div class="filtros-card">
    <div class="filtros-grid">
      <div class="filtro-grupo full">
        <div class="input-icon-wrapper">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" id="f-busqueda" class="filtro-input" placeholder="Buscar por numero o remitente..." autocomplete="off">
        </div>
      </div>
      <div class="filtro-grupo">
        <label class="filtro-label">Tipo de Documento</label>
        <select id="f-tipo" class="filtro-select">
          <option value="">Todos</option>
          <option value="NOTA N\u00ba">Nota N\u00ba</option>
          <option value="OFICIO N\u00ba">Oficio N\u00ba</option>
          <option value="CARTA N\u00ba">Carta N\u00ba</option>
          <option value="MEMORANDUM N\u00ba">Memorandum N\u00ba</option>
          <option value="SOLICITUD N\u00ba">Solicitud N\u00ba</option>
          <option value="INFORME N\u00ba">Informe N\u00ba</option>
        </select>
      </div>
      <div class="filtro-grupo">
        <label class="filtro-label">Origen de Registro</label>
        <select id="f-origen" class="filtro-select">
          <option value="">Todos</option>
          <option value="Emitido">Emitidos</option>
          <option value="Derivado">Derivados</option>
        </select>
      </div>
      <div class="filtro-grupo">
        <label class="filtro-label">Fecha Desde</label>
        <input type="date" id="f-desde" class="filtro-input input-calendario" placeholder="dd/mm/aaaa">
      </div>
      <div class="filtro-grupo">
        <label class="filtro-label">Fecha Hasta</label>
        <input type="date" id="f-hasta" class="filtro-input input-calendario" placeholder="dd/mm/aaaa">
      </div>
    </div>
    <div class="filtro-acciones">
      <button class="btn-limpiar" id="doc-btn-limpiar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        LIMPIAR
      </button>
      <button class="btn-filtrar" id="doc-btn-filtrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        FILTRAR
      </button>
    </div>
  </div>

  <!-- === TABLA PRINCIPAL === -->
  <div class="tabla-card">
    <table class="doc-tabla">
      <thead>
        <tr>
          <th class="th-doc">N\u00ba DOCUMENTO <span class="sort-icon">\u2191\u2193</span></th>
          <th>TIPO</th>
          <th>REMITENTE</th>
          <th>DESTINATARIO</th>
          <th class="th-fecha">FECHA <span class="sort-icon">\u2191\u2193</span></th>
          <th>ESTADO</th>
          <th>PRIORIDAD</th>
          <th class="th-acciones">ACCIONES</th>
        </tr>
      </thead>
      <tbody id="tabla-body"></tbody>
    </table>
    <div class="tabla-footer">
      <div class="footer-pagesize">
        <span>Mostrar</span>
        <select id="page-size" class="pagesize-select">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      <div class="footer-info" id="footer-info">Mostrando 0 de 0 registros</div>
      <div class="pagination" id="paginacion"></div>
    </div>
  </div>
</div>

<!-- === MODAL DETALLE === -->
<div class="modal-overlay" id="modal-doc-detalle">
  <div class="modal-card">
    <div class="modal-header">
      <div class="modal-header-left">
        <div class="modal-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h2 class="modal-header-title">Detalle del Documento</h2>
      </div>
      <button class="modal-cerrar-btn" id="doc-modal-cerrar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="modal-body" id="det-body"></div>
    <div class="modal-footer">
      <div class="modal-footer-actions">
        <button class="modal-btn modal-btn-pdf" id="btn-generar-pdf-formal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          PDF Institucional
        </button>
        <button class="modal-btn modal-btn-word" id="btn-exportar-word">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Exportar Word
        </button>
        <button class="modal-btn modal-btn-adjunto" id="btn-descargar-det">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Ver Adjunto
        </button>
      </div>
      <button class="modal-btn modal-btn-cerrar" id="doc-modal-cerrar-footer">Cerrar</button>
    </div>
  </div>
</div>`;
    contenedor.innerHTML = html;

    this._vincularEventos();
    this._inicializarCalendarios();
    console.log('[Documentos] Template HTML inyectado. tabla-body existe:', !!document.getElementById('tabla-body'));
    console.log('[Documentos] tabla-card existe:', !!document.querySelector('.tabla-card'));
    await this.cargarDocumentos(1);
    await this.cargarEstadisticas();
  },

  _vincularEventos() {
    document.getElementById('doc-btn-filtrar')?.addEventListener('click', () => this.cargarDocumentos(1));
    document.getElementById('doc-btn-limpiar')?.addEventListener('click', () => this.limpiarFiltros());

    const pageSize = document.getElementById('page-size');
    if (pageSize) {
      pageSize.addEventListener('change', () => {
        this._porPagina = parseInt(pageSize.value);
        this.cargarDocumentos(1);
      });
    }

    const cerrarModal = () => {
      document.getElementById('modal-doc-detalle')?.classList.remove('visible');
    };
    document.getElementById('doc-modal-cerrar')?.addEventListener('click', cerrarModal);
    document.getElementById('doc-modal-cerrar-footer')?.addEventListener('click', cerrarModal);
  },

  _inicializarCalendarios() {
    if (typeof flatpickr !== 'undefined') {
      flatpickr("#f-desde, #f-hasta", {
        locale: "es",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true,
        altInputClass: "filtro-input input-calendario",
        onReady: function(selectedDates, dateStr, instance) {
          const btnContainer = document.createElement("div");
          btnContainer.className = "flatpickr-custom-buttons";

          const btnHoy = document.createElement("button");
          btnHoy.textContent = "Hoy";
          btnHoy.className = "flatpickr-btn-hoy";
          btnHoy.addEventListener("click", () => {
            instance.setDate(new Date());
            instance.close();
            instance.element.dispatchEvent(new Event('change'));
          });

          const btnBorrar = document.createElement("button");
          btnBorrar.textContent = "Borrar";
          btnBorrar.className = "flatpickr-btn-borrar";
          btnBorrar.addEventListener("click", () => {
            instance.clear();
            instance.close();
            instance.element.dispatchEvent(new Event('change'));
          });

          btnContainer.appendChild(btnBorrar);
          btnContainer.appendChild(btnHoy);
          instance.calendarContainer.appendChild(btnContainer);
        }
      });
    }
  },

  async cargarEstadisticas() {
    try {
      const { data, error } = await clienteSupabase.from('documentos').select('estado, area_destino');
      if (error) throw error;
      document.getElementById('stat-total').textContent = data.length;
      document.getElementById('stat-proceso').textContent = data.filter(d => d.estado === 'EN PROCESO').length;
      document.getElementById('stat-finalizado').textContent = data.filter(d => d.estado === 'FINALIZADO').length;
    } catch (e) {}
  },

  async cargarDocumentos(pagina) {
    this._paginaActual = pagina;
    const body = document.getElementById('tabla-body');
    if (!body) { console.warn('[Documentos] #tabla-body no encontrado'); return; }
    body.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;"><div class="spinner primario"></div></td></tr>';

    try {
      let query = clienteSupabase.from('documentos').select('*, usuario_registro:perfiles!usuario_registro(nombre_completo), firmante:perfiles!firmante_id(nombre_completo, cargo, firma_url)', { count: 'exact' });

      const busqueda = document.getElementById('f-busqueda')?.value || '';
      if (busqueda) query = query.or(`numero_documento.ilike.%${busqueda}%,remitente.ilike.%${busqueda}%`);

      const tipo = document.getElementById('f-tipo')?.value || '';
      if (tipo) query = query.eq('tipo_documento', tipo);

      const origen = document.getElementById('f-origen')?.value || '';
      if (origen) query = query.eq('tipo_registro', origen);

      const desde = document.getElementById('f-desde')?.value || '';
      if (desde) query = query.gte('fecha_documento', desde);
      const hasta = document.getElementById('f-hasta')?.value || '';
      if (hasta) query = query.lte('fecha_documento', hasta);

      const offset = (pagina - 1) * this._porPagina;
      const { data, count, error } = await query.order('creado_en', { ascending: false }).range(offset, offset + this._porPagina - 1);

      if (error) throw error;
      if (!data) throw new Error('La consulta retornó datos nulos');
      this._documentos = data;
      this._totalRegistros = count || 0;
      this._totalPaginas = Math.ceil(this._totalRegistros / this._porPagina);

      if (!data.length) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#64748B;">No se encontraron registros</td></tr>';
      } else {
        body.innerHTML = '';
        data.forEach(doc => {
          try {
            const estadoClass = (doc.estado || 'REGISTRADO').toLowerCase().replace(/ /g, '-');
            const prioridadClass = (doc.prioridad || 'MEDIA').toLowerCase();
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td><span class="doc-link" onclick="Documentos.verDetalle('${doc.id}')">${doc.numero_documento}</span></td>
              <td>
                <span class="badge-tipo">${doc.tipo_documento || ''}</span>
                <div style="margin-top: 5px;">
                  <span class="badge-tipo badge-${(doc.tipo_registro || 'Emitido').toLowerCase()}">${doc.tipo_registro || 'Emitido'}</span>
                </div>
              </td>
              <td>${doc.remitente || ''}</td>
              <td>${doc.destinatario || ''}</td>
              <td>${doc.fecha_documento || ''}</td>
              <td><span class="badge-estado est-${estadoClass}">${doc.estado || 'REGISTRADO'}</span></td>
              <td><span class="badge-prioridad prio-${prioridadClass}">${doc.prioridad || 'MEDIA'}</span></td>
              <td>
                <div class="acciones-flex">
                  <button class="btn-accion btn-accion-ver" data-tooltip="Ver Detalle" onclick="Documentos.verDetalle('${doc.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button class="btn-accion btn-accion-editar" data-tooltip="Derivar" onclick="Documentos.derivarNuevamente('${doc.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-accion btn-accion-eliminar" data-tooltip="Eliminar" onclick="Documentos.eliminar('${doc.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            `;
            body.appendChild(tr);
          } catch (rowErr) {
            console.warn('[Documentos] Error al renderizar fila:', rowErr, doc);
          }
        });
      }

      const footerInfo = document.getElementById('footer-info');
      if (footerInfo) footerInfo.textContent = `Mostrando ${data.length} de ${this._totalRegistros} registros`;
      this._renderizarPaginacion();
    } catch (err) {
      console.error('[Documentos] Error al cargar:', err);
      body.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#EF5350;">Error al cargar documentos: ' + (err.message || 'Error desconocido') + '</td></tr>';
    }
  },

  _renderizarPaginacion() {
    const pag = document.getElementById('paginacion');
    pag.innerHTML = '';

    if (this._totalPaginas > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.textContent = 'Anterior';
      prevBtn.className = `page-btn prev-next ${this._paginaActual === 1 ? 'disabled' : ''}`;
      if (this._paginaActual > 1) prevBtn.onclick = () => this.cargarDocumentos(this._paginaActual - 1);
      pag.appendChild(prevBtn);
    }

    let rangoInicio = Math.max(1, this._paginaActual - 2);
    let rangoFin = Math.min(this._totalPaginas, this._paginaActual + 2);

    for (let i = rangoInicio; i <= rangoFin; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = `page-btn ${i === this._paginaActual ? 'active' : ''}`;
      btn.onclick = () => this.cargarDocumentos(i);
      pag.appendChild(btn);
    }

    if (this._totalPaginas > 1) {
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Siguiente';
      nextBtn.className = `page-btn prev-next ${this._paginaActual === this._totalPaginas ? 'disabled' : ''}`;
      if (this._paginaActual < this._totalPaginas) nextBtn.onclick = () => this.cargarDocumentos(this._paginaActual + 1);
      pag.appendChild(nextBtn);
    }
  },

  async verDetalle(id) {
    const doc = this._documentos.find(d => d.id === id);
    if (!doc) return;

    const modal = document.getElementById('modal-doc-detalle');
    const detBody = document.getElementById('det-body');

    detBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px;">
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <h4 style="color: #1976D2; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 12px; font-weight: 800; border-bottom: 1px solid #F1F5F9; padding-bottom: 5px;">INFORMACIÓN</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">NÚMERO</span><b style="font-size: 1rem;">${doc.numero_documento}</b></div>
              <div style="display:flex; gap:10px;">
                <div style="flex:1;"><span style="font-size: 0.6rem; color: #94A3B8; display:block;">TIPO</span><span style="font-size: 0.75rem;">${doc.tipo_documento}</span></div>
                <div style="flex:1;"><span style="font-size: 0.6rem; color: #94A3B8; display:block;">FECHA DOC.</span><span style="font-size: 0.75rem;">${doc.fecha_documento}</span></div>
              </div>
            </div>
          </div>

          <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <h4 style="color: #1976D2; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 12px; font-weight: 800; border-bottom: 1px solid #F1F5F9; padding-bottom: 5px;">PARTICIPANTES</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">REMITENTE</span><span style="font-size: 0.8rem; font-weight: 600;">${doc.remitente}</span></div>
              <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">DESTINATARIO</span><span style="font-size: 0.8rem; font-weight: 600;">${doc.destinatario}</span></div>
              <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">CARGO</span><span style="font-size: 0.75rem; font-style: italic; color: #64748B;">${doc.cargo_destinatario || '---'}</span></div>
              <div style="padding-top:8px; border-top: 1px dashed #F1F5F9;"><span style="font-size: 0.6rem; color: #94A3B8; display:block;">ÁREA DESTINO</span><b style="color: #1976D2; font-size: 0.85rem;">${doc.area_destino || 'MESA DE PARTES'}</b></div>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #E2E8F0; flex-grow: 1;">
            <h4 style="color: #1976D2; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 12px; font-weight: 800; border-bottom: 1px solid #F1F5F9; padding-bottom: 5px;">CONTENIDO</h4>
            <div style="margin-bottom:12px;"><span style="font-size: 0.6rem; color: #94A3B8; display:block;">ASUNTO</span><b style="font-size: 0.9rem; line-height: 1.3;">${doc.asunto}</b></div>
            <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">DESCRIPCIÓN</span><p style="font-size: 0.8rem; color: #475569; line-height: 1.5; margin-top:5px;">${doc.descripcion || 'Sin descripción.'}</p></div>
          </div>

          <div style="background: #F1F5F9; padding: 12px 15px; border-radius: 10px; display:flex; flex-direction: column; gap: 8px; border: 1px solid #E2E8F0;">
            <div style="display:flex; justify-content: space-between; align-items: center;">
              <div><small style="color: #64748B; font-size: 0.55rem; font-weight:700; text-transform: uppercase;">AUTOR / FIRMANTE</small><div style="font-weight: 700; font-size: 0.8rem; color: #1976D2;">${doc.firmante?.nombre_completo || doc.usuario_registro?.nombre_completo || 'Usuario'}</div></div>
              <div style="text-align:right;"><small style="color: #64748B; font-size: 0.55rem; font-weight:700; text-transform: uppercase;">FECHA</small><div style="font-weight: 700; font-size: 0.8rem;">${new Date(doc.creado_en).toLocaleDateString()}</div></div>
            </div>
            <div style="border-top: 1px dashed #CBD5E1; padding-top: 6px;"><small style="color: #64748B; font-size: 0.52rem; font-weight:700; text-transform: uppercase;">ELABORADO POR</small><span style="font-size: 0.72rem; color: #475569; margin-left: 8px;">${doc.usuario_registro?.nombre_completo || 'Usuario'}</span></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-descargar-det').onclick = () => {
      if (doc.archivo_pdf) window.open(doc.archivo_pdf, '_blank');
      else Toast.error('No hay archivo adjunto');
    };
    document.getElementById('btn-generar-pdf-formal').onclick = () => this.generarNotaPDF(doc);
    document.getElementById('btn-exportar-word').onclick = () => this.generarWord(doc);
    modal.classList.add('visible');
  },

  async _cargarFirmaUsuario(usuarioId) {
    try {
      if (!usuarioId) return null;
      const { data } = await clienteSupabase.from('perfiles').select('firma_url, nombre_completo, cargo').eq('id', usuarioId).single();
      return data || null;
    } catch (e) { return null; }
  },

  async generarNotaPDF(doc) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const mIzq = 27, mDer = 27, anchoUtil = 210 - mIzq - mDer;

    const firmanteId = doc.firmante_id || doc.usuario_registro;
    const perfil = await this._cargarFirmaUsuario(firmanteId);

    try {
      const img = new Image(); img.src = 'assets/img/Logo.jpg';
      await new Promise((r, j) => { img.onload = r; img.onerror = j; });
      pdf.addImage(img, 'JPEG', mIzq, 10, 22, 22);

      pdf.setFont('helvetica', 'italic'); pdf.setFontSize(9); pdf.setTextColor(80);
      pdf.text('\u201cAño de la recuperación y consolidación de la economía peruana\u201d', 105, 18, { align: 'center' });

      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.setTextColor(0);
      pdf.text('Chincha, ' + this._formatearFechaLarga(doc.fecha_documento), 210 - mDer, 48, { align: 'right' });

      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13);
      const tit = doc.tipo_documento + ' ' + doc.numero_documento;
      pdf.text(tit, mIzq, 62);
      pdf.setLineWidth(0.5);
      pdf.line(mIzq, 63.5, mIzq + pdf.getTextWidth(tit), 63.5);

      const colVal = 58;
      let y = 75;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
      pdf.text('Señor', mIzq, y);
      pdf.text(':', 50, y);
      pdf.text(doc.destinatario.toUpperCase(), colVal, y);

      if (doc.cargo_destinatario) {
        y += 6;
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11);
        pdf.text(doc.cargo_destinatario.toUpperCase(), colVal, y);
      }

      y += 14;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
      pdf.text('Asunto', mIzq, y);
      pdf.text(':', 50, y);
      const asuntoLines = pdf.splitTextToSize(doc.asunto.toUpperCase(), anchoUtil - (colVal - mIzq));
      pdf.text(asuntoLines, colVal, y);
      y += asuntoLines.length * 6;

      y += 8;
      pdf.setDrawColor(180); pdf.setLineWidth(0.3);
      pdf.line(mIzq, y, 210 - mDer, y);
      y += 12;

      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
      const bodyLines = pdf.splitTextToSize(doc.descripcion || '', anchoUtil);
      pdf.text(bodyLines, mIzq, y, { align: 'justify', maxWidth: anchoUtil });
      y += bodyLines.length * 6;

      const descLower = (doc.descripcion || '').toLowerCase();
      const yaContieneAtentamente = descLower.includes('atentamente');
      if (!yaContieneAtentamente) {
        y += 18;
        pdf.text('Atentamente,', mIzq, y);
      }
      y += 12;

      if (perfil && perfil.firma_url) {
        try {
          const firmaImg = new Image();
          firmaImg.crossOrigin = 'anonymous';
          firmaImg.src = perfil.firma_url;
          await new Promise((r, j) => { firmaImg.onload = r; firmaImg.onerror = j; });
          pdf.addImage(firmaImg, 'PNG', mIzq, y, 40, 20);
          y += 22;
        } catch (fe) { console.warn('No se pudo cargar firma:', fe); }
      }

      if (perfil && perfil.nombre_completo) {
        y += 4;
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
        pdf.text('_________________________', mIzq, y);
        y += 5;
        pdf.text(perfil.nombre_completo.toUpperCase(), mIzq, y);
        if (perfil.cargo) {
          y += 5;
          pdf.setFont('helvetica', 'normal');
          pdf.text(perfil.cargo, mIzq, y);
        }
      }

      pdf.save(doc.numero_documento + '.pdf');
      Toast.exito('PDF Institucional generado');
    } catch (e) {
      console.error(e);
      Toast.error('Error al generar PDF');
    }
  },

  async generarWord(doc) {
    const firmanteId = doc.firmante_id || doc.usuario_registro;
    const perfil = await this._cargarFirmaUsuario(firmanteId);
    try {
      const logoUrl = window.location.origin + '/assets/img/Logo.jpg';

      let firmaHtml = '';
      if (perfil && perfil.firma_url) {
        let firmaUrl = perfil.firma_url;

        if (firmaUrl.startsWith('data:image/')) {
          try {
            const partes = firmaUrl.split(';');
            const mimeType = partes[0].split(':')[1];
            const extension = mimeType.split('/')[1] || 'png';
            const base64Data = partes[1].split(',')[1];

            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            const path = `firmas/firma_${firmanteId}_saneada.${extension}`;
            await clienteSupabase.storage.from('documentos').upload(path, blob, { upsert: true });

            const publicUrl = clienteSupabase.storage.from('documentos').getPublicUrl(path).data.publicUrl;

            await clienteSupabase.from('perfiles').update({ firma_url: publicUrl }).eq('id', firmanteId);

            firmaUrl = publicUrl;
          } catch (me) {
            console.error('Error al migrar firma Base64 a Storage:', me);
          }
        }

        firmaHtml = '<p style="margin:0;"><img src="' + firmaUrl + '" width="120" height="60"></p>';
      }

      let firmante = '';
      if (perfil && perfil.nombre_completo) {
        firmante = '<p style="margin:0;"><b>_________________________</b></p>' +
          '<p style="margin:0;"><b>' + perfil.nombre_completo.toUpperCase() + '</b></p>' +
          (perfil.cargo ? '<p style="margin:0;">' + perfil.cargo + '</p>' : '');
      }

      const cabeceraHtml = '<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24pt;">' +
        '<tr>' +
          '<td style="width: 70px; vertical-align: middle;">' +
            '<img src="' + logoUrl + '" width="55" height="55" style="display: block;">' +
          '</td>' +
          '<td style="text-align: center; vertical-align: middle; padding-right: 70px;">' +
            '<p style="margin: 0; font-style: italic; font-size: 9pt; color: #555;">\u201cAño de la recuperación y consolidación de la economía peruana\u201d</p>' +
          '</td>' +
        '</tr>' +
      '</table>';

      const source = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="utf-8"><title>' + doc.numero_documento + '</title>' +
        '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->' +
        '<style>' +
        '@page { size: A4; margin: 2.5cm 2.7cm 1cm 2.7cm; }' +
        'body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #000; }' +
        '.fecha { text-align: right; font-size: 11pt; margin-bottom: 12pt; }' +
        '.titulo { font-size: 13pt; font-weight: bold; text-decoration: underline; margin-bottom: 14pt; }' +
        '.campo { font-size: 11pt; margin: 0; line-height: 1.4; }' +
        '.campo-cargo { font-size: 11pt; font-weight: bold; margin: 0 0 0 78px; line-height: 1.4; }' +
        '.campo-label { display: inline-block; width: 70px; }' +
        '.separador { border: none; border-top: 1px solid #ccc; margin: 14pt 0; }' +
        '.cuerpo { font-size: 11pt; text-align: justify; line-height: 1.6; margin-bottom: 20pt; }' +
        '.cierre { font-size: 11pt; margin-top: 24pt; }' +
        '</style></head><body>' +
        cabeceraHtml +
        '<p class="fecha">Chincha, ' + this._formatearFechaLarga(doc.fecha_documento) + '</p>' +
        '<p class="titulo">' + doc.tipo_documento + ' ' + doc.numero_documento + '</p>' +
        '<p class="campo"><span class="campo-label">Señor</span>: &nbsp;&nbsp;&nbsp;' + doc.destinatario.toUpperCase() + '</p>' +
        '<p class="campo-cargo">' + (doc.cargo_destinatario ? doc.cargo_destinatario.toUpperCase() : '') + '</p>' +
        '<br>' +
        '<p class="campo"><span class="campo-label">Asunto</span>: &nbsp;&nbsp;&nbsp;' + doc.asunto.toUpperCase() + '</p>' +
        '<hr class="separador">' +
        '<div class="cuerpo">' + (doc.descripcion || '').replace(/\n/g, '<br>') + '</div>' +
        ((doc.descripcion || '').toLowerCase().includes('atentamente') ? '' : '<p class="cierre">Atentamente,</p>') + '<br>' +
        firmaHtml + firmante +
        '</body></html>';

      const blob = new Blob(['\ufeff', source], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.numero_documento + '.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      Toast.exito('Documento Word generado');
    } catch (e) {
      console.error(e);
      Toast.error('Error al generar Word');
    }
  },

  _formatearFechaLarga(f) {
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const p = f.split('-');
    return parseInt(p[2]) + ' de ' + meses[parseInt(p[1])-1] + ' del ' + p[0];
  },

  limpiarFiltros() {
    ['f-busqueda','f-tipo','f-origen','f-desde','f-hasta'].forEach((id) => {
      const el = document.getElementById(id);
      if (el._flatpickr) {
        el._flatpickr.clear();
      } else {
        el.value = '';
        if (el.tagName === 'SELECT') el.dispatchEvent(new Event('change'));
      }
    });
    this.cargarDocumentos(1);
  },

  derivarNuevamente(id) { sessionStorage.setItem('derivar_id', id); App.navegar('registrar-tramite'); },

  async eliminar(id) {
    if (confirm('¿Eliminar registro?')) {
      const { error } = await clienteSupabase.from('documentos').delete().eq('id', id);
      if (error) Toast.error('Error'); else { Toast.exito('Eliminado'); this.cargarDocumentos(1); }
    }
  }
};