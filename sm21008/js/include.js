(async () => {
  const h = await fetch('header.html').then(r=>r.text()).catch(()=> '');
  const f = await fetch('footer.html').then(r=>r.text()).catch(()=> '');
  document.querySelector('#__header').innerHTML = h;
  document.querySelector('#__footer').innerHTML = f;
})();
