/*
==================================================
SEQUENCER
==================================================

Responsabilidad:

Construir la PARTITURA completa a partir de
runtimeConfig.

NO conoce:

- BPM
- tiempo
- audio
- canvas
- scheduler

Únicamente transforma información musical
en una lista ordenada de pasos.

==================================================
*/


/*
==================================================
CONSTRUIR SECUENCIA COMPLETA
==================================================

La salida es una lista PLANA.

Por ejemplo:

    ejercicio_rumba_1

        rumba_abierta × 3
        cierre_rumba × 1

se convierte en:

    lap 1 → rumba_abierta → step 0...
    lap 1 → rumba_abierta → step 1...
    ...

    lap 2 → rumba_abierta → step 0...
    ...

    lap 3 → rumba_abierta → step 0...
    ...

    lap 4 → cierre_rumba → step 0...
    ...

El scheduler recibirá posteriormente esta lista
y será él quien añada el tiempo.

==================================================
*/

function buildSequence(
    runtimeConfig
) {

    const sequence = [];


    /*
    Obtener la secuencia de ejercicios.

    Si el ejercicio es simple, se convierte
    internamente en una secuencia de una vuelta.
    */

    const exerciseSequence =
        getExerciseSequence(
            runtimeConfig
        );


    /*
    Número de vuelta global.

    NO se reinicia al cambiar de ejercicio.
    */

    let globalLap = 0;


    /*
    ==========================================
    RECORRER EJERCICIOS
    ==========================================
    */

    for (
        const item
        of exerciseSequence
    ) {

        const exerciseName =
            item.exercise;

        const laps =
            item.laps;


        /*
        ------------------------------------------
        Validaciones
        ------------------------------------------
        */

        if (!exerciseName) {

            throw new Error(
                "Elemento de sequence sin 'exercise'"
            );

        }


        if (
            !Number.isInteger(laps) ||
            laps < 1
        ) {

            throw new Error(
                `Número de vueltas inválido para ${exerciseName}`
            );

        }


        /*
        ------------------------------------------
        Obtener ejercicio cargado
        ------------------------------------------
        */

        const exercise =
            runtimeConfig.exercises[
                exerciseName
            ];


        if (!exercise) {

            throw new Error(
                `El ejercicio ${exerciseName} no está cargado`
            );

        }


        /*
        ------------------------------------------
        No permitimos todavía ejercicios
        compuestos dentro de otros ejercicios.
        ------------------------------------------

        De momento:

            ejercicio compuesto
                ↓
            ejercicios simples

        Más adelante podremos añadir anidamiento
        si resulta necesario.

        ------------------------------------------
        */

        if (
            Array.isArray(
                exercise.sequence
            )
        ) {

            throw new Error(
                `El ejercicio ${exerciseName} es compuesto. Los ejercicios compuestos anidados todavía no están soportados.`
            );

        }


        /*
        ------------------------------------------
        Obtener características del compás
        ------------------------------------------
        */

        const compas =
            runtimeConfig.compases[
                exercise.compas
            ];


        if (!compas) {

            throw new Error(
                `No existe el compás ${exercise.compas} utilizado por ${exerciseName}`
            );

        }


        /*
        ==========================================
        CONSTRUIR LAS VUELTAS
        ==========================================
        */

        for (
            let exerciseLap = 1;
            exerciseLap <= laps;
            exerciseLap++
        ) {

            /*
            Vuelta global.

            Ejemplo:

                rumba × 3
                cierre × 1

                rumba → 1, 2, 3
                cierre → 4
            */

            globalLap++;


            /*
            --------------------------------------
            Construir todos los pasos del compás
            --------------------------------------
            */

            for (
                let step = 0;
                step < compas.subdivisiones;
                step++
            ) {

                sequence.push(

                    buildStep(
                        step,
                        exerciseName,
                        exercise,
                        compas,
                        globalLap,
                        exerciseLap
                    )

                );

            }

        }

    }


    return sequence;

}


/*
==================================================
OBTENER SECUENCIA DE EJERCICIOS
==================================================

EJERCICIO SIMPLE

rumba_abierta.json

    {
        "marks": ...
    }

Se convierte en:

    [
        {
            "exercise": "rumba_abierta",
            "laps": 1
        }
    ]


EJERCICIO COMPUESTO

ejercicio_rumba_1.json

    {
        "sequence": [
            {
                "exercise": "rumba_abierta",
                "laps": 3
            },
            {
                "exercise": "cierre_rumba",
                "laps": 1
            }
        ]
    }

Se utiliza directamente.

==================================================
*/

function getExerciseSequence(
    runtimeConfig
) {

    const preset =
        runtimeConfig.preset;


    /*
    ------------------------------------------
    Ejercicio compuesto
    ------------------------------------------
    */

    if (
        Array.isArray(
            preset.sequence
        )
    ) {

        return preset.sequence;

    }


    /*
    ------------------------------------------
    Ejercicio simple
    ------------------------------------------
    */

    return [

        {
            exercise:
                runtimeConfig.presetName,

            laps: 1
        }

    ];

}


/*
==================================================
CONSTRUIR UN PASO
==================================================
*/

function buildStep(
    step,
    exerciseName,
    exercise,
    compas,
    lap,
    exerciseLap
) {

    return {

        /*
        ------------------------------------------
        Identificación de la vuelta
        ------------------------------------------
        */

        lap,

        exercise,

        exerciseLap,


        /*
        ------------------------------------------
        Paso dentro del compás
        ------------------------------------------
        */

        step,


        /*
        ------------------------------------------
        Información métrica
        ------------------------------------------
        */

        metric:
            buildMetric(
                step,
                compas
            ),


        /*
        ------------------------------------------
        Etiqueta visual
        ------------------------------------------
        */

        label:
            buildLabel(
                step,
                compas
            ),


        /*
        ------------------------------------------
        Eventos musicales
        ------------------------------------------

        Todos los ejercicios utilizan ya el mismo
        formato.

        ------------------------------------------
        */

        events:
            buildEvents(
                step,
                exercise
            )

    };

}


/*
==================================================
CONSTRUIR EVENTOS
==================================================

Todos los presets utilizan ahora:

    "marks": {
        "0": [
            {
                "type": "G",
                "accent": "H"
            }
        ]
    }

Por tanto no hacemos ninguna conversión.

La partitura recibe una copia de los eventos.

==================================================
*/

function buildEvents(
    step,
    exercise
) {

    const events =
        exercise.marks[
            String(step)
        ];


    /*
    ------------------------------------------
    No hay eventos en este paso
    ------------------------------------------
    */

    if (!events) {

        return [];

    }


    /*
    ------------------------------------------
    Validación
    ------------------------------------------

    marks siempre debe contener un array.

    ------------------------------------------
    */

    if (
        !Array.isArray(events)
    ) {

        throw new Error(
            `El formato de marks no es válido en ${exercise.name}, step ${step}`
        );

    }


    /*
    ------------------------------------------
    Copia de los eventos
    ------------------------------------------

    Así la partitura no comparte directamente
    el array original del JSON.

    ------------------------------------------
    */

    return structuredClone(
        events
    );

}


/*
==================================================
CONSTRUIR MÉTRICA
==================================================
*/

function buildMetric(
    step,
    compas
) {

    if (!compas.metric) {

        return null;

    }


    /*
    ------------------------------------------
    Pulso fuerte
    ------------------------------------------
    */

    if (
        compas.metric.strong &&
        compas.metric.strong.includes(step)
    ) {

        return "K";

    }


    /*
    ------------------------------------------
    Resto
    ------------------------------------------
    */

    return "L";

}


/*
==================================================
CONSTRUIR ETIQUETA
==================================================
*/

function buildLabel(
    step,
    compas
) {

    if (
        !compas.etiquetas_default
    ) {

        return null;

    }


    const label =
        compas.etiquetas_default.find(

            item =>
                item.step === step

        );


    return label
        ? label.texto
        : null;

}


/*
==================================================
EXPORTAR
==================================================
*/

window.buildSequence =
    buildSequence;
