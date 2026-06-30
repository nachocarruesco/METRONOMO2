/*
==================================================
APP.JS
==================================================

Responsabilidad:

- Leer la URL.
- Cargar todos los JSON.
- Construir runtimeConfig.
- Pedir la secuencia al sequencer.
- Dibujar el estado inicial.

NO reproduce audio.

NO lleva el tiempo.

NO conoce el scheduler.

Cuando termina este archivo existe un único
objeto global:

window.runtimeConfig

A partir de ese momento el resto de módulos
trabajan únicamente con él.

==================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    init
);

/*
==================================================
CONFIGURACIÓN GLOBAL
==================================================
*/

window.runtimeConfig = {};

/*
==================================================
INICIALIZACIÓN
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

        logOk(`Familia: ${family}`);
        logOk(`Preset: ${presetName}`);

        /*
        ==========================================
        FAMILIAS
        ==========================================
        */

        logSection("FAMILIA");

        const familias =
            await loadJson(
                "./config/familias.json"
            );

        const familyConfig =
            familias[family];

        if (!familyConfig) {

            logError(
                `No existe la familia ${family}`
            );

            return;

        }

        logOk(
            familyConfig.nombre
        );

        /*
        ==========================================
        CONFIGURACIÓN
        ==========================================
        */

        logSection("CONFIG");

        const config =
            await loadJson(
                familyConfig.default
            );

        logOk(
            "Configuración cargada"
        );

        /*
        ==========================================
        PRESET
        ==========================================
        */

        logSection("PRESET");

        const preset =
            await loadJson(
                `${familyConfig.presets}${presetName}.json`
            );

        logOk(
            preset.name
        );

        /*
        ==========================================
        COMPÁS
        ==========================================
        */

        logSection("COMPÁS");

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
                `Compás inexistente: ${preset.compas}`
            );

            return;

        }

        logOk(
            compas.nombre
        );

        /*
        ==========================================
        CREAR RUNTIME
        ==========================================
        */

        window.runtimeConfig = {

            family,

            familyConfig,

            config,

            preset,

            compas

        };

            /*
        ==========================================
        GENERAR SECUENCIA
        ==========================================

        A partir del runtime, el secuenciador
        construye la representación completa del
        compás.

        Cada paso contendrá:

        - número de step
        - etiqueta visual
        - métrica (K/L)
        - eventos musicales

        ==========================================
        */

        window.runtimeConfig.sequenceResolved =
            buildSequence(
                window.runtimeConfig
            );

        /*
        ==========================================
        DIBUJO INICIAL
        ==========================================

        El canvas dibuja el compás completo.

        El metrónomo permanece PARADO.

        El scheduler todavía NO se inicia.

        Será controls.js quien llame a:

            startScheduler()

        cuando el usuario pulse START.

        ==========================================
        */

        drawCompas();

        /*
        ==========================================
        RUNTIME
        ==========================================
        */

        logSection("RUNTIME");

        logOk(
            "Runtime creado"
        );

        console.log(
            window.runtimeConfig
        );

        logOk(
            "Fase de carga completada"

        );

    }

    catch (error) {

        console.error(
            error
        );

        logError(
            error.message
        );

    }

}

/*
==================================================
CARGADOR GENÉRICO DE JSON
==================================================

Todos los módulos utilizan esta función para
leer archivos JSON.

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
