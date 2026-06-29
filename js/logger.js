/*
--------------------------------------------------
LOGGER DEL PROYECTO
--------------------------------------------------

Este módulo centraliza todos los mensajes de
depuración.

Ventajas:

- Todo aparece en pantalla.
- Todo aparece en consola.
- Si algo falla sabremos en qué paso.

Más adelante bastará cambiar DEBUG=false
para ocultar el panel.
--------------------------------------------------
*/

const DEBUG = true;

/*
--------------------------------------------------
Añade una línea al panel de log.
--------------------------------------------------
*/

function writeLog(message, type = "INFO") {

    const text = `[${type}] ${message}`;

    console.log(text);

    if (!DEBUG) {
        return;
    }

    const logDiv = document.getElementById("log");

    if (!logDiv) {
        return;
    }

    const line = document.createElement("div");

    line.className = `log-${type.toLowerCase()}`;

    line.textContent = text;

    logDiv.appendChild(line);
}

/*
--------------------------------------------------
Mensajes estándar
--------------------------------------------------
*/

function logInfo(message) {
    writeLog(message, "INFO");
}

function logOk(message) {
    writeLog(message, "OK");
}

function logError(message) {
    writeLog(message, "ERROR");
}

/*
--------------------------------------------------
Muestra una sección visual.

Sirve para separar bloques del log.

Ejemplo:

===== PRESET =====

===== COMPÁS =====

--------------------------------------------------
*/

function logSection(title) {
    writeLog(`===== ${title} =====`, "INFO");
}

/*
--------------------------------------------------
EXPORTAR FUNCIONES GLOBALES
--------------------------------------------------
*/

window.logInfo = logInfo;
window.logOk = logOk;
window.logError = logError;
window.logSection = logSection;
window.writeLog = writeLog;
window.DEBUG = DEBUG;

/*
--------------------------------------------------
INICIALIZACIÓN DEL LOGGER (SOLO ESTO)
--------------------------------------------------
*/

logInfo("📋 Logger cargado correctamente");
