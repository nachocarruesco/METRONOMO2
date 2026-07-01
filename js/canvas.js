/*
==================================================
CANVAS.JS
==================================================

Responsabilidad:

Dibujar el estado visual del metrónomo.

NO conoce BPM.

NO conoce tiempos.

NO reproduce audio.

Únicamente representa la información que recibe
desde runtimeConfig y desde el scheduler.

El scheduler únicamente llamará a:

setCurrentStep(...)
setLap(...)

==================================================
*/

/*
==================================================
CANVAS
==================================================
*/

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");

/*
==================================================
GEOMETRÍA
==================================================
*/

const cx =
    canvas.width / 2;

const cy =
    canvas.height / 2;

const OUTER_RADIUS = 220;

const STEP_RADIUS = 185;

const LABEL_RADIUS = 255;

const CENTER_RADIUS = 42;

/*
==================================================
COLORES
==================================================
*/

const COLORS = {

    background: "#111111",

    circle: "#666666",

    tick: "#666666",

    label: "#ffffff",

    active: "#00ff66",

    grave: "#ffffff",

    agudo: "#ffffff",

    claqueta: "#00ccff",

    fantasma: "#888888",

    lap: "#00ff66",

    lastLap: "#ff4444"

};

/*
==================================================
ESTADO
==================================================
*/

let currentStep = -1;

let currentLap = 1;

let totalLaps = 1;

/*
==================================================
ÁNGULO DE UN STEP
==================================================
*/

function getStepAngle(
    step,
    totalSteps
) {

    return (
        -Math.PI / 2 +
        step *
        Math.PI * 2 /
        totalSteps
    );

}

/*
==================================================
FUNCIÓN PRINCIPAL

Redibuja TODO.

==================================================
*/

function drawCompas() {

    if (
        !window.runtimeConfig ||
        !window.runtimeConfig.sequenceResolved
    ) {

        return;

    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawOuterCircle();

    drawTicks();

    drawLabels();

    drawEvents();

    drawCenterCircle();

    drawNeedle();

}

/*
==================================================
CÍRCULO EXTERIOR
==================================================
*/

function drawOuterCircle() {

    ctx.beginPath();

    ctx.arc(

        cx,
        cy,

        OUTER_RADIUS,

        0,
        Math.PI * 2

    );

    ctx.strokeStyle =
        COLORS.circle;

    ctx.lineWidth = 3;

    ctx.stroke();

}

/*
==================================================
MUESCAS

Una por subdivisión.

==================================================
*/

function drawTicks() {

    const totalSteps =
        window.runtimeConfig
            .sequenceResolved
            .length;

    for (

        let step = 0;

        step < totalSteps;

        step++

    ) {

        const angle =
            getStepAngle(
                step,
                totalSteps
            );

        const x1 =
            cx +
            Math.cos(angle) *
            (OUTER_RADIUS - 6);

        const y1 =
            cy +
            Math.sin(angle) *
            (OUTER_RADIUS - 6);

        const x2 =
            cx +
            Math.cos(angle) *
            (OUTER_RADIUS + 6);

        const y2 =
            cy +
            Math.sin(angle) *
            (OUTER_RADIUS + 6);

        ctx.beginPath();

        ctx.moveTo(
            x1,
            y1
        );

        ctx.lineTo(
            x2,
            y2
        );

        ctx.strokeStyle =
            COLORS.tick;

        ctx.lineWidth = 2;

        ctx.stroke();

    }

}


/*
==================================================
NUMERACIÓN

Se dibujan utilizando las etiquetas del compás.

==================================================
*/

function drawLabels() {

    const labels =
        window.runtimeConfig
            .compas
            .etiquetas_default;

    const totalSteps =
        window.runtimeConfig
            .sequenceResolved
            .length;

    labels.forEach(label => {

        const angle =
            getStepAngle(
                label.step,
                totalSteps
            );

        const x =
            cx +
            Math.cos(angle) *
            LABEL_RADIUS;

        const y =
            cy +
            Math.sin(angle) *
            LABEL_RADIUS;

        ctx.fillStyle =
            COLORS.label;

        ctx.font =
            "bold 24px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            label.texto,
            x,
            y
        );

    });

}

/*
==================================================
EVENTOS

Cada subdivisión puede contener
0, 1 o varios eventos.

==================================================
*/

function drawEvents() {

    const sequence =
        window.runtimeConfig
            .sequenceResolved;

    const totalSteps =
        sequence.length;

    sequence.forEach(

        (step, index) => {

            const angle =
                getStepAngle(
                    index,
                    totalSteps
                );

            const x =
                cx +
                Math.cos(angle) *
                STEP_RADIUS;

            const y =
                cy +
                Math.sin(angle) *
                STEP_RADIUS;

            if (
                step.events.length === 0
            ) {

                drawEmptyStep(
                    x,
                    y,
                    index === currentStep
                );

                return;

            }

            step.events.forEach(

                (event, eventIndex) => {

                    const offset =
                        step.events.length === 1
                        ? { x:0, y:0 }
                        : {

                            x:
                                (eventIndex - (step.events.length-1)/2) * 12,

                            y:0

                        };

                    drawEvent(

                        event,

                        x + offset.x,

                        y + offset.y,

                        index === currentStep

                    );

                }

            );

        }

    );

}

/*
==================================================
PASO VACÍO
==================================================
*/

function drawEmptyStep(
    x,
    y,
    active
) {

    ctx.beginPath();

    ctx.arc(

        x,

        y,

        active ? 7 : 5,

        0,

        Math.PI * 2

    );

    ctx.fillStyle =

        active

        ? COLORS.active

        : "#555555";

    ctx.fill();

}

/*
==================================================
DIBUJAR EVENTO
==================================================
*/

function drawEvent(
    event,
    x,
    y,
    active
) {

    let size = 10;

    switch(event.accent){

        case "H":
            size = 18;
            break;

        case "M":
            size = 14;
            break;

        case "S":
            size = 10;
            break;

    }

    let color =
        COLORS.grave;

    switch(event.type){

        case "G":
            color = COLORS.grave;
            break;

        case "C":
            color = COLORS.agudo;
            break;

        case "E":
            color = COLORS.claqueta;
            break;

        case "F":
            color = COLORS.fantasma;
            break;

    }

    if(active){

        color =
            COLORS.active;

    }

    ctx.strokeStyle =
        color;

    ctx.fillStyle =
        color;

    ctx.lineWidth =
        active ? 4 : 3;

    switch(event.type){

        /*
        -----------------------
        GRAVE
        -----------------------
        */

        case "G":

            ctx.beginPath();

            ctx.arc(

                x,

                y,

                size,

                0,

                Math.PI*2

            );

            ctx.stroke();

            break;

        /*
        -----------------------
        AGUDO
        -----------------------
        */

        case "C":

            ctx.beginPath();

            ctx.moveTo(
                x-size,
                y-size
            );

            ctx.lineTo(
                x+size,
                y+size
            );

            ctx.moveTo(
                x+size,
                y-size
            );

            ctx.lineTo(
                x-size,
                y+size
            );

            ctx.stroke();

            break;

        /*
        -----------------------
        CLAQUETA
        -----------------------
        */

        case "E":

            ctx.beginPath();

            ctx.rect(

                x-size/2,

                y-size/2,

                size,

                size

            );

            ctx.stroke();

            break;

        /*
        -----------------------
        FANTASMA
        -----------------------
        */

        case "F":

            ctx.beginPath();

            ctx.arc(

                x,

                y,

                size/2,

                0,

                Math.PI*2

            );

            ctx.fill();

            break;

    }

}

/*
==================================================
CÍRCULO CENTRAL
==================================================
*/

function drawCenterCircle() {

    ctx.beginPath();

    ctx.arc(

        cx,

        cy,

        CENTER_RADIUS,

        0,

        Math.PI * 2

    );

    ctx.fillStyle =
        COLORS.background;

    ctx.fill();

    ctx.strokeStyle =
        COLORS.circle;

    ctx.lineWidth = 3;

    ctx.stroke();

    drawLapCounter();

}

/*
==================================================
CONTADOR DE VUELTAS
==================================================
*/

function drawLapCounter() {

    ctx.fillStyle =

        currentLap === totalLaps

        ? COLORS.lastLap

        : COLORS.lap;

    ctx.font =
        "bold 28px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(

        currentLap,

        cx,

        cy

    );

}

/*
==================================================
AGUJA
==================================================
*/

function drawNeedle() {

    if(currentStep < 0){

        return;

    }

    const totalSteps =
        window.runtimeConfig
            .sequenceResolved
            .length;

    const angle =
        getStepAngle(
            currentStep,
            totalSteps
        );

    const x =
        cx +
        Math.cos(angle) *
        (STEP_RADIUS - 25);

    const y =
        cy +
        Math.sin(angle) *
        (STEP_RADIUS - 25);

    ctx.beginPath();

    ctx.moveTo(

        cx,

        cy

    );

    ctx.lineTo(

        x,

        y

    );

    ctx.strokeStyle =
        COLORS.active;

    ctx.lineWidth = 4;

    ctx.stroke();

}

/*
==================================================
ACTUALIZAR STEP

Llamado únicamente por scheduler.js

==================================================
*/

function setCurrentStep(step) {

    currentStep = step;

    drawCompas();

}

/*
==================================================
ACTUALIZAR VUELTAS

Llamado únicamente por scheduler.js

==================================================
*/

function setLap(
    lap,
    total
) {

    currentLap = lap;

    totalLaps = total;

    drawCompas();

}

/*
==================================================
EDICIÓN FUTURA

Aquí se implementará la edición
de eventos pulsando sobre un step.

Secuencia prevista:

Silencio
↓

G S

↓

G M

↓

G H

↓

C S

↓

C M

↓

C H

↓

Silencio

==================================================
*/

canvas.addEventListener(

    "click",

    function(event){

        // Próxima versión.

    }

);

/*
==================================================
EXPORTAR API

El resto del programa sólo utilizará
estas funciones.

==================================================
*/

window.drawCompas =
    drawCompas;

window.setCurrentStep =
    setCurrentStep;

window.setLap =
    setLap;

/*
==================================================
DIBUJO INICIAL

Cuando app.js termina de construir
runtimeConfig llama una única vez a:

drawCompas();

El scheduler NO arranca aquí.

==================================================
*/
