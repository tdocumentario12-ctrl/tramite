/* ============================================
   SISTEMA SIS — Reportes y Estadísticas (Código Premium)
   ============================================ */

const Reportes = {
  _documentos: [],
  _areas: [],
  _perfil: null,

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;
    
    // Obtener fecha actual y hace 30 días para inicializar filtros
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    const strHoy = hoy.toISOString().split('T')[0];
    const str30Dias = hace30Dias.toISOString().split('T')[0];

    contenedor.innerHTML = `
      <div class="rep-container">
        <!-- Cabecera de Sección -->
        <div class="rep-cabecera">
          <div class="cabecera-info-rep">
            <h2 style="font-size: 1.75rem; font-weight: 800; color: #0F172A; margin: 0;">Reportes y Estadísticas Ejecutivas</h2>
            <div class="rep-subtitulo">Analice el volumen de trámites documentarios, la distribución por áreas y los tiempos de respuesta del hospital.</div>
          </div>
          <button class="btn-exportar-rep" onclick="Reportes.exportarCSV()">
            <svg xmlns="http://www.w3.org/2000/svg" style="width:20px; height:20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
            </svg>
            Exportar Resumen (CSV)
          </button>
        </div>

        <!-- Filtros Analíticos -->
        <div class="rep-filtros">
          <div class="rep-filtros-grid">
            <div class="campo-grupo">
              <label class="campo-label" style="font-weight:600; margin-bottom: 6px;">Desde</label>
              <input type="date" id="rep-desde" class="campo-input" value="${str30Dias}" style="margin:0;">
            </div>
            <div class="campo-grupo">
              <label class="campo-label" style="font-weight:600; margin-bottom: 6px;">Hasta</label>
              <input type="date" id="rep-hasta" class="campo-input" value="${strHoy}" style="margin:0;">
            </div>
            <div class="campo-grupo">
              <label class="campo-label" style="font-weight:600; margin-bottom: 6px;">Área Destino</label>
              <select id="rep-area" class="campo-input" style="margin:0;">
                <option value="">Todas las Áreas</option>
              </select>
            </div>
            <div class="campo-grupo">
              <label class="campo-label" style="font-weight:600; margin-bottom: 6px;">Tipo de Documento</label>
              <select id="rep-tipo" class="campo-input" style="margin:0;">
                <option value="">Todos los Tipos</option>
                <option value="NOTA Nº">Nota Nº</option>
                <option value="OFICIO Nº">Oficio Nº</option>
                <option value="CARTA Nº">Carta Nº</option>
                <option value="MEMORANDUM Nº">Memorándum Nº</option>
                <option value="SOLICITUD Nº">Solicitud Nº</option>
                <option value="INFORME Nº">Informe Nº</option>
              </select>
            </div>
          </div>
          <div class="rep-filtros-acciones">
            <button class="btn-secundario" onclick="Reportes.limpiarFiltros()" style="margin:0; padding:10px 24px; font-weight:600;">Limpiar</button>
            <button class="btn-primario" onclick="Reportes.cargarDatos()" style="margin:0; padding:10px 24px; font-weight:600;">Aplicar Filtros</button>
          </div>
        </div>

        <!-- Tarjetas de Estadísticas -->
        <div class="rep-stats-grid">
          <div class="rep-card rep-total">
            <div class="rep-card-icon">📁</div>
            <div class="rep-card-info">
              <span class="rep-card-valor" id="rep-val-total">0</span>
              <span class="rep-card-label">Total Trámites</span>
            </div>
          </div>
          <div class="rep-card rep-proceso">
            <div class="rep-card-icon">⏳</div>
            <div class="rep-card-info">
              <span class="rep-card-valor" id="rep-val-proceso">0</span>
              <span class="rep-card-label">En Proceso</span>
            </div>
          </div>
          <div class="rep-card rep-atendido">
            <div class="rep-card-icon">✅</div>
            <div class="rep-card-info">
              <span class="rep-card-valor" id="rep-val-atendidos">0</span>
              <span class="rep-card-label">Finalizados</span>
            </div>
          </div>
          <div class="rep-card rep-eficiencia">
            <div class="rep-card-icon">🎯</div>
            <div class="rep-card-info">
              <span class="rep-card-valor" id="rep-val-eficiencia">0%</span>
              <span class="rep-card-label">Tasa de Cierre</span>
            </div>
          </div>
        </div>

        <!-- Sección de Gráficos Nativos Premium -->
        <div class="rep-graficos-container">
          <!-- Gráfico 1: Por Estado -->
          <div class="grafico-card">
            <h3 class="grafico-titulo">
              <span>📊</span> Distribución por Estado de Trámite
            </h3>
            <div id="grafico-estados">
              <!-- Render dinámico -->
            </div>
          </div>

          <!-- Gráfico 2: Por Tipo de Documento -->
          <div class="grafico-card">
            <h3 class="grafico-titulo">
              <span>📄</span> Volumen por Tipo de Documento
            </h3>
            <div id="grafico-tipos">
              <!-- Render dinámico -->
            </div>
          </div>

          <!-- Gráfico 3: Top de Áreas con Más Trámites -->
          <div class="grafico-card" style="grid-column: span 2;">
            <h3 class="grafico-titulo">
              <span>🏢</span> Trámites por Área de Destino
            </h3>
            <div id="grafico-areas" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <!-- Render dinámico -->
            </div>
          </div>
        </div>
      </div>
    `;

    await this.cargarAreas();
    await this.cargarDatos();
  },

  async cargarAreas() {
    try {
      const { data, error } = await clienteSupabase.from('areas').select('nombre').order('nombre', { ascending: true });
      if (error) throw error;
      
      this._areas = data;
      const select = document.getElementById('rep-area');
      if (!select) return;

      select.innerHTML = '<option value="">Todas las Áreas</option>';
      data.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.nombre;
        opt.textContent = a.nombre;
        select.appendChild(opt);
      });
    } catch (e) {
      console.error('Error al cargar áreas para reportes:', e);
    }
  },

  async cargarDatos() {
    try {
      let query = clienteSupabase.from('documentos').select('*');

      const desde = document.getElementById('rep-desde').value;
      if (desde) query = query.gte('fecha_documento', desde);

      const hasta = document.getElementById('rep-hasta').value;
      if (hasta) query = query.lte('fecha_documento', hasta);

      const area = document.getElementById('rep-area').value;
      if (area) query = query.eq('area_destino', area);

      const tipo = document.getElementById('rep-tipo').value;
      if (tipo) query = query.eq('tipo_documento', tipo);

      const { data, error } = await query;
      if (error) throw error;

      this._documentos = data;
      this.calcularMétricas(data);

    } catch (err) {
      console.error(err);
      Toast.error('Error al generar estadísticas: ' + err.message);
    }
  },

  limpiarFiltros() {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    document.getElementById('rep-desde').value = hace30Dias.toISOString().split('T')[0];
    document.getElementById('rep-hasta').value = hoy.toISOString().split('T')[0];
    document.getElementById('rep-area').value = '';
    document.getElementById('rep-tipo').value = '';

    this.cargarDatos();
  },

  calcularMétricas(docs) {
    const total = docs.length;
    const proceso = docs.filter(d => d.estado === 'EN PROCESO').length;
    const finalizado = docs.filter(d => d.estado === 'FINALIZADO' || d.estado === 'ATENDIDO').length;
    const registrados = docs.filter(d => d.estado === 'REGISTRADO').length;

    // Calcular eficiencia (Tasa de Cierre)
    const eficiencia = total > 0 ? Math.round((finalizado / total) * 100) : 0;

    // Mostrar en las tarjetas
    document.getElementById('rep-val-total').textContent = total;
    document.getElementById('rep-val-proceso').textContent = proceso;
    document.getElementById('rep-val-atendidos').textContent = finalizado;
    document.getElementById('rep-val-eficiencia').textContent = `${eficiencia}%`;

    // ── Renderizar Gráfico por Estado ──
    const contEstados = document.getElementById('grafico-estados');
    if (contEstados) {
      const pctReg = total > 0 ? Math.round((registrados / total) * 100) : 0;
      const pctProc = total > 0 ? Math.round((proceso / total) * 100) : 0;
      const pctFin = total > 0 ? Math.round((finalizado / total) * 100) : 0;

      contEstados.innerHTML = `
        ${this.crearFilaGrafico('Registrado', registrados, pctReg, 'fill-celeste')}
        ${this.crearFilaGrafico('En Proceso', proceso, pctProc, 'fill-naranja')}
        ${this.crearFilaGrafico('Finalizado', finalizado, pctFin, 'fill-verde')}
      `;
    }

    // ── Renderizar Gráfico por Tipo ──
    const contTipos = document.getElementById('grafico-tipos');
    if (contTipos) {
      const tipos = ['NOTA Nº', 'OFICIO Nº', 'CARTA Nº', 'MEMORANDUM Nº', 'SOLICITUD Nº', 'INFORME Nº'];
      contTipos.innerHTML = '';
      
      tipos.forEach(t => {
        const cant = docs.filter(d => d.tipo_documento === t).length;
        const pct = total > 0 ? Math.round((cant / total) * 100) : 0;
        contTipos.innerHTML += this.crearFilaGrafico(t, cant, pct, 'fill-purpura');
      });
    }

    // ── Renderizar Gráfico por Áreas ──
    const contAreas = document.getElementById('grafico-areas');
    if (contAreas) {
      contAreas.innerHTML = '';
      
      // Agrupar cantidades por área
      const conteoAreas = {};
      docs.forEach(d => {
        const a = d.area_destino || 'Mesa de Partes';
        conteoAreas[a] = (conteoAreas[a] || 0) + 1;
      });

      // Ordenar áreas de mayor a menor volumen
      const listaOrdenada = Object.entries(conteoAreas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8); // Mostrar top 8

      if (listaOrdenada.length === 0) {
        contAreas.style.display = 'block';
        contAreas.innerHTML = '<div style="text-align:center; color:#64748B; padding:20px;">No hay derivaciones en este rango.</div>';
      } else {
        contAreas.style.display = 'grid';
        listaOrdenada.forEach(([area, cant]) => {
          const pct = total > 0 ? Math.round((cant / total) * 100) : 0;
          contAreas.innerHTML += `
            <div>
              ${this.crearFilaGrafico(area, cant, pct, 'fill-celeste')}
            </div>
          `;
        });
      }
    }
  },

  crearFilaGrafico(etiqueta, valor, porcentaje, claseColor) {
    return `
      <div class="grafico-fila">
        <div class="grafico-fila-meta">
          <span>${etiqueta}</span>
          <span>${valor} (${porcentaje}%)</span>
        </div>
        <div class="grafico-barra-bg">
          <div class="grafico-barra-fill ${claseColor}" style="width: ${porcentaje}%;"></div>
        </div>
      </div>
    `;
  },

  exportarCSV() {
    if (this._documentos.length === 0) {
      Toast.error('No hay registros en el reporte actual para exportar');
      return;
    }

    // Cabecera CSV
    let contenido = 'NRO_DOCUMENTO;TIPO_DOCUMENTO;REMITENTE;DESTINATARIO;AREA_DESTINO;FECHA_REGISTRO;PRIORIDAD;ESTADO;TIPO_REGISTRO\n';

    // Filas
    this._documentos.forEach(doc => {
      contenido += `"${doc.numero_documento || ''}";"${doc.tipo_documento || ''}";"${doc.remitente || ''}";"${doc.destinatario || ''}";"${doc.area_destino || ''}";"${doc.fecha_documento || ''}";"${doc.prioridad || ''}";"${doc.estado || ''}";"${doc.tipo_registro || 'Emitido'}"\n`;
    });

    // Crear y disparar descarga
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Nombre del archivo con la fecha
    const fechaStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_SIS_tramites_${fechaStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Toast.exito('Resumen del reporte descargado con éxito');
  }
};
