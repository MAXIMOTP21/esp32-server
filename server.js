const express = require("express");
const historial = [];
const app = express();

app.use(express.json());

// Dashboard Web
app.get("/", (req,res)=>{

let html = `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1">

<title>Dashboard ESP32</title>

<style>

body{
    font-family: Arial, sans-serif;
    background:#f4f6f9;
    margin:0;
    padding:20px;
}

h1{
    text-align:center;
    color:#333;
}

.card{
    background:white;
    border-radius:12px;
    box-shadow:0 2px 8px rgba(0,0,0,0.15);
    padding:15px;
    margin-bottom:15px;
}

.fecha{
    color:gray;
    font-size:13px;
}

.valor{
    font-size:18px;
    margin-top:8px;
}

.temp{
    color:#e74c3c;
}

.hum{
    color:#3498db;
}

.gas{
    color:#27ae60;
}

</style>

</head>

<body>

<h1>📡 Dashboard ESP32</h1>

`;

historial.slice().reverse().forEach(d=>{

html += `
<div class="card">

<div class="fecha">
${new Date(d.fecha).toLocaleString()}
</div>

<div class="valor temp">
🌡 Temperatura: ${d.temperatura} °C
</div>

<div class="valor hum">
💧 Humedad: ${d.humedad} %
</div>

<div class="valor gas">
🧪 Gas: ${d.gas}
</div>

</div>
`;

});

html += `
</body>
</html>
`;

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
