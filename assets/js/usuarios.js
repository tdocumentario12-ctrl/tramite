/* ============================================
   SISTEMA SIS — Gestión de Usuarios
   ============================================ */

const Usuarios = {
  _perfil: null,
  _contenedor: null,
  _editandoId: null,

  /**
   * Renderizar vista de usuarios
   */
  async renderizar(contenedor, perfil) {
    this._perfil = perfil;
    this._contenedor = contenedor;

    // Solo administradores pueden acceder
    if (!perfil || perfil.rol !== 'administrador') {
      contenedor.innerHTML = `
        <div class="acceso-denegado">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <h2>Acceso Restringido</h2>
          <p>No tiene permisos para acceder a esta sección. Contacte al administrador del sistema.</p>
        </div>
      `;
      return;
    }

    contenedor.innerHTML = `
      <div class="usuarios-container">
        <div class="usuarios-cabecera">
          <div class="cabecera-info">
            <h2>Gestión de Usuarios</h2>
            <p class="cabecera-subtitulo">Administre el personal y sus permisos de acceso al sistema.</p>
          </div>
          <button class="btn-nuevo-usuario md-elevation-1" id="btn-nuevo-usuario">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
            </svg>
            Crear Usuario
          </button>
        </div>

        <div class="tabla-contenedor md-elevation-1">
          <div class="tabla-scroll">
            <table class="tabla-usuarios" id="tabla-usuarios">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Gmail</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="tabla-usuarios-body">
                <tr>
                  <td colspan="6">
                    <div style="text-align:center;padding:40px;">
                      <div class="spinner primario" style="margin:0 auto;"></div>
                      <p style="margin-top:12px;color:var(--color-texto-terciario);font-size:var(--fuente-sm);">Cargando usuarios...</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Nuevo/Editar Usuario (Google Material Design 3 Style) -->
      <div class="modal-overlay" id="modal-usuario">
        <div class="modal md-modal">
          <div class="modal-header-md">
            <div class="header-icon-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6"/>
              </svg>
            </div>
            <div class="header-text-md">
              <h3 id="modal-titulo">Nuevo Usuario</h3>
              <p id="modal-subtitulo">Ingrese los datos para registrar al personal.</p>
            </div>
            <button class="btn-icon-md modal-cerrar" id="btn-cerrar-modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <form id="form-usuario" class="modal-body-md" autocomplete="off">
            <input type="hidden" id="campo-id">
            
            <div class="md-grid">
              <!-- Nombre Completo -->
              <div class="md-field full">
                <input type="text" id="campo-nombre" class="md-input" placeholder=" " required minlength="3">
                <label for="campo-nombre" class="md-label">Nombre Completo</label>
                <div class="md-line"></div>
                <span class="md-helper">Ej. Juvissa Villa More</span>
              </div>

              <!-- Nombre de Usuario -->
              <div class="md-field">
                <input type="text" id="campo-usuario" class="md-input" placeholder=" " required minlength="3">
                <label for="campo-usuario" class="md-label">Nombre de Usuario</label>
                <div class="md-line"></div>
                <span class="md-helper">Para inicio de sesión</span>
              </div>

              <!-- Gmail -->
              <div class="md-field">
                <input type="email" id="campo-gmail" class="md-input" placeholder=" " required>
                <label for="campo-gmail" class="md-label">Correo Gmail</label>
                <div class="md-line"></div>
                <span class="md-helper">ejemplo@gmail.com</span>
              </div>

              <!-- Contraseña -->
              <div class="md-field" id="grupo-password">
                <input type="password" id="campo-password" class="md-input" placeholder=" " minlength="6" autocomplete="new-password">
                <label for="campo-password" class="md-label">Contraseña</label>
                <div class="md-line"></div>
                <span class="md-helper">Mínimo 6 caracteres</span>
              </div>

              <!-- Rol -->
              <div class="md-field">
                <select id="campo-rol" class="md-input" required>
                  <option value="operador">Operador</option>
                  <option value="administrador">Administrador</option>
                </select>
                <label for="campo-rol" class="md-label">Rol del Usuario</label>
                <div class="md-line"></div>
              </div>

              <!-- Cargo -->
              <div class="md-field">
                <input type="text" id="campo-cargo" class="md-input" placeholder=" ">
                <label for="campo-cargo" class="md-label">Cargo</label>
                <div class="md-line"></div>
                <span class="md-helper">Ej. Jefe de Unidad SIS</span>
              </div>

              <!-- Firma Digital -->
              <div class="md-field full">
                <label style="font-size: 0.75rem; font-weight: 600; color: var(--color-primario); display: block; margin-bottom: 8px;">Firma Digital (PNG, JPG)</label>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <input type="file" id="campo-firma" accept="image/png, image/jpeg" style="font-size: 0.85rem;">
                  <img id="firma-preview" src="" alt="" style="max-height: 40px; display: none; border: 1px solid #E2E8F0; border-radius: 6px; padding: 2px;">
                </div>
                <span class="md-helper">Se recomienda fondo transparente (PNG)</span>
              </div>
            </div>
          </form>

          <div class="modal-footer-md">
            <button type="button" class="btn-text-md" id="btn-cancelar-modal">Cancelar</button>
            <button type="button" class="btn-filled-md" id="btn-guardar-usuario">
              <span id="btn-guardar-texto">Guardar Usuario</span>
              <div class="spinner" id="btn-guardar-spinner" style="display:none; width:16px; height:16px;"></div>
            </button>
          </div>
        </div>
      </div>
    `;

    this._vincularEventos();
    await this._cargarUsuarios();
  },

  /**
   * Convertir un archivo a Base64
   */
  _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Vincular eventos del DOM
   */
  _vincularEventos() {
    // Abrir modal nuevo usuario
    document.getElementById('btn-nuevo-usuario')?.addEventListener('click', () => {
      this._editandoId = null;
      this._limpiarModal();
      document.getElementById('modal-titulo').textContent = 'Nuevo Usuario';
      document.getElementById('modal-subtitulo').textContent = 'Ingrese los datos para registrar al personal.';
      document.getElementById('grupo-password').style.display = 'block';
      document.getElementById('btn-guardar-texto').textContent = 'Guardar Usuario';
      document.getElementById('modal-usuario').classList.add('visible');
      document.body.classList.add('modal-abierto');
    });

    // Cerrar modal
    const cerrar = () => {
      document.getElementById('modal-usuario').classList.remove('visible');
      document.body.classList.remove('modal-abierto');
    };
    document.getElementById('btn-cerrar-modal')?.addEventListener('click', cerrar);
    document.getElementById('btn-cancelar-modal')?.addEventListener('click', cerrar);

    // Guardar usuario
    document.getElementById('btn-guardar-usuario')?.addEventListener('click', () => this._guardarUsuario());

    // Cerrar modal al hacer click en overlay
    document.getElementById('modal-usuario')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) cerrar();
    });

    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrar();
    });
  },

  /**
   * Cargar lista de usuarios desde Supabase
   */
  async _cargarUsuarios() {
    const tbody = document.getElementById('tabla-usuarios-body');
    if (!tbody) return;

    try {
      const { data: usuarios, error } = await clienteSupabase
        .from('perfiles')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) throw error;

      if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6">
              <div class="tabla-vacia">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p>No hay usuarios registrados en el sistema.</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = usuarios.map(u => `
        <tr>
          <td>
            <div style="font-weight: 600; color: var(--color-texto);">${u.nombre_completo}</div>
            <div style="font-size: 11px; color: var(--color-texto-terciario);">${u.id}</div>
          </td>
          <td>${u.gmail}</td>
          <td><code style="background: var(--color-fondo); padding: 2px 6px; border-radius: 4px;">@${u.nombre_usuario}</code></td>
          <td><span class="badge-rol ${u.rol}">${u.rol}</span></td>
          <td>
            <span class="badge-estado ${u.activo ? 'activo' : 'inactivo'}">
              <span class="badge-estado-dot"></span>
              ${u.activo ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td>
            <div class="tabla-acciones">
              <button class="btn-accion" title="Editar" onclick="Usuarios._editarUsuario('${u.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-accion ${u.activo ? 'peligro' : ''}" title="${u.activo ? 'Desactivar' : 'Activar'}" onclick="Usuarios._cambiarEstado('${u.id}', ${u.activo})">
                ${u.activo 
                  ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
                  : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
                }
              </button>
            </div>
          </td>
        </tr>
      `).join('');

    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      Toast.error('No se pudo cargar la lista de usuarios.');
    }
  },

  /**
   * Limpiar campos del modal
   */
  _limpiarModal() {
    document.getElementById('campo-id').value = '';
    document.getElementById('campo-nombre').value = '';
    document.getElementById('campo-gmail').value = '';
    document.getElementById('campo-usuario').value = '';
    document.getElementById('campo-password').value = '';
    document.getElementById('campo-rol').value = 'operador';
    document.getElementById('campo-cargo').value = '';
    document.getElementById('campo-firma').value = '';
    const preview = document.getElementById('firma-preview');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
  },

  /**
   * Guardar usuario (Crear o Actualizar)
   * Crear: usa función de BD (sin Auth/emails/rate limits)
   * Actualizar: modifica directamente la tabla perfiles
   */
  _guardando: false,

  async _guardarUsuario() {
    // Protección contra clics múltiples
    if (this._guardando) {
      Toast.advertencia('Solicitud en proceso, por favor espere...');
      return;
    }

    const id = document.getElementById('campo-id').value;
    const nombre = document.getElementById('campo-nombre').value.trim();
    const gmail = document.getElementById('campo-gmail').value.trim();
    const usuario = document.getElementById('campo-usuario').value.trim();
    const password = document.getElementById('campo-password').value.trim();
    const rol = document.getElementById('campo-rol').value;
    const cargo = document.getElementById('campo-cargo').value.trim();
    const firmaInput = document.getElementById('campo-firma');

    // ── Validaciones en el cliente ──
    if (!nombre || !gmail || !usuario || (!id && !password)) {
      Toast.advertencia('Complete todos los campos obligatorios.');
      return;
    }

    if (nombre.length < 3) {
      Toast.advertencia('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (usuario.length < 3 || !/^[a-zA-Z0-9._]+$/.test(usuario)) {
      Toast.advertencia('El usuario solo puede contener letras, números, puntos o guiones bajos (mín. 3).');
      return;
    }

    if (!id && password.length < 6) {
      Toast.advertencia('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(gmail)) {
      Toast.advertencia('Ingrese un correo Gmail válido (ejemplo@gmail.com).');
      return;
    }

    const btn = document.getElementById('btn-guardar-usuario');
    const texto = document.getElementById('btn-guardar-texto');
    const spinner = document.getElementById('btn-guardar-spinner');

    this._guardando = true;
    btn.disabled = true;
    texto.style.display = 'none';
    spinner.style.display = 'block';

    try {
      if (id) {
        // ── ACTUALIZAR perfil existente ──
        const updateData = {
          nombre_completo: nombre,
          gmail: gmail,
          nombre_usuario: usuario,
          rol: rol,
          cargo: cargo || null
        };

        // Convertir firma a Base64 si se seleccionó una nueva
        if (firmaInput && firmaInput.files.length > 0) {
          try {
            updateData.firma_url = await this._fileToBase64(firmaInput.files[0]);
          } catch (upErr) { 
            console.error(upErr); 
            Toast.error('Error al procesar la imagen de la firma'); 
            btn.disabled = false; spinner.style.display = 'none'; texto.style.display = 'block';
            this._guardando = false;
            return; 
          }
        }

        const { error } = await clienteSupabase.from('perfiles').update(updateData).eq('id', id);
        if (error) throw error;
        Toast.exito('Usuario actualizado correctamente.');
      } else {
        // ── CREAR usuario via función de BD (sin Auth API) ──
        const { data, error } = await clienteSupabase.rpc('crear_usuario_sistema', {
          p_email: gmail,
          p_password: password,
          p_nombre_completo: nombre,
          p_nombre_usuario: usuario,
          p_rol: rol
        });

        if (error) throw error;

        // La función retorna { success, error?, message?, user_id? }
        if (!data.success) {
          Toast.error(data.error || 'Error al crear el usuario.');
          return;
        }

        const nuevoId = data.user_id;

        // ── ACTUALIZAR el perfil recién creado con cargo y firma ──
        const extraData = { cargo: cargo || null };
        if (firmaInput && firmaInput.files.length > 0) {
          try {
            extraData.firma_url = await this._fileToBase64(firmaInput.files[0]);
          } catch (upErr) { 
            console.error('Error al procesar firma:', upErr); 
          }
        }

        if (extraData.cargo || extraData.firma_url) {
          await clienteSupabase.from('perfiles').update(extraData).eq('id', nuevoId);
        }

        Toast.exito('Usuario creado y configurado correctamente.');
      }

      document.getElementById('modal-usuario').classList.remove('visible');
      document.body.classList.remove('modal-abierto');
      await this._cargarUsuarios();

    } catch (err) {
      console.error('Error al guardar:', err);
      Toast.error(err.message || 'Error al procesar la solicitud.');
    } finally {
      this._guardando = false;
      btn.disabled = false;
      texto.style.display = 'block';
      spinner.style.display = 'none';
    }
  },

  /**
   * Preparar edición de usuario
   */
  async _editarUsuario(id) {
    this._editandoId = id;
    this._limpiarModal();

    try {
      const { data: u, error } = await clienteSupabase
        .from('perfiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      document.getElementById('campo-id').value = u.id;
      document.getElementById('campo-nombre').value = u.nombre_completo;
      document.getElementById('campo-gmail').value = u.gmail;
      document.getElementById('campo-usuario').value = u.nombre_usuario;
      document.getElementById('campo-rol').value = u.rol;
      document.getElementById('campo-cargo').value = u.cargo || '';

      // Mostrar preview de firma existente
      const preview = document.getElementById('firma-preview');
      if (u.firma_url) {
        preview.src = u.firma_url;
        preview.style.display = 'block';
      } else {
        preview.src = '';
        preview.style.display = 'none';
      }
      
      document.getElementById('modal-titulo').textContent = 'Editar Usuario';
      document.getElementById('modal-subtitulo').textContent = 'Modifique los datos del perfil seleccionado.';
      document.getElementById('grupo-password').style.display = 'none'; // No se edita pass aquí
      document.getElementById('btn-guardar-texto').textContent = 'Actualizar Datos';
      document.getElementById('modal-usuario').classList.add('visible');
      document.body.classList.add('modal-abierto');

    } catch (err) {
      console.error('Error al cargar datos:', err);
      Toast.error('No se pudieron obtener los datos del usuario.');
    }
  },

  /**
   * Cambiar estado activo/inactivo
   */
  async _cambiarEstado(id, estadoActual) {
    const accion = estadoActual ? 'desactivar' : 'activar';
    
    // Confirmación simple (Podría ser un modal custom en el futuro)
    if (!confirm(`¿Está seguro que desea ${accion} este usuario?`)) return;

    try {
      const { error } = await clienteSupabase
        .from('perfiles')
        .update({ activo: !estadoActual })
        .eq('id', id);

      if (error) throw error;

      Toast.exito(`Usuario ${estadoActual ? 'desactivado' : 'activado'} correctamente.`);
      await this._cargarUsuarios();

    } catch (err) {
      console.error('Error al cambiar estado:', err);
      Toast.error('Error al procesar el cambio de estado.');
    }
  }
};
