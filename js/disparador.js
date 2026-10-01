/*
    DISPARADOR

    Recibe los eventos temporales generados por el scheduler
    y los entrega a todos los módulos que estén registrados.

    El disparador NO:
    - crea pasos
    - calcula tiempos
    - reproduce audio
    - dibuja Canvas
    - escribe logs

    Su única función es:
        scheduler → disparador → módulos

    Los módulos se registran mediante:
        disparador.register(funcion)
*/

const disparador = {

    listeners: [],


    /*
        REGISTRAR UN MÓDULO

        Cada módulo que quiera recibir eventos llama a:

            disparador.register(miFuncion)

        "register" NO es una función propia de JavaScript.
        La estamos definiendo nosotros aquí.
    */
    register(listener) {

        if (typeof listener !== "function") {

            throw new TypeError(
                "El listener del disparador debe ser una función"
            );

        }

        this.listeners.push(listener);
    },


    /*
        DISPARAR UN EVENTO

        El scheduler llama a:

            disparador.dispatch(event)

        El mismo objeto "event" se entrega a todos
        los módulos registrados.
    */
    dispatch(event) {

        this.listeners.forEach(
            listener => listener(event)
        );

    }

};


/*
    Lo hacemos accesible al resto de módulos.
*/
window.disparador = disparador;
