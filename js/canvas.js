/*
==================================================
CANVAS.JS
==================================================
*/

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const radius = 220;

let currentStep = 0;

function getStepAngle(step, totalSteps) {
    return -Math.PI / 2 + (step * 2 * Math.PI / totalSteps);
}

function drawCompas() {
    // ✅ Usar window.runtimeConfig en lugar de runtimeConfig directamente
    const config = window.runtimeConfig;
    
    if (!config || !config.compas) {
        // console.warn("⏳ runtimeConfig no disponible, esperando...");
        return;
    }

    if (!config.sequenceResolved || config.sequenceResolved.length === 0) {
        // console.warn("⏳ sequenceResolved vacío, esperando...");
        return;
    }

    const totalSteps = config.compas.subdivisiones;
    const sequence = config.sequenceResolved;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Círculo exterior
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Etiquetas
    const labels = config.compas.etiquetas_default;
    if (labels) {
        labels.forEach(label => {
            const angle = getStepAngle(label.step, totalSteps);
            const x = cx + Math.cos(angle) * (radius + 40);
            const y = cy + Math.sin(angle) * (radius + 40);
            ctx.fillStyle = (currentStep === label.step) ? "#00ff88" : "#ffffff";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label.texto, x, y);
        });
    }

    // Dibujar steps
    sequence.forEach((stepData, index) => {
        const angle = getStepAngle(index, totalSteps);
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const isActive = (index === currentStep);

        if (stepData.events && stepData.events.length > 0) {
            stepData.events.forEach((event, eventIndex) => {
                const offsetX = stepData.events.length > 1 ? (eventIndex * 10 - 5) : 0;
                const offsetY = stepData.events.length > 1 ? (eventIndex * 10 - 5) : 0;
                const eventX = x + offsetX;
                const eventY = y + offsetY;

                const eventType = event.type ? event.type.toUpperCase() : '';
                const eventAccent = event.accent || "M";

                let color = "#ffffff";
                if (eventAccent === "H") color = "#ffcc00";
                else if (eventAccent === "M") color = "#ffaa44";

                if (isActive) color = "#00ff88";

                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                ctx.lineWidth = isActive ? 5 : 4;

                if (eventType === "G") {
                    const graveRadius = isActive ? 20 : 16;
                    ctx.beginPath();
                    ctx.arc(eventX, eventY, graveRadius, 0, Math.PI * 2);
                    ctx.stroke();
                    if (!isActive) {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                        ctx.fill();
                    }
                } else if (eventType === "C") {
                    const size = isActive ? 16 : 12;
                    ctx.beginPath();
                    ctx.moveTo(eventX - size, eventY - size);
                    ctx.lineTo(eventX + size, eventY + size);
                    ctx.moveTo(eventX + size, eventY - size);
                    ctx.lineTo(eventX - size, eventY + size);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(eventX, eventY, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        } else {
            ctx.beginPath();
            ctx.arc(x, y, isActive ? 10 : 6, 0, Math.PI * 2);
            ctx.fillStyle = isActive ? "#00ff88" : "#555";
            ctx.fill();
        }
    });

    // Aguja
    if (currentStep !== undefined) {
        const needleAngle = getStepAngle(currentStep, totalSteps);
        const ax = cx + Math.cos(needleAngle) * (radius - 20);
        const ay = cy + Math.sin(needleAngle) * (radius - 20);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#00ff88";
        ctx.fill();
    }
}

function setCurrentStep(step) {
    currentStep = step;
    drawCompas();
}

window.setCurrentStep = setCurrentStep;
window.drawCompas = drawCompas;

/*
==================================================
ESPERAR A QUE RUNTIMECONFIG EXISTA
==================================================
*/

function waitForRuntime() {
    // ✅ Usar window.runtimeConfig
    if (window.runtimeConfig && window.runtimeConfig.compas && window.runtimeConfig.sequenceResolved) {
        drawCompas();
        console.log("✅ Canvas dibujado correctamente");
    } else {
        // console.log("⏳ Esperando runtimeConfig...");
        setTimeout(waitForRuntime, 100);
    }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    waitForRuntime();
} else {
    document.addEventListener("DOMContentLoaded", waitForRuntime);
}
