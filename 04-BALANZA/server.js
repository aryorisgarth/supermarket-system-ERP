const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3030);
const API_URL = process.env.API_URL || 'http://api:8081/api';

app.use(cors());
app.use(express.json());

// Healthcheck ANTES de static: evita 404 si no hay archivo /health en public/
app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'balanza', apiUrl: API_URL });
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate-ean13', (req, res) => {
    const { plu, weight } = req.body;

    if (!plu || !weight) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    const paddedPlu = String(plu).padStart(5, '0');
    const weightVal = Math.round(parseFloat(weight) * 1000);
    const paddedWeight = String(weightVal).padStart(5, '0');
    const code12 = `20${paddedPlu}${paddedWeight}`;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(code12[i], 10);
        sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const remainder = sum % 10;
    const checksum = remainder === 0 ? 0 : 10 - remainder;
    const finalEan13 = `${code12}${checksum}`;

    res.json({ ean13: finalEan13 });
});

app.listen(PORT, () => {
    console.log(`Simulador de Balanza en http://localhost:${PORT}`);
    console.log(`API configurada en ${API_URL}`);
});
