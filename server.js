const express = require("express");
const historial = [];
const app = express();

app.use(express.json());

// Dashboard Web
app.get("/", (req,res)=>{

let html = `
<h1>Dashboard ESP32</h1>
`;

historial.forEach(d=>{

html += `
<p>
${d.fecha}
|
Temp: ${d.temperatura}
|
Hum: ${d.humedad}
|
Gas: ${d.gas}
</p>
`;

});

res.send(html);

});

// Test de funcionamiento
app.get("/test", (req, res) => {
    res.json({
        estado: "online"
    });
});

// Historial JSON
app.get("/api/history",(req,res)=>{

    res.json(historial);

});

// Endpoint para recibir datos del ESP32
app.post("/api/data", (req, res) => {

    historial.push({
    fecha: new Date(),
    temperatura: req.body.temperature,
    humedad: req.body.humidity,
    gas: req.body.gas
});
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
