document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('link[data-app-style]')) return;

  const candidates = [
    'css/styles/styles.css', // tu ubicación actual
    'css/styles.css',
    '/css/styles/styles.css',
    '/css/styles.css'
  ];

  (function tryNext(i){
    if (i >= candidates.length) return console.error('No se pudo cargar styles.css');
    const href = candidates[i] + '?v=' + Date.now();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-app-style','styles');
    link.onload = () => console.log('CSS cargado:', href);
    link.onerror = () => { link.remove(); tryNext(i+1); };
    document.head.appendChild(link);
  })(0);
});

