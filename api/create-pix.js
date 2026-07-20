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
        const { amount, name, email, cpf, utm, description } = req.body;

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

        // ParadisePags standard API call according to api-contract.md
        const response = await fetch('https://multi.paradisepags.com/api/v1/transaction.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({
                amount: amountInCents,
                description: description || 'Doação Ali Cavalos Resgates',
                reference: 'ali_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                source: 'api_externa', // Bypasses productHash validation
                customer: {
                    name: name || 'Doador Anonimo',
                    email: email || 'doador@alicavalos.org',
                    document: cpf ? cpf.replace(/\D/g, '') : '00000000000',
                    phone: '11999999999' // Required parameter (numbers only)
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
            })
        });

        const data = await response.json();

        // Ensure transaction is success and returned the Pix code
        if (!response.ok || data.status !== 'success' || !data.qr_code) {
            return res.status(response.status || 400).json({ 
                error: data.message || 'Não foi possível gerar este Pix. Verifique se o valor está dentro do limite permitido da conta.' 
            });
        }

        // Format qr_code image source
        let qrCodeImage = data.qr_code_base64 || '';
        if (qrCodeImage && !qrCodeImage.startsWith('data:')) {
            qrCodeImage = 'data:image/png;base64,' + qrCodeImage;
        }

        // Return standard structure returned by gateway
        return res.status(200).json({
            success: true,
            pix_copia_cola: data.qr_code,
            pix_qr_code: qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qr_code || '')}`,
            amount: amount,
            transaction_id: data.transaction_id
        });

    } catch (err) {
        console.error('Erro na API Serverless:', err);
        return res.status(500).json({ error: 'Erro interno ao processar a requisição.' });
    }
}
