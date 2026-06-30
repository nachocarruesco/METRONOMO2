/*
==================================================
CONTROLS
==================================================

Gestiona toda la interacción del usuario.

Actualmente:

- START
- STOP

En el futuro también gestionará:

- BPM
- Claqueta
- Cierres
- Instrumentos
- etc.

==================================================
*/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        document
            .getElementById("btnStart")
            .addEventListener(

                "click",

                () => {

                    logOk("START pulsado");

                    startScheduler();

                }

            );

        document
            .getElementById("btnStop")
            .addEventListener(

                "click",

                () => {

                    logOk("STOP pulsado");

                    stopScheduler();

                }

            );

    }

);
