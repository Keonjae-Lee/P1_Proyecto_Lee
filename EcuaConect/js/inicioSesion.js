/*
======================================
inicioSesion.js
Manejo del formulario de login
- Validación JavaScript
- Autenticación con localStorage
- Notificaciones con SweetAlert2
======================================
*/

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector("form.auth-form");
    
    if (formulario) {
        // Cambiar el comportamiento del formulario
        formulario.addEventListener("submit", manejarLogin);
    }
});

function manejarLogin(evento) {
    evento.preventDefault();

    const formulario = evento.target;
    limpiarErroresFormulario(formulario);

    // Obtener datos
    const email = document.getElementById("email")?.value || "";
    const password = document.getElementById("password")?.value || "";

    const datos = { email, password };

    // Validar
    const errores = validarFormularioLogin(datos);

    if (errores.length > 0) {
        errores.forEach(error => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error,
                confirmButtonColor: "#f39c12"
            });
        });
        return false;
    }

    // Mostrar indicador de carga
    Swal.fire({
        title: "Iniciando sesión...",
        html: '<i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #f39c12;"></i>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Simular validación (sin backend real)
    setTimeout(() => {
        try {
            // Intentar autenticar
            if (typeof autenticarUsuario !== "function") {
                throw new Error("No se pudo cargar el módulo de autenticación.");
            }

            const resultado = autenticarUsuario(email, password);

            if (resultado.exito) {
                Swal.fire({
                    icon: "success",
                    title: "¡Bienvenido!",
                    text: `Hola ${resultado.usuario.nombres}, tu sesión ha sido iniciada.`,
                    confirmButtonColor: "#f39c12",
                    allowOutsideClick: false
                }).then(() => {
                    window.location.href = "principal.html";
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error de autenticación",
                    text: resultado.mensaje || "Correo o contraseña incorrectos",
                    confirmButtonColor: "#f39c12"
                });
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: "Ocurrió un problema al iniciar sesión. Intenta de nuevo.",
                confirmButtonColor: "#f39c12"
            });
        }
    }, 1500);
}

// Función para cerrar sesión
function cerrarSesion() {
    sessionStorage.removeItem("usuarioActual");
    window.location.href = "inicioSesion.html";
}

// Actualizar interfaz si hay usuario logueado
function actualizarInterfazUsuario() {
    const usuario = obtenerUsuarioActual();
    
    if (usuario && typeof actualizarNavbar === "function") {
        actualizarNavbar(usuario);
    }
}

document.addEventListener("DOMContentLoaded", actualizarInterfazUsuario);
