/*
==================================================
SCHEDULER.JS - VERSIÓN INICIAL
==================================================

Responsabilidades:

1. Recibir la secuencia de pasos.
2. Asignar tiempos a cada paso.
3. Mostrar en el logger qué está pasando.
4. Planificar con antelación básica.

Por ahora SOLO muestra información en el logger.
No reproduce audio ni actualiza canvas todavía.

==================================================
*/

class Scheduler {
    constructor() {
        // Estado
        this.isRunning = false;
        this.lookAhead = 100; // ms de antelación
        this.scheduleInterval = 25; // ms entre checks
        
        // Secuencia
        this.sequence = [];
        this.totalSteps = 0;
        this.currentStepIndex = 0;
        this.lapCount = 0;
        
        // Timing
        this.startTime = 0;
        this.nextStepTime = 0;
        this.bpm = 120;
        this.intervalMs = 0;
        
        // Loop interno
        this.timerId = null;
        
        // AudioContext (se asignará después)
        this.audioContext = null;
        
        // Compás info
        this.compásInfo = null;
        
        // Estadísticas
        this.stats = {
            stepsScheduled: 0,
            stepsExecuted: 0,
            lapsCompleted: 0
        };
    }
    
    /*
    ==========================================
    CONFIGURACIÓN
    ==========================================
    */
    
    setAudioContext(audioCtx) {
        this.audioContext = audioCtx;
        logOk(`🎧 AudioContext asignado al scheduler`);
    }
    
    setSequence(sequence, bpm) {
        this.sequence = sequence;
        this.totalSteps = sequence.length;
        this.bpm = bpm;
        this.calculateInterval();
        this.reset();
        
        logOk(`📋 Secuencia cargada: ${this.totalSteps} pasos`);
        logInfo(`🎵 BPM: ${this.bpm}`);
        logInfo(`⏱️ Intervalo entre pasos: ${this.intervalMs.toFixed(2)}ms`);
    }
    
    setCompásInfo(compásInfo) {
        this.compásInfo = compásInfo;
        this.calculateInterval();
        logOk(`📊 Compás configurado: ${compásInfo.nombre || compásInfo.pulsos + '/' + compásInfo.subdivisiones}`);
        logInfo(`   Pulsos: ${compásInfo.pulsos}`);
        logInfo(`   Subdivisiones: ${compásInfo.subdivisiones}`);
        logInfo(`   Subdivisiones por pulso: ${compásInfo.subdivision_por_pulso || (compásInfo.subdivisiones / compásInfo.pulsos)}`);
    }
    
    calculateInterval() {
        /*
        ==========================================
        CÁLCULO DEL INTERVALO
        ==========================================
        
        Tiempo entre cada paso (subdivisión).
        
        Para 4/4 con 8 subdivisiones:
        (60 / BPM) / (8 / 4) = (60/120) / 2 = 0.25s
        
        Para 12/8 con 24 subdivisiones:
        (60 / BPM) / (24 / 12) = (60/120) / 2 = 0.25s
        ==========================================
        */
        
        let pulsesPerMeasure = 4;
        let subdivisionsPerMeasure = this.totalSteps;
        
        if (this.compásInfo) {
            pulsesPerMeasure = this.compásInfo.pulsos || 4;
            subdivisionsPerMeasure = this.compásInfo.subdivisiones || this.totalSteps;
        }
        
        const secondsPerBeat = 60 / this.bpm;
        const subdivisionsPerBeat = subdivisionsPerMeasure / pulsesPerMeasure;
        this.intervalMs = (secondsPerBeat / subdivisionsPerBeat) * 1000;
        
        logInfo(`📐 Cálculo de intervalo:`);
        logInfo(`   Pulsos/compás: ${pulsesPerMeasure}`);
        logInfo(`   Subdivisiones/compás: ${subdivisionsPerMeasure}`);
        logInfo(`   Subdivisiones/pulso: ${subdivisionsPerBeat.toFixed(2)}`);
        logInfo(`   Segundos/pulso: ${secondsPerBeat.toFixed(3)}s`);
        logInfo(`   ⏱️ Intervalo: ${this.intervalMs.toFixed(2)}ms`);
    }
    
    reset() {
        this.currentStepIndex = 0;
        this.lapCount = 0;
        this.nextStepTime = 0;
        this.stats.stepsScheduled = 0;
        this.stats.stepsExecuted = 0;
        this.stats.lapsCompleted = 0;
        
        logInfo(`🔄 Scheduler reseteados`);
    }
    
    /*
    ==========================================
    CONTROL DE EJECUCIÓN
    ==========================================
    */
    
    start() {
        if (this.isRunning) {
            logInfo(`⚠️ El scheduler ya está en marcha`);
            return;
        }
        
        if (this.totalSteps === 0) {
            logError(`❌ No hay secuencia para reproducir`);
            return;
        }
        
        if (!this.audioContext) {
            logError(`❌ No hay AudioContext disponible`);
            return;
        }
        
        // Iniciar
        this.isRunning = true;
        this.startTime = this.audioContext.currentTime;
        this.nextStepTime = this.startTime;
        this.lapCount = 0;
        this.currentStepIndex = 0;
        this.stats.stepsScheduled = 0;
        this.stats.stepsExecuted = 0;
        this.stats.lapsCompleted = 0;
        
        logSection(`▶️ SCHEDULER INICIADO`);
        logOk(`✅ Scheduler en marcha`);
        logInfo(`🕐 Tiempo de inicio: ${this.startTime.toFixed(3)}s`);
        logInfo(`📊 Total de pasos: ${this.totalSteps}`);
        logInfo(`⏱️ Intervalo: ${this.intervalMs.toFixed(2)}ms`);
        logInfo(`🔭 Look-ahead: ${this.lookAhead}ms`);
        logInfo(`⏰ Check cada: ${this.scheduleInterval}ms`);
        logInfo(`---`);
        logInfo(`Esperando planificación...`);
        
        // Iniciar el loop de planificación
        this.scheduleLoop();
    }
    
    stop() {
        if (!this.isRunning) {
            logInfo(`⚠️ El scheduler ya está detenido`);
            return;
        }
        
        this.isRunning = false;
        
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        
        logSection(`⏹️ SCHEDULER DETENIDO`);
        logInfo(`📊 Estadísticas finales:`);
        logInfo(`   Pasos planificados: ${this.stats.stepsScheduled}`);
        logInfo(`   Pasos ejecutados: ${this.stats.stepsExecuted}`);
        logInfo(`   Vueltas completadas: ${this.stats.lapsCompleted}`);
        logInfo(`   Paso actual: ${this.currentStepIndex}/${this.totalSteps}`);
        logInfo(`   Vuelta actual: ${this.lapCount + 1}`);
    }
    
    /*
    ==========================================
    LOOP DE PLANIFICACIÓN
    ==========================================
    */
    
    scheduleLoop() {
        if (!this.isRunning) return;
        
        const now = this.audioContext.currentTime * 1000; // en ms
        
        // Planificar pasos con antelación
        let scheduledCount = 0;
        
        while (
            this.currentStepIndex < this.totalSteps &&
            this.nextStepTime < (now + this.lookAhead) / 1000
        ) {
            this.scheduleNextStep();
            scheduledCount++;
        }
        
        // Si se planificaron pasos, mostrarlo (pero no cada vez)
        if (scheduledCount > 0) {
            // Solo mostramos si no hay muchos pasos planificados de golpe
            if (scheduledCount < 5) {
                logInfo(`📦 Planificados ${scheduledCount} paso(s) (total: ${this.stats.stepsScheduled})`);
            }
        }
        
        // Programar la siguiente comprobación
        this.timerId = setTimeout(
            () => this.scheduleLoop(),
            this.scheduleInterval
        );
    }
    
    /*
    ==========================================
    PLANIFICAR SIGUIENTE PASO
    ==========================================
    */
    
    scheduleNextStep() {
        if (this.currentStepIndex >= this.totalSteps) {
            // Fin de la secuencia - reiniciar
            this.lapCount++;
            this.stats.lapsCompleted++;
            this.currentStepIndex = 0;
            
            logSection(`🔄 VUELTA ${this.lapCount + 1}`);
            logOk(`✅ Vuelta ${this.lapCount} completada`);
            logInfo(`   Pasos ejecutados en esta vuelta: ${this.totalSteps}`);
            logInfo(`   Tiempo total de vuelta: ${(this.totalSteps * this.intervalMs / 1000).toFixed(2)}s`);
            logInfo(`   ---`);
            logInfo(`   Iniciando vuelta ${this.lapCount + 1}...`);
            
            // Si la secuencia está vacía, detener
            if (this.totalSteps === 0) {
                this.stop();
                return;
            }
        }
        
        // Obtener el paso actual
        const stepData = this.sequence[this.currentStepIndex];
        const stepIndex = this.currentStepIndex;
        const lap = this.lapCount + 1;
        const scheduledTime = this.nextStepTime;
        
        // Planificar el evento
        this.stats.stepsScheduled++;
        
        // MOSTRAR EL PASO PLANIFICADO EN EL LOGGER
        this.logScheduledStep(stepData, stepIndex, lap, scheduledTime);
        
        // Programar la ejecución en el momento exacto
        this.scheduleExecution(stepData, stepIndex, lap, scheduledTime);
        
        // Avanzar al siguiente paso
        this.currentStepIndex++;
        this.nextStepTime += this.intervalMs / 1000;
    }
    
    /*
    ==========================================
    MOSTRAR PASO PLANIFICADO EN LOGGER
    ==========================================
    
    Esto es lo que quieres ver: cada paso
    con su tiempo y toda su información.
    
    ==========================================
    */
    
    logScheduledStep(stepData, stepIndex, lap, scheduledTime) {
        // Calcular el tiempo en ms desde el inicio
        const elapsedMs = (scheduledTime - this.startTime) * 1000;
        const elapsedSeconds = elapsedMs / 1000;
        
        // Formatear el tiempo
        const timeStr = this.formatTime(elapsedSeconds);
        
        // Construir el mensaje
        let message = `⏰ [${timeStr}] Paso ${stepIndex + 1}/${this.totalSteps}`;
        message += ` | Vuelta ${lap}`;
        message += ` | Métrica: ${stepData.metric || '-'}`;
        
        if (stepData.label) {
            message += ` | Etiqueta: ${stepData.label}`;
        }
        
        // Añadir eventos
        if (stepData.events && stepData.events.length > 0) {
            const eventStrings = stepData.events.map(e => {
                let symbol = '';
                if (e.type === 'G') symbol = '⚪ Grave';
                else if (e.type === 'C') symbol = '❌ Agudo';
                else if (e.type === 'S') symbol = '● Silencio';
                else symbol = e.type || '?';
                
                let accent = '';
                if (e.accent === 'H') accent = '🔴 Fuerte';
                else if (e.accent === 'M') accent = '🟠 Medio';
                else if (e.accent === 'L') accent = '⚪ Ligero';
                
                return `${symbol} (${accent})`;
            });
            message += ` | Eventos: ${eventStrings.join(', ')}`;
        } else {
            message += ` | Eventos: (ninguno)`;
        }
        
        // Tiempo absoluto
        message += ` | 🕐 ${scheduledTime.toFixed(3)}s`;
        
        // Mostrar en el logger
        logInfo(message);
        
        // También mostrar un resumen más compacto para no saturar
        if (this.stats.stepsScheduled % 10 === 0) {
            logInfo(`📊 Progreso: ${this.stats.stepsScheduled} pasos planificados, ${this.stats.stepsExecuted} ejecutados`);
        }
    }
    
    /*
    ==========================================
    FORMATO DE TIEMPO
    ==========================================
    */
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        
        if (mins > 0) {
            return `${mins}m ${secs}s ${ms}ms`;
        } else {
            return `${secs}s ${ms}ms`;
        }
    }
    
    /*
    ==========================================
    PROGRAMAR EJECUCIÓN
    ==========================================
    */
    
    scheduleExecution(stepData, stepIndex, lap, scheduledTime) {
        const now = this.audioContext.currentTime;
        const delay = (scheduledTime - now) * 1000; // en ms
        
        if (delay < 1) {
            // Si el delay es muy pequeño, ejecutar inmediatamente
            this.executeStep(stepData, stepIndex, lap);
            return;
        }
        
        setTimeout(
            () => {
                this.executeStep(stepData, stepIndex, lap);
            },
            delay
        );
    }
    
    /*
    ==========================================
    EJECUTAR PASO
    ==========================================
    
    Por ahora solo muestra en el logger que
    el paso se ha ejecutado.
    
    Más adelante añadiremos audio y canvas.
    
    ==========================================
    */
    
    executeStep(stepData, stepIndex, lap) {
        if (!this.isRunning) return;
        
        this.stats.stepsExecuted++;
        
        // Mostrar en el logger que se ha ejecutado
        // (pero con menos detalle para no saturar)
        if (this.stats.stepsExecuted % 5 === 0 || this.stats.stepsExecuted < 5) {
            const elapsed = (this.audioContext.currentTime - this.startTime);
            const timeStr = this.formatTime(elapsed);
            logOk(`✅ [${timeStr}] Ejecutado paso ${stepIndex + 1} (vuelta ${lap})`);
        }
    }
    
    /*
    ==========================================
    OBTENER INFORMACIÓN
    ==========================================
    */
    
    getProgress() {
        if (this.totalSteps === 0) return { percentage: 0, current: 0, total: 0 };
        
        const percentage = (this.currentStepIndex / this.totalSteps) * 100;
        return {
            percentage: percentage,
            currentStep: this.currentStepIndex,
            totalSteps: this.totalSteps,
            lap: this.lapCount + 1,
            stepsScheduled: this.stats.stepsScheduled,
            stepsExecuted: this.stats.stepsExecuted,
            lapsCompleted: this.stats.lapsCompleted
        };
    }
    
    /*
    ==========================================
    DESTRUIR
    ==========================================
    */
    
    destroy() {
        this.stop();
        this.sequence = [];
        this.totalSteps = 0;
        this.stats = {
            stepsScheduled: 0,
            stepsExecuted: 0,
            lapsCompleted: 0
        };
        logInfo(`🧹 Scheduler destruido`);
    }
}

/*
==================================================
CREAR INSTANCIA GLOBAL
==================================================
*/

const scheduler = new Scheduler();

/*
==================================================
FUNCIÓN PARA INICIALIZAR DESDE APP
==================================================
*/

function initSchedulerFromConfig(runtimeConfig) {
    logSection(`🎯 INICIALIZANDO SCHEDULER`);
    
    // Obtener la secuencia resuelta
    const sequence = runtimeConfig.sequenceResolved;
    
    if (!sequence || sequence.length === 0) {
        logError(`❌ No hay secuencia para inicializar`);
        return false;
    }
    
    logOk(`📋 Secuencia encontrada: ${sequence.length} pasos`);
    
    // Obtener BPM
    const bpm = runtimeConfig.config?.bpm?.default || 120;
    logInfo(`🎵 BPM: ${bpm}`);
    
    // Obtener AudioContext
    const audioCtx = window.audioCtx;
    if (!audioCtx) {
        logError(`❌ No hay AudioContext disponible`);
        return false;
    }
    
    // Configurar el scheduler
    scheduler.setAudioContext(audioCtx);
    scheduler.setSequence(sequence, bpm);
    
    if (runtimeConfig.compas) {
        scheduler.setCompásInfo(runtimeConfig.compas);
    }
    
    logOk(`✅ Scheduler inicializado correctamente`);
    logInfo(`⏱️ Intervalo: ${scheduler.intervalMs.toFixed(2)}ms`);
    logInfo(`📊 Total de pasos: ${scheduler.totalSteps}`);
    
    // Guardar referencia
    runtimeConfig.scheduler = scheduler;
    
    // Mostrar un resumen de los primeros pasos
    logSection(`📋 PRIMEROS 5 PASOS DE LA SECUENCIA`);
    const previewSteps = sequence.slice(0, 5);
    previewSteps.forEach((step, i) => {
        let msg = `  ${i + 1}.`;
        if (step.label) msg += ` Etiqueta: ${step.label}`;
        if (step.metric) msg += ` | Métrica: ${step.metric}`;
        if (step.events && step.events.length > 0) {
            const types = step.events.map(e => e.type).join(',');
            msg += ` | Eventos: ${types}`;
        } else {
            msg += ` | Eventos: (ninguno)`;
        }
        logInfo(msg);
    });
    
    if (sequence.length > 5) {
        logInfo(`  ... y ${sequence.length - 5} pasos más`);
    }
    
    logSection(`✅ SCHEDULER LISTO`);
    logInfo(`ℹ️ Para iniciar, llama a: scheduler.start()`);
    logInfo(`ℹ️ Para detener, llama a: scheduler.stop()`);
    
    return true;
}

/*
==================================================
EXPORTAR
==================================================
*/

window.scheduler = scheduler;
window.initSchedulerFromConfig = initSchedulerFromConfig;

logInfo(`📦 Módulo scheduler.js cargado`);
logInfo(`ℹ️ Instancia global: window.scheduler`);
