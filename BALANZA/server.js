const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3030;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint de prueba por si luego quieren conectar cosas por red
app.post('/api/generate-ean13', (req, res) => {
    const { plu, weight } = req.body;
    
    if (!plu || !weight) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    // Asegurarse que PLU tenga 5 dígitos
    const paddedPlu = String(plu).padStart(5, '0');
    
    // Asumimos que el peso viene como float ej: 2.5
    // Para EAN-13, multiplicamos por 1000 y aseguramos 5 dígitos
    const weightVal = Math.round(parseFloat(weight) * 1000);
    const paddedWeight = String(weightVal).padStart(5, '0');

    // Trama de 12 dígitos
    const code12 = `20${paddedPlu}${paddedWeight}`;

    // Calcular dígito verificador Modulo 10
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
    console.log(`📠 Simulador de Balanza ejecutándose en http://localhost:${PORT}`);
});
