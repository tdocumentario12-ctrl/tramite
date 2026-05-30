const TemplateLoader = {
  _cache: {},
  _version: '3.0',

  async cargar(nombre) {
    if (this._cache[nombre]) return this._cache[nombre];

    try {
      const resp = await fetch(`pages/${nombre}.html?v=${Date.now()}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();

      this._cache[nombre] = text;
      return text;
    } catch (err) {
      console.error(`[TemplateLoader] Error al cargar "${nombre}":`, err);
      return '';
    }
  },

  limpiarCache() {
    this._cache = {};
  }
};

console.log(`[TemplateLoader v${TemplateLoader._version}] cargado`);

