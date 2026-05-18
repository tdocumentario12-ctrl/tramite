/* ============================================
   SISTEMA SIS — Autenticación
   ============================================ */

const Auth = {
  /**
   * Iniciar sesión con nombre de usuario y contraseña.
   */
  async iniciarSesion(nombreUsuario, password, recordarme = false) {
    if (!navigator.onLine) {
      throw new Error('Sin conexión a internet. Verifique su conexión e intente nuevamente.');
    }

    if (!clienteSupabase) {
      throw new Error('Error de configuración del sistema. Recargue la página.');
    }

    let emailData = nombreUsuario;

    // Si el usuario ingresó un nombre de usuario (no contiene '@'), resolvemos su correo mediante Edge Function
    if (!nombreUsuario.includes('@')) {
      const functionUrl = 'https://cizujpnppgazwofczbcg.supabase.co/functions/v1/auth-username';
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ username: nombreUsuario })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[SIS] Error en Edge Function:', result);
        if (response.status === 429) {
          throw new Error('Demasiados intentos. Intente nuevamente en unos minutos.');
        }
        throw new Error(result.error || 'Usuario no encontrado.');
      }

      emailData = result.email;
    }

    // 2. Autenticar con Supabase Auth usando el email (el resto sigue igual)
    const { data, error } = await clienteSupabase.auth.signInWithPassword({
      email: emailData,
      password: password
    });

    if (error) {
      console.error('[SIS] Error de autenticación:', error);
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Usuario o contraseña incorrectos.');
      }
      throw new Error('Error del servidor. Intente nuevamente.');
    }

    // 3. Guardar preferencia de "Recordarme"
    if (recordarme) {
      localStorage.setItem('sis_recordar_usuario', nombreUsuario);
    } else {
      localStorage.removeItem('sis_recordar_usuario');
    }

    return data;
  },

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    try {
      if (clienteSupabase) {
        await clienteSupabase.auth.signOut();
      }
    } catch (err) {
      console.error('[SIS] Error al cerrar sesión:', err);
    }
    window.location.href = 'index.html';
  },

  /**
   * Obtener sesión actual
   */
  async obtenerSesion() {
    try {
      if (!clienteSupabase) return null;
      const { data: { session }, error } = await clienteSupabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (err) {
      console.error('[SIS] Error al obtener sesión:', err);
      return null;
    }
  },

  /**
   * Obtener perfil del usuario logueado
   */
  async obtenerPerfil() {
    try {
      const session = await this.obtenerSesion();
      if (!session) return null;

      const { data, error } = await clienteSupabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[SIS] Error al obtener perfil:', err);
      return null;
    }
  },

  /**
   * Verificar si hay sesión activa, si no redirigir al login
   */
  async verificarAutenticacion() {
    const session = await this.obtenerSesion();
    if (!session) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  /**
   * Obtener nombre de usuario guardado (Recordarme)
   */
  obtenerUsuarioRecordado() {
    return localStorage.getItem('sis_recordar_usuario') || '';
  },

  /**
   * Escuchar cambios de autenticación
   */
  enCambioAuth(callback) {
    if (clienteSupabase) {
      clienteSupabase.auth.onAuthStateChange((evento, session) => {
        callback(evento, session);
      });
    }
  }
};
