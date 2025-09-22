document.addEventListener("DOMContentLoaded", () => {
  const includeElements = document.querySelectorAll("[data-include]");
  includeElements.forEach(async (el) => {
    const file = el.getAttribute("data-include");
    try {
      const resp = await fetch(file);
      if (!resp.ok) throw new Error(`Error al cargar ${file}`);
      const html = await resp.text();
      el.innerHTML = html;
    } catch (err) {
      el.innerHTML = `<p style="color:red">No se pudo cargar ${file}</p>`;
      console.error(err);
    }
  });
});
