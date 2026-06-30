/*
==================================================
APP.JS
==================================================

Este módulo únicamente prepara el motor.

Responsabilidades:

1. Leer los parámetros de la URL.
2. Cargar todos los JSON.
3. Construir runtimeConfig.
4. Pedir al secuenciador la secuencia.
5. Arrancar el scheduler.

NO reproduce audio.

NO dibuja.

NO conoce tiempos.

Toda la lógica temporal pertenece al scheduler.

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

Todos los módulos accederán a este objeto.

scheduler.js
audio.js
canvas.js

==================================================
*/

window.runtimeConfig = {};

async function init() {

    logSection("INICIO");

    logInfo("Aplicación iniciada");

    try {

        /*
        ==========================================
        PARÁMETROS URL
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
            `Familia: ${family}`
        );

        logOk(
            `Preset: ${presetName}`
        );

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
*/

window.runtimeConfig.sequenceResolved =
    buildSequence(window.runtimeConfig);

/*
==========================================
DIBUJO INICIAL

Se dibuja el compás completo pero el
metrónomo permanece parado.

El scheduler NO se inicia aquí.

Será controls.js quien decida cuándo
arrancar o detener el reloj.

==========================================
*/

drawCompas();

/*
==========================================
RUNTIME
==========================================
*/

logSection("RUNTIME");

logOk("Runtime creado");

console.log(window.runtimeConfig);

logOk("Fase de carga completada");  

/*
==================================================
CARGADOR GENÉRICO DE JSON
==================================================

Lee un archivo JSON y devuelve un objeto.

Todos los módulos utilizan esta función.

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

// ✅ FIN DEL ARCHIVO - NADA MÁS DESPUÉS DE AQUÍ
