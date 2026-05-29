const Dashboard = {
  _perfil: null,

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;

    contenedor.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;padding:100px;">
        <div class="spinner primario"></div>
      </div>
    `;

    const ahora = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = ahora.toLocaleDateString('es-PE', opciones);
    const hora = ahora.getHours();
    let saludo = 'Buenos dias';
    if (hora >= 12 && hora < 18) saludo = 'Buenas tardes';
    if (hora >= 18) saludo = 'Buenas noches';

    const nombre = (perfil && perfil.nombre_completo) ? perfil.nombre_completo.split(' ')[0] : 'Usuario';

    const tituloHeader = document.getElementById('titulo-pagina');
    if (tituloHeader) {
      tituloHeader.innerHTML = `${saludo}, ${nombre}. <span style="font-size:0.9rem;font-weight:500;color:#64748B;margin-left:12px;border-left:1px solid #E2E8F0;padding-left:12px;">${fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)}</span>`;
    }

    const html = `<div class="dash-container">
  <!-- SECCION 1: Tarjetas Estadisticas -->
  <div class="dash-kpi-grid">
    <div class="kpi-card" data-color="blue">
      <div class="kpi-icon-wrap blue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <div class="kpi-content">
        <span class="kpi-label">Total Documentos</span>
        <span class="kpi-number" id="kpi-total">0</span>
        <span class="kpi-growth" id="kpi-growth-total">
          <svg class="kpi-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          <span>0%</span>
        </span>
      </div>
      <div class="kpi-spark">
        <svg viewBox="0 0 100 30" class="sparkline-svg">
          <polyline points="0,28 10,22 20,25 30,15 40,18 50,10 60,14 70,6 80,8 90,3 100,5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <div class="kpi-card" data-color="amber">
      <div class="kpi-icon-wrap amber">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div class="kpi-content">
        <span class="kpi-label">Documentos Pendientes</span>
        <span class="kpi-number" id="kpi-pendientes">0</span>
        <span class="kpi-growth" id="kpi-growth-pendientes">
          <svg class="kpi-arrow down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          <span>0%</span>
        </span>
      </div>
      <div class="kpi-spark">
        <svg viewBox="0 0 100 30" class="sparkline-svg">
          <polyline points="0,5 10,12 20,8 30,18 40,14 50,22 60,18 70,25 80,20 90,26 100,24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <div class="kpi-card" data-color="green">
      <div class="kpi-icon-wrap green">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="kpi-content">
        <span class="kpi-label">Documentos Atendidos</span>
        <span class="kpi-number" id="kpi-atendidos">0</span>
        <span class="kpi-growth" id="kpi-growth-atendidos">
          <svg class="kpi-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          <span>0%</span>
        </span>
      </div>
      <div class="kpi-spark">
        <svg viewBox="0 0 100 30" class="sparkline-svg">
          <polyline points="0,25 10,20 20,22 30,12 40,15 50,5 60,8 70,2 80,6 90,1 100,2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <div class="kpi-card" data-color="purple">
      <div class="kpi-icon-wrap purple">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
        </svg>
      </div>
      <div class="kpi-content">
        <span class="kpi-label">Areas Registradas</span>
        <span class="kpi-number" id="kpi-areas">0</span>
        <span class="kpi-growth" id="kpi-growth-areas">
          <span style="color:#94A3B8;font-size:0.75rem;font-weight:400;">--</span>
        </span>
      </div>
      <div class="kpi-spark">
        <svg viewBox="0 0 100 30" class="sparkline-svg">
          <polyline points="0,15 20,12 40,18 60,10 80,14 100,8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  </div>

  <!-- SECCION 2: Graficos + Accesos Rapidos -->
  <div class="dash-middle-layout">
    <div class="dash-main-col">

      <div class="dash-charts-row">
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">Documentos por Area</h3>
            <span class="chart-badge">Este mes</span>
          </div>
          <div class="chart-bars-container" id="chart-barras">
            <div style="padding:30px 0;text-align:center;color:#94A3B8;">Cargando datos...</div>
          </div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">Estado de Documentos</h3>
          </div>
          <div class="donut-container">
            <div class="donut-ring" id="donut-ring">
              <div class="donut-center" id="donut-center">0</div>
            </div>
            <div class="donut-legend" id="donut-legend"></div>
          </div>
        </div>
      </div>

      <!-- SECCION 3: Actividad Reciente -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3 class="dash-card-title">Actividad Reciente</h3>
        </div>
        <div class="dash-table-scroll">
          <table class="dash-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Area Destino</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th style="text-align:center;">Accion</th>
              </tr>
            </thead>
            <tbody id="dash-tabla-body">
              <tr>
                <td colspan="5" style="padding:30px;text-align:center;color:#94A3B8;">Cargando actividad reciente...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="dash-card-footer">
          <button class="dash-ver-todos" id="dash-ver-todos">Ver todos los documentos</button>
        </div>
      </div>

    </div>

    <!-- SECCION 4: Accesos Rapidos -->
    <div class="dash-side-col">
      <h3 class="dash-side-title">Accesos Rapidos</h3>
      <div class="dash-accesos">

        <div class="acceso-card" data-seccion="registrar-tramite">
          <div class="acceso-icon azul">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="acceso-info">
            <span class="acceso-title">Nuevo Documento</span>
            <span class="acceso-desc">Emitir o derivar un tramite</span>
          </div>
        </div>

        <div class="acceso-card" data-seccion="areas">
          <div class="acceso-icon verde">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </div>
          <div class="acceso-info">
            <span class="acceso-title">Registrar Area</span>
            <span class="acceso-desc">Administrar cargos oficiales</span>
          </div>
        </div>

        <div class="acceso-card" data-seccion="reportes">
          <div class="acceso-icon purpura">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div class="acceso-info">
            <span class="acceso-title">Ver Reportes</span>
            <span class="acceso-desc">Estadisticas y metricas</span>
          </div>
        </div>

        <div class="acceso-card" data-seccion="documentos">
          <div class="acceso-icon naranja">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
          <div class="acceso-info">
            <span class="acceso-title">Consultar Expedientes</span>
            <span class="acceso-desc">Buscar documentos registrados</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>;

<!-- MODAL DETALLE DOCUMENTO (Dashboard) -->
<div class="modal-overlay" id="dash-modal-detalle">
  <div class="modal-card" style="max-width:900px;width:95%;border-radius:20px;background:white;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.2);">
    <div class="modal-header" style="padding:18px 28px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;border-radius:10px;background:#E3F2FD;display:flex;align-items:center;justify-content:center;color:#1976D2;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h2 style="margin:0;font-size:1.1rem;color:#0F172A;font-weight:700;">Detalle del Documento</h2>
      </div>
      <button class="dash-modal-cerrar" id="dash-modal-cerrar">&times;</button>
    </div>
    <div class="modal-body" id="dash-det-body" style="padding:24px 28px;background:#F8FAFC;max-height:60vh;overflow-y:auto;"></div>
    <div class="modal-footer" style="padding:16px 28px;background:white;border-top:1px solid #F1F5F9;display:flex;justify-content:flex-end;">
      <button class="dash-modal-btn-cerrar" id="dash-modal-cerrar-footer">Cerrar</button>
    </div>
  </div>
</div>
`;
    contenedor.innerHTML = html;

    this._vincularEventos();
    await this._cargarDatos();
  },

  async _cargarDatos() {
    try {
      const ahora = new Date();
      const anio = ahora.getFullYear();
      const mes = ahora.getMonth();

      const primeroEsteMes = new Date(anio, mes, 1).toISOString().split('T')[0];
      const primeroMesAnt = new Date(anio, mes - 1, 1).toISOString().split('T')[0];
      const ultimoMesAnt = new Date(anio, mes, 0).toISOString().split('T')[0];

      const [
        { count: totalEsteMes },
        { count: totalMesAnt },
        { count: pendEsteMes },
        { count: pendMesAnt },
        { count: ateEsteMes },
        { count: ateMesAnt },
        { count: areasCount },
        { data: docsPorArea },
        { data: docsPorEstado },
        { data: recientes }
      ] = await Promise.all([
        clienteSupabase.from('documentos').select('*', { count: 'exact', head: true }).gte('fecha_documento', primeroEsteMes),
        clienteSupabase.from('documentos').select('*', { count: 'exact', head: true }).gte('fecha_documento', primeroMesAnt).lte('fecha_documento', ultimoMesAnt),
        clienteSupabase.from('documentos').select('*', { count: 'exact', head: true }).in('estado', ['REGISTRADO', 'EN PROCESO']).gte('fecha_documento', primeroEsteMes),
        clienteSupabase.from('documentos').select('*', { count: 'exact', head: true }).in('estado', ['REGISTRADO', 'EN PROCESO']).gte('fecha_documento', primeroMesAnt).lte('fecha_documento', ultimoMesAnt),
        clienteSupabase.from('documentos').select('*', { count: 'exact', head: true }).in('estado', ['ATENDIDO', 'FINALIZADO']).gte('fecha_documento', primeroEsteMes),
        clienteSupabase.from('documentos').select('*', { count: 'exact', head: true }).in('estado', ['ATENDIDO', 'FINALIZADO']).gte('fecha_documento', primeroMesAnt).lte('fecha_documento', ultimoMesAnt),
        clienteSupabase.from('areas').select('*', { count: 'exact', head: true }),
        clienteSupabase.from('documentos').select('area_destino', { count: 'exact' }).not('area_destino', 'is', null),
        clienteSupabase.from('documentos').select('estado', { count: 'exact' }),
        clienteSupabase.from('documentos').select('id, numero_documento, area_destino, fecha_documento, estado').order('id', { ascending: false }).limit(5)
      ]);

      this._renderKPIs(totalEsteMes || 0, totalMesAnt || 0, pendEsteMes || 0, pendMesAnt || 0, ateEsteMes || 0, ateMesAnt || 0, areasCount || 0);
      this._renderBarChart(docsPorArea || []);
      this._renderDonutChart(docsPorEstado || []);
      this._renderActividad(recientes || []);

    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      Toast.error('Error al cargar datos del dashboard');
    }
  },

  _calcularCrecimiento(actual, anterior) {
    if (anterior === 0) return actual > 0 ? '+100%' : '0%';
    const diff = ((actual - anterior) / anterior) * 100;
    const signo = diff >= 0 ? '+' : '';
    return `${signo}${diff.toFixed(1)}%`;
  },

  _renderKPIs(total, totalAnt, pend, pendAnt, ate, ateAnt, areas) {
    const el = (id) => document.getElementById(id);
    const setVal = (id, val) => { const e = el(id); if (e) e.textContent = val; };

    setVal('kpi-total', total);
    setVal('kpi-pendientes', pend);
    setVal('kpi-atendidos', ate);
    setVal('kpi-areas', areas);

    const setGrowth = (id, actual, anterior) => {
      const g = el(id);
      if (!g) return;
      const calc = this._calcularCrecimiento(actual, anterior);
      g.innerHTML = `<svg class="kpi-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg><span>${calc}</span>`;
      g.className = `kpi-growth${calc.startsWith('+') ? '' : ' down'}`;
    };

    setGrowth('kpi-growth-total', total, totalAnt);
    setGrowth('kpi-growth-pendientes', pend, pendAnt);
    setGrowth('kpi-growth-atendidos', ate, ateAnt);
  },

  _renderBarChart(docs) {
    const contenedor = document.getElementById('chart-barras');
    if (!contenedor) return;

    if (!docs || docs.length === 0) {
      contenedor.innerHTML = '<div style="padding:30px 0;text-align:center;color:#94A3B8;">No hay datos de areas disponibles</div>';
      return;
    }

    const conteo = {};
    docs.forEach(d => {
      const area = d.area_destino || 'Sin area';
      conteo[area] = (conteo[area] || 0) + 1;
    });

    const entradas = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxValor = Math.max(...entradas.map(e => e[1]), 1);

    contenedor.innerHTML = entradas.map(([area, cantidad]) => {
      const altura = (cantidad / maxValor) * 100;
      return `
        <div class="bar-group">
          <div class="bar-track">
            <div class="bar-fill" style="height:${altura}%;">
              <span class="bar-tooltip">${cantidad}</span>
            </div>
          </div>
          <span class="bar-label" title="${area}">${area}</span>
        </div>
      `;
    }).join('');
  },

  _renderDonutChart(docs) {
    const ring = document.getElementById('donut-ring');
    const center = document.getElementById('donut-center');
    const legend = document.getElementById('donut-legend');
    if (!ring || !center || !legend) return;

    const docsArr = docs || [];
    const total = docsArr.length;

    const pendientes = docsArr.filter(d => d.estado === 'REGISTRADO' || d.estado === 'EN PROCESO').length;
    const proceso = docsArr.filter(d => d.estado === 'DERIVADO').length;
    const finalizados = docsArr.filter(d => d.estado === 'ATENDIDO' || d.estado === 'FINALIZADO').length;

    if (total === 0) {
      ring.style.background = '#F1F5F9';
      center.textContent = '0';
      legend.innerHTML = '<div class="legend-item"><span class="legend-dot" style="background:#E2E8F0;"></span> Sin datos</div>';
      return;
    }

    const pctPend = (pendientes / total) * 360;
    const pctProc = (proceso / total) * 360;
    const pctFin = (finalizados / total) * 360;

    const grados = [];
    let acum = 0;
    const segmentos = [
      { label: 'Pendientes', value: pendientes, pct: pctPend, color: '#1976D2' },
      { label: 'En Proceso', value: proceso, pct: pctProc, color: '#F59E0B' },
      { label: 'Finalizados', value: finalizados, pct: pctFin, color: '#16A34A' }
    ];

    segmentos.forEach(seg => {
      if (seg.pct > 0) {
        grados.push(`${seg.color} ${acum}deg ${acum + seg.pct}deg`);
        acum += seg.pct;
      }
    });

    ring.style.background = grados.length > 0 ? `conic-gradient(${grados.join(', ')})` : '#F1F5F9';
    center.textContent = total;

    legend.innerHTML = segmentos.filter(s => s.value > 0).map(s => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${s.color};"></span>
        <span>${s.label}</span>
        <span class="legend-count">${s.value}</span>
      </div>
    `).join('');
  },

  _renderActividad(documentos) {
    const body = document.getElementById('dash-tabla-body');
    if (!body) return;

    if (!documentos || documentos.length === 0) {
      body.innerHTML = '<tr><td colspan="5" style="padding:30px;text-align:center;color:#94A3B8;">No hay actividad reciente</td></tr>';
      return;
    }

    body.innerHTML = documentos.map(doc => {
      const badgeClass = this._badgeClass(doc.estado);
      const badgeLabel = this._badgeLabel(doc.estado);
      return `
        <tr>
          <td><span class="doc-numero">${doc.numero_documento || 'S/N'}</span></td>
          <td><span class="doc-area">${doc.area_destino || '—'}</span></td>
          <td><span class="doc-fecha">${doc.fecha_documento || '-'}</span></td>
          <td><span class="badge-estado-dash ${badgeClass}"><span class="dot"></span>${badgeLabel}</span></td>
          <td style="text-align:center;">
            <button class="dash-btn-detalle" data-id="${doc.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Ver detalle
            </button>
          </td>
        </tr>
      `;
    }).join('');

    body.querySelectorAll('.dash-btn-detalle').forEach(btn => {
      btn.addEventListener('click', () => this._verDetalle(btn.getAttribute('data-id')));
    });
  },

  _badgeClass(estado) {
    if (!estado) return 'badge-estado-dash--default';
    const e = estado.toUpperCase();
    if (e === 'REGISTRADO' || e === 'EN PROCESO') return 'badge-estado-dash--proceso';
    if (e === 'DERIVADO') return 'badge-estado-dash--pendiente';
    if (e === 'ATENDIDO' || e === 'FINALIZADO') return 'badge-estado-dash--atendido';
    return 'badge-estado-dash--default';
  },

  _badgeLabel(estado) {
    if (!estado) return '—';
    const e = estado.toUpperCase();
    if (e === 'REGISTRADO') return 'Pendiente';
    if (e === 'EN PROCESO') return 'En Proceso';
    if (e === 'DERIVADO') return 'Derivado';
    if (e === 'ATENDIDO') return 'Atendido';
    if (e === 'FINALIZADO') return 'Finalizado';
    if (e === 'OBSERVADO') return 'Observado';
    return estado;
  },

  async _verDetalle(id) {
    if (!id) return;

    try {
      const { data: doc, error } = await clienteSupabase
        .from('documentos')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !doc) {
        Toast.error('No se pudo cargar el detalle del documento');
        return;
      }

      const body = document.getElementById('dash-det-body');
      if (!body) return;

      body.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:20px;">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="background:white;padding:16px;border-radius:12px;border:1px solid #E2E8F0;">
              <h4 style="color:#1976D2;font-size:0.62rem;text-transform:uppercase;margin-bottom:10px;font-weight:800;border-bottom:1px solid #F1F5F9;padding-bottom:5px;">INFORMACION</h4>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div><span style="font-size:0.58rem;color:#94A3B8;display:block;">NUMERO</span><b style="font-size:0.95rem;">${doc.numero_documento}</b></div>
                <div style="display:flex;gap:10px;">
                  <div style="flex:1;"><span style="font-size:0.58rem;color:#94A3B8;display:block;">TIPO</span><span style="font-size:0.75rem;">${doc.tipo_documento || '—'}</span></div>
                  <div style="flex:1;"><span style="font-size:0.58rem;color:#94A3B8;display:block;">FECHA DOC.</span><span style="font-size:0.75rem;">${doc.fecha_documento || '—'}</span></div>
                </div>
                <div><span style="font-size:0.58rem;color:#94A3B8;display:block;">ESTADO</span><span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:9999px;font-size:0.7rem;font-weight:600;background:#E3F2FD;color:#1976D2;">${this._badgeLabel(doc.estado)}</span></div>
              </div>
            </div>
            <div style="background:white;padding:16px;border-radius:12px;border:1px solid #E2E8F0;">
              <h4 style="color:#1976D2;font-size:0.62rem;text-transform:uppercase;margin-bottom:10px;font-weight:800;border-bottom:1px solid #F1F5F9;padding-bottom:5px;">PARTICIPANTES</h4>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div><span style="font-size:0.58rem;color:#94A3B8;display:block;">REMITENTE</span><span style="font-size:0.8rem;font-weight:600;">${doc.remitente || '—'}</span></div>
                <div><span style="font-size:0.58rem;color:#94A3B8;display:block;">DESTINATARIO</span><span style="font-size:0.8rem;font-weight:600;">${doc.destinatario || '—'}</span></div>
                <div><span style="font-size:0.58rem;color:#94A3B8;display:block;">CARGO</span><span style="font-size:0.72rem;font-style:italic;color:#64748B;">${doc.cargo_destinatario || '—'}</span></div>
                <div style="padding-top:6px;border-top:1px dashed #F1F5F9;"><span style="font-size:0.58rem;color:#94A3B8;display:block;">AREA DESTINO</span><b style="color:#1976D2;font-size:0.82rem;">${doc.area_destino || 'MESA DE PARTES'}</b></div>
              </div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="background:white;padding:16px;border-radius:12px;border:1px solid #E2E8F0;flex-grow:1;">
              <h4 style="color:#1976D2;font-size:0.62rem;text-transform:uppercase;margin-bottom:10px;font-weight:800;border-bottom:1px solid #F1F5F9;padding-bottom:5px;">CONTENIDO</h4>
              <div style="margin-bottom:10px;"><span style="font-size:0.58rem;color:#94A3B8;display:block;">ASUNTO</span><b style="font-size:0.85rem;line-height:1.3;">${doc.asunto || '—'}</b></div>
              <div><span style="font-size:0.58rem;color:#94A3B8;display:block;">DESCRIPCION</span><p style="font-size:0.78rem;color:#475569;line-height:1.5;margin-top:5px;">${doc.descripcion || 'Sin descripcion.'}</p></div>
            </div>
            <div style="background:#F8FAFC;padding:12px 16px;border-radius:10px;display:flex;flex-direction:column;gap:6px;border:1px solid #E2E8F0;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                <div><small style="color:#64748B;font-size:0.52rem;font-weight:700;text-transform:uppercase;display:block;">USUARIO</small><span style="font-weight:700;font-size:0.78rem;color:#1976D2;">${doc.usuario_registro || 'Usuario'}</span></div>
                <div style="text-align:right;"><small style="color:#64748B;font-size:0.52rem;font-weight:700;text-transform:uppercase;display:block;">CREADO</small><span style="font-weight:500;font-size:0.75rem;">${doc.creado_en ? new Date(doc.creado_en).toLocaleDateString() : '—'}</span></div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('dash-modal-detalle').classList.add('visible');

    } catch (err) {
      console.error(err);
      Toast.error('Error al cargar detalle');
    }
  },

  _vincularEventos() {
    document.querySelectorAll('.acceso-card').forEach(card => {
      card.addEventListener('click', () => {
        const seccion = card.getAttribute('data-seccion');
        if (seccion && App && App.navegar) {
          App.navegar(seccion);
        }
      });
    });

    document.getElementById('dash-ver-todos')?.addEventListener('click', () => {
      if (App && App.navegar) App.navegar('documentos');
    });

    const cerrarModal = () => {
      document.getElementById('dash-modal-detalle')?.classList.remove('visible');
    };

    document.getElementById('dash-modal-cerrar')?.addEventListener('click', cerrarModal);
    document.getElementById('dash-modal-cerrar-footer')?.addEventListener('click', cerrarModal);
    document.getElementById('dash-modal-detalle')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) cerrarModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('dash-modal-detalle');
        if (modal && modal.classList.contains('visible')) {
          modal.classList.remove('visible');
        }
      }
    });
  }
};