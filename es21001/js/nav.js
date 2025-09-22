// js/nav.js
document.addEventListener('DOMContentLoaded', function () {
  fetch('nav.html?_=' + Date.now())
    .then(r => {
      if (!r.ok) throw new Error('No se pudo cargar nav.html');
      return r.text();
    })
    .then(html => {
      const ph = document.getElementById('nav-placeholder');
      if (ph) ph.innerHTML = html;
    })
    .catch(err => console.error(err));
});
