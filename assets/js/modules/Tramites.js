const Tramites = {
  _perfil: null,
  _contenedor: null,
  _archivoAdjunto: null,
  _tabActual: 'emitir',
  _areasList: [],

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;
    this._contenedor = contenedor;

    try {
      const { data, error } = await clienteSupabase.from('areas').select('*').order('nombre', { ascending: true });
      if (error) throw error;
      this._areasList = data || [];
    } catch (e) {
      console.error('Error al cargar áreas de la base de datos:', e);
      this._areasList = [];
    }

    const tituloHeader = document.getElementById('titulo-pagina');
    if (tituloHeader) {
      tituloHeader.innerHTML = `GESTIÓN DE TRÁMITES <span style="font-size: 0.95rem; font-weight: 500; color: var(--color-texto-secundario); margin-left: 12px; border-left: 1px solid var(--color-borde); padding-left: 12px;">Documentos emitidos y en trámite.</span>`;
    }

    const areasOptions = this._areasList.map(a => `<option value="${a.nombre}">${a.nombre}</option>`).join('');

    const mainHtml = await TemplateLoader.cargar('tramites');
    contenedor.innerHTML = mainHtml;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('activo'));
    const tabBtn = document.getElementById(`tab-${this._tabActual}`);
    if (tabBtn) tabBtn.classList.add('activo');

    this._vincularEventosTabs();
    await this._cargarFormularioActual(areasOptions);
  },

  _vincularEventosTabs() {
    document.getElementById('tab-emitir')?.addEventListener('click', () => {
      if (this._tabActual === 'emitir') return;
      this._tabActual = 'emitir';
      this.renderizar(this._contenedor, this._perfil);
    });

    document.getElementById('tab-derivar')?.addEventListener('click', () => {
      if (this._tabActual === 'derivar') return;
      this._tabActual = 'derivar';
      this.renderizar(this._contenedor, this._perfil);
    });
  },

  async _cargarFormularioActual(areasOptions) {
    const zonaContenido = document.getElementById('tramite-contenido-dinamico');

    if (this._tabActual === 'emitir') {
      await this._renderizarFormEmitir(zonaContenido, areasOptions);
      await this._generarCorrelativo();
      await this._cargarFirmantesSelect();
    } else {
      await this._renderizarFormDerivar(zonaContenido, areasOptions);
      await this._verificarDerivacionPendiente();
    }
  },

  async _cargarFirmantesSelect() {
    const select = document.getElementById('t-firmante');
    if (!select) return;

    try {
      const { data: perfiles, error } = await clienteSupabase
        .from('perfiles')
        .select('id, nombre_completo, cargo, firma_url')
        .eq('activo', true)
        .order('nombre_completo', { ascending: true });

      if (error) throw error;

      if (!perfiles || perfiles.length === 0) {
        select.innerHTML = '<option value="" disabled>No hay firmantes disponibles</option>';
        return;
      }

      select.innerHTML = perfiles.map(p => {
        const tieneFirma = p.firma_url ? '✍️ ' : '⚠️ (Sin firma) ';
        const cargoStr = p.cargo ? ` - ${p.cargo}` : '';
        return `<option value="${p.id}">${tieneFirma}${p.nombre_completo}${cargoStr}</option>`;
      }).join('');

      if (this._perfil && this._perfil.id) {
        select.value = this._perfil.id;
      }
    } catch (err) {
      console.error('Error al cargar firmantes:', err);
      select.innerHTML = '<option value="" disabled>Error al cargar firmantes</option>';
    }
  },

  async _generarCorrelativo() {
    const inputNumero = document.getElementById('t-numero');
    const selectTipo = document.getElementById('t-tipo');
    if (!inputNumero || !selectTipo) return;

    const tipoSeleccionado = selectTipo.value;
    const anoActual = 2026;

    try {
      const { data, error } = await clienteSupabase
        .from('tramites')
        .select('numero_documento')
        .eq('tipo_documento', tipoSeleccionado)
        .ilike('numero_documento', `%-2026-US-HSJCH`)
        .order('creado_en', { ascending: false })
        .limit(1);

      if (error) throw error;

      let proximoNumero = 1;
      if (tipoSeleccionado === 'NOTA Nº') proximoNumero = 454;

      if (data && data.length > 0) {
        const match = data[0].numero_documento.match(/(\d+)-/);
        if (match) proximoNumero = parseInt(match[1]) + 1;
      }

      inputNumero.value = `${proximoNumero}-${anoActual}-US-HSJCH`;
    } catch (err) {
      console.error('Error al generar correlativo por tipo:', err);
    }
  },

  async _renderizarFormEmitir(zona, areasOptions) {
    const formHtml = (await TemplateLoader.cargar('tramites-emitir'))
      .replace('{{AREAS_OPTIONS}}', areasOptions);
    zona.innerHTML = formHtml;
    this._vincularEventosEmitir();
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('t-fecha').value = hoy;
  },

  async _renderizarFormDerivar(zona, areasOptions) {
    const formHtml = (await TemplateLoader.cargar('tramites-derivar'))
      .replace('{{AREAS_OPTIONS}}', areasOptions);
    zona.innerHTML = formHtml;
    this._vincularEventosDerivar();
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('d-fecha-doc').value = hoy;
  },

  _vincularEventosEmitir() {
    const form = document.getElementById('form-registro-tramite');
    const selectTipo = document.getElementById('t-tipo');

    selectTipo?.addEventListener('change', () => this._generarCorrelativo());
    form?.addEventListener('submit', (e) => { e.preventDefault(); this._guardarTramite(); });
    document.getElementById('t-btn-select')?.addEventListener('click', () => document.getElementById('t-file-input').click());
    document.getElementById('t-file-input')?.addEventListener('change', (e) => this._manejarArchivo(e.target.files[0]));
    document.getElementById('t-btn-cancelar')?.addEventListener('click', () => App.navegar('documentos'));

    const textarea = document.getElementById('t-descripcion');
    textarea?.addEventListener('input', () => {
      const counter = document.getElementById('t-char-counter');
      if (counter) counter.textContent = `${textarea.value.length}/2000`;
    });

    const selectArea = document.getElementById('t-area');
    selectArea?.addEventListener('change', () => {
      const areaInfo = this._areasList.find(a => a.nombre === selectArea.value);
      if (areaInfo) {
        document.getElementById('t-destinatario').value = areaInfo.responsable;
        document.getElementById('t-cargo').value = areaInfo.cargo;
      }
    });
  },

  _vincularEventosDerivar() {
    document.getElementById('form-derivacion')?.addEventListener('submit', (e) => { e.preventDefault(); this._guardarDerivacion(); });
    document.getElementById('d-btn-cancelar')?.addEventListener('click', () => App.navegar('documentos'));

    const selectArea = document.getElementById('d-area');
    selectArea?.addEventListener('change', () => {
      const areaInfo = this._areasList.find(a => a.nombre === selectArea.value);
      if (areaInfo) {
        document.getElementById('d-responsable').value = areaInfo.responsable;
        document.getElementById('d-cargo-resp').value = areaInfo.cargo;
      }
    });
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
      if (document.getElementById('d-remitente')) {
        document.getElementById('d-remitente').value = data.remitente || '';
      }
      this._archivoPendienteDerivar = data.archivo_pdf;
      Toast.info('Datos del documento cargados.');
      sessionStorage.removeItem('derivar_id');
    } catch (err) { console.error(err); }
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
        usuario_id: this._perfil.id,
        firmante_id: document.getElementById('t-firmante').value || null
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

      this._archivoAdjunto = null;
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
        remitente: document.getElementById('d-remitente').value,
        destinatario: document.getElementById('d-responsable').value,
        cargo_destinatario: document.getElementById('d-cargo-resp').value,
        area: document.getElementById('d-area').value,
        estado: document.getElementById('d-estado').value,
        archivo_url: this._archivoPendienteDerivar || null,
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
      this._archivoPendienteDerivar = null;
      Toast.exito('Registrado y derivado');
      App.navegar('documentos');
    } catch (err) { Toast.error(err.message); }
    finally { btn.disabled = false; spinner.style.display = 'none'; }
  }
};
