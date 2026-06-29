/*
==================================================
SCHEDULER
==================================================

Responsabilidad:

Ser el ÚNICO dueño del reloj del metrónomo.

EN ESTA VERSIÓN DE PRUEBAS:

- NO usa AudioContext.
- NO reproduce audio.
- NO dibuja en canvas.
- SOLO muestra eventos en el logger.

Quién lo llama:

- app.js (al iniciar, con startScheduler)

==================================================
*/

/*
==================================================
VARIABLES PRIVADAS
==================================================
*/

// Estado del scheduler
let isRunning = false;
let sequence = [];
let totalSteps = 0;
let currentStepIndex = 0;
let lapCount = 0;

// Timing
let startTime = 0;
let bpm = 120;
let intervalMs = 0;

// Loop interno (usamos setInterval, no AudioContext)
let timerId = null;

// Estadísticas
let stats = {
    stepsScheduled: 0,
    stepsExecuted: 0,
    lapsCompleted: 0
};

// Callbacks para cuando el scheduler esté listo
let onStepCallback = null;
let onLapCompleteCallback = null;
let onSequenceCompleteCallback = null;

/*
==================================================
FUNCIÓN PÚBLICA PRINCIPAL
==================================================
*/

/*
------------------------------------------
startScheduler()
------------------------------------------

Inicia el scheduler en modo pruebas.

Solo muestra eventos en el logger.

------------------------------------------
*/

function startScheduler({
    sequence: seq,
    bpm: bpmValue,
    callbacks = {}
}) {

    // Verificar que todo está listo
    if (isRunning) {
        logInfo("⚠️ El scheduler ya está en marcha");
        return;
    }

    if (!seq || seq.length === 0) {
        logError("❌ No hay secuencia para reproducir");
        return;
    }

    // Guardar configuración
    sequence = seq;
    totalSteps = seq.length;
    bpm = bpmValue;
    onStepCallback = callbacks.onStep || null;
    onLapCompleteCallback = callbacks.onLapComplete || null;
    onSequenceCompleteCallback = callbacks.onSequenceComplete || null;

    // Calcular intervalo entre pasos
    calculateInterval();

    // Inicializar estado
    isRunning = true;
    startTime = Date.now(); // Usamos Date.now() en lugar de AudioContext
    currentStepIndex = 0;
    lapCount = 0;
    stats = {
        stepsScheduled: 0,
        stepsExecuted: 0,
        lapsCompleted: 0
    };

    logSection("▶️ SCHEDULER INICIADO (MODO PRUEBAS)");
    logOk(`✅ Scheduler en marcha`);
    logInfo(`   BPM: ${bpm}`);
    logInfo(`   Intervalo entre pasos: ${intervalMs.toFixed(2)}ms`);
    logInfo(`   Total de pasos: ${totalSteps}`);
    logInfo(`   Inicio: ${new Date().toLocaleTimeString()}`);
    logInfo(`---`);
    logInfo(`⏳ Ejecutando pasos...`);
    logInfo(`---`);

    // Ejecutar el primer paso inmediatamente
    executeNextStep();

    // Iniciar el loop
    timerId = setInterval(
        executeNextStep,
        intervalMs
    );

}

/*
------------------------------------------
stopScheduler()
------------------------------------------

Detiene el scheduler.

------------------------------------------
*/

function stopScheduler() {

    if (!isRunning) {
        logInfo("⚠️ El scheduler ya está detenido");
        return;
    }

    isRunning = false;

    // Cancelar el loop
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }

    logSection("⏹️ SCHEDULER DETENIDO");
    logInfo(`   Pasos ejecutados: ${stats.stepsExecuted}`);
    logInfo(`   Vueltas completadas: ${stats.lapsCompleted}`);
    logInfo(`   Tiempo total: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

}

/*
------------------------------------------
isSchedulerRunning()
------------------------------------------

Devuelve true si el scheduler está en marcha.

------------------------------------------
*/

function isSchedulerRunning() {
    return isRunning;
}

/*
==================================================
FUNCIONES PRIVADAS
==================================================
*/

/*
------------------------------------------
calculateInterval()
------------------------------------------

Calcula el tiempo entre pasos según BPM y compás.

Para 4/4 con 8 subdivisiones:
(60 / BPM) / (8 / 4) = (60/120) / 2 = 0.25s = 250ms

------------------------------------------
*/

function calculateInterval() {

    // Detectar compás según número de subdivisiones
    let pulsesPerMeasure = 4; // Default: 4/4

    if (totalSteps === 24) {
        // Bulerías, Alegrías (12/8)
        pulsesPerMeasure = 12;
    } else if (totalSteps === 16) {
        pulsesPerMeasure = 4;
    } else if (totalSteps === 12) {
        pulsesPerMeasure = 4;
    }
    // Para 8 subdivisiones (rumba, tangos): pulsesPerMeasure = 4

    const secondsPerBeat = 60 / bpm;
    const subdivisionsPerBeat = totalSteps / pulsesPerMeasure;
    intervalMs = (secondsPerBeat / subdivisionsPerBeat) * 1000;

}

/*
------------------------------------------
executeNextStep()
------------------------------------------

Ejecuta el siguiente paso de la secuencia.

Muestra en el logger los eventos que se
enviarían al canvas y al audio.

------------------------------------------
*/

function executeNextStep() {

    if (!isRunning) {
        return;
    }

    // Si hemos llegado al final de la secuencia
    if (currentStepIndex >= totalSteps) {

        // Completar vuelta
        lapCount++;
        stats.lapsCompleted++;

        // Notificar al canvas (si existe callback)
        if (onLapCompleteCallback) {
            onLapCompleteCallback(lapCount);
        }

        // Reiniciar al principio
        currentStepIndex = 0;

        logSection(`🔄 VUELTA ${lapCount + 1}`);
        logOk(`✅ Vuelta ${lapCount} completada`);
        logInfo(`   Pasos ejecutados: ${totalSteps}`);
        logInfo(`   Tiempo total: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
        logInfo(`   ---`);
        logInfo(`   Iniciando vuelta ${lapCount + 1}...`);
        logInfo(`---`);

        // Si la secuencia está vacía, detener
        if (totalSteps === 0) {
            stopScheduler();
            return;
        }

    }

    // Obtener el paso actual
    const stepData = sequence[currentStepIndex];
    const stepIndex = currentStepIndex;
    const lap = lapCount + 1;

    // Incrementar contador
    stats.stepsExecuted++;

    // MOSTRAR EN EL LOGGER
    logStep(stepData, stepIndex, lap);

    // Notificar al canvas (si existe callback)
    if (onStepCallback) {
        onStepCallback(stepIndex, stepData, lap);
    }

    // Notificar al audio (si existe callback)
    if (onSequenceCompleteCallback) {
        onSequenceCompleteCallback(stepData, stepIndex, lap);
    }

    // Avanzar al siguiente paso
    currentStepIndex++;

}

/*
------------------------------------------
logStep()
------------------------------------------

Muestra en el logger toda la información
del paso que se está ejecutando.

Aquí se ven los eventos que se enviarían
al canvas y al audio.

------------------------------------------
*/

function logStep(
    stepData,
    stepIndex,
    lap
) {

    // Calcular tiempo desde el inicio
    const elapsedMs = Date.now() - startTime;
    const elapsedSeconds = elapsedMs / 1000;
    const timeStr = formatTime(elapsedSeconds);

    // Construir mensaje
    let message = `⏰ [${timeStr}]`;

    // Información del paso
    message += ` Paso ${stepIndex + 1}/${totalSteps}`;
    message += ` | Vuelta ${lap}`;

    // Métrica
    if (stepData.metric === "K") {
        message += ` | 🔴 FUERTE`;
    } else {
        message += ` | ⚪ débil`;
    }

    // Etiqueta
    if (stepData.label) {
        message += ` | Etiqueta: "${stepData.label}"`;
    }

    // Eventos (lo que se enviaría al audio y al canvas)
    if (stepData.events && stepData.events.length > 0) {

        const eventStrings = stepData.events.map(event => {

            // Tipo de evento
            let typeStr = '';
            if (event.type === 'G') typeStr = '⚪ GRAVE';
            else if (event.type === 'C') typeStr = '❌ AGUDO';
            else if (event.type === 'S') typeStr = '● SILENCIO';
            else typeStr = `? ${event.type}`;

            // Acento
            let accentStr = '';
            if (event.accent === 'H') accentStr = '🔴 FUERTE';
            else if (event.accent === 'M') accentStr = '🟠 MEDIO';
            else if (event.accent === 'L') accentStr = '⚪ LIGERO';
            else accentStr = `? ${event.accent}`;

            return `${typeStr} (${accentStr})`;

        });

        message += ` | Eventos: ${eventStrings.join(' | ')}`;

    } else {

        message += ` | Eventos: (ninguno)`;

    }

    // Mostrar en el logger
    logInfo(message);

}

/*
------------------------------------------
formatTime()
------------------------------------------

Formatea un tiempo en segundos a:
- "1m 23s 456ms" (si hay minutos)
- "23s 456ms" (si solo hay segundos)

------------------------------------------
*/

function formatTime(seconds) {

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    if (mins > 0) {
        return `${mins}m ${secs}s ${String(ms).padStart(3, '0')}ms`;
    } else {
        return `${secs}s ${String(ms).padStart(3, '0')}ms`;
    }

}

/*
==================================================
EXPORTACIÓN DEL MÓDULO
==================================================
*/

// Exponer solo lo que otros módulos necesitan
window.startScheduler = startScheduler;
window.stopScheduler = stopScheduler;
window.isSchedulerRunning = isSchedulerRunning;

/*
==================================================
MENSAJE DE CARGA
==================================================
*/

logInfo("📦 Scheduler cargado (modo pruebas - sin AudioContext)");
logInfo("   startScheduler() - inicia el reloj");
logInfo("   stopScheduler()  - detiene el reloj");
