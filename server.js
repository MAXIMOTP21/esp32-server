const express = require("express");
const historial = [];
const app = express();
let estadoLed = false;
let estadoRelay = false;
const TEMP_MIN = 18;
const TEMP_MAX = 26;

const HUM_MIN = 50;
const HUM_MAX = 75;

const GAS_MAX = 200;

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

<title>ESP32 Dashboard</title>

https://cdn.jsdelivr.net/npm/chart.jsscript>

<style>
body{
    background:#0f172a;
    color:white;
    font-family:Arial;
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
    box-shadow:0 0 10px rgba(0,0,0,0.3);
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
    font-size:22px;
    margin-top:5px;
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
<div class="card">

<div class="card">

<h2>🎯 Valores ideales</h2>

<p>🌡 Temperatura ideal: 18°C - 26°C</p>

<p>💧 Humedad ideal: 50% - 75%</p>

<p>🧪 Gas máximo: 200</p>

</div>
<div class="card">

<h2>📈 Temperatura</h2>

<canvas id="tempChart"></canvas>

</div>

<div class="estado">
ESP32:
<span class="online">● ONLINE</span>
</div>
<div class="card">

<h2>🚨 Estado Actual</h2>

<p>
LED:
${estadoLed ? "🟢 ACTIVADO" : "⚪ APAGADO"}
</p>

<p>
Relay:
${estadoRelay ? "🟢 ACTIVADO" : "⚪ APAGADO"}
</p>

</div>
<div class="grid">
`;
const ultimo = historial[historial.length - 1];

if(ultimo){
if(ultimo){

const estadoTemp =
(ultimo.temperatura >= TEMP_MIN &&
ultimo.temperatura <= TEMP_MAX)
?
"🟢 Correcta"
:
"🔴 Fuera de rango";

const estadoHum =
(ultimo.humedad >= HUM_MIN &&
ultimo.humedad <= HUM_MAX)
?
"🟢 Correcta"
:
"🔴 Fuera de rango";

html += `

<div class="card">

<h2>📟 Lectura Actual</h2>

<p>
🌡 Temperatura:
${ultimo.temperatura} °C
${estadoTemp}
</p>

<p>
💧 Humedad:
${ultimo.humedad} %
${estadoHum}
</p>

<p>
🧪 Gas:
${ultimo.gas}
</p>

</div>

`;

}
html += `

<div class="card">

<h2>📟 Lectura Actual</h2>

<p>🌡 Temperatura: ${ultimo.temperatura} °C</p>

<p>💧 Humedad: ${ultimo.humedad} %</p>

<p>🧪 Gas: ${ultimo.gas}</p>

</div>

`;

}

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

</div>

<script>

const labels = [
${historial.map(
d => `"${new Date(d.fecha).toLocaleTimeString()}"`
).join(",")}
];

const temperaturas = [
${historial.map(d=>d.temperatura).join(",")}
];

new Chart(
document.getElementById("tempChart"),
{
type:"line",
data:{
labels:labels,
datasets:[

{
label:'Temperatura',
data:temperaturas,
borderColor:'#ef4444',
backgroundColor:'rgba(239,68,68,0.2)',
fill:true
},

{
label:'Mínimo Ideal',
data:Array(temperaturas.length).fill(18),
borderColor:'#22c55e',
fill:false
},

{
label:'Máximo Ideal',
data:Array(temperaturas.length).fill(26),
borderColor:'#facc15',
fill:false
}

]
borderColor:"#ef4444",
backgroundColor:"rgba(239,68,68,0.2)",
fill:true
}]
},
options:{
responsive:true
}
}
);

</script>

</body>

</html>

`;

res.send(html);

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
let relay = false;
estadoLed = led;
estadoRelay = relay;
if(temperatura > 30)
{
   led = true;
}

if(gas > 200)
{
 
    relay = true;
}
estadoLed = led;
estadoRelay = relay;
   res.json({
    status: "ok",
    led: led,
    relay: relay,
    sampling: 5000
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
