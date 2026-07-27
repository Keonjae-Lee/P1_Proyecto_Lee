/*
======================================
carrito.js
Módulo compartido del carrito de compras.
Se incluye en catalogo.html, producto.html y carrito.html.

Guarda el carrito en localStorage (mismo patrón usado en otras
prácticas del curso) para que persista entre páginas sin backend.
======================================
*/

const CLAVE_CARRITO = "ecuaconect_carrito";

// ---------- Lectura y escritura en localStorage ----------

function obtenerCarrito() {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    actualizarBadgeCarrito();
}

// ---------- Operaciones del carrito ----------

// producto = { id, nombre, precio, imagen, vendedor }
function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();
    const existente = carrito.find((item) => item.id === producto.id);

    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarCarrito(carrito);
    mostrarAlerta(`"${producto.nombre}" se agregó al carrito.`, "success");
}

function cambiarCantidad(id, delta) {
    let carrito = obtenerCarrito();
    const item = carrito.find((p) => p.id === id);
    if (!item) return;

    item.cantidad += delta;
    if (item.cantidad <= 0) {
        carrito = carrito.filter((p) => p.id !== id);
    }

    guardarCarrito(carrito);
    if (typeof pintarCarrito === "function") pintarCarrito();
}

function eliminarDelCarrito(id) {
    const carrito = obtenerCarrito().filter((p) => p.id !== id);
    guardarCarrito(carrito);
    if (typeof pintarCarrito === "function") pintarCarrito();
}

function vaciarCarrito() {
    guardarCarrito([]);
    if (typeof pintarCarrito === "function") pintarCarrito();
}

function calcularSubtotal() {
    return obtenerCarrito().reduce((total, item) => total + item.precio * item.cantidad, 0);
}

function calcularCantidadTotal() {
    return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
}

// ---------- Badge del carrito en la navbar ----------

function actualizarBadgeCarrito() {
    const cantidad = calcularCantidadTotal();
    document.querySelectorAll(".badge-carrito-contador").forEach((badge) => {
        badge.textContent = cantidad;
    });
}

// ---------- Alertas Bootstrap dinámicas ----------

// tipo: "success" | "danger" | "info" | "warning"
function mostrarAlerta(mensaje, tipo = "success") {
    const contenedor = document.getElementById("contenedorAlertas");
    
    // Usar SweetAlert2 si está disponible
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: tipo === "danger" ? "error" : tipo,
            title: tipo === "success" ? "¡Éxito!" : tipo === "danger" ? "Error" : "Información",
            text: mensaje,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            confirmButtonColor: "#f39c12"
        });
    } else if (contenedor) {
        // Fallback a alertas Bootstrap
        const iconos = {
            success: "fa-circle-check",
            danger: "fa-circle-exclamation",
            info: "fa-circle-info",
            warning: "fa-triangle-exclamation",
        };

        const alerta = document.createElement("div");
        alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
        alerta.setAttribute("role", "alert");
        alerta.innerHTML = `
            <i class="fa-solid ${iconos[tipo] || iconos.info} me-2"></i>${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        `;

        contenedor.prepend(alerta);

        setTimeout(() => {
            bootstrap.Alert.getOrCreateInstance(alerta).close();
        }, 4000);
    }
}

document.addEventListener("DOMContentLoaded", actualizarBadgeCarrito);
