const TemplateLoader = {
  _cache: {},
  _version: '3.0',

  async cargar(nombre) {
    if (this._cache[nombre]) return this._cache[nombre];

    try {
      const resp = await fetch(`pages/${nombre}.html?v=${Date.now()}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();

      // Parsear como documento HTML completo para que el navegador
      // estructure correctamente incluso con scripts inyectados
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // Extraer solo el body (los partials no tienen <html>/<body> propios)
      let html = doc.body.innerHTML;

      // Eliminar cualquier script o comentario residual que haya quedado
      html = html.replace(/<script[\s\S]*?<\/script>\s*/gi, '');
      html = html.replace(/<!--[\s\S]*?-->\s*/g, '');

      this._cache[nombre] = html;
      return html;
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

