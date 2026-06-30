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

let currentStep = 0;

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

    currentStep = 0;

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

            currentStep,

            nextEventTime,

            lap

        );

        nextEventTime +=
            schedulerState.secondsPerStep;

        currentStep++;

        if (

            currentStep >=

            window.runtimeConfig.sequenceResolved.length

        ) {

            currentStep = 0;

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
    Logger
    */

    logInfo(

        `[${eventTime.toFixed(3)}] ` +

        `Paso ${step.step}` +

        ` (${step.label ?? "-"})`

    );

    /*
    Canvas
    */

    if (window.setCurrentStep) {

        const delay =

            Math.max(

                0,

                eventTime * 1000 -

                performance.now()

            );

        setTimeout(

            () => {

                window.setCurrentStep(
                    stepIndex
                );

            },

            delay

        );

    }

    /*
    Audio

    Aquí irá:

    window.audioEngine.schedule(step,eventTime);

    */

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
