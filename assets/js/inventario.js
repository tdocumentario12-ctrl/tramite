/* ============================================
   SISTEMA SIS — Gestión de Inventario
   ============================================ */

const Inventario = {
  _perfil: null,

  async renderizar(contenedor, perfil) {
    this._perfil = perfil;

    contenedor.innerHTML = `
      <div class="inventario-container">
        <!-- Cabecera -->
        <div class="inventario-cabecera">
          <div class="cabecera-info-inventario">
            <h2>Control de Inventario</h2>
            <div class="inventario-subtitulo">Administre el almacén, registre entradas y controle las salidas de insumos.</div>
          </div>
        </div>

        <!-- Pestañas (Tabs) -->
        <div class="inventario-tabs">
          <button class="inventario-tab activo" data-tab="tab-resumen">Resumen</button>
          <button class="inventario-tab" data-tab="tab-descontar">Descontar (Salidas)</button>
          <button class="inventario-tab" data-tab="tab-ingresar">Ingresar (Entradas)</button>
          <button class="inventario-tab" data-tab="tab-catalogo">Catálogo</button>
          <button class="inventario-tab" data-tab="tab-kardex">Kardex</button>
        </div>

        <!-- Contenido: Resumen -->
        <div class="inventario-tab-content activo" id="tab-resumen">
          <div style="padding: 40px; text-align: center; color: var(--color-texto-secundario);">
            <h3>Dashboard de Inventario</h3>
            <p>Aquí se mostrarán los gráficos de consumo y alertas de stock bajo.</p>
          </div>
        </div>

        <!-- Contenido: Descontar (Salidas) -->
        <div class="inventario-tab-content" id="tab-descontar">
          <div class="inventario-form-panel">
            <h3>Registrar Salida de Insumo</h3>
            <form id="form-salida-inventario" onsubmit="event.preventDefault();">
              <div class="inventario-form-grid">
                <div class="campo-grupo">
                  <label class="campo-label">Artículo a Descontar</label>
                  <select class="campo-input">
                    <option value="">Seleccione un artículo...</option>
                    <option value="1">Paracetamol 500mg (Caja)</option>
                    <option value="2">Jeringas 5ml (Unidad)</option>
                    <option value="3">Gasa Estéril (Paquete)</option>
                  </select>
                </div>
                <div class="campo-grupo">
                  <label class="campo-label">Cantidad</label>
                  <input type="number" class="campo-input" min="1" placeholder="Ej. 5">
                </div>
                <div class="campo-grupo">
                  <label class="campo-label">Área Destino</label>
                  <select class="campo-input">
                    <option value="">Seleccione el área...</option>
                    <option value="1">Pediatría</option>
                    <option value="2">Emergencia</option>
                  </select>
                </div>
                <div class="campo-grupo">
                  <label class="campo-label">Motivo</label>
                  <input type="text" class="campo-input" placeholder="Ej. Consumo diario">
                </div>
              </div>
              <div style="text-align: right; margin-top: 20px;">
                <button type="submit" class="btn-primario">Registrar Salida</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Contenido: Ingresar (Entradas) -->
        <div class="inventario-tab-content" id="tab-ingresar">
          <div style="padding: 40px; text-align: center; color: var(--color-texto-secundario);">
            <h3>Formulario de Ingreso</h3>
            <p>Aquí se registrará la recepción de nuevos insumos de proveedores.</p>
          </div>
        </div>

        <!-- Contenido: Catálogo -->
        <div class="inventario-tab-content" id="tab-catalogo">
          <div style="padding: 40px; text-align: center; color: var(--color-texto-secundario);">
            <h3>Catálogo de Artículos</h3>
            <p>Lista CRUD de productos con definición de stock mínimo, presentación, etc.</p>
          </div>
        </div>

        <!-- Contenido: Kardex -->
        <div class="inventario-tab-content" id="tab-kardex">
          <div style="padding: 40px; text-align: center; color: var(--color-texto-secundario);">
            <h3>Historial de Movimientos (Kardex)</h3>
            <p>Tabla detallada de todas las entradas y salidas del almacén.</p>
          </div>
        </div>

      </div>
    `;

    this._vincularEventos(contenedor);
  },

  _vincularEventos(contenedor) {
    // Lógica de pestañas
    const tabs = contenedor.querySelectorAll('.inventario-tab');
    const contents = contenedor.querySelectorAll('.inventario-tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remover activo de todos
        tabs.forEach(t => t.classList.remove('activo'));
        contents.forEach(c => c.classList.remove('activo'));

        // Activar el seleccionado
        tab.classList.add('activo');
        const targetId = tab.getAttribute('data-tab');
        contenedor.querySelector(`#${targetId}`).classList.add('activo');
      });
    });
  }
};
