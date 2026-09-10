const express = require("express");

const app = express();

app.use(express.json());

// Página principal
app.get("/", (req, res) => {
    res.send("Servidor ESP32 funcionando");
});

// Test de funcionamiento
app.get("/test", (req, res) => {
    res.json({
        estado: "online"
    });
});

// Endpoint para recibir datos del ESP32
app.post("/api/data", (req, res) => {

    console.log("Datos recibidos:");

    console.log(req.body);

    const temperatura = req.body.temperature;
    const humedad = req.body.humidity;
    const gas = req.body.gas;

    console.log("Temperatura:", temperatura);
    console.log("Humedad:", humedad);
    console.log("Gas:", gas);

    let led = false;

    if (temperatura > 30) {
        led = true;
    }

    res.json({
        status: "ok",
        led: led,
        relay: false,
        sampling: 5000
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
