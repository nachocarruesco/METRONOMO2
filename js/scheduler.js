/*
==================================================
SCHEDULER
==================================================

Responsabilidad:

Mantener un reloj.

Consultar al secuenciador.

Asignar un instante absoluto a cada paso.

Enviar el evento a todos los módulos.

NO reproduce audio.

NO dibuja.

==================================================
*/

let schedulerTimer = null;

let schedulerStep = 0;

let nextEventTime = 0;

let lap = 0;

/*
==================================================
CONFIGURACIÓN
==================================================
*/

const LOOK_AHEAD = 0.10;      // segundos

const TICK = 25;              // ms

/*
==================================================
INICIAR
==================================================
*/

function startScheduler() {

    if (schedulerTimer) {
        return;
    }

    const bpm =
        window.runtimeConfig.config.bpm.default;

    const subdivisionPerBeat =
        window.runtimeConfig.compas.subdivision_por_pulso;

    const secondsPerStep =
        60 / bpm / subdivisionPerBeat;

    schedulerState.secondsPerStep =
        secondsPerStep;

    schedulerState.audioTime =
        performance.now() / 1000;

    nextEventTime =
        schedulerState.audioTime;

    schedulerStep = 0;

    lap = 0;

    logSection("SCHEDULER");

    logOk("Scheduler iniciado");

    schedulerTimer =
        setInterval(
            schedulerTick,
            TICK
        );

}

/*
==================================================
DETENER
==================================================
*/

function stopScheduler() {

    if (!schedulerTimer) {
        return;
    }

    clearInterval(
        schedulerTimer
    );

    schedulerTimer = null;

    logOk(
        "Scheduler detenido"
    );

}

/*
==================================================
TICK
==================================================
*/

function schedulerTick() {

    const now =
        performance.now() / 1000;

    while (

        nextEventTime <
        now + LOOK_AHEAD

    ) {

        dispatchStep(

            schedulerStep,

            nextEventTime,

            lap

        );

        nextEventTime +=
            schedulerState.secondsPerStep;

        schedulerStep++;

        if (

            schedulerStep >=

            window.runtimeConfig.sequenceResolved.length

        ) {

            schedulerStep = 0;

            lap++;

        }

    }

}

/*
==================================================
ENVIAR EVENTO
==================================================
*/

function dispatchStep(
    stepIndex,
    eventTime,
    lap
) {
    const step =
        window.runtimeConfig
            .sequenceResolved[stepIndex];


    /*
        EVENTO TEMPORAL

        El scheduler añade al paso la información
        necesaria para saber CUÁNDO debe ejecutarse.

        El scheduler NO decide qué módulo lo utilizará.
    */
    const event = {

        time: eventTime,

        step: step.step,

        lap: lap + 1,

        metric: step.metric,

        label: step.label,

        events: structuredClone(
            step.events
        )

    };


    /*
        Entregamos el evento al DISPARADOR.

        A partir de aquí el scheduler deja de saber
        quién consume el evento.
    */
    window.disparador.dispatch(event);
}

/*
==================================================
ESTADO
==================================================
*/

const schedulerState = {

    secondsPerStep: 0,

    audioTime: 0

};

/*
==================================================
EXPORTAR
==================================================
*/

window.startScheduler =
    startScheduler;

window.stopScheduler =
    stopScheduler;
