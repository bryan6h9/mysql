// Asegúrate de cargar el SDK de PayPal en tu HTML:
<script src="https://www.paypal.com/sdk/js?client-id=Aaswf6EUR4wHiCPTnHHHdmBvRRExF4GlSjdoOeVC05LzYnNyiISLyDl-z60VTSRin-CLpY-_udZ7ZLaL&components=buttons"></script>

// Crear el botón de PayPal en el frontend
paypal.Buttons({
    createOrder: async function(data, actions) {
        // Hacer una solicitud a tu backend para crear el pago
        const response = await fetch('/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: '10.00',  // Este valor debe ser dinámico dependiendo del producto seleccionado
                currency: 'USD'
            })
        });

        const data = await response.json();
        
        // Retornar la URL de aprobación recibida desde el backend
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '10.00',  // O usa el valor recibido del backend
                    currency_code: 'USD'
                }
            }],
            application_context: {
                return_url: data.return_url,  // URL para aprobar el pago
                cancel_url: data.cancel_url   // URL en caso de cancelar
            }
        });
    },
    onApprove: async function(data, actions) {
        // Capturar el pago después de la aprobación
        const response = await fetch('/execute-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderID: data.orderID
            })
        });

        const data = await response.json();

        // Manejar el pago capturado exitosamente
        alert('Pago completado: ' + data.payer.name.given_name);
        window.location.href = 'thankyou.html';  // Redirigir a página de agradecimiento
    },
    onCancel: function(data) {
        // Si el usuario cancela el pago
        alert('El pago fue cancelado.');
        window.location.href = 'cancel.html';  // Redirigir a página de cancelación
    },
    onError: function(err) {
        console.error('Error en el proceso de pago:', err);
        alert('Hubo un error al procesar el pago.');
    }
}).render('#paypal-button-container'); // Esto renderiza el botón de PayPal en el contenedor con id 'paypal-button-container'
