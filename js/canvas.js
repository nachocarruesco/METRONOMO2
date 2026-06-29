/*
==================================================
CANVAS.JS
==================================================

Responsabilidades:

1. Dibujar el compás.
2. Dibujar las etiquetas (desde step.label).
3. Dibujar eventos:
   - "G" = Grave (círculo)
   - "C" = Agudo (X)  ← ¡Ahora soporta C!
4. Mostrar paso activo y aguja.

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

// Paso actual (se actualiza desde el scheduler)
let currentStep = 0;

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

    if (!runtimeConfig || !runtimeConfig.compas) {
        console.warn("⚠️ No hay runtimeConfig o compas disponible");
        return;
    }

    const totalSteps =
        runtimeConfig.compas.subdivisiones;

    const sequence =
        runtimeConfig.sequenceResolved;

    if (!sequence) {
        console.warn("⚠️ No hay sequenceResolved disponible");
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
    DIBUJAR STEPS CON SUS EVENTOS
    ------------------------------------------
    */

    sequence.forEach(

        (stepData, index) => {

            const angle =
                getStepAngle(
                    index,
                    totalSteps
                );

            const x =
                cx +
                Math.cos(angle) *
                radius;

            const y =
                cy +
                Math.sin(angle) *
                radius;

            const isActive =
                (index === currentStep);

            /*
            ------------------------------
            ETIQUETA DEL STEP (step.label)
            ------------------------------
            */

            if (stepData.label) {

                const labelAngle = angle;
                const labelOffset = 40;
                
                const labelX =
                    cx +
                    Math.cos(labelAngle) *
                    (radius + labelOffset);

                const labelY =
                    cy +
                    Math.sin(labelAngle) *
                    (radius + labelOffset);

                // Color según la métrica
                let labelColor = "#ffffff";
                
                // Si la métrica es K (fuerte) 
                if (stepData.metric === "K") {
                    labelColor = "#00ff88"; // Verde para tiempos fuertes
                } else {
                    labelColor = "#ffffff"; // Blanco para otros
                }

                // Resaltar si está activo
                if (isActive) {
                    labelColor = "#ffcc00";
                }

                ctx.fillStyle = labelColor;
                ctx.font = "bold 24px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillText(
                    stepData.label,
                    labelX,
                    labelY
                );

            }

            /*
            ------------------------------
            SI EL PASO TIENE EVENTOS
            ------------------------------
            */

            if (
                stepData.events &&
                stepData.events.length > 0
            ) {

                // Dibujar cada evento del paso
                stepData.events.forEach(

                    (event, eventIndex) => {

                        // Desplazar ligeramente si hay múltiples eventos
                        const offsetX = 
                            stepData.events.length > 1
                                ? (eventIndex * 10 - 5)
                                : 0;

                        const offsetY = 
                            stepData.events.length > 1
                                ? (eventIndex * 10 - 5)
                                : 0;

                        const eventX = x + offsetX;
                        const eventY = y + offsetY;

                        // Normalizar el tipo (por si viene en minúsculas)
                        const eventType = event.type ? event.type.toUpperCase() : '';
                        const eventAccent = event.accent || "M";

                        // Color según acento
                        let color = "#ffffff";
                        let glowColor = null;
                        
                        if (eventAccent === "H") {
                            color = "#ffcc00"; // Acento fuerte
                            glowColor = "rgba(255, 204, 0, 0.3)";
                        } else if (eventAccent === "M") {
                            color = "#ffaa44"; // Acento medio
                        } else if (eventAccent === "L") {
                            color = "#ffffff"; // Acento ligero
                        }

                        // Si está activo, resaltar más
                        if (isActive) {
                            color = "#00ff88";
                            glowColor = "rgba(0, 255, 136, 0.3)";
                        }

                        ctx.strokeStyle = color;
                        ctx.fillStyle = color;
                        ctx.lineWidth = isActive ? 5 : 4;

                        /*
                        ------------------------------
                        TIPO: GRAVE (G)
                        ------------------------------
                        */

                        if (eventType === "G") {

                            const graveRadius = 
                                isActive ? 20 : 16;

                            if (glowColor) {
                                ctx.shadowColor = glowColor;
                                ctx.shadowBlur = 20;
                            }

                            ctx.beginPath();

                            ctx.arc(
                                eventX,
                                eventY,
                                graveRadius,
                                0,
                                Math.PI * 2
                            );

                            ctx.stroke();

                            // Relleno suave para graves
                            if (!isActive) {
                                ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                                ctx.fill();
                            }

                            ctx.shadowColor = "transparent";
                            ctx.shadowBlur = 0;

                            return;

                        }

                        /*
                        ------------------------------
                        TIPO: AGUDO (C) ← ¡AHORA SOPORTA C!
                        "C" = Do en notación musical = Agudo
                        ------------------------------
                        */

                        if (eventType === "C") {

                            const size =
                                isActive ? 16 : 12;

                            if (glowColor) {
                                ctx.shadowColor = glowColor;
                                ctx.shadowBlur = 20;
                            }

                            ctx.beginPath();

                            // Dibujar la X
                            ctx.moveTo(
                                eventX - size,
                                eventY - size
                            );

                            ctx.lineTo(
                                eventX + size,
                                eventY + size
                            );

                            ctx.moveTo(
                                eventX + size,
                                eventY - size
                            );

                            ctx.lineTo(
                                eventX - size,
                                eventY + size
                            );

                            ctx.stroke();

                            ctx.shadowColor = "transparent";
                            ctx.shadowBlur = 0;

                            return;

                        }

                        /*
                        ------------------------------
                        TIPO: SILENCIO (S) o DESCONOCIDO
                        ------------------------------
                        */

                        if (eventType === "S" || !eventType) {

                            ctx.beginPath();

                            ctx.arc(
                                eventX,
                                eventY,
                                6,
                                0,
                                Math.PI * 2
                            );

                            ctx.fill();

                            return;

                        }

                        /*
                        ------------------------------
                        TIPO DESCONOCIDO: Dibujar un punto
                        ------------------------------
                        */

                        ctx.beginPath();

                        ctx.arc(
                            eventX,
                            eventY,
                            8,
                            0,
                            Math.PI * 2
                        );

                        ctx.fill();

                        return;

                    }

                );

            } 
            
            /*
            ------------------------------
            SI EL PASO NO TIENE EVENTOS
            ------------------------------
            */

            else {

                // Mostrar un punto pequeño para pasos vacíos
                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    isActive ? 10 : 6,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = 
                    isActive ? "#00ff88" : "#555";

                ctx.fill();

            }

        }

    );

    /*
    ------------------------------------------
    AGUJA (solo si el metrónomo está corriendo)
    ------------------------------------------
    */

    if (currentStep !== undefined) {

        const needleAngle =
            getStepAngle(
                currentStep,
                totalSteps
            );

        const ax =
            cx +
            Math.cos(needleAngle) *
            (radius - 20);

        const ay =
            cy +
            Math.sin(needleAngle) *
            (radius - 20);

        ctx.beginPath();

        ctx.moveTo(
            cx,
            cy
        );

        ctx.lineTo(
            ax,
            ay
        );

        ctx.strokeStyle =
            "#00ff88";

        ctx.lineWidth = 4;

        ctx.stroke();

        // Centro
        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            8,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#00ff88";

        ctx.fill();

    }

}

/*
==================================================
ACTUALIZAR PASO ACTIVO
==================================================

Esta función se llama desde el scheduler
cuando cambia el paso.

==================================================
*/

function setCurrentStep(step) {

    currentStep = step;

    drawCompas();

}

/*
==================================================
EXPORTAR PARA EL SCHEDULER
==================================================
*/

window.setCurrentStep = setCurrentStep;

window.drawCompas = drawCompas;

/*
==================================================
DIBUJO INICIAL
==================================================
*/

// Esperar a que runtimeConfig esté disponible
function waitForRuntime() {

    if (runtimeConfig && runtimeConfig.compas) {

        drawCompas();

    } else {

        setTimeout(
            waitForRuntime,
            100
        );

    }

}

// Iniciar cuando el DOM esté listo
if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
) {

    waitForRuntime();

} else {

    document.addEventListener(
        "DOMContentLoaded",
        waitForRuntime
    );

}
