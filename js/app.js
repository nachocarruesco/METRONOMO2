/*
--------------------------------------------------
APP PRINCIPAL

Responsabilidades:

1. Leer parámetros URL.
2. Cargar configuración.
3. Cargar preset.
4. Cargar compás.
5. Construir runtimeConfig.
6. Mostrar información en logger.
--------------------------------------------------
*/

document.addEventListener("DOMContentLoaded", init);

/*
--------------------------------------------------
Objeto global temporal

Aquí guardaremos toda la información ya resuelta.

Más adelante será el objeto que utilizarán:

- secuenciador
- audio
- canvas
--------------------------------------------------
*/

let runtimeConfig = {};

/*
--------------------------------------------------
Punto de entrada principal
--------------------------------------------------
*/

async function init() {

    logInfo("Aplicación iniciada");

    try {

        /*
        ------------------------------------------
        Leer parámetros URL
        ------------------------------------------
        */

        const params = new URLSearchParams(window.location.search);

        const configName = params.get("config");
        const presetName = params.get("preset");

        if (!configName) {
            logError("No se recibió parámetro config");
            return;
        }

        if (!presetName) {
            logError("No se recibió parámetro preset");
            return;
        }

        logOk(`Config solicitada: ${configName}`);
        logOk(`Preset solicitado: ${presetName}`);

        /*
        ------------------------------------------
        Cargar configuración principal
        ------------------------------------------
        */

        const configPath = `./config/${configName}.json`;

        logInfo(`Cargando ${configPath}`);

        const config = await loadJson(configPath);

        logOk("Configuración cargada");

        /*
        ------------------------------------------
        Obtener preset desde sequence

        De momento usamos el primero.

        Más adelante el secuenciador recorrerá
        todos los elementos.
        ------------------------------------------
        */

        const sequenceItem = config.sequence[0];

        const presetPath =
            `./presets/rumba/${sequenceItem.preset}.json`;

        logInfo(`Cargando ${presetPath}`);

        const preset = await loadJson(presetPath);

        logOk("Preset cargado");

        /*
        ------------------------------------------
        Obtener compás asociado al preset
        ------------------------------------------
        */

        const compasId = preset.compas;

        logInfo(`Compás solicitado: ${compasId}`);

        const compases =
            await loadJson("./config/compas.json");

        const compas = compases[compasId];

        if (!compas) {

            logError(
                `No existe el compás ${compasId}`
            );

            return;
        }

        logOk("Compás cargado");

        /*
        ------------------------------------------
        Construcción del runtime

        A partir de este punto el resto de
        módulos NO deberán leer JSON.

        Todos trabajarán contra runtimeConfig.
        ------------------------------------------
        */

        runtimeConfig = {

            config: config,

            preset: preset,

            compas: compas

        };

        /*
        ------------------------------------------
        Mostrar resumen
        ------------------------------------------
        */

        logInfo("----- RESUMEN -----");

        logInfo(
            `Nombre preset: ${preset.name}`
        );

        logInfo(
            `Familia: ${preset.family}`
        );

        logInfo(
            `Compás: ${preset.compas}`
        );

        logInfo(
            `Pulsos: ${compas.pulsos}`
        );

        logInfo(
            `Subdivisiones: ${compas.subdivisiones}`
        );

        logInfo(
            `Subdivisiones por pulso: ${compas.subdivision_por_pulso}`
        );

        logInfo("Marcas encontradas:");

        Object.entries(preset.marks).forEach(
            ([step, sound]) => {

                logInfo(
                    `${step} -> ${sound}`
                );

            }
        );

        logOk("Runtime creado");

        /*
        ------------------------------------------
        Debug completo

        Muy útil mientras desarrollas.
        ------------------------------------------
        */

        console.log(runtimeConfig);

        logOk("Fase 2 completada");

    }
    catch (error) {

        console.error(error);

        logError(
            `Excepción: ${error.message}`
        );

    }
}

/*
--------------------------------------------------
Carga un JSON desde disco

Recibe:
    ruta

Devuelve:
    objeto javascript
--------------------------------------------------
*/

async function loadJson(path) {

    const response = await fetch(path);

    if (!response.ok) {

        throw new Error(
            `Error cargando ${path}`
        );

    }

    return await response.json();
}
