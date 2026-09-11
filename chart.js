<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Monitoreo Hidropónico</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <h1>Monitoreo Hidropónico</h1>
    <canvas id="myChart" width="400" height="200"></canvas>
    <script>
        const ctx = document.getElementById('myChart').getContext('2d');
        let labels = [];
        let data = [];
        
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        function fetchData() {
            fetch('https://esp32-server-xpqh.onrender.com/api/data/history')
                .then(response => response.json())
                .then(history => {
                    labels = history.map(entry => new Date(entry.timestamp).toLocaleString());
                    data = history.map(entry => entry.temperature);
                    myChart.data.labels = labels;
                    myChart.data.datasets[0].data = data;
                    myChart.update();
                });
        }

        setInterval(fetchData, 10000); // Actualiza cada 10 segundos
    </script>
</body>
</html>
