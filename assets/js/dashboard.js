/* ============================================
   SISTEMA SIS — Dashboard Minimalista
   ============================================ */

const Dashboard = {
  async renderizar(contenedor, perfil) {
    // 1. Mostrar Spinner limpio
    contenedor.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;padding:100px;">
        <div class="spinner primario"></div>
      </div>
    `;

    // 2. Variables Base
    const ahora = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = ahora.toLocaleDateString('es-PE', opciones);
    const hora = ahora.getHours();
    let saludo = 'Buenos días';
    if (hora >= 12 && hora < 18) saludo = 'Buenas tardes';
    if (hora >= 18) saludo = 'Buenas noches';

    const nombre = perfil ? perfil.nombre_completo.split(' ')[0] : 'Usuario';
    const rol = perfil ? perfil.rol : 'operador';

    // 3. Consultar Métricas Reales desde Supabase
    let stats = { hoy: 0, pendientes: 0, finalizados: 0 };
    let ultimosDocumentos = [];

    try {
      const hoyStr = ahora.toISOString().split('T')[0];

      // Documentos de Hoy
      const { count: countHoy } = await clienteSupabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_documento', hoyStr);
      stats.hoy = countHoy || 0;

      // Trámites Pendientes
      const { count: countPendientes } = await clienteSupabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['REGISTRADO', 'EN PROCESO']);
      stats.pendientes = countPendientes || 0;

      // Trámites Finalizados
      const { count: countFinalizados } = await clienteSupabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['ATENDIDO', 'FINALIZADO']);
      stats.finalizados = countFinalizados || 0;

      // Últimos 5 movimientos (Listado)
      const { data: ultimos } = await clienteSupabase
        .from('documentos')
        .select('id, numero_documento, remitente, estado, fecha_documento')
        .order('id', { ascending: false })
        .limit(5);
      
      ultimosDocumentos = ultimos || [];
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
    }

    // 4. Renderizar UI Limpia (Minimalista)
    
    // Mover saludo al header global
    const tituloHeader = document.getElementById('titulo-pagina');
    if (tituloHeader) {
      tituloHeader.innerHTML = `${saludo}, ${nombre}. <span style="font-size: 0.95rem; font-weight: 500; color: var(--color-texto-secundario); margin-left: 12px; border-left: 1px solid var(--color-borde); padding-left: 12px;">${fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)}</span>`;
    }

    // Header Minimalista solo con Acciones Rápidas
    const htmlHeader = `
      <div class="dash-header-minimalista" style="justify-content: flex-end; border-bottom: none; margin-bottom: 24px; padding-bottom: 0;">
        <div class="dash-acciones-sutiles">
          <button class="btn-sutil" onclick="App.navegar('registrar-tramite')" title="Nuevo Trámite">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Nuevo
          </button>
          <button class="btn-sutil" onclick="App.navegar('documentos')" title="Ver Documentos">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Documentos
          </button>
        </div>
      </div>
    `;

    // KPIs Limpios
    const htmlKPIs = `
      <div class="dash-kpi-grid">
        <div class="dash-kpi-card">
          <span class="kpi-titulo">Ingresados Hoy</span>
          <div class="kpi-valor">${stats.hoy}</div>
        </div>
        <div class="dash-kpi-card">
          <span class="kpi-titulo">Trámites Pendientes</span>
          <div class="kpi-valor text-advertencia">${stats.pendientes}</div>
        </div>
        <div class="dash-kpi-card">
          <span class="kpi-titulo">Trámites Finalizados</span>
          <div class="kpi-valor text-exito">${stats.finalizados}</div>
        </div>
      </div>
    `;

    // Lista de Actividad Simple
    let htmlLista = ultimosDocumentos.map(doc => {
      let colorPunto = 'var(--color-borde-hover)';
      if (doc.estado === 'EN PROCESO') colorPunto = 'var(--color-info)';
      if (doc.estado === 'ATENDIDO' || doc.estado === 'FINALIZADO') colorPunto = 'var(--color-exito)';
      if (doc.estado === 'OBSERVADO') colorPunto = 'var(--color-error)';

      return `
        <div class="lista-item-minimal">
          <div class="punto-estado" style="background-color: ${colorPunto};"></div>
          <div class="lista-info">
            <div class="lista-doc">${doc.numero_documento || 'S/N'}</div>
            <div class="lista-remitente">${doc.remitente || 'Sin remitente'}</div>
          </div>
          <div class="lista-meta">
            <span class="lista-estado">${doc.estado}</span>
            <span class="lista-fecha">${doc.fecha_documento || '-'}</span>
          </div>
        </div>
      `;
    }).join('');

    if (ultimosDocumentos.length === 0) {
      htmlLista = '<div style="padding:40px 0; color:var(--color-texto-secundario); font-size:0.9rem;">No hay actividad reciente para mostrar.</div>';
    }

    const htmlActividad = `
      <div class="dash-actividad-seccion">
        <h3 class="dash-subtitulo">Actividad Reciente</h3>
        <div class="dash-lista">
          ${htmlLista}
        </div>
      </div>
    `;

    // Ensamblar todo
    contenedor.innerHTML = `
      <div class="dashboard-minimalista fade-in">
        ${htmlHeader}
        ${htmlKPIs}
        ${htmlActividad}
      </div>
    `;
  }
};
