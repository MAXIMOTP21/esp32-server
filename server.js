const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor ESP32 funcionando");
});

app.post("/api/data", (req, res) => {

    console.log("Datos recibidos:");
    console.log(req.body);

    res.json({
        status: "ok",
        led: true,
        relay: false,
        sampling: 5000
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
