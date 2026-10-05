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

IMPORTANTE:

El scheduler NO calcula las vueltas musicales.

La información de lap ya viene resuelta por
sequencer.js dentro de sequenceResolved.

El scheduler únicamente recorre sequenceResolved
y vuelve al principio cuando llega al final.

==================================================
*/

let schedulerTimer = null;

let schedulerStep = 0;

let nextEventTime = 0;

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

    /*
        Empezamos siempre por el primer paso
        de sequenceResolved.

        El número de lap NO se guarda aquí.

        Lo proporciona cada paso de la partitura.
    */
    schedulerStep = 0;

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

            nextEventTime

        );

        /*
            El siguiente paso se programa después
            del intervalo temporal correspondiente
            a una subdivisión.
        */
        nextEventTime +=
            schedulerState.secondsPerStep;

        schedulerStep++;

        /*
            Hemos llegado al final de la partitura
            resuelta.

            Volvemos al principio.

            IMPORTANTE:

            Aquí NO incrementamos ningún lap.

            Cada paso de sequenceResolved ya contiene
            su propio número de lap.

            Esto permite que:

            - un ejercicio de 4 laps vuelva a
              comenzar en lap 1 después del lap 4.

            - un ejercicio de 1 lap vuelva a comenzar
              siempre en lap 1.

            - un ejercicio compuesto conserve la
              numeración correcta de sus laps.
        */
        if (

            schedulerStep >=

            window.runtimeConfig.sequenceResolved.length

        ) {

            schedulerStep = 0;

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
    eventTime
) {

    const step =
        window.runtimeConfig
            .sequenceResolved[stepIndex];

    /*
        EVENTO TEMPORAL

        El scheduler añade únicamente la información
        temporal al paso de la partitura.

        El número de lap NO lo calcula el scheduler.

        Lo obtiene directamente del paso resuelto
        por sequencer.js.
    */

    const event = {

        time: eventTime,

        step: step.step,

        lap: step.lap,

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
