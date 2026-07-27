/*
======================================
carrito-pagina.js
Lógica exclusiva de carrito.html: pinta los productos guardados
en localStorage, actualiza cantidades y precios en tiempo real,
y maneja la confirmación de eliminar y de pagar.
Depende de las funciones definidas en carrito.js.
======================================
*/

const listaCarrito = document.getElementById("listaCarrito");
const carritoVacio = document.getElementById("carritoVacio");
const resumenPedido = document.getElementById("resumenPedido");
const alertaEnvioGratis = document.getElementById("alertaEnvioGratis");
const mensajeEnvioGratis = document.getElementById("mensajeEnvioGratis");

const labelSubtotal = document.getElementById("labelSubtotal");
const valorSubtotal = document.getElementById("valorSubtotal");
const valorDescuento = document.getElementById("valorDescuento");
const valorEnvio = document.getElementById("valorEnvio");
const valorTotal = document.getElementById("valorTotal");
const valorTotalModalPago = document.getElementById("valorTotalModalPago");
const btnPagar = document.getElementById("btnPagar");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
const btnConfirmarPago = document.getElementById("btnConfirmarPago");

const ENVIO_GRATIS_DESDE = 80;
const COSTO_ENVIO = 5;
const PORCENTAJE_DESCUENTO = 0.10; // cupón ECUA10

// Guarda temporalmente el id del producto que se quiere eliminar
let idAEliminar = null;

document.addEventListener("DOMContentLoaded", pintarCarrito);

function pintarCarrito() {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "";
        carritoVacio.classList.remove("d-none");
        resumenPedido.classList.add("d-none");
        alertaEnvioGratis.classList.add("d-none");
        return;
    }

    carritoVacio.classList.add("d-none");
    resumenPedido.classList.remove("d-none");
    alertaEnvioGratis.classList.remove("d-none");

    listaCarrito.innerHTML = "";

    carrito.forEach((item) => {
        const fila = document.createElement("div");
        fila.className = "carrito-item";
        fila.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}">
            <div class="info">
                <p class="nombre">${item.nombre}</p>
                <p class="vendedor">${item.vendedor || ""}</p>
                <p class="precio">$${item.precio.toFixed(2)}</p>
            </div>
            <div class="cantidad">
                <button class="btn-cantidad btn-restar" data-id="${item.id}">−</button>
                <p>${item.cantidad}</p>
                <button class="btn-cantidad btn-sumar" data-id="${item.id}">+</button>
            </div>
            <button class="btn-eliminar" data-bs-toggle="modal" data-bs-target="#modalEliminar" data-id="${item.id}">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        listaCarrito.appendChild(fila);
    });

    activarBotonesCantidad();
    activarBotonesEliminar();
    actualizarResumen();
}

function activarBotonesCantidad() {
    document.querySelectorAll(".btn-sumar").forEach((boton) => {
        boton.addEventListener("click", () => cambiarCantidad(boton.dataset.id, 1));
    });
    document.querySelectorAll(".btn-restar").forEach((boton) => {
        boton.addEventListener("click", () => cambiarCantidad(boton.dataset.id, -1));
    });
}

function activarBotonesEliminar() {
    document.querySelectorAll(".btn-eliminar").forEach((boton) => {
        boton.addEventListener("click", () => {
            idAEliminar = boton.dataset.id;
        });
    });
}

// Se confirma la eliminación desde el modal
btnConfirmarEliminar.addEventListener("click", () => {
    if (!idAEliminar) return;
    eliminarDelCarrito(idAEliminar);
    mostrarAlerta("Producto eliminado del carrito.", "info");
    idAEliminar = null;
});

function actualizarResumen() {
    const subtotal = calcularSubtotal();
    const descuento = subtotal * PORCENTAJE_DESCUENTO;
    const envio = subtotal >= ENVIO_GRATIS_DESDE || subtotal === 0 ? 0 : COSTO_ENVIO;
    const total = subtotal - descuento + envio;
    const cantidadTotal = calcularCantidadTotal();

    labelSubtotal.textContent = `Subtotal (${cantidadTotal} producto${cantidadTotal === 1 ? "" : "s"})`;
    valorSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    valorDescuento.textContent = `-$${descuento.toFixed(2)}`;
    valorEnvio.textContent = envio === 0 ? "Gratis" : `$${envio.toFixed(2)}`;
    valorTotal.textContent = `$${total.toFixed(2)}`;
    valorTotalModalPago.textContent = `$${total.toFixed(2)}`;

    if (envio === 0) {
        mensajeEnvioGratis.innerHTML = `¡Tu pedido tiene <strong>envío gratis</strong>! 🎉`;
    } else {
        const faltante = (ENVIO_GRATIS_DESDE - subtotal).toFixed(2);
        mensajeEnvioGratis.innerHTML = `¡Envío gratis en compras mayores a <strong>$${ENVIO_GRATIS_DESDE}</strong>! Te faltan <strong>$${faltante}</strong>.`;
    }

    // Si el carrito está vacío no tiene sentido dejar pagar
    btnPagar.disabled = cantidadTotal === 0;
}

// Se confirma el pago desde el modal de pago
btnConfirmarPago.addEventListener("click", () => {
    if (obtenerCarrito().length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Carrito vacío",
            text: "Tu carrito está vacío, agrega productos antes de pagar.",
            confirmButtonColor: "#f39c12"
        });
        return;
    }

    const total = (calcularSubtotal() * (1 - PORCENTAJE_DESCUENTO) + (calcularSubtotal() >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO)).toFixed(2);

    Swal.fire({
        icon: "success",
        title: "¡Compra realizada!",
        html: `<p>Gracias por apoyar a nuestros artesanos.</p><p class="text-muted">Total pagado: <strong>$${total}</strong></p>`,
        confirmButtonColor: "#f39c12"
    }).then(() => {
        vaciarCarrito();
    });
});
