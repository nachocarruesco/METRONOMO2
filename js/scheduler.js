/*
==================================================
SCHEDULER
==================================================

Responsabilidad:

Es el reloj del metrónomo.

No sabe cómo se dibuja.

No sabe cómo suena.

Únicamente decide CUÁNDO ocurre cada paso
y envía ese paso a los distintos módulos.

En el futuro enviará los eventos a:

- audio.js
- canvas.js

==================================================
*/

let schedulerTimer = null;

let schedulerStep = 0;

let schedulerRunning = false;

/*
==================================================
INICIAR
==================================================
*/

function startScheduler() {

    if (schedulerRunning) {
        return;
    }

    const runtime = window.runtimeConfig;

    if (!runtime) {
        return;
    }

    schedulerRunning = true;

    schedulerStep = 0;

    const bpm =
        runtime.config.bpm.default;

    /*
    Duración de un pulso
    */

    const beatDuration =
        60000 / bpm;

    /*
    Duración de una subdivisión
    */

    const stepDuration =
        beatDuration /
        runtime.compas.subdivision_por_pulso;

    logSection("SCHEDULER");

    logInfo(
        `BPM: ${bpm}`
    );

    logInfo(
        `Paso cada ${stepDuration.toFixed(2)} ms`
    );

    schedulerTimer = setInterval(

        schedulerTick,

        stepDuration

    );

}

/*
==================================================
DETENER
==================================================
*/

function stopScheduler() {

    schedulerRunning = false;

    clearInterval(
        schedulerTimer
    );

    schedulerTimer = null;

    logInfo(
        "Scheduler detenido"
    );

}

/*
==================================================
TICK
==================================================
*/

function schedulerTick() {

    const runtime =
        window.runtimeConfig;

    const sequence =
        runtime.sequenceResolved;

    const step =
        sequence[schedulerStep];

    /*
    LOGGER
    */

    logInfo(
        `Tick -> paso ${step.step}`
    );

    /*
    CANVAS
    */

    setCurrentStep(
        step.step
    );

    /*
    AQUÍ IRÁ EL AUDIO

    audio.schedule(step);

    */

    schedulerStep++;

    if (
        schedulerStep >=
        sequence.length
    ) {

        schedulerStep = 0;

        logInfo(
            "Fin de compás"
        );

    }

}

/*
==================================================
EXPORTAR
==================================================
*/

window.startScheduler =
    startScheduler;

window.stopScheduler =
    stopScheduler;


