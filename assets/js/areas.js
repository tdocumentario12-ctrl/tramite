/* ============================================
   SISTEMA SIS — Gestión de Áreas (Código Premium)
   ============================================ */

const Areas = {
  _areas: [],
  _paginaActual: 1,
  _porPagina: 10,
  _totalRegistros: 0,
  _totalPaginas: 1,
  _editandoId: null,
  _eliminandoId: null,
  _perfil: null,

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;
    this._paginaActual = 1;
    this._editandoId = null;
    this._eliminandoId = null;

        // Mover título y subtítulo al header global
    const tituloHeader = document.getElementById('titulo-pagina');
    if (tituloHeader) {
      tituloHeader.innerHTML = `GESTIÓN DE ÁREAS HOSPITALARIAS <span style="font-size: 0.95rem; font-weight: 500; color: var(--color-texto-secundario); margin-left: 12px; border-left: 1px solid var(--color-borde); padding-left: 12px;">Configura los cargos oficiales del Hospital San José de Chincha.</span>`;
    }

    contenedor.innerHTML = `
      <div class="areas-container">
        <!-- Cabecera de Sección -->
        <div class="areas-cabecera">
          <div class="cabecera-info-areas">
            
          </div>
          <button class="btn-nueva-area" id="btn-abrir-nueva-area">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Área
          </button>
        </div>

        <!-- Panel de Filtro y Búsqueda -->
        <div class="areas-filtros">
          <div class="areas-filtros-grid">
            <div class="campo-grupo">
              <label class="campo-label">Buscar por Nombre o Responsable</label>
              <div style="display:flex; gap:12px;">
                <input type="text" id="areas-busqueda" class="campo-input" placeholder="Ej. Pediatría, Vargas..." style="max-width: 400px; margin: 0;">
                <button class="btn-primario" onclick="Areas.buscar()" style="margin:0; padding: 10px 24px; font-weight:600;">Buscar</button>
                <button class="btn-secundario" onclick="Areas.limpiarBuscador()" style="margin:0; padding: 10px 24px; font-weight:600;">Limpiar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla CRUD -->
        <div class="areas-tabla-contenedor">
          <table class="areas-tabla">
            <thead>
              <tr>
                <th>NOMBRE DEL ÁREA / DEPARTAMENTO</th>
                <th>JEFE DE ÁREA / RESPONSABLE</th>
                <th>CARGO OFICIAL</th>
                <th style="width: 140px;">ACCIONES</th>
              </tr>
            </thead>
            <tbody id="areas-tabla-body">
              <tr>
                <td colspan="4" style="text-align:center; padding:40px;">
                  <div class="spinner primario" style="margin: 0 auto;"></div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Paginación -->
          <div class="areas-paginacion">
            <span id="areas-paginacion-info" style="font-size:0.85rem; color:#64748B; font-weight:500;">Mostrando 0 de 0 áreas</span>
            <div style="display:flex; gap:8px;" id="areas-paginacion-botones">
              <!-- Botones dinámicos -->
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Agregar / Editar Área -->
      <div class="modal-overlay-areas" id="modal-area">
        <div class="modal-card-areas">
          <div class="modal-header-areas">
            <h3 class="modal-titulo-areas" id="modal-area-titulo">
              <span style="font-size: 1.4rem;">🏢</span> <span id="modal-area-titulo-texto" style="font-size: 1.15rem; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing:0.5px;">Nueva Área</span>
            </h3>
            <button class="modal-cerrar-areas" onclick="Areas.cerrarModal()">&times;</button>
          </div>
          <div class="modal-body-areas">
            <form id="form-area" onsubmit="event.preventDefault();">
              <div class="campo-grupo" style="margin-bottom:20px;">
                <label class="campo-label" for="area-nombre" style="font-weight:600; margin-bottom: 6px;">Nombre de Área / Departamento</label>
                <input type="text" id="area-nombre" class="campo-input" required placeholder="Ej. Pediatría" style="margin: 0;">
              </div>
              <div class="campo-grupo" style="margin-bottom:20px;">
                <label class="campo-label" for="area-responsable" style="font-weight:600; margin-bottom: 6px;">Nombre Completo del Responsable (Jefe)</label>
                <input type="text" id="area-responsable" class="campo-input" required placeholder="Ej. M.C. VICTOR VARGAS URIBE" style="margin: 0;">
              </div>
              <div class="campo-grupo" style="margin-bottom:10px;">
                <label class="campo-label" for="area-cargo" style="font-weight:600; margin-bottom: 6px;">Cargo Oficial</label>
                <input type="text" id="area-cargo" class="campo-input" required placeholder="Ej. Jefe del Departamento de Pediatría" style="margin: 0;">
              </div>
            </form>
          </div>
          <div class="modal-footer-areas">
            <button class="btn-secundario" onclick="Areas.cerrarModal()" style="margin:0; padding:10px 20px;">Cancelar</button>
            <button class="btn-primario" id="btn-guardar-area" onclick="Areas.guardar()" style="margin:0; padding:10px 24px; display:flex; align-items:center; gap:8px; font-weight:600;">
              <span id="btn-guardar-texto-area">Guardar Área</span>
              <div class="spinner" id="btn-guardar-spinner-area" style="display:none; width:16px; height:16px; border-color:white; border-top-color:transparent; margin:0;"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación de Eliminación -->
      <div class="modal-overlay-areas" id="modal-eliminar-area">
        <div class="modal-card-areas" style="max-width:400px; text-align:center; padding:30px 20px; border-radius: 20px;">
          <div style="font-size:3rem; margin-bottom:15px; color:#EF4444;">⚠️</div>
          <h3 style="margin: 0 0 10px 0; font-size: 1.15rem; color: #0F172A; font-weight: 800; text-transform: uppercase;">¿Eliminar Área?</h3>
          <p style="margin: 0 0 25px 0; font-size: 0.85rem; color: #64748B; line-height: 1.5;" id="texto-confirmar-eliminar">Esta acción eliminará de forma permanente el área. ¿Desea continuar?</p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn-secundario" onclick="Areas.cerrarModalEliminar()" style="margin:0; padding: 10px 24px; font-size: 0.85rem; font-weight:600;">Cancelar</button>
            <button class="btn-primario" id="btn-eliminar-confirmar-area" onclick="Areas.confirmarEliminar()" style="margin:0; padding: 10px 24px; font-size: 0.85rem; font-weight:600; background:#EF4444; border-color:#EF4444; color:white;">Eliminar</button>
          </div>
        </div>
      </div>
    `;

    this._vincularEventos();
    await this.cargarAreas(1);
  },

  _vincularEventos() {
    document.getElementById('btn-abrir-nueva-area')?.addEventListener('click', () => {
      this._editandoId = null;
      this._limpiarModal();
      document.getElementById('modal-area-titulo-texto').textContent = 'Nueva Área';
      document.getElementById('btn-guardar-texto-area').textContent = 'Guardar Área';
      document.getElementById('modal-area').classList.add('visible');
    });

    document.getElementById('areas-busqueda')?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.buscar();
      }
    });
  },

  _limpiarModal() {
    document.getElementById('area-nombre').value = '';
    document.getElementById('area-responsable').value = '';
    document.getElementById('area-cargo').value = '';
    this._editandoId = null;
  },

  cerrarModal() {
    document.getElementById('modal-area').classList.remove('visible');
    this._limpiarModal();
  },

  cerrarModalEliminar() {
    document.getElementById('modal-eliminar-area').classList.remove('visible');
    this._eliminandoId = null;
  },

  buscar() {
    this.cargarAreas(1);
  },

  limpiarBuscador() {
    document.getElementById('areas-busqueda').value = '';
    this.cargarAreas(1);
  },

  async cargarAreas(pagina) {
    this._paginaActual = pagina;
    const body = document.getElementById('areas-tabla-body');
    if (!body) return;

    body.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:40px;"><div class="spinner primario" style="margin:0 auto;"></div></td></tr>';

    try {
      let query = clienteSupabase.from('areas').select('*', { count: 'exact' });
      
      const busqueda = document.getElementById('areas-busqueda').value.trim();
      if (busqueda) {
        query = query.or(`nombre.ilike.%${busqueda}%,responsable.ilike.%${busqueda}%,cargo.ilike.%${busqueda}%`);
      }

      const offset = (pagina - 1) * this._porPagina;
      const { data, count, error } = await query.order('nombre', { ascending: true }).range(offset, offset + this._porPagina - 1);

      if (error) throw error;

      this._areas = data;
      this._totalRegistros = count;
      this._totalPaginas = Math.ceil(count / this._porPagina);

      body.innerHTML = data.length ? '' : '<tr><td colspan="4" style="text-align:center; padding:40px; color:#64748B;">No se encontraron áreas registradas</td></tr>';

      data.forEach(area => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="area-nombre-destacado">${area.nombre}</span></td>
          <td><span class="area-responsable-badge">${area.responsable}</span></td>
          <td><span class="area-cargo-badge">${area.cargo}</span></td>
          <td>
            <div class="acciones-flex" style="justify-content:center; gap:8px;">
              <button class="btn-accion-tabla" title="Editar Área" onclick="Areas.abrirEditar('${area.id}')">✏️</button>
              <button class="btn-accion-tabla" title="Eliminar Área" onclick="Areas.abrirEliminar('${area.id}', '${area.nombre.replace(/'/g, "\\'")}')">🗑️</button>
            </div>
          </td>
        `;
        body.appendChild(tr);
      });

      document.getElementById('areas-paginacion-info').textContent = `Mostrando ${data.length} de ${count} áreas`;
      this._renderizarPaginacion();

    } catch (err) {
      console.error(err);
      Toast.error('Error al cargar áreas: ' + err.message);
    }
  },

  _renderizarPaginacion() {
    const contenedor = document.getElementById('areas-paginacion-botones');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    // Botón anterior
    const btnAnt = document.createElement('button');
    btnAnt.className = 'btn-secundario';
    btnAnt.style.margin = '0';
    btnAnt.style.padding = '6px 12px';
    btnAnt.textContent = '◀';
    btnAnt.disabled = this._paginaActual === 1;
    btnAnt.onclick = () => this.cargarAreas(this._paginaActual - 1);
    contenedor.appendChild(btnAnt);

    // Indicador de página
    const sp = document.createElement('span');
    sp.style.alignSelf = 'center';
    sp.style.fontSize = '0.85rem';
    sp.style.fontWeight = '700';
    sp.style.color = '#0F172A';
    sp.style.margin = '0 6px';
    sp.textContent = `${this._paginaActual} / ${this._totalPaginas || 1}`;
    contenedor.appendChild(sp);

    // Botón siguiente
    const btnSig = document.createElement('button');
    btnSig.className = 'btn-secundario';
    btnSig.style.margin = '0';
    btnSig.style.padding = '6px 12px';
    btnSig.textContent = '▶';
    btnSig.disabled = this._paginaActual === this._totalPaginas || this._totalPaginas === 0;
    btnSig.onclick = () => this.cargarAreas(this._paginaActual + 1);
    contenedor.appendChild(btnSig);
  },

  async guardar() {
    const nombreInput = document.getElementById('area-nombre');
    const responsableInput = document.getElementById('area-responsable');
    const cargoInput = document.getElementById('area-cargo');

    const nombre = nombreInput.value.trim();
    const responsable = responsableInput.value.trim();
    const cargo = cargoInput.value.trim();

    if (!nombre || !responsable || !cargo) {
      Toast.error('Por favor, complete todos los campos requeridos');
      return;
    }

    const btn = document.getElementById('btn-guardar-area');
    const spinner = document.getElementById('btn-guardar-spinner-area');
    const txt = document.getElementById('btn-guardar-texto-area');

    try {
      btn.disabled = true;
      spinner.style.display = 'inline-block';
      txt.textContent = 'Guardando...';

      const payload = { nombre, responsable, cargo };

      if (this._editandoId) {
        // Modo Edición
        const { error } = await clienteSupabase
          .from('areas')
          .update(payload)
          .eq('id', this._editandoId);

        if (error) throw error;
        Toast.exito('Área actualizada correctamente');
      } else {
        // Modo Creación
        const { error } = await clienteSupabase
          .from('areas')
          .insert([payload]);

        if (error) throw error;
        Toast.exito('Nueva área registrada con éxito');
      }

      this.cerrarModal();
      await this.cargarAreas(this._paginaActual);

    } catch (err) {
      console.error(err);
      Toast.error('Error al guardar: ' + err.message);
    } finally {
      btn.disabled = false;
      spinner.style.display = 'none';
      txt.textContent = this._editandoId ? 'Guardar Cambios' : 'Guardar Área';
    }
  },

  abrirEditar(id) {
    const area = this._areas.find(a => a.id === id);
    if (!area) return;

    this._editandoId = id;
    document.getElementById('area-nombre').value = area.nombre;
    document.getElementById('area-responsable').value = area.responsable;
    document.getElementById('area-cargo').value = area.cargo;

    document.getElementById('modal-area-titulo-texto').textContent = 'Editar Área';
    document.getElementById('btn-guardar-texto-area').textContent = 'Guardar Cambios';
    document.getElementById('modal-area').classList.add('visible');
  },

  abrirEliminar(id, nombre) {
    this._eliminandoId = id;
    document.getElementById('texto-confirmar-eliminar').textContent = `¿Está seguro de que desea eliminar permanentemente el área "${nombre}"? Esta acción no se puede deshacer.`;
    document.getElementById('modal-eliminar-area').classList.add('visible');
  },

  async confirmarEliminar() {
    if (!this._eliminandoId) return;

    const btn = document.getElementById('btn-eliminar-confirmar-area');
    btn.disabled = true;

    try {
      const { error } = await clienteSupabase
        .from('areas')
        .delete()
        .eq('id', this._eliminandoId);

      if (error) throw error;

      Toast.exito('Área eliminada exitosamente');
      this.cerrarModalEliminar();
      await this.cargarAreas(1);

    } catch (err) {
      console.error(err);
      Toast.error('Error al eliminar área: ' + err.message);
    } finally {
      btn.disabled = false;
    }
  }
};
