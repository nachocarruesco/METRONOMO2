/*
==================================================
SEQUENCER
==================================================

Responsabilidad:

Construir una secuencia completa a partir de:

- preset
- compás

NO conoce tiempos.

NO reproduce audio.

NO dibuja.

Únicamente genera la información musical que
utilizará el scheduler.

==================================================
*/


/*
==================================================
Construye una secuencia completa

Devuelve un array donde cada elemento
representa una subdivisión del compás.

==================================================
*/

function buildSequence(runtimeConfig) {

    const preset = runtimeConfig.preset;
    const compas = runtimeConfig.compas;

    const sequence = [];

    for (let step = 0; step < compas.subdivisiones; step++) {

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
Construye un único paso

Cada paso contiene toda la información
musical necesaria.

==================================================
*/

/*
------------------------------------------
EVENTOS DEL PRESET
------------------------------------------
*/
function buildStep(
    step,
    preset,
    compas
) {

    const events = [];

    /*
    ------------------------------------------
    SONIDO DEL PRESET
    ------------------------------------------
    */

    const sound =
        preset.marks[String(step)];

    if (sound) {

        events.push({

            type: "sound",

            symbol: sound

        });

    }

    /*
    ------------------------------------------
    MÉTRICA DEL COMPÁS

    K = tiempo fuerte

    L = tiempo débil

    ------------------------------------------
    */

    let metric = "L";

    if (
        compas.metric &&
        compas.metric.strong.includes(step)
    ) {

        metric = "K";

    }

    /*
    ------------------------------------------
    ETIQUETA VISUAL

    1

    2

    3

    4

    etc.

    ------------------------------------------
    */

    let label = null;

    if (compas.etiquetas_default) {

        const tag =
            compas.etiquetas_default.find(

                item => item.step === step

            );

        if (tag) {

            label = tag.texto;

        }

    }

    /*
    ------------------------------------------
    DEVOLVER PASO
    ------------------------------------------
    */

    return {

        step,

        metric,

        label,

        events

    };

}
