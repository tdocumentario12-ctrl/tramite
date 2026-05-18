/* ============================================
   SISTEMA SIS — Router y Lógica Principal
   ============================================ */

const App = {
  _perfil: null,
  _seccionActual: 'dashboard',

  /**
   * Inicializar la aplicación
   */
  async inicializar() {
    // Inicializar utilidades
    Conexion.inicializar();
    Toast.inicializar();

    // Verificar autenticación
    const autenticado = await Auth.verificarAutenticacion();
    if (!autenticado) return;

    // Obtener perfil
    this._perfil = await Auth.obtenerPerfil();
    if (!this._perfil) {
      Toast.error('Error al cargar el perfil de usuario.');
      await Auth.cerrarSesion();
      return;
    }

    // Renderizar UI
    this._renderizarUsuarioInfo();
    this._filtrarMenuPorRol();
    this._vincularEventos();
    this._cargarSeccion('dashboard');

    // Escuchar cambios de autenticación
    Auth.enCambioAuth((evento, session) => {
      if (evento === 'SIGNED_OUT' || evento === 'TOKEN_REFRESHED' && !session) {
        window.location.href = 'index.html';
      }
    });
  },

  /**
   * Mostrar información del usuario en el header
   */
  _renderizarUsuarioInfo() {
    const infoEl = document.getElementById('usuario-info');
    const avatarEl = document.getElementById('usuario-avatar');
    const nombreEl = document.getElementById('usuario-nombre');

    if (this._perfil) {
      const iniciales = this._perfil.nombre_completo
        .split(' ')
        .map(n => n.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');

      avatarEl.textContent = iniciales;
      nombreEl.textContent = this._perfil.nombre_completo;
    }
  },

  /**
   * Ocultar módulos del sidebar según el rol del usuario.
   * Items con data-rol solo se muestran si el usuario tiene ese rol.
   */
  _filtrarMenuPorRol() {
    if (!this._perfil) return;

    document.querySelectorAll('.sidebar-item[data-rol]').forEach(item => {
      const rolRequerido = item.getAttribute('data-rol');
      if (this._perfil.rol !== rolRequerido) {
        item.style.display = 'none';
      }
    });
  },

  /**
   * Vincular eventos de navegación
   */
  _vincularEventos() {
    // Menú de navegación
    document.querySelectorAll('.sidebar-item[data-seccion]').forEach(item => {
      item.addEventListener('click', () => {
        const seccion = item.getAttribute('data-seccion');
        this._cargarSeccion(seccion);
      });
    });

    // Cerrar sesión (Modal Premium)
    const modalLogout = document.getElementById('modal-confirm-logout');
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    const btnLogoutCancelar = document.getElementById('btn-logout-cancelar');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');

    if (btnCerrarSesion && modalLogout) {
      btnCerrarSesion.addEventListener('click', () => {
        modalLogout.classList.add('visible');
      });

      const ocultarModal = () => modalLogout.classList.remove('visible');

      btnLogoutCancelar?.addEventListener('click', ocultarModal);
      modalLogout.addEventListener('click', (e) => {
        if (e.target === modalLogout) ocultarModal();
      });

      btnLogoutConfirmar?.addEventListener('click', async () => {
        btnLogoutConfirmar.disabled = true;
        btnLogoutConfirmar.textContent = 'Saliendo...';
        await Auth.cerrarSesion();
      });

      // Cerrar también con tecla Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalLogout.classList.contains('visible')) {
          ocultarModal();
        }
      });
    }

    // Botón menú móvil
    document.getElementById('btn-menu-movil').addEventListener('click', () => {
      this._toggleSidebar();
    });

    // Overlay sidebar
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
      this._toggleSidebar(false);
    });

    // Cerrar sidebar con Escape en móvil
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this._toggleSidebar(false);
      }
    });
  },

  /**
   * Cargar una sección
   */
  async _cargarSeccion(seccion) {
    this._seccionActual = seccion;

    // Actualizar menú activo
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('activo');
    });
    document.querySelector(`.sidebar-item[data-seccion="${seccion}"]`)?.classList.add('activo');

    // Actualizar título de la página
    const titulos = {
      'dashboard': 'Dashboard',
      'usuarios': 'Usuarios',
      'registrar-tramite': 'Registrar Trámite',
      'documentos': 'Gestión de Documentos',
      'areas': 'Gestión de Áreas',
      'reportes': 'Reportes y Estadísticas'
    };
    document.getElementById('titulo-pagina').textContent = titulos[seccion] || 'Dashboard';

    // Cerrar sidebar en móvil
    this._toggleSidebar(false);

    // Cargar contenido
    const contenedor = document.getElementById('contenido-area');
    contenedor.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;padding:60px;">
        <div class="spinner primario"></div>
      </div>
    `;

    try {
      switch (seccion) {
        case 'dashboard':
          await Dashboard.renderizar(contenedor, this._perfil);
          break;
        case 'usuarios':
          await Usuarios.renderizar(contenedor, this._perfil);
          break;
        case 'registrar-tramite':
          await Tramites.renderizar(contenedor, this._perfil);
          break;
        case 'documentos':
          await Documentos.renderizar(contenedor, this._perfil);
          break;
        case 'areas':
          await Areas.renderizar(contenedor, this._perfil);
          break;
        case 'reportes':
          await Reportes.renderizar(contenedor, this._perfil);
          break;
        default:
          await Dashboard.renderizar(contenedor, this._perfil);
      }
    } catch (err) {
      console.error('Error al cargar sección:', err);
      contenedor.innerHTML = `
        <div class="tabla-vacia">
          <p style="color:var(--color-error);">Error al cargar la sección. Intente nuevamente.</p>
        </div>
      `;
    }
  },

  /**
   * Toggle sidebar (para móvil)
   */
  _toggleSidebar(forzar) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (typeof forzar === 'boolean') {
      sidebar.classList.toggle('abierto', forzar);
      overlay.classList.toggle('visible', forzar);
    } else {
      sidebar.classList.toggle('abierto');
      overlay.classList.toggle('visible');
    }
  },

  /**
   * Navegación programática
   */
  navegar(seccion) {
    this._cargarSeccion(seccion);
  }
};

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  App.inicializar();
});
