const express = require("express");

const historial = [];

const app = express();

app.use(express.json());

app.get("/", (req, res) => {

let html = `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>ESP32 Dashboard</title>

https://cdn.jsdelivr.net/npm/chart.jsscript>

<style>

body{
    background:#0f172a;
    color:white;
    font-family:Arial, sans-serif;
    padding:20px;
}

h1{
    text-align:center;
}

.estado{
    text-align:center;
    margin-bottom:20px;
}

.online{
    color:#22c55e;
    font-weight:bold;
}

.grid{
    display:grid;
    gap:15px;
}

.card{
    background:#1e293b;
    padding:15px;
    border-radius:15px;
    box-shadow:0px 0px 10px rgba(0,0,0,0.3);
}

.temp{
    color:#ef4444;
}

.hum{
    color:#38bdf8;
}

.gas{
    color:#22c55e;
}

.fecha{
    color:#94a3b8;
    font-size:12px;
}

.valor{
    font-size:20px;
    margin-top:5px;
}

.chart-container{
    background:#1e293b;
    padding:20px;
    border-radius:15px;
    margin-bottom:20px;
}

</style>

<script>

setTimeout(()=>{
    location.reload();
},5000);

</script>

</head>

<body>

<h1>📡 ESP32 Dashboard</h1>

<div class="estado">
ESP32:
<span class="online">● ONLINE</span>
</div>

<div class="chart-container">
<canvas id="tempChart"></canvas>
</div>

<div class="grid">
`;

historial.slice().reverse().forEach(d => {

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

</div>

<script>

const labels = [
${historial.map((d,i)=>`"${i+1}"`).join(",")}
];

const temperaturas = [
${historial.map(d=>d.temperatura).join(",")}
];

new Chart(
document.getElementById('tempChart'),
{
    type:'line',
    data:{
        labels:labels,
        datasets:[
        {
            label:'Temperatura °C',
            data:temperaturas,
            borderColor:'#ef4444',
            backgroundColor:'rgba(239,68,68,0.2)',
            fill:true,
            tension:0.4
        }]
    },
    options:{
        responsive:true
    }
});

</script>

</body>

</html>

`;

res.send(html);

});

// Historial JSON
app.get("/api/history", (req, res) => {
    res.json(historial);
});

// Recibir datos del ESP32
app.post("/api/data", (req, res) => {

    historial.push({

        fecha: new Date(),
        temperatura: req.body.temperature,
        humedad: req.body.humidity,
        gas: req.body.gas

    });

    const temperatura = req.body.temperature;
    const gas = req.body.gas;

    let led = false;
    let
