/*
==================================================
CANVAS.JS
PARTE 1
==================================================

Responsabilidad:

- Dibujar el compás.
- NO conoce BPM.
- NO conoce tiempos.
- NO reproduce audio.

El scheduler únicamente llamará a:

setCurrentStep(...)
setLap(...)

==================================================
*/

/*=================================================
CANVAS
=================================================*/

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");

/*=================================================
GEOMETRÍA
=================================================*/

const cx =
    canvas.width / 2;

const cy =
    canvas.height / 2;

const OUTER_RADIUS = 220;

const STEP_RADIUS = 175;

const LABEL_RADIUS = 255;

const CENTER_RADIUS = 42;

/*=================================================
ESTADO
=================================================*/

let currentStep = -1;

let currentLap = 1;

let totalLaps = 1;

/*=================================================
COLORES
=================================================*/

const COLORS = {

    background: "#000000",

    circle: "#666666",

    ticks: "#777777",

    labels: "#ffffff",

    inactive: "#666666",

    active: "#00ff88",

    grave: "#ffffff",

    agudo: "#ffffff",

    lap: "#00ff88",

    lastLap: "#ff3333"

};

/*=================================================
ÁNGULO DE UN STEP
=================================================*/

function getStepAngle(step, totalSteps) {

    return (
        -Math.PI / 2 +
        step *
        Math.PI * 2 /
        totalSteps
    );

}

/*=================================================
REDIBUJAR TODO
=================================================*/

function drawCompas() {

    if (
        !window.runtimeConfig ||
        !window.runtimeConfig.sequenceResolved
    ) {
        return;
    }

    const sequence =
        window.runtimeConfig.sequenceResolved;

    const totalSteps =
        sequence.length;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawOuterCircle();

    drawTicks(totalSteps);

    drawLabels(totalSteps);

    drawEvents(sequence);

    drawCenterCircle();

}

/*=================================================
CÍRCULO EXTERIOR
=================================================*/

function drawOuterCircle() {

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        OUTER_RADIUS,
        0,
        Math.PI * 2
    );

    ctx.lineWidth = 4;

    ctx.strokeStyle =
        COLORS.circle;

    ctx.stroke();

}

/*=================================================
MUESCAS
=================================================*/

function drawTicks(totalSteps) {

    for (
        let i = 0;
        i < totalSteps;
        i++
    ) {

        const angle =
            getStepAngle(
                i,
                totalSteps
            );

        const x1 =
            cx +
            Math.cos(angle) *
            (OUTER_RADIUS - 10);

        const y1 =
            cy +
            Math.sin(angle) *
            (OUTER_RADIUS - 10);

        const x2 =
            cx +
            Math.cos(angle) *
            (OUTER_RADIUS + 10);

        const y2 =
            cy +
            Math.sin(angle) *
            (OUTER_RADIUS + 10);

        ctx.beginPath();

        ctx.moveTo(x1, y1);

        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
            COLORS.ticks;

        ctx.lineWidth = 2;

        ctx.stroke();

    }

}

/*=================================================
NUMERACIÓN
=================================================*/

function drawLabels(totalSteps) {

    const labels =
        window.runtimeConfig
            .compas
            .etiquetas_default;

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
            COLORS.labels;

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

/*=================================================
EVENTOS
=================================================*/

function drawEvents(sequence) {

    sequence.forEach((step, index) => {

        const angle =
            getStepAngle(
                index,
                sequence.length
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
            event => {

                drawEvent(
                    event,
                    x,
                    y,
                    index === currentStep
                );

            }
        );

    });

}

/*=================================================
PASO VACÍO
=================================================*/

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
            : COLORS.inactive;

    ctx.fill();

}

/*=================================================
DIBUJAR EVENTO
=================================================*/

function drawEvent(
    event,
    x,
    y,
    active
) {

    let size = 10;

    switch (event.accent) {

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

    ctx.strokeStyle =
        active
            ? COLORS.active
            : COLORS.grave;

    ctx.fillStyle =
        active
            ? COLORS.active
            : COLORS.grave;

    ctx.lineWidth =
        active
            ? 4
            : 3;

    switch (event.type) {

        /*
        ------------------------
        GRAVE
        ------------------------
        */

        case "G":

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                size,
                0,
                Math.PI * 2
            );

            ctx.stroke();

            break;

        /*
        ------------------------
        AGUDO
        ------------------------
        */

        case "C":

            ctx.beginPath();

            ctx.moveTo(
                x - size,
                y - size
            );

            ctx.lineTo(
                x + size,
                y + size
            );

            ctx.moveTo(
                x + size,
                y - size
            );

            ctx.lineTo(
                x - size,
                y + size
            );

            ctx.stroke();

            break;

        /*
        ------------------------
        CLAQUETA
        ------------------------
        */

        case "E":

            ctx.beginPath();

            ctx.rect(
                x - size / 2,
                y - size / 2,
                size,
                size
            );

            ctx.stroke();

            break;

        /*
        ------------------------
        FANTASMA
        ------------------------
        */

        case "F":

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                size / 2,
                0,
                Math.PI * 2
            );

            ctx.fill();

            break;

    }

}

/*=================================================
CÍRCULO CENTRAL
=================================================*/

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

/*=================================================
CONTADOR DE VUELTAS
=================================================*/

function drawLapCounter() {

    ctx.fillStyle =
        currentLap === totalLaps
            ? COLORS.lastLap
            : COLORS.lap;

    ctx.font =
        "bold 26px Arial";

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

/*=================================================
AGUJA
=================================================*/

function drawNeedle() {

    if (currentStep < 0)
        return;

    const totalSteps =
        window.runtimeConfig
            .sequenceResolved.length;

    const angle =
        getStepAngle(
            currentStep,
            totalSteps
        );

    const x =
        cx +
        Math.cos(angle) *
        (STEP_RADIUS - 20);

    const y =
        cy +
        Math.sin(angle) *
        (STEP_RADIUS - 20);

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

/*=================================================
ACTUALIZAR STEP
=================================================*/

function setCurrentStep(step) {

    currentStep = step;

    drawCompas();

    drawNeedle();

}

/*=================================================
ACTUALIZAR VUELTAS
=================================================*/

function setLap(
    lap,
    total
) {

    currentLap = lap;

    totalLaps = total;

    drawCompas();

    drawNeedle();

}

/*=================================================
CLICK SOBRE EL CANVAS

(Preparado para edición futura)

=================================================*/

canvas.addEventListener(
    "click",
    function(event) {

        // Aquí se implementará
        // la edición de eventos
        // (G→C→silencio...)

    }
);

/*=================================================
EXPORTAR API
=================================================*/

window.drawCompas =
    drawCompas;

window.setCurrentStep =
    setCurrentStep;

window.setLap =
    setLap;

/*=================================================
DIBUJO INICIAL

Sólo dibuja.

NO arranca el scheduler.

=================================================*/

drawCompas();
