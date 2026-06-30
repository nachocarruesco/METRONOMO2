/*
==================================================
SEQUENCER
==================================================

Responsabilidad:

Construir una secuencia musical completa a partir
del runtimeConfig.

NO conoce BPM.
NO conoce tiempo.
NO conoce audio.
NO conoce canvas.
NO conoce scheduler.

Únicamente transforma la información musical
en una lista de pasos completamente resueltos.

==================================================
*/


/*
==================================================
CONSTRUIR SECUENCIA COMPLETA
==================================================
*/

function buildSequence(runtimeConfig) {

    const sequence = [];

    const preset =
        runtimeConfig.preset;

    const compas =
        runtimeConfig.compas;

    for (
        let step = 0;
        step < compas.subdivisiones;
        step++
    ) {

        sequence.push(

            buildStep(
                step,
                preset,
                compas
            )

        );

    }

    return sequence;

}


/*
==================================================
CONSTRUIR UN PASO
==================================================
*/

function buildStep(
    step,
    preset,
    compas
) {

    return {

        step,

        metric:
            buildMetric(
                step,
                compas
            ),

        label:
            buildLabel(
                step,
                compas
            ),

        events:
            buildEvents(
                step,
                preset
            )

    };

}


/*
==================================================
CONSTRUIR EVENTOS
==================================================
*/

function buildEvents(
    step,
    preset
) {

    const events =
        preset.marks[
            String(step)
        ];

    if (!events) {

        return [];

    }

    return structuredClone(events);

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

    if (
        compas.metric.strong &&
        compas.metric.strong.includes(step)
    ) {

        return "K";

    }

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

    if (!compas.etiquetas_default) {

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
