/* ============================================
   SISTEMA SIS — Configuración de Supabase
   ============================================ */

const SUPABASE_URL = 'https://cizujpnppgazwofczbcg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpenVqcG5wcGdhendvZmN6YmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTE2MzMsImV4cCI6MjA5MzY4NzYzM30.bxyC2nJ4WDnlrhiCY4gTI4qy26p8pECFQ3J_gTzvzbg';

// Inicializar cliente Supabase — usar nombre distinto para evitar colisión con window.supabase
var clienteSupabase;
try {
  clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('[SIS] Cliente Supabase inicializado correctamente');
} catch (err) {
  console.error('[SIS] Error al inicializar Supabase:', err);
  clienteSupabase = null;
}

/* ── Detector de conexión ── */
const Conexion = {
  _banner: null,
  _timeout: null,

  inicializar() {
    this._banner = document.createElement('div');
    this._banner.className = 'banner-conexion';
    this._banner.id = 'banner-conexion';
    document.body.prepend(this._banner);

    window.addEventListener('online', () => this._mostrarEstado(true));
    window.addEventListener('offline', () => this._mostrarEstado(false));

    if (!navigator.onLine) {
      this._mostrarEstado(false);
    }
  },

  _mostrarEstado(enLinea) {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    this._banner.classList.remove('online', 'offline');

    if (enLinea) {
      this._banner.textContent = '✓ Conexión restaurada';
      this._banner.classList.add('online', 'visible');
      this._timeout = setTimeout(() => {
        this._banner.classList.remove('visible');
      }, 3000);
    } else {
      this._banner.textContent = '⚠ Sin conexión a internet. Verificando...';
      this._banner.classList.add('offline', 'visible');
    }
  },

  estaEnLinea() {
    return navigator.onLine;
  }
};

/* ── Sistema de notificaciones Toast ── */
const Toast = {
  _contenedor: null,

  inicializar() {
    this._contenedor = document.createElement('div');
    this._contenedor.className = 'toast-contenedor';
    this._contenedor.id = 'toast-contenedor';
    document.body.appendChild(this._contenedor);
  },

  mostrar(mensaje, tipo = 'info') {
    if (!this._contenedor) this.inicializar();

    const iconos = {
      exito: '✓',
      error: '✕',
      advertencia: '⚠',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<span>${iconos[tipo] || 'ℹ'}</span><span>${mensaje}</span>`;
    this._contenedor.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 4000);
  },

  exito(mensaje) { this.mostrar(mensaje, 'exito'); },
  error(mensaje) { this.mostrar(mensaje, 'error'); },
  advertencia(mensaje) { this.mostrar(mensaje, 'advertencia'); },
  info(mensaje) { this.mostrar(mensaje, 'info'); }
};
