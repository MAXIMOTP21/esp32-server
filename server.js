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

https://cdn.jsdelivr.net/npm/chart.jsscript>

<title>ESP32 Dashboard</title>

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
    <canvas id="tempChart"></canvas>
</div>
<div class="estado">
ESP32:
<span class="online">● ONLINE</span>
</div>

<div class="grid">
`;

historial.slice().reverse().forEach(d=>{

html += `

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
        datasets:[{
            label:'Temperatura °C',
            data:temperaturas,
            borderColor:'red',
            backgroundColor:'rgba(255,0,0,0.2)',
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

if(temperatura > 30)
{
   led = true;
}

if(gas > 200)
{
   relay = true;
}

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
