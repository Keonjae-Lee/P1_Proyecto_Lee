/*
======================================
producto.js
Conecta los botones "Agregar al carrito" y "Comprar ahora" de la
página de detalle de producto (producto.html) con el carrito
compartido (carrito.js).
======================================
*/

// Datos del producto que se muestra en esta página (Poncho Azul)
const PRODUCTO_ACTUAL = {
    id: "poncho-azul",
    nombre: "Poncho Azul",
    precio: 30,
    vendedor: "Doña Emily · Quitumbe",
    imagen: "https://www.pimkay.com/wp-content/uploads/2022/02/Capa-de-Macana-Azul-1.jpg",
};

const btnAgregarCarritoProducto = document.getElementById("btnAgregarCarritoProducto");
const btnComprarAhora = document.getElementById("btnComprarAhora");

btnAgregarCarritoProducto.addEventListener("click", () => {
    agregarAlCarrito(PRODUCTO_ACTUAL);
});

btnComprarAhora.addEventListener("click", () => {
    agregarAlCarrito(PRODUCTO_ACTUAL);
    mostrarAlerta("Producto agregado. Te llevamos a tu carrito para finalizar la compra...", "info");

    setTimeout(() => {
        window.location.href = "carrito.html";
    }, 1200);
});
