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
        CONSTRUIR RUNTIME

        Desde este momento el resto del
        proyecto ya no vuelve a leer JSON.

        Todos los módulos trabajarán
        únicamente con runtimeConfig.

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

        El secuenciador transforma el preset
        en una lista completa de pasos.

        El resultado ya no depende de JSON.

        El scheduler utilizará esta secuencia
        continuamente.

        ==========================================
        */

        logSection("SECUENCIA");

        window.runtimeConfig.sequenceResolved =
            buildSequence(
                window.runtimeConfig
            );

        /*
        ==========================================
        MOSTRAR SECUENCIA

        Solo para depuración.

        Cuando el proyecto esté terminado
        este bloque podrá eliminarse sin que
        afecte al funcionamiento.

        ==========================================
        */

        window.runtimeConfig.sequenceResolved.forEach(

            (step) => {

                logInfo("--------------------------------");

                logInfo(
                    `Paso: ${step.step}`
                );

                logInfo(
                    `Etiqueta: ${step.label ?? "-"}`
                );

                logInfo(
                    `Métrica: ${step.metric}`
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

                    step.events.forEach(

                        (event) => {

                            logInfo(

                                `Tipo: ${event.type}   Acento: ${event.accent}`

                            );

                        }

                    );

                }

            }

        );

        logOk(
            "Secuencia generada"
        );

        /*
        ==========================================
        DIBUJO INICIAL

        El canvas únicamente representa el
        estado actual.

        Más adelante será el scheduler quien
        lo actualice continuamente.

        ==========================================
        */

        drawCompas();

        /*
        ==========================================
        ARRANCAR EL SCHEDULER

        A partir de aquí el control deja de
        pertenecer a app.js.

        app.js termina su trabajo.

        El scheduler será el dueño del reloj
        del metrónomo.

        ==========================================
        */

        logSection("▶️ INICIANDO SCHEDULER");

        const bpm = window.runtimeConfig.config.bpm.default || 120;

        startScheduler({
            sequence: window.runtimeConfig.sequenceResolved,
            bpm: bpm,
            callbacks: {
                onStep: function(stepIndex, stepData, lap) {
                    // Aquí irá Canvas.setCurrentStep(stepIndex)
                    // Por ahora, solo logger
                },
                onLapComplete: function(lapCount) {
                    // Aquí irá actualizar el contador de vueltas
                }
            }
        });

        logOk("✅ Scheduler iniciado automáticamente");

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
