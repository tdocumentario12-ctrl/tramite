const Usuarios = {
  _perfil: null,
  _contenedor: null,
  _editandoId: null,
  _onKeyDown: null,

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;
    this._contenedor = contenedor;

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

    const tituloHeader = document.getElementById('titulo-pagina');
    if (tituloHeader) {
      tituloHeader.innerHTML = `GESTION DE USUARIOS <span style="font-size: 0.95rem; font-weight: 500; color: var(--color-texto-secundario); margin-left: 12px; border-left: 1px solid var(--color-borde); padding-left: 12px;">Administre el personal y sus permisos de acceso al sistema.</span>`;
    }

    const html = await TemplateLoader.cargar('usuarios');
    contenedor.innerHTML = html;

    this._vincularEventos();
    await this._cargarUsuarios();
  },

  _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },

  _vincularEventos() {
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

    const cerrar = () => {
      document.getElementById('modal-usuario').classList.remove('visible');
      document.body.classList.remove('modal-abierto');
    };
    document.getElementById('btn-cerrar-modal')?.addEventListener('click', cerrar);
    document.getElementById('btn-cancelar-modal')?.addEventListener('click', cerrar);

    document.getElementById('btn-guardar-usuario')?.addEventListener('click', () => this._guardarUsuario());

    document.getElementById('modal-usuario')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) cerrar();
    });

    if (this._onKeyDown) document.removeEventListener('keydown', this._onKeyDown);
    this._onKeyDown = (e) => { if (e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', this._onKeyDown);
  },

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

  _limpiarModal() {
    const $ = id => document.getElementById(id);
    const ids = ['campo-id','campo-nombre','campo-gmail','campo-usuario','campo-password','campo-rol','campo-cargo','campo-firma','firma-preview'];
    const faltan = ids.filter(id => !$(id));
    if (faltan.length) {
      console.warn('[Usuarios] Campos del modal no encontrados en el DOM:', faltan);
    }
    if ($('campo-id')) $('campo-id').value = '';
    if ($('campo-nombre')) $('campo-nombre').value = '';
    if ($('campo-gmail')) $('campo-gmail').value = '';
    if ($('campo-usuario')) $('campo-usuario').value = '';
    if ($('campo-password')) $('campo-password').value = '';
    if ($('campo-rol')) $('campo-rol').value = 'operador';
    if ($('campo-cargo')) $('campo-cargo').value = '';
    if ($('campo-firma')) $('campo-firma').value = '';
    const preview = $('firma-preview');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
  },

  _guardando: false,

  async _guardarUsuario() {
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
        const updateData = {
          nombre_completo: nombre,
          gmail: gmail,
          nombre_usuario: usuario,
          rol: rol,
          cargo: cargo || null
        };

        if (firmaInput && firmaInput.files.length > 0) {
          try {
            const file = firmaInput.files[0];
            const fileExt = file.name.split('.').pop();
            const path = `firmas/firma_${id}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await clienteSupabase.storage.from('documentos').upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;

            const publicUrl = clienteSupabase.storage.from('documentos').getPublicUrl(path).data.publicUrl;
            updateData.firma_url = publicUrl;
          } catch (upErr) {
            console.error(upErr);
            Toast.error('Error al subir la imagen de la firma a Storage');
            btn.disabled = false; spinner.style.display = 'none'; texto.style.display = 'block';
            this._guardando = false;
            return;
          }
        }

        const { error } = await clienteSupabase.from('perfiles').update(updateData).eq('id', id);
        if (error) throw error;
        Toast.exito('Usuario actualizado correctamente.');
      } else {
        const rpcArgs = { p_email: gmail, p_password: password, p_nombre_completo: nombre, p_nombre_usuario: usuario, p_rol: rol };
        console.log('[Usuarios] Llamando RPC crear_usuario_sistema con:', rpcArgs);
        const { data, error } = await clienteSupabase.rpc('crear_usuario_sistema', rpcArgs);
        console.log('[Usuarios] RPC respuesta:', { data, error });

        if (error) throw error;

        if (!data.success) {
          Toast.error(data.error || 'Error al crear el usuario.');
          return;
        }

        const nuevoId = data.user_id;
        const extraData = { cargo: cargo || null };

        if (firmaInput && firmaInput.files.length > 0) {
          try {
            const file = firmaInput.files[0];
            const fileExt = file.name.split('.').pop();
            const path = `firmas/firma_${nuevoId}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await clienteSupabase.storage.from('documentos').upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;

            const publicUrl = clienteSupabase.storage.from('documentos').getPublicUrl(path).data.publicUrl;
            extraData.firma_url = publicUrl;
          } catch (upErr) {
            console.error('Error al subir firma a Storage:', upErr);
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
      document.getElementById('grupo-password').style.display = 'none';
      document.getElementById('btn-guardar-texto').textContent = 'Actualizar Datos';
      document.getElementById('modal-usuario').classList.add('visible');
      document.body.classList.add('modal-abierto');
    } catch (err) {
      console.error('Error al cargar datos:', err);
      Toast.error('No se pudieron obtener los datos del usuario.');
    }
  },

  async _cambiarEstado(id, estadoActual) {
    const accion = estadoActual ? 'desactivar' : 'activar';

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
