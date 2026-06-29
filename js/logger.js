logSection("SECUENCIA");

sequenceResolved.forEach(step => {

    let texto = `Paso ${step.step}`;

    if (step.label) {

        texto += ` | ${step.label}`;

    }

    texto += ` | ${step.metric}`;

    if (step.events.length === 0) {

        texto += " | silencio";

    }

    else {

        step.events.forEach(event => {

            texto += ` | ${event.symbol}`;

        });

    }

    logInfo(texto);

});
