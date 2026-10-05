/*
==================================================
APP.JS
==================================================

Responsabilidad:

- Leer la URL.
- Cargar familias.
- Cargar configuración general.
- Cargar el ejercicio solicitado.
- Cargar los ejercicios que formen parte de
  un ejercicio compuesto.
- Cargar los compases.
- Crear runtimeConfig.
- Pedir al secuenciador que construya la partitura.
- Dibujar el estado inicial.

NO reproduce audio.
NO lleva el tiempo.
NO conoce el scheduler.
NO construye los pasos musicales.

El secuenciador recibe todos los datos ya cargados
y construye sequenceResolved.

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


        logOk(
            `Familia: ${family}`
        );

        logOk(
            `Ejercicio: ${presetName}`
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
        CONFIGURACIÓN GENERAL
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
        EJERCICIO PRINCIPAL
        ==========================================

        Todo es un ejercicio.

        Puede ser:

        - simple: contiene "marks"
        - compuesto: contiene "sequence"

        ==========================================
        */

        logSection("EJERCICIO");

        const preset =
            await loadExercise(
                presetName,
                familyConfig
            );

        logOk(
            preset.name
        );


        /*
        ==========================================
        COMPASES
        ==========================================
        */

        logSection("COMPASES");

        const compases =
            await loadJson(
                "./config/compas.json"
            );

        logOk(
            "Compases cargados"
        );


        /*
        ==========================================
        CARGAR EJERCICIOS NECESARIOS
        ==========================================

        Guardamos todos los ejercicios que necesita
        el ejercicio principal en:

            runtimeConfig.exercises

        Así el secuenciador no necesita hacer
        ninguna petición HTTP.

        ==========================================
        */

        logSection("EJERCICIOS");

        const exercises = {};


        /*
        ------------------------------------------
        EJERCICIO SIMPLE
        ------------------------------------------

        Si no tiene sequence, el propio ejercicio
        es el que se va a ejecutar.

        ------------------------------------------
        */

        if (
            !Array.isArray(
                preset.sequence
            )
        ) {

            exercises[presetName] =
                preset;

        }


        /*
        ------------------------------------------
        EJERCICIO COMPUESTO
        ------------------------------------------

        Cargamos cada ejercicio mencionado
        en sequence.

        ------------------------------------------
        */

        else {

            for (
                const item
                of preset.sequence
            ) {

                const exerciseName =
                    item.exercise;


                if (!exerciseName) {

                    throw new Error(
                        "La secuencia contiene un elemento sin 'exercise'"
                    );

                }


                /*
                Evitamos cargar dos veces
                el mismo ejercicio.
                */

                if (
                    exercises[exerciseName]
                ) {

                    continue;

                }


                logInfo(
                    `Cargando ejercicio: ${exerciseName}`
                );


                exercises[exerciseName] =
                    await loadExercise(
                        exerciseName,
                        familyConfig
                    );


                logOk(
                    `${exerciseName} cargado`
                );

            }

        }


        /*
        ==========================================
        CREAR RUNTIME
        ==========================================
        */

        window.runtimeConfig = {

            /*
            Identificación
            */

            family,

            presetName,

            familyConfig,


            /*
            Configuración general
            */

            config,


            /*
            Ejercicio solicitado
            */

            preset,


            /*
            Ejercicios utilizados por la secuencia
            */

            exercises,


            /*
            Todos los compases disponibles
            */

            compases

        };


        /*
        ==========================================
        CONSTRUIR PARTITURA
        ==========================================

        El secuenciador transforma el ejercicio
        completo en una lista plana de pasos.

        ==========================================
        */

        window.runtimeConfig.sequenceResolved =
            buildSequence(
                window.runtimeConfig
            );


        /*
        ==========================================
        COMPÁS PARA EL CANVAS ACTUAL
        ==========================================

        El canvas actual todavía trabaja con:

            runtimeConfig.compas

        Como todavía no hemos adaptado el canvas
        a ejercicios compuestos, le proporcionamos
        provisionalmente el compás del primer
        ejercicio de la secuencia.

        Esto NO afecta a sequenceResolved.

        ==========================================
        */

        window.runtimeConfig.compas =
            getFirstCompas(
                window.runtimeConfig
            );


        /*
        ==========================================
        DIBUJO INICIAL
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
CARGAR EJERCICIO
==================================================

Todos los ejercicios utilizan exactamente el
mismo formato JSON.

La única diferencia de ubicación es que algunos
están directamente en:

    presets/rumba/

y los cierres están en:

    presets/rumba/cierres/

Probamos primero presets y después cierres.

==================================================
*/

async function loadExercise(
    exerciseName,
    familyConfig
) {

    const paths = [

        `${familyConfig.presets}${exerciseName}.json`

    ];


    /*
    ------------------------------------------
    Directorio de cierres
    ------------------------------------------
    */

    if (familyConfig.cierres) {

        paths.push(
            `${familyConfig.cierres}${exerciseName}.json`
        );

    }


    /*
    ------------------------------------------
    Probar las rutas
    ------------------------------------------
    */

    for (
        const path
        of paths
    ) {

        try {

            return await loadJson(
                path
            );

        }

        catch (error) {

            /*
            La ruta no existe.

            Probamos la siguiente.

            No mostramos todavía el error porque
            puede existir en la siguiente ruta.
            */

        }

    }


    /*
    Ninguna ruta funcionó.
    */

    throw new Error(
        `No se encontró el ejercicio "${exerciseName}"`
    );

}


/*
==================================================
OBTENER PRIMER COMPÁS
==================================================

Esto es solamente una adaptación provisional
para el canvas actual.

En un ejercicio simple:

    ejercicio.compas

En uno compuesto:

    primer ejercicio de sequence
        ↓
    ejercicio.compas

Más adelante el canvas deberá conocer el compás
correspondiente a cada lap.

==================================================
*/

function getFirstCompas(
    runtimeConfig
) {

    const preset =
        runtimeConfig.preset;


    let exerciseName;


    /*
    ------------------------------------------
    Ejercicio simple
    ------------------------------------------
    */

    if (
        !Array.isArray(
            preset.sequence
        )
    ) {

        exerciseName =
            runtimeConfig.presetName;

    }


    /*
    ------------------------------------------
    Ejercicio compuesto
    ------------------------------------------
    */

    else {

        if (
            preset.sequence.length === 0
        ) {

            throw new Error(
                "El ejercicio no contiene ninguna vuelta"
            );

        }


        exerciseName =
            preset.sequence[0].exercise;

    }


    /*
    ------------------------------------------
    Obtener ejercicio
    ------------------------------------------
    */

    const exercise =
        runtimeConfig.exercises[
            exerciseName
        ];


    if (!exercise) {

        throw new Error(
            `No está cargado el ejercicio ${exerciseName}`
        );

    }


    /*
    ------------------------------------------
    Obtener compás
    ------------------------------------------
    */

    const compas =
        runtimeConfig.compases[
            exercise.compas
        ];


    if (!compas) {

        throw new Error(
            `No existe el compás ${exercise.compas}`
        );

    }


    return compas;

}


/*
==================================================
CARGADOR GENÉRICO DE JSON
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
