/*
======================================
registro.js
Manejo del formulario de registro
- Validación JavaScript
- Almacenamiento en localStorage
- Notificaciones con SweetAlert2
======================================
*/

const CLAVE_USUARIOS = "ecuaconect_usuarios";

// Obtener lista de usuarios registrados
function obtenerUsuarios() {
    const datos = localStorage.getItem(CLAVE_USUARIOS);
    return datos ? JSON.parse(datos) : [];
}

// Guardar usuario en localStorage
function guardarUsuario(usuario) {
    const usuarios = obtenerUsuarios();
    
    // Verificar si el email ya existe
    if (usuarios.some(u => u.email === usuario.email)) {
        return { exito: false, mensaje: "Este correo electrónico ya está registrado" };
    }

    // Generar ID único
    usuario.id = Date.now();
    usuario.fechaRegistro = new Date().toISOString();
    
    usuarios.push(usuario);
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    
    return { exito: true, mensaje: "Usuario registrado exitosamente", usuario: usuario };
}

// Verificar si un usuario existe
function usuarioExiste(email) {
    const usuarios = obtenerUsuarios();
    return usuarios.some(u => u.email === email);
}

// Autenticar usuario
function autenticarUsuario(email, password) {
    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        // Guardar en sesión
        sessionStorage.setItem("usuarioActual", JSON.stringify({
            id: usuario.id,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.email
        }));
        return { exito: true, usuario: usuario };
    }
    
    return { exito: false, mensaje: "Correo o contraseña incorrectos" };
}

// Obtener usuario actual de sesión
function obtenerUsuarioActual() {
    const datos = sessionStorage.getItem("usuarioActual");
    return datos ? JSON.parse(datos) : null;
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector("form");
    
    if (formulario && formulario.action.includes("inicioSesion.html")) {
        // Este es el formulario de registro (acción apunta a inicioSesion.html)
        formulario.addEventListener("submit", manejarRegistro);
    }
});

// Manejar envío del formulario de registro
function manejarRegistro(evento) {
    evento.preventDefault();

    const formulario = evento.target;
    limpiarErroresFormulario(formulario);

    // Obtener datos del formulario
    const datos = {
        nombres: document.getElementById("nombres")?.value || "",
        apellidos: document.getElementById("apellidos")?.value || "",
        cedula: document.getElementById("cedula")?.value || "",
        fecha: document.getElementById("fecha")?.value || "",
        genero: document.getElementById("genero")?.value || "",
        email: document.getElementById("email")?.value || "",
        password: document.getElementById("password")?.value || "",
        passwordConfirm: document.getElementById("passwordConfirm")?.value || "",
        terminos: document.getElementById("terminos")?.checked || false
    };

    // Validar
    const errores = validarFormularioRegistro(datos);

    if (errores.length > 0) {
        // Mostrar errores
        errores.forEach(error => {
            Swal.fire({
                icon: "error",
                title: "Error en el formulario",
                text: error,
                confirmButtonColor: "#f39c12"
            });
        });

        // Marcar campos específicos con error
        if (errores.some(e => e.includes("nombres"))) {
            marcarCampoError(document.getElementById("nombres"), "Los nombres son requeridos");
        }
        if (errores.some(e => e.includes("apellidos"))) {
            marcarCampoError(document.getElementById("apellidos"), "Los apellidos son requeridos");
        }
        if (errores.some(e => e.includes("cedula"))) {
            marcarCampoError(document.getElementById("cedula"), "Cédula inválida");
        }
        if (errores.some(e => e.includes("email"))) {
            marcarCampoError(document.getElementById("email"), "Email inválido");
        }
        if (errores.some(e => e.includes("contraseña"))) {
            marcarCampoError(document.getElementById("password"), "Contraseña inválida");
        }

        return false;
    }

    // Guardar usuario
    const resultado = guardarUsuario({
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        cedula: datos.cedula,
        fecha: datos.fecha,
        genero: datos.genero,
        email: datos.email,
        password: datos.password
    });

    if (resultado.exito) {
        Swal.fire({
            icon: "success",
            title: "¡Registro exitoso!",
            text: "Tu cuenta ha sido creada. Serás redirigido para iniciar sesión.",
            confirmButtonColor: "#f39c12",
            allowOutsideClick: false
        }).then(() => {
            setTimeout(() => {
                window.location.href = "inicioSesion.html";
            }, 1500);
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: resultado.mensaje,
            confirmButtonColor: "#f39c12"
        });
    }
}
