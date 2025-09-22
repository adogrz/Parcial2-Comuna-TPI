const tbody = document.getElementById('tbody');
const totalEl = document.getElementById('total');
const btnVaciar = document.getElementById('vaciar');

function getCart(){ return JSON.parse(localStorage.getItem('cart') || '[]'); }
function setCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }

function render(){
  const cart = getCart();
  if (!Array.isArray(cart) || cart.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">Carrito vacío</td></tr>';
    totalEl.textContent = '0.00';
    return;
  }

  let total = 0;
  tbody.innerHTML = cart.map(item => {
    const precio = Number(item.precio) || 0;
    const qty = Math.max(1, Number(item.qty) || 1);
    const sub = precio * qty;
    total += sub;

    return `<tr>
      <td>${item.nombre}</td>
      <td>$${precio.toFixed(2)}</td>
      <td>
        <button data-id="${String(item.id)}" data-action="dec" aria-label="Disminuir">-</button>
        ${qty}
        <button data-id="${String(item.id)}" data-action="inc" aria-label="Aumentar">+</button>
      </td>
      <td>$${sub.toFixed(2)}</td>
      <td><button data-id="${String(item.id)}" data-action="del" aria-label="Eliminar">Eliminar</button></td>
    </tr>`;
  }).join('');

  totalEl.textContent = total.toFixed(2);
}

tbody.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;

  const id = String(btn.dataset.id);     // mantener como STRING
  const action = btn.dataset.action;
  const cart = getCart();
  const idx = cart.findIndex(i => String(i.id) === id);
  if (idx < 0) return;

  if (action === 'inc') {
    cart[idx].qty = Math.max(1, Number(cart[idx].qty || 0) + 1);
  } else if (action === 'dec') {
    cart[idx].qty = Math.max(1, Number(cart[idx].qty || 1) - 1);
  } else if (action === 'del') {
    cart.splice(idx, 1);
  }

  setCart(cart);
  render();
});

if (btnVaciar){
  btnVaciar.addEventListener('click', ()=>{
    if (confirm('¿Vaciar carrito?')) { setCart([]); render(); }
  });
}

render();
