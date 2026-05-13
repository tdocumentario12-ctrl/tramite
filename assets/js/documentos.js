/* ============================================
   SISTEMA SIS — Gestión de Documentos
   ============================================ */

const Documentos = {
  _documentos: [],
  _paginaActual: 1,
  _totalPaginas: 1,
  _porPagina: 10,
  _totalRegistros: 0,

  async renderizar(contenedor) {
    contenedor.innerHTML = `
      <div class="doc-container">
        <!-- Dashboard de Estadísticas -->
        <div class="doc-stats">
          <div class="stat-card stat-total">
            <div class="stat-icon">📁</div>
            <div class="stat-info">
              <span class="stat-valor" id="stat-total">0</span>
              <span class="stat-label">Total Documentos</span>
            </div>
          </div>
          <div class="stat-card stat-pendientes">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <span class="stat-valor" id="stat-proceso">0</span>
              <span class="stat-label">En Proceso</span>
            </div>
          </div>
          <div class="stat-card stat-atendidos">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <span class="stat-valor" id="stat-finalizado">0</span>
              <span class="stat-label">Finalizados</span>
            </div>
          </div>
          <div class="stat-card stat-emitidos">
            <div class="stat-icon">📍</div>
            <div class="stat-info">
              <span class="stat-valor" id="stat-areas">0</span>
              <span class="stat-label">Áreas Activas</span>
            </div>
          </div>
        </div>

        <!-- Panel de Filtros -->
        <div class="doc-filtros">
          <div class="filtros-grid">
            <div class="campo-grupo">
              <label class="campo-label">Número / Remitente</label>
              <input type="text" id="f-busqueda" class="campo-input" placeholder="Buscar texto...">
            </div>

            <div class="campo-grupo">
              <label class="campo-label">Tipo de Documento</label>
              <select id="f-tipo" class="campo-input">
                <option value="">Todos</option>
                <option value="NOTA Nº">Nota Nº</option>
                <option value="OFICIO Nº">Oficio Nº</option>
                <option value="CARTA Nº">Carta Nº</option>
                <option value="MEMORANDUM Nº">Memorándum Nº</option>
                <option value="SOLICITUD Nº">Solicitud Nº</option>
                <option value="INFORME Nº">Informe Nº</option>
              </select>
            </div>

            <div class="campo-grupo">
              <label class="campo-label">Desde</label>
              <input type="date" id="f-desde" class="campo-input">
            </div>
            <div class="campo-grupo">
              <label class="campo-label">Hasta</label>
              <input type="date" id="f-hasta" class="campo-input">
            </div>
          </div>
          <div class="filtro-acciones">
            <button class="btn-secundario" onclick="Documentos.limpiarFiltros()">Limpiar</button>
            <button class="btn-primario" onclick="Documentos.cargarDocumentos(1)">Filtrar</button>
          </div>
        </div>

        <!-- Tabla de Documentos -->
        <div class="doc-tabla-wrapper">
          <table class="doc-tabla">
            <thead>
              <tr>
                <th>Nº DOCUMENTO</th>
                <th>TIPO</th>
                <th>REMITENTE</th>
                <th>DESTINATARIO</th>
                <th>FECHA</th>
                <th>ESTADO</th>
                <th>PRIORIDAD</th>
                <th style="text-align:center;">ACCIONES</th>
              </tr>
            </thead>
            <tbody id="tabla-body">
              <!-- Datos dinámicos -->
            </tbody>
          </table>
          <div class="doc-footer">
            <div class="footer-info" id="footer-info">Mostrando 0 de 0 registros</div>
            <div class="pagination" id="paginacion"></div>
          </div>
        </div>
      </div>

      <!-- Modal de Detalle (Compacto y Premium) -->
      <div class="modal-overlay" id="modal-doc-detalle">
        <div class="modal-card" style="max-width: 950px; width: 95%; border-radius: 16px; background: white; overflow: hidden; box-shadow: var(--sombra-xl);">
          <div class="modal-header" style="padding: 15px 25px; border-bottom: 1px solid #F1F5F9; background: white; display: flex; align-items: center; justify-content: space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size: 1.5rem;">📄</span>
              <h2 style="margin:0; font-size:1.1rem; color:#0F172A;">Detalle del Documento</h2>
            </div>
            <button class="modal-cerrar" onclick="Documentos.cerrarModal()" style="background: none; border: none; font-size: 1.8rem; line-height: 1; cursor: pointer; color: #94A3B8; padding: 0; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; transition: all 0.2s;">&times;</button>
          </div>
          
          <div class="modal-body" id="det-body" style="padding: 20px; background: #F8FAFC;">
            <!-- Contenido dinámico -->
          </div>

          <div class="modal-footer" style="padding: 15px 25px; background: white; border-top: 1px solid #F1F5F9; display: flex; justify-content: space-between;">
            <div style="display:flex; gap:10px; flex-wrap: wrap;">
              <button class="btn-exportar-pdf" id="btn-generar-pdf-formal">🖨️ PDF Institucional</button>
              <button class="btn-exportar-word" id="btn-exportar-word">📝 Exportar Word</button>
              <button class="btn-ver-adjunto" id="btn-descargar-det">📎 Ver Adjunto</button>
            </div>
            <button class="btn-cancelar" onclick="Documentos.cerrarModal()" style="margin:0; padding: 8px 20px; font-size: 0.85rem;">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    await this.cargarDocumentos(1);
    await this.cargarEstadisticas();
  },

  async cargarEstadisticas() {
    try {
      const { data, error } = await clienteSupabase.from('documentos').select('estado, area_destino');
      if (error) throw error;
      document.getElementById('stat-total').textContent = data.length;
      document.getElementById('stat-proceso').textContent = data.filter(d => d.estado === 'EN PROCESO').length;
      document.getElementById('stat-finalizado').textContent = data.filter(d => d.estado === 'FINALIZADO').length;
      const areas = [...new Set(data.map(d => d.area_destino).filter(a => a))];
      document.getElementById('stat-areas').textContent = areas.length;
    } catch (e) {}
  },

  async cargarDocumentos(pagina) {
    this._paginaActual = pagina;
    const body = document.getElementById('tabla-body');
    body.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;"><div class="spinner primario"></div></td></tr>';

    try {
      let query = clienteSupabase.from('documentos').select('*, perfiles(nombre_completo)', { count: 'exact' });
      const busqueda = document.getElementById('f-busqueda').value;
      if (busqueda) query = query.or(`numero_documento.ilike.%${busqueda}%,remitente.ilike.%${busqueda}%`);

      const tipo = document.getElementById('f-tipo').value;
      if (tipo) query = query.eq('tipo_documento', tipo);

      const desde = document.getElementById('f-desde').value;
      if (desde) query = query.gte('fecha_documento', desde);
      const hasta = document.getElementById('f-hasta').value;
      if (hasta) query = query.lte('fecha_documento', hasta);

      const offset = (pagina - 1) * this._porPagina;
      const { data, count, error } = await query.order('creado_en', { ascending: false }).range(offset, offset + this._porPagina - 1);

      if (error) throw error;
      this._documentos = data;
      this._totalRegistros = count;
      this._totalPaginas = Math.ceil(count / this._porPagina);

      body.innerHTML = data.length ? '' : '<tr><td colspan="8" style="text-align:center; padding:40px;">No se encontraron registros</td></tr>';
      
      data.forEach(doc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span style="font-weight:700; color:var(--color-primario);">${doc.numero_documento}</span></td>
          <td><span class="badge-tipo">${doc.tipo_documento}</span></td>
          <td>${doc.remitente}</td>
          <td>${doc.destinatario}</td>
          <td>${doc.fecha_documento}</td>
          <td><span class="badge-estado est-${doc.estado.toLowerCase().replace(' ', '-')}">${doc.estado}</span></td>
          <td><span class="badge-prioridad prio-${doc.prioridad.toLowerCase()}">${doc.prioridad}</span></td>
          <td>
            <div class="acciones-flex" style="justify-content:center;">
              <button class="btn-accion-tabla" title="Ver Detalle" onclick="Documentos.verDetalle('${doc.id}')">👁️</button>
              <button class="btn-accion-tabla" title="Derivar" onclick="Documentos.derivarNuevamente('${doc.id}')">⤴️</button>
              <button class="btn-accion-tabla" title="Eliminar" onclick="Documentos.eliminar('${doc.id}')">🗑️</button>
            </div>
          </td>
        `;
        body.appendChild(tr);
      });

      document.getElementById('footer-info').textContent = `Mostrando ${data.length} de ${count} registros`;
      this._renderizarPaginacion();
    } catch (err) { console.error(err); }
  },

  _renderizarPaginacion() {
    const pag = document.getElementById('paginacion');
    pag.innerHTML = '';
    for (let i = 1; i <= this._totalPaginas; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = `page-btn ${i === this._paginaActual ? 'active' : ''}`;
      btn.onclick = () => this.cargarDocumentos(i);
      pag.appendChild(btn);
    }
  },

  async verDetalle(id) {
    const doc = this._documentos.find(d => d.id === id);
    if (!doc) return;

    const modal = document.getElementById('modal-doc-detalle');
    const detBody = document.getElementById('det-body');

    detBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px;">
        <!-- Columna Izquierda -->
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <h4 style="color: #0284C7; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 12px; font-weight: 800; border-bottom: 1px solid #F1F5F9; padding-bottom: 5px;">INFORMACIÓN</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">NÚMERO</span><b style="font-size: 1rem;">${doc.numero_documento}</b></div>
              <div style="display:flex; gap:10px;">
                <div style="flex:1;"><span style="font-size: 0.6rem; color: #94A3B8; display:block;">TIPO</span><span style="font-size: 0.75rem;">${doc.tipo_documento}</span></div>
                <div style="flex:1;"><span style="font-size: 0.6rem; color: #94A3B8; display:block;">FECHA DOC.</span><span style="font-size: 0.75rem;">${doc.fecha_documento}</span></div>
              </div>
            </div>
          </div>

          <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <h4 style="color: #0284C7; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 12px; font-weight: 800; border-bottom: 1px solid #F1F5F9; padding-bottom: 5px;">PARTICIPANTES</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">REMITENTE</span><span style="font-size: 0.8rem; font-weight: 600;">${doc.remitente}</span></div>
              <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">DESTINATARIO</span><span style="font-size: 0.8rem; font-weight: 600;">${doc.destinatario}</span></div>
              <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">CARGO</span><span style="font-size: 0.75rem; font-style: italic; color: #64748B;">${doc.cargo_destinatario || '---'}</span></div>
              <div style="padding-top:8px; border-top: 1px dashed #F1F5F9;"><span style="font-size: 0.6rem; color: #94A3B8; display:block;">ÁREA DESTINO</span><b style="color: #0284C7; font-size: 0.85rem;">${doc.area_destino || 'MESA DE PARTES'}</b></div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha -->
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #E2E8F0; flex-grow: 1;">
            <h4 style="color: #0284C7; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 12px; font-weight: 800; border-bottom: 1px solid #F1F5F9; padding-bottom: 5px;">CONTENIDO</h4>
            <div style="margin-bottom:12px;"><span style="font-size: 0.6rem; color: #94A3B8; display:block;">ASUNTO</span><b style="font-size: 0.9rem; line-height: 1.3;">${doc.asunto}</b></div>
            <div><span style="font-size: 0.6rem; color: #94A3B8; display:block;">DESCRIPCIÓN</span><p style="font-size: 0.8rem; color: #475569; line-height: 1.5; margin-top:5px;">${doc.descripcion || 'Sin descripción.'}</p></div>
          </div>

          <div style="background: #F1F5F9; padding: 12px 15px; border-radius: 10px; display:flex; justify-content: space-between; align-items: center; border: 1px solid #E2E8F0;">
             <div><small style="color: #64748B; font-size: 0.55rem; font-weight:700; text-transform: uppercase;">REGISTRADO POR</small><div style="font-weight: 700; font-size: 0.8rem;">${doc.perfiles?.nombre_completo || 'Usuario'}</div></div>
             <div style="text-align:right;"><small style="color: #64748B; font-size: 0.55rem; font-weight:700; text-transform: uppercase;">FECHA</small><div style="font-weight: 700; font-size: 0.8rem;">${new Date(doc.creado_en).toLocaleDateString()}</div></div>
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

  /* ── Cargar firma digital del usuario logueado ── */
  async _cargarFirmaUsuario() {
    try {
      const { data: { user } } = await clienteSupabase.auth.getUser();
      if (!user) return null;
      const { data } = await clienteSupabase.from('perfiles').select('firma_url, nombre_completo, cargo').eq('id', user.id).single();
      return data || null;
    } catch (e) { return null; }
  },

  /* ── PDF Institucional (formato formal alineado) ── */
  async generarNotaPDF(doc) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const mIzq = 27, mDer = 27, anchoUtil = 210 - mIzq - mDer;
    const perfil = await this._cargarFirmaUsuario();

    try {
      // --- Logo ---
      const img = new Image(); img.src = 'assets/img/Logo.jpg';
      await new Promise((r, j) => { img.onload = r; img.onerror = j; });
      pdf.addImage(img, 'JPEG', mIzq, 10, 22, 22);

      // --- Lema del año (centrado, itálica) ---
      pdf.setFont('helvetica', 'italic'); pdf.setFontSize(9); pdf.setTextColor(80);
      pdf.text('\u201cAño de la recuperación y consolidación de la economía peruana\u201d', 105, 18, { align: 'center' });

      // --- Fecha (derecha) ---
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.setTextColor(0);
      pdf.text('Chincha, ' + this._formatearFechaLarga(doc.fecha_documento), 210 - mDer, 48, { align: 'right' });

      // --- Título subrayado ---
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13);
      const tit = doc.tipo_documento + ' ' + doc.numero_documento;
      pdf.text(tit, mIzq, 62);
      pdf.setLineWidth(0.5);
      pdf.line(mIzq, 63.5, mIzq + pdf.getTextWidth(tit), 63.5);

      // --- Señor / Cargo (tabulado) ---
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

      // --- Asunto (tabulado) ---
      y += 14;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
      pdf.text('Asunto', mIzq, y);
      pdf.text(':', 50, y);
      const asuntoLines = pdf.splitTextToSize(doc.asunto.toUpperCase(), anchoUtil - (colVal - mIzq));
      pdf.text(asuntoLines, colVal, y);
      y += asuntoLines.length * 6;

      // --- Línea separadora ---
      y += 8;
      pdf.setDrawColor(180); pdf.setLineWidth(0.3);
      pdf.line(mIzq, y, 210 - mDer, y);
      y += 12;

      // --- Cuerpo (justificado) ---
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
      const bodyLines = pdf.splitTextToSize(doc.descripcion || '', anchoUtil);
      pdf.text(bodyLines, mIzq, y, { align: 'justify', maxWidth: anchoUtil });
      y += bodyLines.length * 6;

      // --- Cierre (solo si no está ya en la descripción) ---
      const descLower = (doc.descripcion || '').toLowerCase();
      const yaContieneAtentamente = descLower.includes('atentamente');
      if (!yaContieneAtentamente) {
        y += 18;
        pdf.text('Atentamente,', mIzq, y);
      }
      y += 12;

      // --- Firma digital (si existe) ---
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

      // --- Nombre y cargo del firmante ---
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

  /* ── Exportar Word (.doc) ── */
  async generarWord(doc) {
    const perfil = await this._cargarFirmaUsuario();
    try {
      let firmaHtml = '';
      if (perfil && perfil.firma_url) {
        firmaHtml = '<p style="margin:0;"><img src="' + perfil.firma_url + '" width="120" height="60"></p>';
      }
      let firmante = '';
      if (perfil && perfil.nombre_completo) {
        firmante = '<p style="margin:0;"><b>_________________________</b></p>' +
          '<p style="margin:0;"><b>' + perfil.nombre_completo.toUpperCase() + '</b></p>' +
          (perfil.cargo ? '<p style="margin:0;">' + perfil.cargo + '</p>' : '');
      }

      const source = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="utf-8"><title>' + doc.numero_documento + '</title>' +
        '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->' +
        '<style>' +
        '@page { size: A4; margin: 2.5cm 2.7cm 1cm 2.7cm; }' +
        'body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #000; }' +
        '.lema { text-align: center; font-style: italic; font-size: 9pt; color: #555; margin-bottom: 24pt; }' +
        '.fecha { text-align: right; font-size: 11pt; margin-bottom: 12pt; }' +
        '.titulo { font-size: 13pt; font-weight: bold; text-decoration: underline; margin-bottom: 14pt; }' +
        '.campo { font-size: 11pt; margin: 0; line-height: 1.4; }' +
        '.campo-cargo { font-size: 11pt; font-weight: bold; margin: 0 0 0 78px; line-height: 1.4; }' +
        '.campo-label { display: inline-block; width: 70px; }' +
        '.separador { border: none; border-top: 1px solid #ccc; margin: 14pt 0; }' +
        '.cuerpo { font-size: 11pt; text-align: justify; line-height: 1.6; margin-bottom: 20pt; }' +
        '.cierre { font-size: 11pt; margin-top: 24pt; }' +
        '</style></head><body>' +
        '<p class="lema">\u201cAño de la recuperación y consolidación de la economía peruana\u201d</p>' +
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

  cerrarModal() { document.getElementById('modal-doc-detalle').classList.remove('visible'); },

  limpiarFiltros() {
    ['f-busqueda','f-tipo','f-desde','f-hasta'].forEach(function(id) { document.getElementById(id).value = ''; });
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
