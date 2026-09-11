const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos (MongoDB)
mongoose.connect('mongodb://localhost:27017/hidroponia', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const dataSchema = new mongoose.Schema({
    device_id: String,
    temperature: Number,
    humidity: Number,
    gas: Number,
    ph: Number,
    ec: Number,
    timestamp: { type: Date, default: Date.now }
});

const Data = mongoose.model('Data', dataSchema);

// Ruta para recibir los datos del ESP32
app.post('/api/data', async (req, res) => {
    const { device_id, temperature, humidity, gas, ph, ec } = req.body;

    const newData = new Data({ device_id, temperature, humidity, gas, ph, ec });
    await newData.save();

    // Lógica para activar bombas y extractores
    const response = {
        led: false,
        relay: false
    };

    if (ph < 5.5 || ph > 6.5 || ec > 2.0 || temperature > 30 || humidity > 80) {
        response.relay = true; // Activa la bomba/extractor
    }

    res.json(response);
});

// Ruta para obtener el historial de datos
app.get('/api/data/history', async (req, res) => {
    const history = await Data.find().sort({ timestamp: -1 }).limit(20);
    res.json(history);
});

// Servidor escuchando
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
