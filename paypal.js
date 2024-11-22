const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // Para manejar JSON

// Configuración del entorno de PayPal
function environment() {
    let clientId = 'Aaswf6EUR4wHiCPTnHHHdmBvRRExF4GlSjdoOeVC05LzYnNyiISLyDl-z60VTSRin-CLpY-_udZ7ZLaL';
    let clientSecret = 'EHQwVKrsf54L8TtRfUt_pmEE7SFQTx2aBD2-tIbRey_dQZ7u0OM3mHhWXxP7H-YaDOPg-kZbu89SXW6U';
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// Crear el cliente de PayPal
const client = new paypal.core.PayPalHttpClient(environment());

// Ruta para crear el pago
app.post('/create-payment', async (req, res) => {
    const { amount, currency } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: currency,
                value: amount  // El monto que se envió desde el frontend
            }
        }],
        application_context: {
            return_url: 'http://localhost:5001/execute-payment',  // URL para aprobar el pago
            cancel_url: 'http://localhost:5001/cancel-payment'    // URL para cancelar el pago
        }
    });

    try {
        const order = await client.execute(request);
        res.json({
            return_url: order.result.links.find(link => link.rel === 'approve').href,
            cancel_url: order.result.links.find(link => link.rel === 'cancel').href
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el pago');
    }
});

// Ruta para ejecutar el pago después de la aprobación
app.post('/execute-payment', async (req, res) => {
    const { orderID } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    
    try {
        const capture = await client.execute(request);
        res.json({
            payer: capture.result.payer,
            status: capture.result.status
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al capturar el pago');
    }
});

// Ruta para manejar cancelación
app.get('/cancel-payment', (req, res) => {
    res.send('Pago cancelado.');
});

// Iniciar el servidor
app.listen(5001, () => {
    console.log('Servidor en el puerto 5001');
});
