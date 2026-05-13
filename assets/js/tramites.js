/* ============================================
   SISTEMA SIS — Gestión de Trámites
   ============================================ */

const Tramites = {
  _perfil: null,
  _contenedor: null,
  _archivoAdjunto: null,
  _tabActual: 'emitir', // 'emitir' o 'derivar'
  _dataAreas: {
    "Administración General": { nombre: "DRA. ELENA ESTHER BORJAS MAURICIO", cargo: "Administradora del Hospital San José de Chincha" },
    "Cirugía": { nombre: "M.C. BRIAN DONAYRE PALOMINO", cargo: "Jefe del Departamento de Cirugía" },
    "Pediatría": { nombre: "M.C. VICTOR VARGAS URIBE", cargo: "Jefe del Departamento de Pediatría" },
    "Medicina Interna": { nombre: "M.C. FERNANDO CAGNA PUPPI", cargo: "Jefe del Departamento de Medicina" },
    "Ginecología y Obstetricia": { nombre: "M.C. KAROL RAMOS JEREZ", cargo: "Jefe del Departamento de Gineco-Obstetricia" },
    "Patología Clínica y Anatomía Patológica": { nombre: "M.C. JACQUELINE TELLO ALMEYDA", cargo: "Jefe del Departamento de Patología Clínica y Anatomía" },
    "Radiología e Imágenes": { nombre: "M.C. BETTY CABRERA BENAVIDES", cargo: "Jefe del Departamento de Radiodiagnóstico por Imágenes" },
    "Centro Quirúrgico y Anestesiología": { nombre: "M.C. LUCIO CERVANTES HUAMANI", cargo: "Jefe del Departamento de Anestesiología y Centro Quirúrgico" },
    "Emergencia y UCI": { nombre: "M.C. LUIS ANGEL CHIRINOS HOYOS", cargo: "Jefe del Departamento de Emergencia y Cuidados Críticos" },
    "Enfermería": { nombre: "LIC. INES QUISPE PADILLA", cargo: "Jefe del Departamento de Enfermería" },
    "Medicina Especializada": { nombre: "M.C. MARCO ANTONIO GUERRERO ANGULO", cargo: "Jefe del Servicio de Medicina Especializada - Departamento de Medicina" },
    "Neonatología": { nombre: "M.C. EUSEBIO VITALIO ALFARO", cargo: "Jefe del Servicio de Neonatología del Departamento de Pediatría" },
    "Cirugía Especializada": { nombre: "M.C. Jefe del Servicio de Cirugía Especializada", cargo: "Jefe del Servicio de Cirugía Especializada" },
    "Emergencia": { nombre: "M.C. CARLOS ÑAHUIS PALOMINO", cargo: "Jefe del Servicio de Emergencia" },
    "Farmacia": { nombre: "Q.F. KERIM SANCHEZ MENDOZA", cargo: "Jefe del Servicio de Farmacia" }
  },

  /**
   * Inicializar y renderizar vista principal de trámites
   */
  async renderizar(contenedor, perfil) {
    this._perfil = perfil;
    this._contenedor = contenedor;

    contenedor.innerHTML = `
      <div class="tramites-container">
        <!-- Navegación por pestañas -->
        <div class="tramites-tabs">
          <button class="tab-btn ${this._tabActual === 'emitir' ? 'activo' : ''}" id="tab-emitir">
            Emitir documento
          </button>
          <button class="tab-btn ${this._tabActual === 'derivar' ? 'activo' : ''}" id="tab-derivar">
            Derivación
          </button>
        </div>

        <div id="tramite-contenido-dinamico">
          <!-- El formulario se cargará aquí -->
        </div>
      </div>
    `;

    this._vincularEventosTabs();
    await this._cargarFormularioActual();
  },

  _vincularEventosTabs() {
    document.getElementById('tab-emitir').addEventListener('click', () => {
      if (this._tabActual === 'emitir') return;
      this._tabActual = 'emitir';
      this.renderizar(this._contenedor, this._perfil);
    });

    document.getElementById('tab-derivar').addEventListener('click', () => {
      if (this._tabActual === 'derivar') return;
      this._tabActual = 'derivar';
      this.renderizar(this._contenedor, this._perfil);
    });
  },

  async _cargarFormularioActual() {
    const zonaContenido = document.getElementById('tramite-contenido-dinamico');
    
    if (this._tabActual === 'emitir') {
      this._renderizarFormEmitir(zonaContenido);
      await this._generarCorrelativo();
    } else {
      this._renderizarFormDerivar(zonaContenido);
      await this._verificarDerivacionPendiente();
    }
  },

  /**
   * Generar correlativo independiente por tipo de documento
   */
  async _generarCorrelativo() {
    const inputNumero = document.getElementById('t-numero');
    const selectTipo = document.getElementById('t-tipo');
    if (!inputNumero || !selectTipo) return;

    const tipoSeleccionado = selectTipo.value;
    const añoActual = 2026;

    try {
      // Buscar el último registro de ESE tipo específico
      const { data, error } = await clienteSupabase
        .from('tramites')
        .select('numero_documento')
        .eq('tipo_documento', tipoSeleccionado)
        .ilike('numero_documento', `%-2026-US-HSJCH`)
        .order('creado_en', { ascending: false })
        .limit(1);

      if (error) throw error;

      let proximoNumero = 1; // Por defecto empezamos en 1 para tipos nuevos

      // Si es NOTA Nº, el usuario pidió empezar en 454
      if (tipoSeleccionado === 'NOTA Nº') proximoNumero = 454;

      if (data && data.length > 0) {
        const match = data[0].numero_documento.match(/(\d+)-/);
        if (match) proximoNumero = parseInt(match[1]) + 1;
      }

      inputNumero.value = `${proximoNumero}-${añoActual}-US-HSJCH`;
    } catch (err) {
      console.error('Error al generar correlativo por tipo:', err);
    }
  },

  /**
   * Formulario 1: Emitir / Registrar Documento
   */
  _renderizarFormEmitir(zona) {
    zona.innerHTML = `
      <div class="tramite-card">
        <form id="form-registro-tramite" autocomplete="off">
          <section class="form-seccion">
            <div class="seccion-titulo"><span class="seccion-numero">1</span><h3>Datos Generales</h3></div>
            <div class="grid-4">
              <div class="campo-grupo">
                <label class="campo-label">Número de documento</label>
                <input type="text" id="t-numero" class="campo-input" placeholder="Ej. 454-2026-US-HSJCH" required>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Tipo de documento</label>
                <select id="t-tipo" class="campo-input" required>
                  <option value="NOTA Nº" selected>Nota Nº</option>
                  <option value="OFICIO Nº">Oficio Nº</option>
                  <option value="CARTA Nº">Carta Nº</option>
                  <option value="MEMORANDUM Nº">Memorándum Nº</option>
                  <option value="SOLICITUD Nº">Solicitud Nº</option>
                  <option value="INFORME Nº">Informe Nº</option>
                </select>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Fecha</label>
                <input type="date" id="t-fecha" class="campo-input" required>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Prioridad</label>
                <select id="t-prioridad" class="campo-input" required>
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA" selected>Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
            </div>
          </section>

          <section class="form-seccion">
            <div class="seccion-titulo"><span class="seccion-numero">2</span><h3>Origen y Destino</h3></div>
            <div class="grid-4">
              <div class="campo-grupo">
                <label class="campo-label">Remitente</label>
                <input type="text" id="t-remitente" class="campo-input" placeholder="Nombre o institución" required>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Área</label>
                <select id="t-area" class="campo-input" required>
                  <option value="" disabled selected>Seleccione el área</option>
                  <option value="Administración General">Administración General</option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Pediatría">Pediatría</option>
                  <option value="Medicina Interna">Medicina Interna</option>
                  <option value="Ginecología y Obstetricia">Ginecología y Obstetricia</option>
                  <option value="Patología Clínica y Anatomía Patológica">Patología Clínica y Anatomía Patológica</option>
                  <option value="Radiología e Imágenes">Radiología e Imágenes</option>
                  <option value="Centro Quirúrgico y Anestesiología">Centro Quirúrgico y Anestesiología</option>
                  <option value="Emergencia y UCI">Emergencia y UCI</option>
                  <option value="Enfermería">Enfermería</option>
                  <option value="Medicina Especializada">Medicina Especializada</option>
                  <option value="Neonatología">Neonatología</option>
                  <option value="Cirugía Especializada">Cirugía Especializada</option>
                  <option value="Emergencia">Emergencia</option>
                  <option value="Farmacia">Farmacia</option>
                </select>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Destinatario (Señor/a)</label>
                <input type="text" id="t-destinatario" class="campo-input" placeholder="Nombre completo" required>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Cargo del Destinatario</label>
                <input type="text" id="t-cargo" class="campo-input" placeholder="Ej. Jefe de Unidad" required>
              </div>
            </div>
          </section>

          <section class="form-seccion">
            <div class="seccion-titulo"><span class="seccion-numero">3</span><h3>Detalle del Documento</h3></div>
            <div class="campo-grupo full">
              <label class="campo-label">Asunto</label>
              <input type="text" id="t-asunto" class="campo-input" placeholder="Ingrese el asunto" required>
            </div>
            <div class="campo-grupo full" style="margin-top:20px;">
              <label class="campo-label">Cuerpo del Documento</label>
              <div class="textarea-wrapper">
                <textarea id="t-descripcion" class="campo-input campo-textarea" placeholder="Redacte el contenido..." maxlength="2000"></textarea>
                <span class="char-counter" id="t-char-counter">0/2000</span>
              </div>
            </div>
          </section>

          <section class="form-seccion">
            <div class="seccion-titulo"><span class="seccion-numero">4</span><h3>Archivo Adjunto (opcional)</h3></div>
            <div class="upload-zone" id="t-upload-zone">
              <input type="file" id="t-file-input" hidden accept="application/pdf">
              <div class="upload-icon">📄</div>
              <h4>Arrastre o seleccione el documento (PDF)</h4>
              <button type="button" class="btn-select-file" id="t-btn-select">Seleccionar archivo</button>
              <small id="t-file-name">Solo archivos PDF</small>
            </div>
          </section>


          <div class="form-acciones">
            <button type="button" class="btn-cancelar" onclick="App.navegar('dashboard')">Cancelar</button>
            <button type="submit" class="btn-guardar-tramite" id="t-btn-guardar">
              <span id="t-btn-texto">Emitir Documento</span>
              <div class="spinner" id="t-btn-spinner" style="display:none; width:18px; height:18px;"></div>
            </button>
          </div>
        </form>
      </div>
    `;
    this._vincularEventosEmitir();
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('t-fecha').value = hoy;
  },

  /**
   * Formulario 2: Derivación de Documento (Manual)
   */
  _renderizarFormDerivar(zona) {
    zona.innerHTML = `
      <div class="tramite-card">
        <form id="form-derivacion" autocomplete="off">
          <section class="form-seccion">
            <div class="seccion-titulo"><span class="seccion-numero">1</span><h3>Datos Generales del Documento</h3></div>
            <div class="grid-4">
              <div class="campo-grupo">
                <label class="campo-label">Número de documento</label>
                <input type="text" id="d-numero" class="campo-input" placeholder="Ej. 454-2026-US-HSJCH" required>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Tipo de documento</label>
                <select id="d-tipo-doc" class="campo-input" required>
                  <option value="NOTA Nº" selected>Nota Nº</option>
                  <option value="OFICIO Nº">Oficio Nº</option>
                  <option value="CARTA Nº">Carta Nº</option>
                  <option value="MEMORANDUM Nº">Memorándum Nº</option>
                  <option value="SOLICITUD Nº">Solicitud Nº</option>
                  <option value="INFORME Nº">Informe Nº</option>
                </select>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Fecha</label>
                <input type="date" id="d-fecha-doc" class="campo-input" required>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Prioridad</label>
                <select id="d-prioridad-doc" class="campo-input" required>
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA" selected>Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
            </div>
            <div class="campo-grupo full" style="margin-top:15px;">
              <label class="campo-label">Asunto</label>
              <input type="text" id="d-asunto-doc" class="campo-input" placeholder="Ingrese el asunto" required>
            </div>
          </section>

          <section class="form-seccion">
            <div class="seccion-titulo"><span class="seccion-numero">2</span><h3>Datos de Derivación</h3></div>
            <div class="grid-4">
              <div class="campo-grupo">
                <label class="campo-label">Área Destino</label>
                <select id="d-area" class="campo-input" required>
                  <option value="" disabled selected>Seleccione el área</option>
                  <option value="Administración General">Administración General</option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Pediatría">Pediatría</option>
                  <option value="Medicina Interna">Medicina Interna</option>
                  <option value="Ginecología y Obstetricia">Ginecología y Obstetricia</option>
                  <option value="Patología Clínica y Anatomía Patológica">Patología Clínica y Anatomía Patológica</option>
                  <option value="Radiología e Imágenes">Radiología e Imágenes</option>
                  <option value="Centro Quirúrgico y Anestesiología">Centro Quirúrgico y Anestesiología</option>
                  <option value="Emergencia y UCI">Emergencia y UCI</option>
                  <option value="Enfermería">Enfermería</option>
                  <option value="Medicina Especializada">Medicina Especializada</option>
                  <option value="Neonatología">Neonatología</option>
                  <option value="Cirugía Especializada">Cirugía Especializada</option>
                  <option value="Emergencia">Emergencia</option>
                  <option value="Farmacia">Farmacia</option>
                  <option value="Unidad de Seguros Privados">Unidad de Seguros Privados</option>
                  <option value="FISSAL">FISSAL</option>
                </select>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Responsable</label>
                <input type="text" id="d-responsable" class="campo-input" placeholder="Nombre del responsable" required>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Cargo del Responsable</label>
                <input type="text" id="d-cargo-resp" class="campo-input" placeholder="Ej. Jefe de Unidad" required>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Nuevo Estado</label>
                <select id="d-estado" class="campo-input" required>
                  <option value="DERIVADO" selected>Derivado</option>
                  <option value="EN PROCESO">En Proceso</option>
                  <option value="FINALIZADO">Finalizado</option>
                </select>
              </div>
            </div>
            <div class="campo-grupo full" style="margin-top:20px;">
              <label class="campo-label">Observaciones de Derivación</label>
              <textarea id="d-observaciones" class="campo-input campo-textarea" placeholder="Ingrese observaciones..."></textarea>
            </div>
          </section>

          <div class="form-acciones">
            <button type="button" class="btn-cancelar" onclick="App.navegar('dashboard')">Cancelar</button>
            <button type="submit" class="btn-guardar-tramite" id="d-btn-guardar">
              <span>Registrar y Derivar</span>
              <div class="spinner" id="d-btn-spinner" style="display:none; width:18px; height:18px;"></div>
            </button>
          </div>
        </form>
      </div>
    `;
    this._vincularEventosDerivar();
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('d-fecha-doc').value = hoy;
  },

  async _verificarDerivacionPendiente() {
    const derivarId = sessionStorage.getItem('derivar_id');
    if (!derivarId) return;
    try {
      const { data, error } = await clienteSupabase.from('documentos').select('*').eq('id', derivarId).single();
      if (error) throw error;
      document.getElementById('d-numero').value = data.numero_documento;
      document.getElementById('d-tipo-doc').value = data.tipo_documento;
      document.getElementById('d-fecha-doc').value = data.fecha_documento;
      document.getElementById('d-prioridad-doc').value = data.prioridad;
      document.getElementById('d-asunto-doc').value = data.asunto;
      
      // Guardar URL del archivo si existe para no perderlo al derivar
      this._archivoPendienteDerivar = data.archivo_pdf;
      
      Toast.info('Datos del documento cargados.');
      sessionStorage.removeItem('derivar_id');
    } catch (err) { console.error(err); }
  },

  _vincularEventosEmitir() {
    const form = document.getElementById('form-registro-tramite');
    const selectTipo = document.getElementById('t-tipo');
    
    // Al cambiar el tipo, recalcular el correlativo para ese tipo
    selectTipo?.addEventListener('change', () => this._generarCorrelativo());

    form?.addEventListener('submit', (e) => { e.preventDefault(); this._guardarTramite(); });
    document.getElementById('t-btn-select')?.addEventListener('click', () => document.getElementById('t-file-input').click());
    document.getElementById('t-file-input')?.addEventListener('change', (e) => this._manejarArchivo(e.target.files[0]));
    
    const textarea = document.getElementById('t-descripcion');
    textarea?.addEventListener('input', () => { document.getElementById('t-char-counter').textContent = `${textarea.value.length}/2000`; });


    // Autocomplete
    const selectArea = document.getElementById('t-area');
    selectArea?.addEventListener('change', () => {
      const data = this._dataAreas[selectArea.value];
      if (data) {
        document.getElementById('t-destinatario').value = data.nombre;
        document.getElementById('t-cargo').value = data.cargo;
      }
    });
  },

  _vincularEventosDerivar() {
    document.getElementById('form-derivacion')?.addEventListener('submit', (e) => { e.preventDefault(); this._guardarDerivacion(); });

    // Autocomplete
    const selectArea = document.getElementById('d-area');
    selectArea?.addEventListener('change', () => {
      const data = this._dataAreas[selectArea.value];
      if (data) {
        document.getElementById('d-responsable').value = data.nombre;
        document.getElementById('d-cargo-resp').value = data.cargo;
      }
    });
  },

  _manejarArchivo(file) {
    if (!file || file.type !== 'application/pdf') { Toast.error('Solo PDF'); return; }
    this._archivoAdjunto = file;
    document.getElementById('t-file-name').textContent = `Archivo: ${file.name}`;
    document.getElementById('t-file-name').style.color = 'var(--color-exito)';
  },

  async _guardarTramite() {
    const btn = document.getElementById('t-btn-guardar');
    const spinner = document.getElementById('t-btn-spinner');
    try {
      btn.disabled = true; spinner.style.display = 'block';
      const tramite = {
        numero_documento: document.getElementById('t-numero').value,
        tipo_documento: document.getElementById('t-tipo').value,
        fecha: document.getElementById('t-fecha').value,
        prioridad: document.getElementById('t-prioridad').value,
        remitente: document.getElementById('t-remitente').value,
        destinatario: document.getElementById('t-destinatario').value,
        cargo_destinatario: document.getElementById('t-cargo').value,
        area: document.getElementById('t-area').value,
        asunto: document.getElementById('t-asunto').value,
        descripcion: document.getElementById('t-descripcion').value,
        estado: 'REGISTRADO',
        usuario_id: this._perfil.id
      };
      if (this._archivoAdjunto) {
        const path = `tramites/${Date.now()}.pdf`;
        const { error: uploadError } = await clienteSupabase.storage.from('documentos').upload(path, this._archivoAdjunto);
        
        if (uploadError) {
          console.error('Error subiendo archivo:', uploadError);
          throw new Error('No se pudo subir el archivo PDF. Intente nuevamente.');
        }

        tramite.archivo_url = clienteSupabase.storage.from('documentos').getPublicUrl(path).data.publicUrl;
      }
      
      const { error: insertError } = await clienteSupabase.from('tramites').insert(tramite);
      if (insertError) throw insertError;

      this._archivoAdjunto = null; // Limpiar para el siguiente


      Toast.exito('Emitido con éxito');
      App.navegar('documentos');
    } catch (err) { Toast.error(err.message); } 
    finally { btn.disabled = false; spinner.style.display = 'none'; }
  },

  async _guardarDerivacion() {
    const btn = document.getElementById('d-btn-guardar');
    const spinner = document.getElementById('d-btn-spinner');
    try {
      btn.disabled = true; spinner.style.display = 'block';
      const tramite = {
        numero_documento: document.getElementById('d-numero').value,
        tipo_documento: document.getElementById('d-tipo-doc').value,
        fecha: document.getElementById('d-fecha-doc').value,
        prioridad: document.getElementById('d-prioridad-doc').value,
        asunto: document.getElementById('d-asunto-doc').value,
        remitente: 'DERIVACIÓN MANUAL',
        destinatario: document.getElementById('d-responsable').value,
        cargo_destinatario: document.getElementById('d-cargo-resp').value,
        area: document.getElementById('d-area').value,
        estado: document.getElementById('d-estado').value,
        archivo_url: this._archivoPendienteDerivar || null, // Mantener el adjunto original
        usuario_id: this._perfil.id
      };
      const { data: nt, error: et } = await clienteSupabase.from('tramites').insert(tramite).select().single();
      if (et) throw et;

      await clienteSupabase.from('derivaciones').insert({
        tramite_id: nt.id, area_origen: 'MESA DE PARTES', area_destino: tramite.area,
        responsable_destino: tramite.destinatario, prioridad: tramite.prioridad,
        estado: tramite.estado, observaciones: document.getElementById('d-observaciones').value,
        usuario_id: this._perfil.id
      });
      this._archivoPendienteDerivar = null; // Limpiar
      Toast.exito('Registrado y derivado');
      App.navegar('documentos');
    } catch (err) { Toast.error(err.message); }
    finally { btn.disabled = false; spinner.style.display = 'none'; }
  }
};
