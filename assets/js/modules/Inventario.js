/* ============================================
   SISTEMA SIS — Gestión de Inventario (Completo)
   ============================================ */

const Inventario = {
  _perfil: null,
  _articulos: [],
  _carritoSalidas: [],

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;

    // Mover título al header global
    const tituloHeader = document.getElementById('titulo-pagina');
    if (tituloHeader) {
      tituloHeader.innerHTML = `CONTROL DE INVENTARIO <span style="font-size:0.95rem;font-weight:500;color:var(--color-texto-secundario);margin-left:12px;border-left:1px solid var(--color-borde);padding-left:12px;">Administre el almacén, registre entradas y controle salidas de insumos.</span>`;
    }

    contenedor.innerHTML = `
      <div class="inventario-container">
        <div class="inventario-tabs">
          <button class="inventario-tab activo" data-tab="tab-resumen">📊 Resumen</button>
          <button class="inventario-tab" data-tab="tab-descontar">📤 Descontar</button>
          <button class="inventario-tab" data-tab="tab-ingresar">📥 Ingresar</button>
          <button class="inventario-tab" data-tab="tab-catalogo">📋 Catálogo</button>
          <button class="inventario-tab" data-tab="tab-kardex">🗂️ Kardex</button>
        </div>

        <!-- RESUMEN -->
        <div class="inventario-tab-content activo" id="tab-resumen">
          <div class="inv-stats" id="inv-kpis">
            <div style="padding:40px;text-align:center;"><div class="spinner primario" style="margin:0 auto;"></div></div>
          </div>
          <div id="inv-alertas"></div>
        </div>

        <!-- DESCONTAR -->
        <div class="inventario-tab-content" id="tab-descontar">
          <div class="inventario-form-panel">
            <h3>Registrar Salida de Insumos</h3>
            <div class="inventario-form-grid" style="margin-bottom: 20px;">
              <div class="campo-grupo">
                <label class="campo-label">Área Destino *</label>
                <select class="campo-input" id="sal-area">
                  <option value="">Seleccione el área...</option>
                </select>
              </div>
            </div>
            
            <div style="background: #F8FAFC; padding: 16px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 24px;">
              <h4 style="margin: 0 0 12px 0; font-size: 0.95rem; color: #334155;">Añadir Insumos</h4>
              <div class="inventario-form-grid">
                <div class="campo-grupo" style="grid-column: span 2;">
                  <label class="campo-label">Artículo</label>
                  <select class="campo-input" id="sal-articulo">
                    <option value="">Cargando artículos...</option>
                  </select>
                  <small id="sal-stock-info" style="color:var(--color-texto-secundario);font-size:0.8rem;"></small>
                </div>
                <div class="campo-grupo">
                  <label class="campo-label">Cantidad</label>
                  <div style="display: flex; gap: 8px;">
                    <input type="number" class="campo-input" id="sal-cantidad" min="1" placeholder="Ej. 5">
                    <button class="btn-secundario" id="btn-agregar-carrito" style="margin:0; min-width: max-content;">+ Añadir</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="inv-tabla-contenedor">
              <table class="inv-tabla">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th style="text-align:center;">Cantidad</th>
                    <th style="text-align:center;">Acción</th>
                  </tr>
                </thead>
                <tbody id="carrito-body">
                  <tr><td colspan="3" style="text-align:center;padding:20px;color:#94A3B8;">No hay insumos agregados a la lista.</td></tr>
                </tbody>
              </table>
            </div>

            <div style="text-align:right;margin-top:20px;">
              <button class="btn-primario" id="btn-procesar-salida" disabled>Procesar Entrega y Generar Cargo</button>
            </div>
          </div>
        </div>

        <!-- INGRESAR -->
        <div class="inventario-tab-content" id="tab-ingresar">
          <div class="inventario-form-panel">
            <h3>Registrar Entrada de Insumo</h3>
            <div class="inventario-form-grid">
              <div class="campo-grupo">
                <label class="campo-label">Artículo *</label>
                <select class="campo-input" id="ent-articulo">
                  <option value="">Cargando artículos...</option>
                </select>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Cantidad *</label>
                <input type="number" class="campo-input" id="ent-cantidad" min="1" placeholder="Ej. 50">
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Proveedor</label>
                <input type="text" class="campo-input" id="ent-proveedor" placeholder="Nombre del proveedor">
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Nro. Documento</label>
                <input type="text" class="campo-input" id="ent-doc" placeholder="Ej. FACT-001">
              </div>
              <div class="campo-grupo" style="grid-column:span 2">
                <label class="campo-label">Motivo / Observación</label>
                <input type="text" class="campo-input" id="ent-motivo" placeholder="Ej. Abastecimiento mensual">
              </div>
            </div>
            <div style="text-align:right;margin-top:20px;">
              <button class="btn-primario" id="btn-registrar-entrada">Registrar Entrada</button>
            </div>
          </div>
        </div>

        <!-- CATÁLOGO -->
        <div class="inventario-tab-content" id="tab-catalogo">
          <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
            <button class="btn-secundario" id="btn-cargar-inicial" style="margin-right:12px;">Cargar Catálogo Excel</button>
            <button class="btn-primario" id="btn-nuevo-articulo">+ Nuevo Artículo</button>
          </div>
          <div class="inv-tabla-contenedor">
            <table class="inv-tabla">
              <thead>
                <tr>
                  <th>Código</th><th>Artículo</th><th>Categoría</th>
                  <th>Unidad</th><th>Stock</th><th>Stock Mín.</th><th>Estado</th>
                </tr>
              </thead>
              <tbody id="catalogo-body">
                <tr><td colspan="7" style="text-align:center;padding:40px;"><div class="spinner primario" style="margin:0 auto;"></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- KARDEX -->
        <div class="inventario-tab-content" id="tab-kardex">
          <div class="inv-filtros">
            <div class="inventario-form-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:12px;">
              <div class="campo-grupo">
                <label class="campo-label">Desde</label>
                <input type="date" class="campo-input" id="kard-desde">
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Hasta</label>
                <input type="date" class="campo-input" id="kard-hasta">
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Tipo</label>
                <select class="campo-input" id="kard-tipo">
                  <option value="">Todos</option>
                  <option value="ENTRADA">Entradas</option>
                  <option value="SALIDA">Salidas</option>
                </select>
              </div>
              <div class="campo-grupo" style="display:flex;align-items:flex-end;">
                <button class="btn-primario" id="btn-filtrar-kardex" style="width:100%;margin:0;">Filtrar</button>
              </div>
            </div>
          </div>
          <div class="inv-tabla-contenedor">
            <table class="inv-tabla">
              <thead>
                <tr>
                  <th>Fecha</th><th>Artículo</th><th>Tipo</th>
                  <th>Cantidad</th><th>Stock Ant.</th><th>Stock Nuevo</th>
                  <th>Área / Proveedor</th><th>Motivo</th>
                </tr>
              </thead>
              <tbody id="kardex-body">
                <tr><td colspan="8" style="text-align:center;padding:40px;"><div class="spinner primario" style="margin:0 auto;"></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- MODAL ARTÍCULO -->
      <div class="modal-overlay" id="modal-articulo">
        <div class="modal" style="max-width:520px;">
          <div class="modal-header">
            <h3 id="modal-art-titulo">Nuevo Artículo</h3>
            <button class="modal-cerrar" id="btn-cerrar-art">✕</button>
          </div>
          <div class="modal-body" style="padding:24px;">
            <input type="hidden" id="art-id">
            <div class="inventario-form-grid">
              <div class="campo-grupo">
                <label class="campo-label">Código *</label>
                <input type="text" class="campo-input" id="art-codigo" placeholder="Ej. MED-010">
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Unidad *</label>
                <input type="text" class="campo-input" id="art-unidad" placeholder="Caja, Frasco...">
              </div>
              <div class="campo-grupo" style="grid-column:span 2">
                <label class="campo-label">Nombre del Artículo *</label>
                <input type="text" class="campo-input" id="art-nombre" placeholder="Nombre completo del artículo">
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Categoría</label>
                <select class="campo-input" id="art-categoria">
                  <option>Medicamentos</option>
                  <option>Insumos</option>
                  <option>Soluciones</option>
                  <option>Equipos/Otros</option>
                </select>
              </div>
              <div class="campo-grupo">
                <label class="campo-label">Stock Mínimo</label>
                <input type="number" class="campo-input" id="art-stock-min" min="0" value="5">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secundario" id="btn-cancelar-art">Cancelar</button>
            <button class="btn-primario" id="btn-guardar-art">Guardar</button>
          </div>
        </div>
      </div>
    `;

    this._inicializarFechas();
    this._vincularEventos(contenedor);
    await this._cargarArticulos();
    await this._cargarResumen();
    await this._cargarKardex();
    await this._cargarCatalogo();
  },

  _inicializarFechas() {
    const hoy = new Date().toISOString().split('T')[0];
    const hace30 = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const desde = document.getElementById('kard-desde');
    const hasta = document.getElementById('kard-hasta');
    if (desde) desde.value = hace30;
    if (hasta) hasta.value = hoy;
  },

  async _cargarArticulos() {
    try {
      const { data, error } = await clienteSupabase
        .from('inventario_articulos')
        .select('id, nombre, unidad, stock_actual')
        .eq('activo', true)
        .order('nombre');
      if (error) throw error;
      this._articulos = data || [];

      const selSal = document.getElementById('sal-articulo');
      const selEnt = document.getElementById('ent-articulo');
      const opts = `<option value="">Seleccione un artículo...</option>` +
        this._articulos.map(a => `<option value="${a.id}" data-stock="${a.stock_actual}">${a.nombre} (${a.unidad}) — Stock: ${a.stock_actual}</option>`).join('');
      if (selSal) selSal.innerHTML = opts;
      if (selEnt) selEnt.innerHTML = opts;

      selSal?.addEventListener('change', () => {
        const opt = selSal.selectedOptions[0];
        const info = document.getElementById('sal-stock-info');
        if (info) info.textContent = opt?.dataset.stock ? `Stock disponible: ${opt.dataset.stock}` : '';
      });

      const { data: areas } = await clienteSupabase.from('areas').select('nombre').order('nombre');
      const selArea = document.getElementById('sal-area');
      if (selArea && areas) {
        selArea.innerHTML = `<option value="">Seleccione el área...</option>` +
          areas.map(a => `<option value="${a.nombre}">${a.nombre}</option>`).join('');
      }
    } catch (e) {
      console.error('Error cargando artículos:', e);
    }
  },

  async _cargarResumen() {
    try {
      const { data, error } = await clienteSupabase
        .from('inventario_articulos')
        .select('id, nombre, stock_actual, stock_minimo, categoria')
        .eq('activo', true);
      if (error) throw error;

      // Consultar movimientos para KPIs de Entradas y Salidas
      const { data: movimientos, error: errMov } = await clienteSupabase
        .from('inventario_movimientos')
        .select('tipo');
      if (errMov) throw errMov;

      const totalEntradas = movimientos.filter(m => m.tipo === 'ENTRADA').length;
      const totalSalidas = movimientos.filter(m => m.tipo === 'SALIDA').length;

      const total = data.length;
      const bajoStock = data.filter(a => a.stock_actual <= a.stock_minimo);
      const sinStock = data.filter(a => a.stock_actual === 0);
      const totalUnidades = data.reduce((s, a) => s + a.stock_actual, 0);

      const kpiEl = document.getElementById('inv-kpis');
      if (kpiEl) {
        kpiEl.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
        kpiEl.innerHTML = `
          <div class="inv-stat-card" style="border-left:5px solid #0284C7; padding: 15px;">
            <div class="inv-stat-icon" style="background:#E0F2FE;color:#0284C7; width: 40px; height: 40px; font-size: 1.2rem;">📦</div>
            <div><div class="inv-stat-val" style="font-size: 1.6rem;">${total}</div><div class="inv-stat-lbl">Insumos Reg.</div></div>
          </div>
          <div class="inv-stat-card" style="border-left:5px solid #16A34A; padding: 15px;">
            <div class="inv-stat-icon" style="background:#DCFCE7;color:#16A34A; width: 40px; height: 40px; font-size: 1.2rem;">📥</div>
            <div><div class="inv-stat-val" style="font-size: 1.6rem;">${totalEntradas}</div><div class="inv-stat-lbl">Total Entradas</div></div>
          </div>
          <div class="inv-stat-card" style="border-left:5px solid #DC2626; padding: 15px;">
            <div class="inv-stat-icon" style="background:#FEE2E2;color:#DC2626; width: 40px; height: 40px; font-size: 1.2rem;">📤</div>
            <div><div class="inv-stat-val" style="font-size: 1.6rem;">${totalSalidas}</div><div class="inv-stat-lbl">Total Salidas</div></div>
          </div>
          <div class="inv-stat-card" style="border-left:5px solid #D97706; padding: 15px;">
            <div class="inv-stat-icon" style="background:#FEF3C7;color:#D97706; width: 40px; height: 40px; font-size: 1.2rem;">⚠️</div>
            <div><div class="inv-stat-val" style="font-size: 1.6rem;">${bajoStock.length}</div><div class="inv-stat-lbl">Stock Bajo</div></div>
          </div>
          <div class="inv-stat-card" style="border-left:5px solid #6366F1; padding: 15px;">
            <div class="inv-stat-icon" style="background:#E0E7FF;color:#4F46E5; width: 40px; height: 40px; font-size: 1.2rem;">📊</div>
            <div><div class="inv-stat-val" style="font-size: 1.6rem;">${totalUnidades}</div><div class="inv-stat-lbl">Stock General</div></div>
          </div>
        `;
      }

      const alertEl = document.getElementById('inv-alertas');
      if (alertEl && bajoStock.length > 0) {
        alertEl.innerHTML = `
          <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:12px;padding:20px;margin-top:24px;">
            <h4 style="color:#92400E;margin-bottom:12px;">⚠️ Artículos con Stock Bajo</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;">
              ${bajoStock.map(a => `
                <div style="background:white;border:1px solid #FDE68A;border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-weight:600;font-size:0.9rem;">${a.nombre}</span>
                  <span style="color:#D97706;font-weight:700;font-size:0.85rem;">Stock: ${a.stock_actual} / Mín: ${a.stock_minimo}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (alertEl) {
        alertEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--color-texto-secundario);">✅ Todos los artículos tienen stock suficiente.</div>`;
      }
    } catch (e) {
      console.error('Error cargando resumen:', e);
    }
  },

  async _cargarCatalogo() {
    const tbody = document.getElementById('catalogo-body');
    if (!tbody) return;
    try {
      const { data, error } = await clienteSupabase
        .from('inventario_articulos')
        .select('*')
        .order('nombre');
      if (error) throw error;

      if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--color-texto-secundario);">No hay artículos registrados.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.map(a => {
        const alerta = a.stock_actual <= a.stock_minimo;
        return `
          <tr>
            <td><code style="background:var(--color-fondo);padding:2px 6px;border-radius:4px;">${a.codigo}</code></td>
            <td style="font-weight:600;">${a.nombre}</td>
            <td>${a.categoria || '-'}</td>
            <td>${a.unidad}</td>
            <td style="font-weight:700;color:${alerta ? '#DC2626' : 'var(--color-texto)'};">${a.stock_actual}</td>
            <td>${a.stock_minimo}</td>
            <td>
              <span style="padding:3px 10px;border-radius:999px;font-size:0.75rem;font-weight:700;
                background:${a.activo ? '#DCFCE7' : '#F1F5F9'};color:${a.activo ? '#16A34A' : '#64748B'};">
                ${a.activo ? 'Activo' : 'Inactivo'}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Error cargando catálogo:', e);
    }
  },

  async _cargarKardex() {
    const tbody = document.getElementById('kardex-body');
    if (!tbody) return;
    try {
      let query = clienteSupabase
        .from('inventario_movimientos')
        .select('*, inventario_articulos(nombre, unidad)')
        .order('creado_en', { ascending: false })
        .limit(100);

      const desde = document.getElementById('kard-desde')?.value;
      const hasta = document.getElementById('kard-hasta')?.value;
      const tipo = document.getElementById('kard-tipo')?.value;
      if (desde) query = query.gte('fecha', desde);
      if (hasta) query = query.lte('fecha', hasta);
      if (tipo) query = query.eq('tipo', tipo);

      const { data, error } = await query;
      if (error) throw error;

      if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--color-texto-secundario);">No hay movimientos registrados.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.map(m => `
        <tr>
          <td>${m.fecha}</td>
          <td style="font-weight:600;">${m.inventario_articulos?.nombre || '-'}</td>
          <td>
            <span style="padding:3px 10px;border-radius:999px;font-size:0.75rem;font-weight:700;
              background:${m.tipo === 'ENTRADA' ? '#DCFCE7' : '#FEE2E2'};
              color:${m.tipo === 'ENTRADA' ? '#16A34A' : '#DC2626'};">
              ${m.tipo}
            </span>
          </td>
          <td style="font-weight:700;">${m.cantidad}</td>
          <td style="color:var(--color-texto-secundario);">${m.stock_anterior}</td>
          <td style="font-weight:700;">${m.stock_nuevo}</td>
          <td>${m.area_destino || m.proveedor || '-'}</td>
          <td style="color:var(--color-texto-secundario);">${m.motivo || '-'}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error cargando kardex:', e);
    }
  },

  _agregarAlCarrito() {
    const artSelect = document.getElementById('sal-articulo');
    const artId = parseInt(artSelect.value);
    const cantidad = parseInt(document.getElementById('sal-cantidad').value);

    if (!artId || !cantidad || cantidad < 1) {
      Toast.advertencia('Seleccione un artículo y una cantidad válida.');
      return;
    }

    const art = this._articulos.find(a => a.id === artId);
    if (!art) return;

    const itemExistente = this._carritoSalidas.find(i => i.articulo_id === artId);
    const cantidadTotal = itemExistente ? itemExistente.cantidad + cantidad : cantidad;

    if (cantidadTotal > art.stock_actual) {
      Toast.error(`Stock insuficiente. Disponible: ${art.stock_actual}`);
      return;
    }

    if (itemExistente) {
      itemExistente.cantidad = cantidadTotal;
    } else {
      this._carritoSalidas.push({
        articulo_id: art.id,
        nombre: art.nombre,
        unidad: art.unidad,
        cantidad: cantidad,
        stock_actual: art.stock_actual
      });
    }

    document.getElementById('sal-cantidad').value = '';
    artSelect.value = '';
    document.getElementById('sal-stock-info').textContent = '';
    this._renderizarCarrito();
  },

  _eliminarDelCarrito(id) {
    this._carritoSalidas = this._carritoSalidas.filter(i => i.articulo_id !== id);
    this._renderizarCarrito();
  },

  _renderizarCarrito() {
    const tbody = document.getElementById('carrito-body');
    const btnProcesar = document.getElementById('btn-procesar-salida');
    if (!tbody) return;

    if (this._carritoSalidas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;color:#94A3B8;">No hay insumos agregados a la lista.</td></tr>`;
      if(btnProcesar) btnProcesar.disabled = true;
      return;
    }

    tbody.innerHTML = this._carritoSalidas.map(item => `
      <tr>
        <td style="font-weight:500;">${item.nombre}</td>
        <td style="text-align:center; font-weight:700;">${item.cantidad} ${item.unidad}</td>
        <td style="text-align:center;">
          <button class="btn-secundario" onclick="Inventario._eliminarDelCarrito(${item.articulo_id})" style="padding:4px 8px; font-size:0.8rem; border-color:#DC2626; color:#DC2626;">Eliminar</button>
        </td>
      </tr>
    `).join('');
    
    if(btnProcesar) btnProcesar.disabled = false;
  },

  async _procesarSalidaCarrito() {
    const areaDestino = document.getElementById('sal-area')?.value;
    if (!areaDestino) {
      Toast.advertencia('Debe seleccionar el Área Destino.');
      return;
    }

    if (this._carritoSalidas.length === 0) {
      Toast.advertencia('El carrito está vacío.');
      return;
    }

    const btn = document.getElementById('btn-procesar-salida');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    try {
      const fechaActual = new Date().toISOString().split('T')[0];
      const movimientos = [];
      const articulosActualizados = [];

      for (const item of this._carritoSalidas) {
        const { data: artDB } = await clienteSupabase.from('inventario_articulos').select('stock_actual').eq('id', item.articulo_id).single();
        if(!artDB || artDB.stock_actual < item.cantidad) {
          throw new Error(`Stock insuficiente para ${item.nombre}. Actualizado en BD: ${artDB ? artDB.stock_actual : 0}`);
        }

        const stockAnterior = artDB.stock_actual;
        const stockNuevo = stockAnterior - item.cantidad;

        articulosActualizados.push({
          id: item.articulo_id,
          stock_actual: stockNuevo,
          actualizado_en: new Date().toISOString()
        });

        movimientos.push({
          articulo_id: item.articulo_id,
          tipo: 'SALIDA',
          cantidad: item.cantidad,
          stock_anterior: stockAnterior,
          stock_nuevo: stockNuevo,
          motivo: 'Entrega por requerimiento',
          area_destino: areaDestino,
          fecha: fechaActual,
          registrado_por: this._perfil?.id || null
        });
      }

      for (const art of articulosActualizados) {
        const { error: errStock } = await clienteSupabase.from('inventario_articulos').update({ stock_actual: art.stock_actual, actualizado_en: art.actualizado_en }).eq('id', art.id);
        if (errStock) throw errStock;
      }

      const { error: errMov } = await clienteSupabase.from('inventario_movimientos').insert(movimientos);
      if (errMov) throw errMov;

      Toast.exito('Salida procesada y registrada correctamente.');

      if (window.jspdf) {
        this._generarPDFSalida(this._carritoSalidas, areaDestino);
      }

      this._carritoSalidas = [];
      document.getElementById('sal-area').value = '';
      this._renderizarCarrito();

      await this._cargarArticulos();
      await this._cargarResumen();
      await this._cargarKardex();
      await this._cargarCatalogo();

    } catch (err) {
      console.error(err);
      Toast.error('Error al procesar salida: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Procesar Entrega y Generar Cargo';
    }
  },

  async _registrarEntrada() {
    const artId = parseInt(document.getElementById('ent-articulo')?.value);
    const cantidad = parseInt(document.getElementById('ent-cantidad')?.value);
    const motivo = document.getElementById('ent-motivo')?.value.trim();

    if (!artId || !cantidad || cantidad < 1) {
      Toast.advertencia('Seleccione un artículo y una cantidad válida.');
      return;
    }

    const art = this._articulos.find(a => a.id === artId);
    if (!art) return;

    const stockAnterior = art.stock_actual;
    const stockNuevo = stockAnterior + cantidad;

    try {
      const { error: errStock } = await clienteSupabase
        .from('inventario_articulos')
        .update({ stock_actual: stockNuevo, actualizado_en: new Date().toISOString() })
        .eq('id', artId);
      if (errStock) throw errStock;

      const movimiento = {
        articulo_id: artId, tipo: 'ENTRADA', cantidad,
        stock_anterior: stockAnterior, stock_nuevo: stockNuevo,
        motivo: motivo || null,
        fecha: new Date().toISOString().split('T')[0],
        registrado_por: this._perfil?.id || null,
        proveedor: document.getElementById('ent-proveedor')?.value.trim() || null,
        numero_doc: document.getElementById('ent-doc')?.value.trim() || null
      };

      const { error: errMov } = await clienteSupabase.from('inventario_movimientos').insert(movimiento);
      if (errMov) throw errMov;

      Toast.exito('Entrada registrada correctamente.');

      ['ent-articulo','ent-cantidad','ent-proveedor','ent-doc','ent-motivo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      await this._cargarArticulos();
      await this._cargarResumen();
      await this._cargarKardex();
      await this._cargarCatalogo();

    } catch (err) {
      console.error(err);
      Toast.error('Error al registrar entrada: ' + err.message);
    }
  },

  async _guardarArticulo() {
    const id = document.getElementById('art-id')?.value;
    const codigo = document.getElementById('art-codigo')?.value.trim();
    const nombre = document.getElementById('art-nombre')?.value.trim();
    const unidad = document.getElementById('art-unidad')?.value.trim();
    const categoria = document.getElementById('art-categoria')?.value;
    const stockMin = parseInt(document.getElementById('art-stock-min')?.value) || 0;

    if (!codigo || !nombre || !unidad) {
      Toast.advertencia('Complete los campos obligatorios (Código, Nombre, Unidad).');
      return;
    }

    const payload = { codigo, nombre, unidad, categoria, stock_minimo: stockMin };

    try {
      if (id) {
        const { error } = await clienteSupabase.from('inventario_articulos').update(payload).eq('id', id);
        if (error) throw error;
        Toast.exito('Artículo actualizado.');
      } else {
        const { error } = await clienteSupabase.from('inventario_articulos').insert({ ...payload, stock_actual: 0 });
        if (error) throw error;
        Toast.exito('Artículo creado correctamente.');
      }
      document.getElementById('modal-articulo').classList.remove('visible');
      await this._cargarArticulos();
      await this._cargarCatalogo();
      await this._cargarResumen();
    } catch (err) {
      Toast.error('Error al guardar: ' + err.message);
    }
  },

  _generarPDFSalida(carrito, destino) {
    const { jsPDF } = window.jspdf;
    // Formato A5 Landscape (Horizontal): 210 x 148 mm
    const doc = new jsPDF({ format: 'a5', orientation: 'landscape' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CARGO DE ENTREGA DE ÚTILES DE OFICINA", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = meses[hoy.getMonth()];
    const anio = hoy.getFullYear();
    
    const fechaFormat = `CHINCHA, ${dia} de ${mes} del ${anio}`;
    doc.text(fechaFormat, 195, 32, { align: "right" });

    doc.setFont("helvetica", "bold");
    const parrafo = `QUE, LA OFICINA DE LA UNIDAD DE SEGUROS REALIZA LA ENTREGA DE LOS SIGUIENTES UTILES DE ESCRITORIO AL SERVICIO DE ${destino.toUpperCase()}.`;
    const lineas = doc.splitTextToSize(parrafo, 180);
    doc.text(lineas, 15, 45);

    // Dibuja una tabla de artículos
    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(15, 60, 180, 8, "FD");
    
    doc.setFontSize(10);
    doc.text("DESCRIPCIÓN DEL INSUMO", 18, 65);
    doc.text("CANTIDAD", 170, 65, { align: "center" });

    doc.setFont("helvetica", "normal");
    
    let y = 68;
    for (const item of carrito) {
      doc.rect(15, y, 180, 8);
      const nombreCorto = item.nombre.length > 80 ? item.nombre.substring(0, 77) + "..." : item.nombre;
      doc.text(nombreCorto, 18, y + 5);
      doc.text(`${item.cantidad} ${item.unidad}`, 170, y + 5, { align: "center" });
      y += 8;
    }

    // Firmas
    let yFirma = 115;
    if (y > 90) yFirma = y + 25; 

    if (yFirma < 140) {
      doc.setFontSize(10);
      doc.line(75, yFirma, 135, yFirma);
      doc.setFont("helvetica", "bold");
      doc.text("Recibí conforme", 105, yFirma + 5, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.text("Nombre: ________________________", 15, yFirma + 15);
      doc.text("DNI: ________________________", 105, yFirma + 15);
      doc.text("Firma: ", 15, yFirma + 25);
    }

    doc.save(`Cargo_Entrega_${hoy.getTime()}.pdf`);
  },

  async _cargarCatalogoInicial() {
    const insumos = [
      { codigo: "ART-001", nombre: "Archivador de cartón con palanca lomo ancho tamaño oficio", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 5, activo: true },
      { codigo: "ART-002", nombre: "Archivador de palanca lomo angosto", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 5, activo: true },
      { codigo: "ART-003", nombre: "Archivador plastificado de palanca lomo ancho tamaño 1/2 oficio", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 5, activo: true },
      { codigo: "ART-004", nombre: "Bandeja de acrílico para escritorio de 2 pisos", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 5, activo: true },
      { codigo: "ART-005", nombre: "Bolígrafo tinta gel borrable azul", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 10, activo: true },
      { codigo: "ART-006", nombre: "Bolígrafo tinta líquida azul", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 10, activo: true },
      { codigo: "ART-007", nombre: "Bolígrafo tinta líquida negro", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 10, activo: true },
      { codigo: "ART-008", nombre: "Bolígrafo tinta líquida rojo", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 10, activo: true },
      { codigo: "ART-009", nombre: "Bolígrafo tinta seca azul", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 10, activo: true },
      { codigo: "ART-010", nombre: "Bolígrafo tinta seca negro", categoria: "Útiles de Oficina", unidad: "Unidad", stock_actual: 0, stock_minimo: 10, activo: true }
    ];

    try {
      const { data: existentes } = await clienteSupabase.from('inventario_articulos').select('codigo');
      const codigosExistentes = existentes ? existentes.map(e => e.codigo) : [];
      
      const nuevosInsumos = insumos.filter(insumo => !codigosExistentes.includes(insumo.codigo));

      if (nuevosInsumos.length === 0) {
        Toast.info('El catálogo inicial ya se encuentra cargado.');
        return;
      }

      Toast.info(`Cargando ${nuevosInsumos.length} artículos iniciales...`);
      const { error } = await clienteSupabase.from('inventario_articulos').insert(nuevosInsumos);
      if (error) throw error;

      Toast.exito('Catálogo inicial cargado con éxito.');
      await this._cargarArticulos();
      await this._cargarCatalogo();
      await this._cargarResumen();
    } catch (err) {
      console.error(err);
      Toast.error('Error al cargar catálogo: ' + err.message);
    }
  },

  _vincularEventos(contenedor) {
    const tabs = contenedor.querySelectorAll('.inventario-tab');
    const contents = contenedor.querySelectorAll('.inventario-tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('activo'));
        contents.forEach(c => c.classList.remove('activo'));
        tab.classList.add('activo');
        contenedor.querySelector(`#${tab.dataset.tab}`).classList.add('activo');
      });
    });

    document.getElementById('btn-agregar-carrito')?.addEventListener('click', () => this._agregarAlCarrito());
    document.getElementById('btn-procesar-salida')?.addEventListener('click', () => this._procesarSalidaCarrito());
    
    document.getElementById('btn-registrar-entrada')?.addEventListener('click', () => this._registrarEntrada());
    document.getElementById('btn-filtrar-kardex')?.addEventListener('click', () => this._cargarKardex());
    document.getElementById('btn-cargar-inicial')?.addEventListener('click', () => this._cargarCatalogoInicial());

    document.getElementById('btn-nuevo-articulo')?.addEventListener('click', () => {
      document.getElementById('art-id').value = '';
      document.getElementById('art-codigo').value = '';
      document.getElementById('art-nombre').value = '';
      document.getElementById('art-unidad').value = '';
      document.getElementById('art-stock-min').value = '5';
      document.getElementById('modal-art-titulo').textContent = 'Nuevo Artículo';
      document.getElementById('modal-articulo').classList.add('visible');
    });

    const cerrarModal = () => document.getElementById('modal-articulo').classList.remove('visible');
    document.getElementById('btn-cerrar-art')?.addEventListener('click', cerrarModal);
    document.getElementById('btn-cancelar-art')?.addEventListener('click', cerrarModal);
    document.getElementById('btn-guardar-art')?.addEventListener('click', () => this._guardarArticulo());
    document.getElementById('modal-articulo')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) cerrarModal();
    });
  }
};
