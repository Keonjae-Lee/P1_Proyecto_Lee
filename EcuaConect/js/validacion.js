/*
======================================
validacion.js
Validación de formularios con JavaScript
- Validación de email
- Validación de contraseña
- Validación de cédula
- Validación de campos obligatorios
======================================
*/

// Validar formato de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar contraseña (8-16 caracteres, letras, números y caracteres especiales)
function validarContrasena(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,16}$/;
    return regex.test(password);
}

// Validar cédula ecuatoriana (10 dígitos)
function validarCedula(cedula) {
    const regex = /^\d{10}$/;
    return regex.test(cedula);
}

// Validar que no esté vacío
function validarRequerido(campo) {
    return campo.trim().length > 0;
}

// Validar que las contraseñas coincidan
function validarContrasenasCoinc(password1, password2) {
    return password1 === password2;
}

// Validar edad mínima (mayor de 18 años)
function validarEdad(fechaNacimiento) {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age >= 18;
}

// Función general para validar formulario de registro
function validarFormularioRegistro(datos) {
    const errores = [];

    // Validar nombres
    if (!validarRequerido(datos.nombres)) {
        errores.push("Los nombres son requeridos");
    }

    // Validar apellidos
    if (!validarRequerido(datos.apellidos)) {
        errores.push("Los apellidos son requeridos");
    }

    // Validar cédula
    if (!validarRequerido(datos.cedula)) {
        errores.push("La cédula es requerida");
    } else if (!validarCedula(datos.cedula)) {
        errores.push("La cédula debe contener 10 dígitos");
    }

    // Validar fecha de nacimiento
    if (!validarRequerido(datos.fecha)) {
        errores.push("La fecha de nacimiento es requerida");
    } else if (!validarEdad(datos.fecha)) {
        errores.push("Debes ser mayor de 18 años para registrarte");
    }

    // Validar género
    if (!validarRequerido(datos.genero)) {
        errores.push("El género es requerido");
    }

    // Validar email
    if (!validarRequerido(datos.email)) {
        errores.push("El correo electrónico es requerido");
    } else if (!validarEmail(datos.email)) {
        errores.push("El correo electrónico no es válido");
    }

    // Validar contraseña
    if (!validarRequerido(datos.password)) {
        errores.push("La contraseña es requerida");
    } else if (!validarContrasena(datos.password)) {
        errores.push("La contraseña debe tener entre 8-16 caracteres, letras, números y caracteres especiales (@$!%*?&.#_-)");
    }

    // Validar confirmación de contraseña
    if (!validarRequerido(datos.passwordConfirm)) {
        errores.push("Debe confirmar la contraseña");
    } else if (!validarContrasenasCoinc(datos.password, datos.passwordConfirm)) {
        errores.push("Las contraseñas no coinciden");
    }

    // Validar términos
    if (!datos.terminos) {
        errores.push("Debes aceptar los términos y condiciones");
    }

    return errores;
}

// Función general para validar formulario de login
function validarFormularioLogin(datos) {
    const errores = [];

    if (!validarRequerido(datos.email)) {
        errores.push("El correo electrónico es requerido");
    } else if (!validarEmail(datos.email)) {
        errores.push("El correo electrónico no es válido");
    }

    if (!validarRequerido(datos.password)) {
        errores.push("La contraseña es requerida");
    }

    return errores;
}

// Marcar campo con error visualmente
function marcarCampoError(elemento, mensaje) {
    elemento.classList.add("is-invalid");
    let feedback = elemento.nextElementSibling;
    if (!feedback || !feedback.classList.contains("invalid-feedback")) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback d-block";
        elemento.parentNode.insertBefore(feedback, elemento.nextSibling);
    }
    feedback.textContent = mensaje;
}

// Limpiar marcas de error de un campo
function limpiarCampoError(elemento) {
    elemento.classList.remove("is-invalid");
    const feedback = elemento.nextElementSibling;
    if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.remove();
    }
}

// Limpiar todos los errores de un formulario
function limpiarErroresFormulario(formulario) {
    formulario.querySelectorAll(".is-invalid").forEach(campo => {
        limpiarCampoError(campo);
    });
}
