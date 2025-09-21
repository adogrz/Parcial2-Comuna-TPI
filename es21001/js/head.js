// head.js
document.addEventListener("DOMContentLoaded", function () {
  fetch("head.html")
    .then(response => response.text())
    .then(data => {
      const head = document.head;
      const temp = document.createElement("div");
      temp.innerHTML = data;

      // Inserta cada hijo del fragmento en el <head>
      Array.from(temp.children).forEach(el => head.appendChild(el));
    });
});

