/*
==================================================
CANVAS.JS
==================================================

Responsabilidades:

1. Dibujar el compás.
2. Dibujar las etiquetas.
3. Dibujar graves y agudos.
4. Más adelante:
    - aguja
    - paso activo
    - editor

NO carga JSON.

NO reproduce audio.

Trabaja exclusivamente con:

runtimeConfig

==================================================
*/

const canvas =
    document.getElementById(
        "canvas"
    );

const ctx =
    canvas.getContext("2d");

const cx =
    canvas.width / 2;

const cy =
    canvas.height / 2;

const radius = 220;

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
        (
            step *
            2 *
            Math.PI /
            totalSteps
        )
    );

}

/*
==================================================
DIBUJAR COMPÁS COMPLETO
==================================================
*/

function drawCompas() {

    if (!runtimeConfig.compas) {
        return;
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /*
    ------------------------------------------
    CÍRCULO EXTERIOR
    ------------------------------------------
    */

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        radius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 4;
    ctx.stroke();

    /*
    ------------------------------------------
    ETIQUETAS
    ------------------------------------------
    */

    const labels =
        runtimeConfig.compas
            .etiquetas_default;

    if (labels) {

        labels.forEach(

            label => {

                const angle =
                    getStepAngle(
                        label.step,
                        runtimeConfig.compas.subdivisiones
                    );

                const x =
                    cx +
                    Math.cos(angle) *
                    (radius + 40);

                const y =
                    cy +
                    Math.sin(angle) *
                    (radius + 40);

                ctx.fillStyle =
                    "#ffffff";

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

            }

        );

    }

    /*
    ------------------------------------------
    STEPS
    ------------------------------------------
    */

    runtimeConfig
        .sequenceResolved
        .forEach(

            (
                sound,
                index
            ) => {

                const angle =
                    getStepAngle(
                        index,
                        runtimeConfig.compas.subdivisiones
                    );

                const x =
                    cx +
                    Math.cos(angle) *
                    radius;

                const y =
                    cy +
                    Math.sin(angle) *
                    radius;

                /*
                ----------------------
                SILENCIO
                ----------------------
                */

                if (!sound) {

                    ctx.beginPath();

                    ctx.arc(
                        x,
                        y,
                        6,
                        0,
                        Math.PI * 2
                    );

                    ctx.fillStyle =
                        "#777";

                    ctx.fill();

                    return;

                }

                /*
                ----------------------
                GRAVE
                ----------------------
                */

                if (
                    sound ===
                    "grave"
                ) {

                    ctx.beginPath();

                    ctx.arc(
                        x,
                        y,
                        16,
                        0,
                        Math.PI * 2
                    );

                    ctx.strokeStyle =
                        "#ffffff";

                    ctx.lineWidth = 4;

                    ctx.stroke();

                    return;

                }

                /*
                ----------------------
                AGUDO
                ----------------------
                */

                if (
                    sound ===
                    "agudo"
                ) {

                    const size = 12;

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

                    ctx.strokeStyle =
                        "#ffffff";

                    ctx.lineWidth = 4;

                    ctx.stroke();

                }

            }

        );

}
