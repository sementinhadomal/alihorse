// Vercel Serverless Function: /api/create-pix.js
// Integrates securely with ParadisePags gateway to generate Pix payments

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
    }

    try {
        const { amount, name, email, cpf } = req.body;

        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Valor de doação inválido.' });
        }

        // ParadisePags API Key from Environment Variables
        const apiKey = process.env.PARADISE_API_KEY;

        // If no API Key is set, fallback to Mock Demo Mode for layout presentation
        if (!apiKey) {
            console.log('Ambiente de Demonstração: PARADISE_API_KEY não configurada.');
            
            // Mock dynamic Pix details
            const mockCopiaCola = `00020101021226830014br.gov.bcb.pix2561multi.paradisepags.com/transacoes/ali_${Math.random().toString(36).substring(7)}5204000053039865405${parseFloat(amount).toFixed(2)}5802BR5921Ali Cavalos Resgates6009Sao Paulo62070503***6304${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;
            
            // Return placeholder QR code image and copy/paste text
            return res.status(200).json({
                success: true,
                demo: true,
                pix_copia_cola: mockCopiaCola,
                pix_qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockCopiaCola)}`,
                amount: amount,
                message: 'Doação gerada com sucesso em ambiente de simulação!'
            });
        }

        // Parse amount to cents (common standard for payment gateways)
        const amountInCents = Math.round(parseFloat(amount) * 100);

        // ParadisePags standard API call
        // Adjust endpoint URL when actual endpoint is confirmed in credentials
        const response = await fetch('https://multi.paradisepags.com/api/v1/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                payment_method: 'pix',
                amount: amountInCents,
                customer: {
                    name: name || 'Doador Anônimo',
                    email: email || 'doador@alicavalos.org',
                    document: cpf ? cpf.replace(/\D/g, '') : '00000000000'
                },
                description: 'Doação Ali Cavalos Resgates',
                metadata: {
                    project: 'ali-cavalos-resgates'
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.message || 'Erro ao processar pagamento junto à gateway.' 
            });
        }

        // Return standard structure returned by gateway (adjust if actual payload changes)
        return res.status(200).json({
            success: true,
            pix_copia_cola: data.pix_copia_cola || data.pix_code || data.qrcode_text,
            pix_qr_code: data.pix_qr_code || data.qrcode_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.pix_copia_cola || '')}`,
            amount: amount,
            transaction_id: data.id
        });

    } catch (err) {
        console.error('Erro na API Serverless:', err);
        return res.status(500).json({ error: 'Erro interno ao processar a requisição.' });
    }
}
