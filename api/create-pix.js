// Vercel Serverless Function: /api/create-pix.js
// Integrates securely with ParadisePags gateway to generate Pix payments

function generateValidCPF() {
    const rnd = n => Math.floor(Math.random() * n);
    const n = Array.from({ length: 9 }, () => rnd(10));
    let d1 = n.reduce((total, number, index) => total + (number * (10 - index)), 0) % 11;
    d1 = d1 < 2 ? 0 : 11 - d1;
    let d2 = [...n, d1].reduce((total, number, index) => total + (number * (11 - index)), 0) % 11;
    d2 = d2 < 2 ? 0 : 11 - d2;
    return [...n, d1, d2].join('');
}

export default async function handler(req, res) {
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
        const { amount, name, email, cpf, utm, description } = req.body;

        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Valor de doação inválido.' });
        }

        // ParadisePags API Key from Environment Variables
        const apiKey = process.env.PARADISE_API_KEY || process.env.PARADISEPAGS_API_KEY;

        // If no API Key is set, fallback to Mock Demo Mode for layout presentation
        if (!apiKey) {
            console.log('Ambiente de Demonstração: PARADISE_API_KEY não configurada.');
            const mockCopiaCola = `00020101021226830014br.gov.bcb.pix2561multi.paradisepags.com/transacoes/ali_${Math.random().toString(36).substring(7)}5204000053039865405${parseFloat(amount).toFixed(2)}5802BR5921Ali Cavalos Resgates6009Sao Paulo62070503***6304${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;
            
            return res.status(200).json({
                success: true,
                demo: true,
                pix_copia_cola: mockCopiaCola,
                pix_qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockCopiaCola)}`,
                amount: amount,
                message: 'Modo demonstração: Configure PARADISE_API_KEY no painel da Vercel para gerar Pix real.'
            });
        }

        const amountInCents = Math.round(parseFloat(amount) * 100);
        const validDoc = (cpf && cpf.replace(/\D/g, '').length === 11) ? cpf.replace(/\D/g, '') : generateValidCPF();

        const payload = {
            amount: amountInCents,
            description: description || 'Doação Ali Cavalos Resgates',
            reference: 'ali_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            source: 'api_externa',
            customer: {
                name: name || 'Doador Ali Cavalos',
                email: (email && email.indexOf('@') !== -1) ? email : 'doador@alicavalos.org',
                document: validDoc,
                phone: '11987654321'
            },
            tracking: utm ? {
                utm_source: utm.utm_source || '',
                utm_medium: utm.utm_medium || '',
                utm_campaign: utm.utm_campaign || '',
                utm_term: utm.utm_term || '',
                utm_content: utm.utm_content || '',
                src: utm.src || '',
                sck: utm.sck || ''
            } : undefined
        };

        // Call ParadisePags Gateway
        const response = await fetch('https://multi.paradisepags.com/api/v1/transaction.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || (data.status !== 'success' && !data.qr_code && !data.pix_copia_cola)) {
            const errMsg = data.message || data.error || (data.errors ? JSON.stringify(data.errors) : 'Erro na gateway ParadisePags.');
            return res.status(400).json({ error: errMsg });
        }

        const pixCode = data.qr_code || data.pix_copia_cola || data.code || '';
        let qrCodeImage = data.qr_code_base64 || data.qr_code_url || '';
        if (qrCodeImage && !qrCodeImage.startsWith('data:') && !qrCodeImage.startsWith('http')) {
            qrCodeImage = 'data:image/png;base64,' + qrCodeImage;
        }

        // Notify Utmify API server-side
        try {
            const utmToken = process.env.UTMIFY_API_TOKEN || '6a58d5851448fa453642d0da';
            fetch('https://api.utmify.com.br/api/v1/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': utmToken,
                    'x-api-key': utmToken
                },
                body: JSON.stringify({
                    orderId: data.transaction_id || payload.reference,
                    platform: 'ParadisePags',
                    paymentMethod: 'pix',
                    status: 'waiting_payment',
                    createdAt: new Date().toISOString(),
                    customer: {
                        name: payload.customer.name,
                        email: payload.customer.email,
                        phone: payload.customer.phone
                    },
                    products: [{
                        id: 'doacao_ali',
                        name: 'Doação Ali Cavalos Resgates',
                        price: amountInCents
                    }],
                    trackingParameters: utm || {}
                })
            }).catch(() => {});
        } catch (uErr) {}

        return res.status(200).json({
            success: true,
            pix_copia_cola: pixCode,
            pix_qr_code: qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`,
            amount: amount,
            transaction_id: data.transaction_id || payload.reference
        });

    } catch (err) {
        console.error('Erro na API Serverless:', err);
        return res.status(500).json({ error: 'Erro interno ao processar a requisição: ' + err.message });
    }
}
