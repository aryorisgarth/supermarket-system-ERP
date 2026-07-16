const http = require('http');
async function testBarcode() {
    try {
        const loginRes = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@admin.com', password: 'password' })
        });
        const loginText = await loginRes.text();
        console.log("LOGIN HTTP", loginRes.status, loginText);
        let token = "";
        if (loginRes.ok) {
            token = JSON.parse(loginText).token;
        }

        const res = await fetch('http://localhost:8081/api/products/barcode/2001110025004', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const text = await res.text();
        console.log("BARCODE HTTP", res.status, text);
    } catch (e) {
        console.error("ERROR:", e);
    }
}

testBarcode();
