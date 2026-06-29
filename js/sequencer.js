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

const presetEvents =
    preset.marks[String(step)];

if (presetEvents) {

    events.push(
        ...presetEvents
    );

}
