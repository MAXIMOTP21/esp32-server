const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Historial en memoria (últimas 50 lecturas)
let dataHistory = [];
const MAX_HISTORY = 50;

// Estado manual de actuadores (sobreescritura desde la web)
let manualOverride = {
  pump: null,       // null = automático, true = encendido manual, false = apagado manual
  extractor1: null,
  extractor2: null
};

// Umbrales para la lógica de automatización
const THRESHOLDS = {
  phMin: 5.5,
  phMax: 6.5,
  ecMin: 1.2,
  ecMax: 2.0,       // mS/cm
  tempMax: 28.0,    // °C ambiente
  humidityMax: 80.0 // % humedad ambiente
};

// Estado actual de actuadores calculados por el servidor
let currentActuators = {
  pump: false,
  extractor1: false,
  extractor2: false
};

// Ruta principal para ver la página web
app.get('/', (req, res) => {
  res.render('index', { 
    history: dataHistory, 
    thresholds: THRESHOLDS, 
    actuators: currentActuators,
    override: manualOverride
  });
});

// Endpoint API que recibe los datos desde el ESP32
app.post('/api/data', (req, res) => {
  const { device_id, temperature, humidity, ph, ec } = req.body;

  const timestamp = new Date().toLocaleTimeString();
  
  const currentReadings = {
    device_id: device_id || 'esp32_001',
    temperature: parseFloat(temperature) || 0,
    humidity: parseFloat(humidity) || 0,
    ph: parseFloat(ph) || 0,
    ec: parseFloat(ec) || 0,
    time: timestamp
  };

  // --- LOGICA DE CONTROL DE ACTUADORES ---
  // 1. Bomba de agua: Se activa si la EC es baja (necesita solución) o el pH está fuera de rango
  let calcPump = (currentReadings.ec < THRESHOLDS.ecMin) || 
                 (currentReadings.ph < THRESHOLDS.phMin || currentReadings.ph > THRESHOLDS.phMax);

  // 2. Extractor 1: Se activa por alta temperatura
  let calcExtractor1 = currentReadings.temperature > THRESHOLDS.tempMax;

  // 3. Extractor 2: Se activa por alta humedad o muy alta temperatura
  let calcExtractor2 = (currentReadings.humidity > THRESHOLDS.humidityMax) || 
                       (currentReadings.temperature > (THRESHOLDS.tempMax + 3));

  // Aplicar sobreescritura manual si existe, o usar cálculo automático
  currentActuators.pump = manualOverride.pump !== null ? manualOverride.pump : calcPump;
  currentActuators.extractor1 = manualOverride.extractor1 !== null ? manualOverride.extractor1 : calcExtractor1;
  currentActuators.extractor2 = manualOverride.extractor2 !== null ? manualOverride.extractor2 : calcExtractor2;

  // Guardar en historial
  dataHistory.push({ ...currentReadings, actuators: { ...currentActuators } });
  if (dataHistory.length > MAX_HISTORY) {
    dataHistory.shift();
  }

  // Transmitir nuevos datos e historia a la página web en tiempo real por WebSockets
  io.emit('newData', {
    readings: currentReadings,
    actuators: currentActuators
  });

  console.log(`[${timestamp}] Datos recibidos de ${currentReadings.device_id} | pH: ${currentReadings.ph} | EC: ${currentReadings.ec}`);

  // Responder al ESP32 indicándole el estado de los actuadores
  res.json({
    status: 'success',
    pump: currentActuators.pump,
    extractor1: currentActuators.extractor1,
    extractor2: currentActuators.extractor2,
    led: currentActuators.pump || currentActuators.extractor1 || currentActuators.extractor2
  });
});

// Ruta API para cambiar estado manual desde la web
app.post('/api/control', (req, res) => {
  const { device, state } = req.body; // state: 'auto', 'on', 'off'
  
  if (device in manualOverride) {
    if (state === 'auto') manualOverride[device] = null;
    else if (state === 'on') manualOverride[device] = true;
    else if (state === 'off') manualOverride[device] = false;
  }

  io.emit('actuatorUpdate', { actuators: currentActuators, override: manualOverride });
  res.json({ success: true, override: manualOverride });
});

// Configurar WebSockets
io.on('connection', (socket) => {
  console.log('Cliente Web conectado');
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
