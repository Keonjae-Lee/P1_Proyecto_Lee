/*
======================================
catalogo.js
Carga productos desde JSON local (data/datos.json)
- Filtro por categoría
- Búsqueda en tiempo real
- Ordenamiento (precio, calificación, nombre)
- Agregar, editar y eliminar productos personalizados
  (persistidos en localStorage, funcionando como "JSON local")
- Modal de detalle de producto
======================================
*/

const URL_JSON_LOCAL = "data/datos.json";
const CLAVE_PRODUCTOS_CUSTOM = "ecuaconect_productos_nuevos";

// Variables globales
let productosOriginales = [];
let productosCustom = [];
let productosFiltrados = [];
let idProductoEnEdicion = null; // guarda el id del producto que se está editando

// Elementos del DOM
const listaProductos = document.getElementById("listaProductos");
const estadoCarga = document.getElementById("estadoCarga");
const estadoError = document.getElementById("estadoError");
const contadorProductos = document.getElementById("contadorProductos");
const badgesFiltro = document.querySelectorAll("#filtrosCategoria .filter-badge");
const inputBusqueda = document.getElementById("busquedaProducto");
const selectOrdenamiento = document.getElementById("ordenamiento");

// Elementos del modal de detalle
const modalDetalle = document.getElementById("modalDetalleProducto");
const modalDetalleBootstrap = modalDetalle ? new bootstrap.Modal(modalDetalle) : null;
const modalDetalleTitulo = document.getElementById("modalDetalleTitulo");
const modalDetalleImagen = document.getElementById("modalDetalleImagen");
const modalDetalleDescripcion = document.getElementById("modalDetalleDescripcion");
const modalDetalleJSON = document.getElementById("modalDetalleJSON");

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarProductosLocal();
    activarBotonesDestacados();
    configurarEventosBusquedaOrdenamiento();
    configurarModalAgregarProducto();
});

// ========== Cargar JSON Local ==========
async function cargarProductosLocal() {
    mostrarCarga();

    try {
        const respuesta = await fetch(URL_JSON_LOCAL);

        if (!respuesta.ok) {
            console.warn(`Advertencia: No se pudo cargar JSON (${respuesta.status}). Usando productos vacíos.`);
            productosOriginales = [];
        } else {
            const datos = await respuesta.json();
            productosOriginales = datos.productos || [];
            console.log(`✓ JSON cargado: ${productosOriginales.length} productos`);
        }

        // Agregar los productos personalizados guardados en localStorage
        cargarProductosCustom();
        filtrarYOrdenar();
    } catch (error) {
        console.error("Error cargando JSON local:", error);
        mostrarError(error);
    }
}

// ========== Cargar Productos Personalizados desde localStorage ==========
function cargarProductosCustom() {
    const datos = localStorage.getItem(CLAVE_PRODUCTOS_CUSTOM);
    productosCustom = datos ? JSON.parse(datos) : [];
    productosOriginales = [...productosOriginales, ...productosCustom];
}

function guardarProductosCustomEnStorage() {
    localStorage.setItem(CLAVE_PRODUCTOS_CUSTOM, JSON.stringify(productosCustom));
}

// ========== Modal Agregar / Editar Producto ==========
function configurarModalAgregarProducto() {
    const btnAgregarProducto = document.getElementById("btnAgregarProducto");
    const modalAgregar = document.getElementById("modalAgregarProducto");
    const formAgregar = document.getElementById("formAgregarProducto");

    if (btnAgregarProducto && modalAgregar && formAgregar) {
        const modalBootstrap = new bootstrap.Modal(modalAgregar);

        btnAgregarProducto.addEventListener("click", () => {
            idProductoEnEdicion = null; // modo "agregar", no edición
            formAgregar.reset();
            actualizarTituloModal(false);
            modalBootstrap.show();
        });

        formAgregar.addEventListener("submit", guardarProducto);
    }
}

function actualizarTituloModal(esEdicion) {
    const titulo = document.querySelector("#modalAgregarProducto .modal-title");
    const btnGuardar = document.querySelector("#modalAgregarProducto .modal-footer .btn:not(.btn-secondary)");
    if (titulo) {
        titulo.innerHTML = esEdicion
            ? `<i class="fa-solid fa-pen me-2"></i> Editar producto`
            : `<i class="fa-solid fa-plus me-2"></i> Agregar producto`;
    }
    if (btnGuardar) {
        btnGuardar.innerHTML = esEdicion
            ? `<i class="fa-solid fa-save me-1"></i> Guardar cambios`
            : `<i class="fa-solid fa-save me-1"></i> Guardar producto`;
    }
}

// Se ejecuta tanto para "Agregar" como para "Editar" (idProductoEnEdicion decide cuál)
function guardarProducto(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombreProducto")?.value.trim() || "";
    const descripcion = document.getElementById("descripcionProducto")?.value.trim() || "";
    const categoria = document.getElementById("categoriaProducto")?.value || "";
    const precio = parseFloat(document.getElementById("precioProducto")?.value || 0);
    const imagen = document.getElementById("imagenProducto")?.value.trim() || "https://via.placeholder.com/200?text=Sin+imagen";
    const stock = parseInt(document.getElementById("stockProducto")?.value || 1);

    // Validación de formulario
    if (!nombre || !descripcion || !categoria || isNaN(precio) || precio <= 0 || isNaN(stock) || stock <= 0) {
        Swal.fire({
            icon: "error",
            title: "Faltan datos",
            text: "Por favor completa todos los campos correctamente.",
            confirmButtonColor: "#f39c12"
        });
        return;
    }

    if (idProductoEnEdicion !== null) {
        // ---- MODO EDICIÓN ----
        const indiceCustom = productosCustom.findIndex(p => p.id === idProductoEnEdicion);
        if (indiceCustom === -1) {
            Swal.fire({ icon: "error", title: "Error", text: "No se encontró el producto a editar." });
            return;
        }

        productosCustom[indiceCustom] = {
            ...productosCustom[indiceCustom],
            nombre, descripcion, categoria, precio, imagen, stock
        };
        guardarProductosCustomEnStorage();

        // Reflejar el cambio también en productosOriginales
        const indiceOriginal = productosOriginales.findIndex(p => p.id === idProductoEnEdicion);
        if (indiceOriginal !== -1) productosOriginales[indiceOriginal] = productosCustom[indiceCustom];

        Swal.fire({
            icon: "success",
            title: "¡Producto actualizado!",
            text: `Los cambios en "${nombre}" se guardaron correctamente.`,
            toast: true, position: "top-end", timer: 3000, timerProgressBar: true, showConfirmButton: false
        });

    } else {
        // ---- MODO AGREGAR ----
        const productoNuevo = {
            id: Date.now(),
            nombre, descripcion, categoria, precio,
            calificacion: 5,
            resenas: 0,
            stock,
            region: "Personalizado",
            imagen,
            vendedor_id: 999,
            esCustom: true
        };

        productosCustom.push(productoNuevo);
        guardarProductosCustomEnStorage();
        productosOriginales.push(productoNuevo);

        Swal.fire({
            icon: "success",
            title: "¡Producto agregado!",
            text: `"${nombre}" ha sido agregado al catálogo.`,
            toast: true, position: "top-end", timer: 3000, timerProgressBar: true, showConfirmButton: false
        });
    }

    idProductoEnEdicion = null;
    bootstrap.Modal.getInstance(document.getElementById("modalAgregarProducto")).hide();
    filtrarYOrdenar();
}

// Abre el modal ya precargado con los datos del producto a editar
function abrirModalEdicion(producto) {
    idProductoEnEdicion = producto.id;

    document.getElementById("nombreProducto").value = producto.nombre;
    document.getElementById("descripcionProducto").value = producto.descripcion;
    document.getElementById("categoriaProducto").value = producto.categoria;
    document.getElementById("precioProducto").value = producto.precio;
    document.getElementById("stockProducto").value = producto.stock;
    document.getElementById("imagenProducto").value = producto.imagen;

    actualizarTituloModal(true);

    const modalAgregar = document.getElementById("modalAgregarProducto");
    bootstrap.Modal.getOrCreateInstance(modalAgregar).show();
}

// Elimina un producto personalizado (con confirmación previa)
function eliminarProducto(id) {
    const producto = productosCustom.find(p => p.id === id);
    if (!producto) return;

    Swal.fire({
        icon: "warning",
        title: "¿Eliminar producto?",
        text: `Se eliminará "${producto.nombre}" permanentemente.`,
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d"
    }).then((resultado) => {
        if (resultado.isConfirmed) {
            productosCustom = productosCustom.filter(p => p.id !== id);
            guardarProductosCustomEnStorage();
            productosOriginales = productosOriginales.filter(p => p.id !== id);

            Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: `"${producto.nombre}" fue eliminado del catálogo.`,
                toast: true, position: "top-end", timer: 2500, timerProgressBar: true, showConfirmButton: false
            });

            filtrarYOrdenar();
        }
    });
}

// ========== Búsqueda en tiempo real + Ordenamiento ==========
function configurarEventosBusquedaOrdenamiento() {
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", () => {
            filtrarYOrdenar();
        });
    }

    if (selectOrdenamiento) {
        selectOrdenamiento.addEventListener("change", () => {
            filtrarYOrdenar();
        });
    }
}

function filtrarYOrdenar() {
    const categoriaActiva = document.querySelector(".active-filter")?.dataset.categoria || "todos";
    const terminoBusqueda = inputBusqueda?.value?.toLowerCase().trim() || "";
    const ordenamiento = selectOrdenamiento?.value || "relevancia";

    let productos = productosOriginales;

    // Filtrar por categoría
    if (categoriaActiva !== "todos") {
        productos = productos.filter(p => mapearCategoriaProducto(p.categoria) === categoriaActiva);
    }

    // Filtrar por búsqueda (nombre y descripción)
    if (terminoBusqueda) {
        productos = productos.filter(p =>
            p.nombre.toLowerCase().includes(terminoBusqueda) ||
            p.descripcion.toLowerCase().includes(terminoBusqueda)
        );
    }

    // Ordenar (incluye precio mayor→menor y menor→mayor)
    productos = ordenarProductos(productos, ordenamiento);

    productosFiltrados = productos;
    pintarProductos(productos);
}

function mapearCategoriaProducto(categoria) {
    const mapa = {
        "ceramica": "home-decoration",
        "tejido": "womens-dresses",
        "madera": "furniture",
        "metal": "mens-watches"
    };
    return mapa[categoria] || categoria;
}

function ordenarProductos(productos, criterio) {
    const copia = [...productos];

    switch (criterio) {
        case "precio-asc":
            return copia.sort((a, b) => a.precio - b.precio);
        case "precio-desc":
            return copia.sort((a, b) => b.precio - a.precio);
        case "calificacion-desc":
            return copia.sort((a, b) => b.calificacion - a.calificacion);
        case "calificacion-asc":
            return copia.sort((a, b) => a.calificacion - b.calificacion);
        case "nombre-asc":
            return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
        case "nombre-desc":
            return copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
        default:
            return copia;
    }
}

// ========== Filtros por Categoría ==========
badgesFiltro.forEach((badge) => {
    badge.addEventListener("click", () => {
        if (inputBusqueda) inputBusqueda.value = "";
        if (selectOrdenamiento) selectOrdenamiento.value = "relevancia";

        badgesFiltro.forEach((b) => b.classList.remove("active-filter"));
        badge.classList.add("active-filter");

        filtrarYOrdenar();
    });
});

// ========== Pintar Productos ==========
function pintarProductos(productos) {
    listaProductos.innerHTML = "";

    if (!productos || productos.length === 0) {
        listaProductos.innerHTML = `<p class="text-center text-muted my-3"><i class="fa-solid fa-magnifying-glass me-2"></i>No se encontraron productos.</p>`;
        contadorProductos.textContent = "0 producto(s)";
        ocultarCarga();
        return;
    }

    productos.forEach((producto) => {
        const fila = document.createElement("div");
        fila.className = "catalogo-fieldset";

        const estrellas = generarEstrellas(producto.calificacion);
        const badgeCustom = producto.esCustom ? '<span class="badge bg-info ms-2">Nuevo</span>' : '';

        // Botones extra de editar/eliminar solo para productos personalizados
        const botonesEdicion = producto.esCustom ? `
            <button class="btn btn-sm btn-outline-primary btn-editar-producto" data-id="${producto.id}" title="Editar">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-eliminar-producto" data-id="${producto.id}" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
            </button>
        ` : "";

        fila.innerHTML = `
            <div>
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/200?text=Imagen+no+disponible'">
                <div class="info">
                    <p class="nombre">${producto.nombre} ${badgeCustom}</p>
                    <p class="vendedor"><i class="fa-solid fa-tag"></i> ${producto.categoria} • ${producto.region}</p>
                    <p class="calificacion">${estrellas} ${producto.calificacion} (${producto.resenas} reseña${producto.resenas !== 1 ? 's' : ''})</p>
                </div>
                <div class="precio-col">
                    <p>$${producto.precio.toFixed(2)}</p>
                    <div class="d-flex gap-1 justify-content-end flex-wrap">
                        <button class="btn-ver-detalle" data-id="${producto.id}">Ver más</button>
                        <button class="btn btn-sm btn-outline-dark btn-agregar-producto"
                            data-id="${producto.id}"
                            data-nombre="${producto.nombre}"
                            data-precio="${producto.precio}"
                            data-vendedor="${producto.categoria}"
                            data-imagen="${producto.imagen}">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                        ${botonesEdicion}
                    </div>
                </div>
            </div>
        `;

        listaProductos.appendChild(fila);
    });

    contadorProductos.textContent = `${productos.length} producto(s)`;
    ocultarCarga();
    activarBotonesDetalle();
    activarBotonesEdicionEliminacion();
}

function generarEstrellas(calificacion) {
    let estrellas = "★".repeat(Math.floor(calificacion));
    if (calificacion % 1 !== 0) estrellas += "";
    estrellas += "☆".repeat(5 - Math.ceil(calificacion));
    return estrellas;
}

// ========== Botones de Ver Detalle / Agregar al carrito ==========
function activarBotonesDetalle() {
    document.querySelectorAll(".btn-ver-detalle").forEach((boton) => {
        boton.addEventListener("click", (evento) => {
            evento.preventDefault();
            const id = parseInt(boton.dataset.id);
            const producto = productosOriginales.find(p => p.id === id);
            if (producto) mostrarDetalleProducto(producto);
        });
    });

    document.querySelectorAll(".btn-agregar-producto").forEach((boton) => {
        boton.addEventListener("click", () => {
            agregarAlCarrito({
                id: boton.dataset.id,
                nombre: boton.dataset.nombre,
                precio: parseFloat(boton.dataset.precio),
                vendedor: boton.dataset.vendedor,
                imagen: boton.dataset.imagen,
            });

            Swal.fire({
                icon: "success",
                title: "¡Agregado al carrito!",
                text: `${boton.dataset.nombre} ha sido agregado exitosamente.`,
                toast: true, position: "top-end", showConfirmButton: false, timer: 2000, timerProgressBar: true
            });
        });
    });
}

// ========== Botones de Editar / Eliminar (solo productos personalizados) ==========
function activarBotonesEdicionEliminacion() {
    document.querySelectorAll(".btn-editar-producto").forEach((boton) => {
        boton.addEventListener("click", () => {
            const id = parseInt(boton.dataset.id);
            const producto = productosCustom.find(p => p.id === id);
            if (producto) abrirModalEdicion(producto);
        });
    });

    document.querySelectorAll(".btn-eliminar-producto").forEach((boton) => {
        boton.addEventListener("click", () => {
            const id = parseInt(boton.dataset.id);
            eliminarProducto(id);
        });
    });
}

// Mostrar detalle de producto
function mostrarDetalleProducto(producto) {
    if (!modalDetalleBootstrap) return;

    modalDetalleTitulo.innerHTML = `<i class="fa-solid fa-circle-info me-2"></i> ${producto.nombre}`;
    modalDetalleImagen.src = producto.imagen;
    modalDetalleImagen.alt = producto.nombre;
    modalDetalleDescripcion.textContent = producto.descripcion;
    modalDetalleJSON.textContent = JSON.stringify(producto, null, 2);

    modalDetalleBootstrap.show();
}

// ========== Helpers de estado de carga / error ==========
function mostrarCarga() {
    if (estadoCarga) estadoCarga.classList.remove("d-none");
    if (estadoError) estadoError.classList.add("d-none");
    if (listaProductos) listaProductos.innerHTML = "";
}

function ocultarCarga() {
    if (estadoCarga) estadoCarga.classList.add("d-none");
}



// Los productos destacados son fijos (no vienen del JSON)
function activarBotonesDestacados() {
    document.querySelectorAll(".btn-agregar-destacado").forEach((boton) => {
        boton.addEventListener("click", () => {
            agregarAlCarrito({
                id: boton.dataset.id,
                nombre: boton.dataset.nombre,
                precio: parseFloat(boton.dataset.precio),
                vendedor: boton.dataset.vendedor,
                imagen: boton.dataset.imagen,
            });

            Swal.fire({
                icon: "success",
                title: "¡Agregado al carrito!",
                text: `${boton.dataset.nombre} ha sido agregado exitosamente.`,
                toast: true, position: "top-end", showConfirmButton: false, timer: 2000, timerProgressBar: true
            });
        });
    });
}
