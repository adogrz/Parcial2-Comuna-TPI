// Robust include that works with http(s) and file:// (fallback to window.__HEADER__/__FOOTER__)
async function injectPartials() {
  const useFetch = location.protocol === "http:" || location.protocol === "https:";
  const spots = document.querySelectorAll("[data-include]");
  for (const el of spots) {
    const file = el.getAttribute("data-include");
    if (useFetch) {
      try {
        const res = await fetch(file, { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        el.innerHTML = await res.text();
      } catch (err) {
        console.error(`No se pudo cargar ${file}:`, err);
        // fallback to inlined templates if available
        if (typeof window.__HEADER__ === "string" && /header/i.test(file)) {
          el.innerHTML = window.__HEADER__;
        } else if (typeof window.__FOOTER__ === "string" && /footer/i.test(file)) {
          el.innerHTML = window.__FOOTER__;
        } else {
          el.innerHTML = `<div style="padding:1rem;background:#fee;border:1px solid #f99;color:#900">
            Error cargando <strong>${file}</strong>. Si abriste con file:// usa el fallback (partials.js) o inicia un servidor local.
          </div>`;
        }
      }
    } else {
      // file:// fallback
      if (typeof window.__HEADER__ === "string" && /header/i.test(file)) {
        el.innerHTML = window.__HEADER__;
      } else if (typeof window.__FOOTER__ === "string" && /footer/i.test(file)) {
        el.innerHTML = window.__FOOTER__;
      } else {
        el.innerHTML = `<!-- ${file} no soportado en file:// -->`;
      }
    }
  }
}
document.addEventListener("DOMContentLoaded", injectPartials);
