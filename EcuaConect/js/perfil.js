/*
======================================
perfil.js
Gestiona el perfil del usuario
- Carga datos del usuario autenticado
- Permite editar perfil
- Guarda cambios en localStorage
- Opción de cargar usuario aleatorio de API
======================================
*/

const URL_USUARIOS_API = "https://dummyjson.com/users";

// Elementos del DOM
const fotoPerfil = document.getElementById("fotoPerfil");
const nombreCompleto = document.getElementById("nombreCompleto");
const emailPerfil = document.getElementById("emailPerfil");
const campoNombres = document.getElementById("campoNombres");
const campoApellidos = document.getElementById("campoApellidos");
const campoFechaNacimiento = document.getElementById("campoFechaNacimiento");
const campoGenero = document.getElementById("campoGenero");
const campoTelefono = document.getElementById("campoTelefono");

const estadoCargaPerfil = document.getElementById("estadoCargaPerfil");
const estadoErrorPerfil = document.getElementById("estadoErrorPerfil");
const btnActualizarPerfil = document.getElementById("btnActualizarPerfil");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

// Elementos del modal de edición
const editNombres = document.getElementById("editNombres");
const editApellidos = document.getElementById("editApellidos");
const editTelefono = document.getElementById("editTelefono");
const editEmail = document.getElementById("editEmail");
const btnGuardarCambios = document.getElementById("btnGuardarCambios");

// Variable global para almacenar el perfil actual
let perfilActual = null;

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarPerfilUsuario();
    configurarEventosEdicion();
});

// ========== Cargar Perfil ==========
function cargarPerfilUsuario() {
    const usuario = obtenerUsuarioActual();
    
    if (usuario) {
        // Mostrar datos del usuario logueado desde localStorage
        perfilActual = usuario;
        mostrarPerfilLocal(usuario);
    } else {
        // Si no hay usuario logueado, mostrar usuario por defecto (como antes)
        mostrarModoAnonimo();
    }
}

// Mostrar perfil del usuario logueado
function mostrarPerfilLocal(usuario) {
    nombreCompleto.textContent = `${usuario.nombres} ${usuario.apellidos}`;
    emailPerfil.textContent = usuario.email;
    
    campoNombres.textContent = usuario.nombres;
    campoApellidos.textContent = usuario.apellidos;
    campoTelefono.textContent = usuario.telefono || "No registrado";
    campoGenero.textContent = usuario.genero || "No especificado";
    
    // Generar foto por defecto
    fotoPerfil.src = generarFotoPerfilDefecto(usuario.nombres);
}

// Si no hay usuario logueado
function mostrarModoAnonimo() {
    perfilActual = {
        nombres: "Usuario",
        apellidos: "Anónimo",
        email: "visitante@ecuaconect.com",
        telefono: "0987654321",
        genero: "No especificado"
    };
    
    mostrarPerfilLocal(perfilActual);
}

// Generar una foto de perfil por defecto (Avatar)
function generarFotoPerfilDefecto(nombre) {
    const inicial = nombre.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=f39c12&color=ffffff&bold=true&size=100`;
}

// ========== Edición de Perfil ==========
function configurarEventosEdicion() {
    btnGuardarCambios.addEventListener("click", guardarCambiosPerfil);
    
    // Abrir modal y cargar datos
    const modalEditar = document.getElementById("modalEditar");
    if (modalEditar) {
        modalEditar.addEventListener("show.bs.modal", cargarDatosEnModal);
    }
    
    // Cerrar sesión
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    }

    // Botón para cargar usuario aleatorio de API (opcional)
    if (btnActualizarPerfil) {
        btnActualizarPerfil.addEventListener("click", cargarUsuarioAleatorio);
    }
}

// Cargar datos actuales en los inputs del modal
function cargarDatosEnModal() {
    if (perfilActual) {
        editNombres.value = perfilActual.nombres || "";
        editApellidos.value = perfilActual.apellidos || "";
        editTelefono.value = perfilActual.telefono || "";
        editEmail.value = perfilActual.email || "";
    }
}

// Guardar cambios del perfil
function guardarCambiosPerfil() {
    // Validar que los campos no estén vacíos
    if (!editNombres.value.trim() || !editApellidos.value.trim() || !editEmail.value.trim()) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Los campos nombres, apellidos y email son obligatorios",
            confirmButtonColor: "#f39c12"
        });
        return;
    }

    // Validar email
    if (!validarEmail(editEmail.value)) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "El email no es válido",
            confirmButtonColor: "#f39c12"
        });
        return;
    }

    // Actualizar perfil local
    perfilActual.nombres = editNombres.value;
    perfilActual.apellidos = editApellidos.value;
    perfilActual.telefono = editTelefono.value;
    perfilActual.email = editEmail.value;

    // Guardar en localStorage/sessionStorage
    sessionStorage.setItem("usuarioActual", JSON.stringify(perfilActual));

    // Si estaba registrado, actualizar en usuarios
    const usuarios = obtenerUsuarios();
    const indiceUsuario = usuarios.findIndex(u => u.email === perfilActual.email);
    if (indiceUsuario !== -1) {
        usuarios[indiceUsuario] = perfilActual;
        localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    }

    // Actualizar pantalla
    mostrarPerfilLocal(perfilActual);
    fotoPerfil.src = generarFotoPerfilDefecto(perfilActual.nombres);

    // Cerrar modal
    const modalEditar = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
    if (modalEditar) modalEditar.hide();

    // Mostrar notificación
    Swal.fire({
        icon: "success",
        title: "¡Perfil actualizado!",
        text: "Tus cambios han sido guardados exitosamente",
        confirmButtonColor: "#f39c12",
        toast: true,
        position: "top-end",
        timer: 3000,
        timerProgressBar: true
    });
}

// ========== Cerrar Sesión ==========
function cerrarSesion() {
    Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Se perderá la sesión actual",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#f39c12"
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem("usuarioActual");
            
            Swal.fire({
                icon: "success",
                title: "Sesión cerrada",
                text: "Serás redirigido al inicio de sesión",
                confirmButtonColor: "#f39c12",
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                window.location.href = "inicioSesion.html";
            });
        }
    });
}

// ========== Funcionalidad de Cargar Usuario Aleatorio (Opcional) ==========
async function cargarUsuarioAleatorio() {
    mostrarCargaPerfil();

    try {
        const idAleatorio = Math.floor(Math.random() * 100) + 1;
        const respuesta = await fetch(`${URL_USUARIOS_API}/${idAleatorio}`);

        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }

        const usuarioAPI = await respuesta.json();

        // Crear objeto compatible con nuestro sistema
        perfilActual = {
            nombres: usuarioAPI.firstName,
            apellidos: usuarioAPI.lastName,
            email: usuarioAPI.email,
            telefono: usuarioAPI.phone,
            genero: usuarioAPI.gender === "male" ? "Masculino" : "Femenino",
            fechaNacimiento: usuarioAPI.birthDate
        };

        mostrarPerfilLocal(perfilActual);
        fotoPerfil.src = usuarioAPI.image || generarFotoPerfilDefecto(usuarioAPI.firstName);

        ocultarCargaPerfil();
    } catch (error) {
        mostrarErrorPerfil(error);
        console.error("Error cargando usuario de API:", error);
    }
}

// ========== Helpers ==========
function mostrarCargaPerfil() {
    estadoCargaPerfil.classList.remove("d-none");
    estadoErrorPerfil.classList.add("d-none");
}

function ocultarCargaPerfil() {
    estadoCargaPerfil.classList.add("d-none");
}

function mostrarErrorPerfil(error) {
    ocultarCargaPerfil();
    estadoErrorPerfil.classList.remove("d-none");
    estadoErrorPerfil.textContent = "No se pudieron cargar los datos. Intenta de nuevo.";
    console.error("Error:", error);
}

