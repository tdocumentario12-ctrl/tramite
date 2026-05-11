/* ============================================
   SISTEMA SIS — Dashboard
   ============================================ */

const Dashboard = {
  /**
   * Renderizar vista del dashboard
   */
  async renderizar(contenedor, perfil) {
    const ahora = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = ahora.toLocaleDateString('es-PE', opciones);

    // Determinar saludo según hora
    const hora = ahora.getHours();
    let saludo = 'Buenos días';
    if (hora >= 12 && hora < 18) saludo = 'Buenas tardes';
    if (hora >= 18) saludo = 'Buenas noches';

    const nombre = perfil ? perfil.nombre_completo : 'Usuario';
    const rol = perfil ? perfil.rol : 'operador';

    let htmlInfo = '';

    // Si es administrador, mostrar estadísticas
    if (rol === 'administrador') {
      let totalUsuarios = 0;
      let usuariosActivos = 0;

      try {
        const { count: total } = await clienteSupabase
          .from('perfiles')
          .select('*', { count: 'exact', head: true });
        totalUsuarios = total || 0;

        const { count: activos } = await clienteSupabase
          .from('perfiles')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true);
        usuariosActivos = activos || 0;
      } catch (err) {
        console.error('Error al obtener estadísticas:', err);
      }

      htmlInfo = `
        <div class="dashboard-info">
          <div class="info-card">
            <div class="info-card-icono primario">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="info-card-contenido">
              <h3>${totalUsuarios}</h3>
              <p>Usuarios registrados</p>
            </div>
          </div>
          <div class="info-card">
            <div class="info-card-icono exito">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="info-card-contenido">
              <h3>${usuariosActivos}</h3>
              <p>Usuarios activos</p>
            </div>
          </div>
          <div class="info-card">
            <div class="info-card-icono advertencia">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div class="info-card-contenido">
              <h3>v1.0</h3>
              <p>Versión del sistema</p>
            </div>
          </div>
        </div>
      `;
    }

    contenedor.innerHTML = `
      <div class="dashboard-container">
        <div class="bienvenida-card">
          <p class="bienvenida-saludo">${saludo},</p>
          <h1 class="bienvenida-nombre">${nombre}</h1>
          <span class="bienvenida-rol">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            ${rol}
          </span>
          <div class="bienvenida-fecha">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${fechaFormateada}
          </div>
        </div>
        ${htmlInfo}
      </div>
    `;
  }
};
