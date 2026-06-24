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
        ------------------------------------------
        LEER PARÁMETROS DE URL
        ------------------------------------------

        Ejemplo:

        player.html?family=rumba&preset=rumba_abierta

        family = rumba
        preset = rumba_abierta

        ------------------------------------------
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

        logOk(`Familia recibida: ${family}`);
        logOk(`Preset recibido: ${presetName}`);

        /*
        ------------------------------------------
        CARGAR CONFIGURACIÓN DE FAMILIA
        ------------------------------------------

        Ejemplo:

        ./config/familias/rumba.json

        Este archivo indica:

        - dónde están los presets
        - qué configuración por defecto usar

        ------------------------------------------
        */

        logSection("FAMILIA");

        const familyPath =
            `./config/familias/${family}.json`;

        logInfo(
            `Cargando ${familyPath}`
        );

        const familyConfig =
            await loadJson(familyPath);

        logOk("Familia cargada");

        /*
        ------------------------------------------
        OBTENER CONFIGURACIÓN POR DEFECTO
        ------------------------------------------
        */

        const defaultConfigName =
            familyConfig.defaultConfig;

        logInfo(
            "Configuración por defecto encontrada"
        );

        logOk(defaultConfigName);

        /*
        ------------------------------------------
        CARGAR CONFIGURACIÓN DEFAULT
        ------------------------------------------
        */

        const defaultConfigPath =
            `./config/defaults/${defaultConfigName}.json`;

        logInfo(
            `Cargando ${defaultConfigPath}`
        );

        const config =
            await loadJson(
                defaultConfigPath
            );

        logOk(
            "Configuración cargada"
        );

        /*
        ------------------------------------------
        CONSTRUIR RUTA DEL PRESET
        ------------------------------------------

        NO está escrita a mano.

        Se genera automáticamente usando
        la familia recibida.

        ------------------------------------------
        */

        logSection("PRESET");

        const presetPath =
            `./presets/${family}/${presetName}.json`;

        logInfo(
            "Ruta de preset generada"
        );

        logOk(presetPath);

        /*
        ------------------------------------------
        CARGAR PRESET
        ------------------------------------------
        */

        logInfo(
            `Cargando preset`
        );

        const preset =
            await loadJson(
                presetPath
            );

        logOk(
            "Preset cargado"
        );

        /*
        ------------------------------------------
        MOSTRAR DATOS DEL PRESET
        ------------------------------------------
        */

        logInfo("Nombre");
        logOk(preset.name);

        logInfo("Familia");
        logOk(preset.family);

        logInfo("Compás");
        logOk(preset.compas);

        logInfo("Marcas");

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
        ------------------------------------------
        CARGAR ARCHIVO DE COMPASES
        ------------------------------------------
        */

        logSection("COMPÁS");

        logInfo(
            "Cargando compas.json"
        );

        const compases =
            await loadJson(
                "./config/compas.json"
            );

        const compas =
            compases[preset.compas];

        if (!compas) {

            logError(
                `No existe el compás ${preset.compas}`
            );

            return;
        }

        logOk(
            `Compás encontrado: ${preset.compas}`
        );

        /*
        ------------------------------------------
        MOSTRAR DATOS DEL COMPÁS
        ------------------------------------------
        */

        logInfo("Pulsos");
        logOk(compas.pulsos);

        logInfo("Subdivisiones");
        logOk(compas.subdivisiones);

        logInfo(
            "Subdivisiones por pulso"
        );

        logOk(
            compas.subdivision_por_pulso
        );

        /*
        ------------------------------------------
        CONSTRUIR RUNTIME GLOBAL
        ------------------------------------------

        A partir de aquí:

        secuenciador.js
        audio.js
        canvas.js

        usarán runtimeConfig.

        Ya no tendrán que leer JSON.

        ------------------------------------------
        */

        runtimeConfig = {

            family: family,

            familyConfig: familyConfig,

            config: config,

            preset: preset,

            compas: compas

        };

        /*
        ------------------------------------------
        RESUMEN FINAL
        ------------------------------------------
        */

        logSection("RUNTIME");

        logInfo("Configuración");
        logOk(config.name);

        logInfo("Preset");
        logOk(preset.name);

        logInfo("Compás");
        logOk(compas.nombre);

        logInfo("Instrumento");
        logOk(
            config.audio.instrumento
        );

        logInfo("Claqueta");

        logOk(
            config.claqueta.enabled
                ? "Activada"
                : "Desactivada"
        );

        logInfo("Cierres");

        logOk(
            config.cierres.enabled
                ? "Activados"
                : "Desactivados"
        );

        logOk("Runtime creado");

        console.log(
            "runtimeConfig",
            runtimeConfig
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
