/*
==================================================
SEQUENCER.JS
==================================================

Responsabilidad ÚNICA:

Recibir runtimeConfig y devolver una secuencia
completa de pasos musicales.

Características:

- NO conoce BPM.
- NO conoce tiempos.
- NO conoce audio.
- NO conoce canvas.
- NO sabe qué significa "G" o "C".
- Solo entrega datos estructurados.

==================================================
*/

/*
==================================================
CONSTRUIR SECUENCIA COMPLETA
==================================================

Recibe runtimeConfig.

Devuelve un array de pasos.

Cada paso es un objeto con:

{
    step: number,        // Índice del paso (0, 1, 2...)
    metric: "K" | "L",   // K = fuerte, L = débil
    label: string|null,  // "1", "2", "3", "4" o null
    events: [            // Array de eventos musicales
        {
            type: string,   // "G", "C", "S", etc.
            accent: string  // "H", "M", "L"
        }
    ]
}

El secuenciador NO interpreta los eventos.
Solo los entrega tal como están en el preset.

==================================================
*/

function buildSequence(runtimeConfig) {

    // Extraer datos necesarios
    const preset = runtimeConfig.preset;
    const compas = runtimeConfig.compas;

    // Número total de pasos (subdivisiones del compás)
    const totalSteps = compas.subdivisiones;

    // Array que contendrá la secuencia completa
    const sequence = [];

    // Construir paso por paso
    for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {

        const step = buildStep(
            stepIndex,
            preset,
            compas
        );

        sequence.push(step);

    }

    return sequence;

}

/*
==================================================
CONSTRUIR UN PASO INDIVIDUAL
==================================================

Cada paso se construye a partir de:

1. Eventos del preset (si existen)
2. Métrica del compás (fuerte/débil)
3. Etiqueta visual (1, 2, 3, 4...)

==================================================
*/

function buildStep(
    stepIndex,
    preset,
    compas
) {

    /*
    ------------------------------------------
    1. EVENTOS DEL PRESET
    ------------------------------------------
    
    Busca en preset.marks si hay eventos
    para este paso.
    
    Si hay, los copia exactamente.
    Si no, el array de eventos queda vacío.
    ------------------------------------------
    */

    const events = [];

    // preset.marks es un objeto donde las claves son strings
    const presetEvents = preset.marks[String(stepIndex)];

    if (presetEvents && Array.isArray(presetEvents)) {

        // Copiar eventos tal cual, sin modificarlos
        for (const event of presetEvents) {

            events.push({
                type: event.type,
                accent: event.accent || "M" // Default: acento medio
            });

        }

    }

    /*
    ------------------------------------------
    2. MÉTRICA DEL COMPÁS
    ------------------------------------------
    
    K = tiempo fuerte (strong)
    L = tiempo débil (weak)
    
    La métrica se define en compas.metric.strong
    ------------------------------------------
    */

    let metric = "L"; // Por defecto: débil

    if (
        compas.metric &&
        compas.metric.strong &&
        compas.metric.strong.includes(stepIndex)
    ) {

        metric = "K";

    }

    /*
    ------------------------------------------
    3. ETIQUETA VISUAL
    ------------------------------------------
    
    Las etiquetas se definen en compas.etiquetas_default
    
    Ejemplo: 
    { step: 0, texto: "1" }
    { step: 2, texto: "2" }
    { step: 4, texto: "3" }
    { step: 6, texto: "4" }
    
    Si no hay etiqueta para este paso, queda null.
    ------------------------------------------
    */

    let label = null;

    if (
        compas.etiquetas_default &&
        Array.isArray(compas.etiquetas_default)
    ) {

        const found = compas.etiquetas_default.find(
            item => item.step === stepIndex
        );

        if (found) {
            label = found.texto;
        }

    }

    /*
    ------------------------------------------
    4. DEVOLVER PASO COMPLETO
    ------------------------------------------
    
    El paso contiene toda la información
    que el scheduler necesita para:
    
    - Mostrar en canvas (label, metric)
    - Reproducir audio (events)
    - Calcular tiempos (el scheduler añade el tiempo después)
    ------------------------------------------
    */

    return {
        step: stepIndex,
        metric: metric,
        label: label,
        events: events
    };

}

/*
==================================================
FUNCIÓN DE UTILIDAD PARA DEPURACIÓN
==================================================

Muestra la secuencia en un formato legible.

Útil para verificar que el secuenciador
está generando lo que esperamos.

==================================================
*/

function logSequence(sequence) {

    if (!sequence || sequence.length === 0) {
        logInfo("Secuencia vacía");
        return;
    }

    logInfo(`📋 Secuencia: ${sequence.length} pasos`);
    logInfo("");

    for (const step of sequence) {

        let text = `  Paso ${step.step}`;

        if (step.label) {
            text += ` | ${step.label}`;
        }

        text += ` | Métrica: ${step.metric}`;

        if (step.events.length === 0) {
            text += " | Eventos: (ninguno)";
        } else {
            const eventTexts = step.events.map(e => 
                `${e.type}${e.accent}`
            );
            text += ` | Eventos: ${eventTexts.join(", ")}`;
        }

        logInfo(text);

    }

}

/*
==================================================
EXPORTAR FUNCIONES
==================================================

Estas funciones estarán disponibles globalmente
para que app.js pueda usarlas.

==================================================
*/

window.buildSequence = buildSequence;
window.logSequence = logSequence;

/*
==================================================
MENSAJE DE CARGA
==================================================
*/

logInfo("📦 Sequencer cargado");
logInfo("   buildSequence() - construye secuencia");
logInfo("   logSequence()   - muestra secuencia en logger");
