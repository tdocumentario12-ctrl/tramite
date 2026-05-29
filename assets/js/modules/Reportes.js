const Reportes = {
  _documentos: [],
  _areas: [],
  _perfil: null,

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;

    const html = await TemplateLoader.cargar('reportes');
    contenedor.innerHTML = html;

    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    document.getElementById('rep-desde').value = hace30Dias.toISOString().split('T')[0];
    document.getElementById('rep-hasta').value = hoy.toISOString().split('T')[0];

    this._vincularEventos();
    await this.cargarAreas();
    await this.cargarDatos();
  },

  _vincularEventos() {
    document.getElementById('rep-btn-aplicar')?.addEventListener('click', () => this.cargarDatos());
    document.getElementById('rep-btn-limpiar')?.addEventListener('click', () => this.limpiarFiltros());
    document.getElementById('rep-btn-exportar')?.addEventListener('click', () => this.exportarCSV());
  },

  async cargarAreas() {
    try {
      const { data, error } = await clienteSupabase.from('areas').select('nombre').order('nombre', { ascending: true });
      if (error) throw error;

      this._areas = data;
      const select = document.getElementById('rep-area');
      if (!select) return;

      select.innerHTML = '<option value="">Todas las Áreas</option>';
      data.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.nombre;
        opt.textContent = a.nombre;
        select.appendChild(opt);
      });
    } catch (e) {
      console.error('Error al cargar áreas para reportes:', e);
    }
  },

  async cargarDatos() {
    try {
      let query = clienteSupabase.from('documentos').select('*');

      const desde = document.getElementById('rep-desde').value;
      if (desde) query = query.gte('fecha_documento', desde);

      const hasta = document.getElementById('rep-hasta').value;
      if (hasta) query = query.lte('fecha_documento', hasta);

      const area = document.getElementById('rep-area').value;
      if (area) query = query.eq('area_destino', area);

      const tipo = document.getElementById('rep-tipo').value;
      if (tipo) query = query.eq('tipo_documento', tipo);

      const { data, error } = await query;
      if (error) throw error;

      this._documentos = data;
      this.calcularMetricas(data);
    } catch (err) {
      console.error(err);
      Toast.error('Error al generar estadísticas: ' + err.message);
    }
  },

  limpiarFiltros() {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    document.getElementById('rep-desde').value = hace30Dias.toISOString().split('T')[0];
    document.getElementById('rep-hasta').value = hoy.toISOString().split('T')[0];
    document.getElementById('rep-area').value = '';
    document.getElementById('rep-tipo').value = '';

    this.cargarDatos();
  },

  calcularMetricas(docs) {
    const total = docs.length;
    const proceso = docs.filter(d => d.estado === 'EN PROCESO').length;
    const finalizado = docs.filter(d => d.estado === 'FINALIZADO' || d.estado === 'ATENDIDO').length;
    const registrados = docs.filter(d => d.estado === 'REGISTRADO').length;

    const eficiencia = total > 0 ? Math.round((finalizado / total) * 100) : 0;

    document.getElementById('rep-val-total').textContent = total;
    document.getElementById('rep-val-proceso').textContent = proceso;
    document.getElementById('rep-val-atendidos').textContent = finalizado;
    document.getElementById('rep-val-eficiencia').textContent = `${eficiencia}%`;

    const contEstados = document.getElementById('grafico-estados');
    if (contEstados) {
      const pctReg = total > 0 ? Math.round((registrados / total) * 100) : 0;
      const pctProc = total > 0 ? Math.round((proceso / total) * 100) : 0;
      const pctFin = total > 0 ? Math.round((finalizado / total) * 100) : 0;

      contEstados.innerHTML = `
        ${this._crearFilaGrafico('Registrado', registrados, pctReg, 'fill-celeste')}
        ${this._crearFilaGrafico('En Proceso', proceso, pctProc, 'fill-naranja')}
        ${this._crearFilaGrafico('Finalizado', finalizado, pctFin, 'fill-verde')}
      `;
    }

    const contTipos = document.getElementById('grafico-tipos');
    if (contTipos) {
      const tipos = ['NOTA Nº', 'OFICIO Nº', 'CARTA Nº', 'MEMORANDUM Nº', 'SOLICITUD Nº', 'INFORME Nº'];
      contTipos.innerHTML = '';

      tipos.forEach(t => {
        const cant = docs.filter(d => d.tipo_documento === t).length;
        const pct = total > 0 ? Math.round((cant / total) * 100) : 0;
        contTipos.innerHTML += this._crearFilaGrafico(t, cant, pct, 'fill-purpura');
      });
    }

    const contAreas = document.getElementById('grafico-areas');
    if (contAreas) {
      contAreas.innerHTML = '';

      const conteoAreas = {};
      docs.forEach(d => {
        const a = d.area_destino || 'Mesa de Partes';
        conteoAreas[a] = (conteoAreas[a] || 0) + 1;
      });

      const listaOrdenada = Object.entries(conteoAreas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      if (listaOrdenada.length === 0) {
        contAreas.style.display = 'block';
        contAreas.innerHTML = '<div style="text-align:center; color:#64748B; padding:20px;">No hay derivaciones en este rango.</div>';
      } else {
        contAreas.style.display = 'grid';
        listaOrdenada.forEach(([area, cant]) => {
          const pct = total > 0 ? Math.round((cant / total) * 100) : 0;
          contAreas.innerHTML += `
            <div>
              ${this._crearFilaGrafico(area, cant, pct, 'fill-celeste')}
            </div>
          `;
        });
      }
    }
  },

  _crearFilaGrafico(etiqueta, valor, porcentaje, claseColor) {
    return `
      <div class="grafico-fila">
        <div class="grafico-fila-meta">
          <span>${etiqueta}</span>
          <span>${valor} (${porcentaje}%)</span>
        </div>
        <div class="grafico-barra-bg">
          <div class="grafico-barra-fill ${claseColor}" style="width: ${porcentaje}%;"></div>
        </div>
      </div>
    `;
  },

  exportarCSV() {
    if (this._documentos.length === 0) {
      Toast.error('No hay registros en el reporte actual para exportar');
      return;
    }

    let contenido = 'NRO_DOCUMENTO;TIPO_DOCUMENTO;REMITENTE;DESTINATARIO;AREA_DESTINO;FECHA_REGISTRO;PRIORIDAD;ESTADO;TIPO_REGISTRO\n';

    this._documentos.forEach(doc => {
      contenido += `"${doc.numero_documento || ''}";"${doc.tipo_documento || ''}";"${doc.remitente || ''}";"${doc.destinatario || ''}";"${doc.area_destino || ''}";"${doc.fecha_documento || ''}";"${doc.prioridad || ''}";"${doc.estado || ''}";"${doc.tipo_registro || 'Emitido'}"\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const fechaStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_SIS_tramites_${fechaStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Toast.exito('Resumen del reporte descargado con éxito');
  }
};
