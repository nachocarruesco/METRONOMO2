/*
==================================================
APP PRINCIPAL
==================================================

Este archivo coordina toda la carga inicial.

Su trabajo NO es reproducir audio.

Su trabajo NO es dibujar.

Su trabajo NO es generar secuencias.

Su único trabajo es:

1. Leer parámetros URL.
2. Cargar archivos JSON.
3. Resolver toda la configuración.
4. Construir runtimeConfig.
5. Mostrar información en el logger.

Cuando termina este archivo existe un único
objeto llamado runtimeConfig.

A partir de ese momento el resto de módulos
trabajarán solamente con runtimeConfig.

De esta manera:

Audio
Canvas
Secuenciador

NO necesitan saber dónde están los JSON.

==================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    init
);

/*
==================================================
CONFIGURACIÓN GLOBAL EN MEMORIA
==================================================

Aquí se almacenará toda la información ya
resuelta.

Más adelante lo utilizarán:

- secuenciador
- audio
- dibujo

==================================================
*/

let runtimeConfig = {};

/*
==================================================
FUNCIÓN PRINCIPAL
==================================================

Se ejecuta automáticamente cuando la página
termina de cargarse.

==================================================
*/
async function init() {

    logSection("INICIO");

    logInfo("Aplicación iniciada");

    try {

        /*
        ==========================================
        LEER URL
        ==========================================
        */

        const params =
            new URLSearchParams(
                window.location.search
            );

        const family =
            params.get("family");

        const presetName =
            params.get("preset");

        if (!family) {

            logError(
                "No se recibió parámetro family"
            );

            return;
        }

        if (!presetName) {

            logError(
                "No se recibió parámetro preset"
            );

            return;
        }

        logOk(
            `Familia recibida: ${family}`
        );

        logOk(
            `Preset recibido: ${presetName}`
        );

        /*
        ==========================================
        CARGAR FAMILIAS.JSON
        ==========================================
        */

        logSection("FAMILIA");

        const familiasPath =
            "./config/familias.json";

        logInfo(
            `Cargando ${familiasPath}`
        );

        const familias =
            await loadJson(
                familiasPath
            );

        logOk(
            "Archivo familias cargado"
        );

        /*
        ==========================================
        BUSCAR FAMILIA
        ==========================================
        */

        const familyConfig =
            familias[family];

        if (!familyConfig) {

            logError(
                `No existe la familia ${family}`
            );

            return;
        }

        logOk(
            `Familia encontrada: ${familyConfig.nombre}`
        );

        logInfo(
            `Ruta presets: ${familyConfig.presets}`
        );

        logInfo(
            `Ruta cierres: ${familyConfig.cierres}`
        );

        /*
        ==========================================
        CARGAR CONFIG DEFAULT
        ==========================================
        */

        logSection("CONFIG");

        const configPath =
            familyConfig.default;

        logInfo(
            `Cargando ${configPath}`
        );

        const config =
            await loadJson(
                configPath
            );

        logOk(
            "Configuración cargada"
        );

        /*
        ==========================================
        CARGAR PRESET
        ==========================================
        */

        logSection("PRESET");

        const presetPath =
            `${familyConfig.presets}${presetName}.json`;

        logInfo(
            `Ruta preset: ${presetPath}`
        );

        const preset =
            await loadJson(
                presetPath
            );

        logOk(
            "Preset cargado"
        );

        /*
        ==========================================
        MOSTRAR PRESET
        ==========================================
        */

        logInfo(
            `Nombre: ${preset.name}`
        );

        logInfo(
            `Familia: ${preset.family}`
        );

        logInfo(
            `Compás: ${preset.compas}`
        );

        logInfo(
            "Marcas:"
        );

        Object.entries(
            preset.marks
        ).forEach(

            ([step, sound]) => {

                logInfo(
                    `${step} -> ${sound}`
                );

            }

        );

        /*
        ==========================================
        CARGAR COMPÁS
        ==========================================
        */

        logSection("COMPÁS");

        logInfo(
            "Cargando ./config/compas.json"
        );

        const compases =
            await loadJson(
                "./config/compas.json"
            );

        const compas =
            compases[
                preset.compas
            ];

        if (!compas) {

            logError(
                `No existe el compás ${preset.compas}`
            );

            return;
        }

        logOk(
            `Compás encontrado: ${compas.nombre}`
        );

        logInfo(
            `Pulsos: ${compas.pulsos}`
        );

        logInfo(
            `Subdivisiones: ${compas.subdivisiones}`
        );

        logInfo(
            `Subdivisiones/pulso: ${compas.subdivision_por_pulso}`
        );

        /*
        ==========================================
        CREAR RUNTIME
        ==========================================
        */

        logSection("RUNTIME");

        runtimeConfig = {

            family,

            familyConfig,

            config,

            preset,

            compas

        };
        logSection("SECUENCIA");

        
        const sequenceResolved =
            buildSequence(runtimeConfig);
        
        runtimeConfig.sequenceResolved =
        sequenceResolved;

        console.log(JSON.stringify(step.events, null, 4));

        sequenceResolved.forEach((step) => {

            logInfo("--------------------------------");

            logInfo(
                    `Paso: ${step.step}`
            );

            logInfo(
                `Etiqueta: ${
                    step.label ?? "-"
                }`
            );

            logInfo(
                `Métrica: ${
                    step.metric ?? "-"
                }`
            );

            if (step.events.length === 0) {

                logInfo(
                    "Eventos: ninguno"
                );

        }
                
        else {

            logInfo(
                "Eventos:"
            );

            step.events.forEach((event) => {

                logInfo(
                    `   Tipo: ${event.type}   Acento: ${event.accent}`
                );

            });

        }

    });

        logOk(
            "Runtime creado"
        );

        drawCompas();

        console.log(
            runtimeConfig
        );

        /*
        ==========================================
        RESUMEN
        ==========================================
        */

        logInfo(
            `Instrumento: ${config.audio.instrumento}`
        );

        logInfo(
            `BPM default: ${config.bpm.default}`
        );

        logInfo(
            `Claqueta: ${
                config.claqueta.enabled
                    ? "ON"
                    : "OFF"
            }`
        );

        logInfo(
            `Cierres: ${
                config.cierres.enabled
                    ? "ON"
                    : "OFF"
            }`
        );

        logOk(
            "Fase de carga completada"
        );

    }
    catch (error) {

        console.error(error);

        logError(
            error.message
        );

    }

}

/*
==================================================
CARGADOR GENÉRICO DE JSON
==================================================

Recibe una ruta.

Devuelve un objeto JavaScript.

==================================================
*/

async function loadJson(path) {

    const response =
        await fetch(path);

    if (!response.ok) {

        throw new Error(
            `Error cargando ${path}`
        );

    }

    return await response.json();
}

