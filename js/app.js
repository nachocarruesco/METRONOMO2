/*
--------------------------------------------------
APP PRINCIPAL

Responsabilidad:

1. Leer parámetros de URL.
2. Mostrar información de depuración.
3. Más adelante cargará:
   - configuraciones
   - presets
   - compases
--------------------------------------------------
*/

document.addEventListener("DOMContentLoaded", init);

/*
--------------------------------------------------
Punto de entrada principal
--------------------------------------------------
*/

function init() {

    logInfo("Aplicación iniciada");

    const params = new URLSearchParams(window.location.search);

    const config = params.get("config");
    const preset = params.get("preset");

    logInfo(`Parámetro config recibido`);

    if (config) {
        logOk(config);
    } else {
        logError("No se recibió parámetro config");
    }

    logInfo(`Parámetro preset recibido`);

    if (preset) {
        logOk(preset);
    } else {
        logError("No se recibió parámetro preset");
    }

    logInfo("Fin de la fase 1");
}
