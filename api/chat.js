const https = require('https');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return simulateFallbackResponse(messages, res);
    }

    // Format messages for Gemini API
    const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const systemInstruction = {
        parts: [{
            text: `Você é o próprio "Ali", fundador do "Ali Resgate Cavalos". Um protetor de animais humilde, batalhador e extremamente apaixonado por salvar cavalos de situações de rua, abandono, fome e maus-tratos.
Seu objetivo é conversar de forma amigável, acolhedora e humilde com os visitantes do site, tirando dúvidas sobre o abrigo e persuadindo-os a fazer uma doação Pix para apoiar na compra de ração, alfafa, medicamentos e cirurgias dos cavalos.

Você está totalmente preparado para responder as seguintes perguntas frequentes do projeto:
- Para onde vai minha doação?
  Toda contribuição financeira é direcionada para custear a compra direta de feno, vacinas, honorários de cirurgias, combustível para locomoção da caminhonete de resgate, e manutenção básica do sítio de reabilitação.
- Como acompanho os resgates?
  Publicamos diariamente as atualizações de todos os casos e novos resgates em nossa rede social do Instagram e enviamos boletins aos doadores.
- Vocês possuem veterinários parceiros?
  Sim. Contamos com a parceria de clínicas de grandes animais e veterinários de campo especializados que atendem as emergências do projeto e oferecem descontos solidários.
- Posso ajudar de outra forma? Aceitam voluntários?
  Com certeza. Aceitamos doações em insumos diretamente no nosso sítio (feno, sacos de ração, remédios, cabrestos). Também abrimos vagas periódicas para voluntários interessados em ajudar no trato direto dos cavalos aos finais de semana.
- Posso fazer doações mensais?
  Sim. Através de doações frequentes via Pix, você pode apoiar mensalmente o nosso projeto, garantindo uma receita fixa para o sustento contínuo das baias do projeto.

Instruções de conduta:
1. Responda em Português do Brasil com frases acolhedoras, empáticas e sinceras.
2. Use termos humanos e simples.
3. Se quiserem doar, mencione que podem usar os botões rápidos de valor ("Doar agora: R$ 20, R$ 30, R$ 50, R$ 100") no próprio chat ou fechar o chat e clicar no botão dourado/laranja "QUERO AJUDAR AGORA".
4. Escreva respostas curtas (máximo de 3 parágrafos) para manter a leitura agradável no celular.`
        }]
    };

    const postData = JSON.stringify({
        contents,
        systemInstruction,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400
        }
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (chunk) => body += chunk);
        response.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                    const replyText = data.candidates[0].content.parts[0].text;
                    res.status(200).json({ reply: replyText });
                } else {
                    console.error('Gemini API Error Response:', body);
                    res.status(500).json({ error: 'Invalid response from Gemini model' });
                }
            } catch (e) {
                res.status(500).json({ error: 'Failed to parse AI response' });
            }
        });
    });

    request.on('error', (e) => {
        console.error('Gemini Request Error:', e);
        res.status(500).json({ error: 'Request to Gemini failed' });
    });

    request.write(postData);
    request.end();
};

function simulateFallbackResponse(messages, res) {
    const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
    let reply = "Olá! Eu sou o próprio Ali. 🐴 Cuidamos de dezenas de cavalos resgatados e dependemos de ajuda externa para feno, veterinário e remédios. Como posso te ajudar hoje? (Você também pode usar as opções rápidas de valores abaixo para doar!)";
    
    if (lastUserMessage.includes('para onde') || lastUserMessage.includes('destinado') || lastUserMessage.includes('destino') || lastUserMessage.includes('onde vai') || lastUserMessage.includes('recurso')) {
        reply = "Toda doação financeira que recebemos é direcionada para custear a compra direta de feno, vacinas, honorários de cirurgias, combustível para a caminhonete de resgate e manutenção básica do sítio de reabilitação. Cuidamos de cada centavo com muita responsabilidade!";
    } else if (lastUserMessage.includes('acompanho') || lastUserMessage.includes('ver') || lastUserMessage.includes('instagram') || lastUserMessage.includes('rede social') || lastUserMessage.includes('fotos') || lastUserMessage.includes('noticia')) {
        reply = "Nós publicamos diariamente as atualizações de todos os casos e novos resgates no nosso Instagram oficial e enviamos boletins informativos constantes para os doadores cadastrados. Você vai acompanhar de perto a recuperação dos cavalos!";
    } else if (lastUserMessage.includes('veterinario') || lastUserMessage.includes('médico') || lastUserMessage.includes('cirurgia') || lastUserMessage.includes('clinica')) {
        reply = "Sim, contamos com o apoio e parceria de excelentes clínicas de grandes animais e veterinários de campo especializados. Eles atendem nossas emergências a qualquer hora e nos oferecem descontos solidários em tratamentos complexos.";
    } else if (lastUserMessage.includes('mensal') || lastUserMessage.includes('todo mes') || lastUserMessage.includes('mensalmente') || lastUserMessage.includes('fixa')) {
        reply = "Seria maravilhoso! Através de doações recorrentes via Pix, você nos ajuda a ter uma receita fixa para o sustento contínuo das baias e tratamento diário dos animais resgatados. Qualquer valor ajuda muito!";
    } else if (lastUserMessage.includes('voluntario') || lastUserMessage.includes('outra forma') || lastUserMessage.includes('ajudar de outra') || lastUserMessage.includes('insumo') || lastUserMessage.includes('ração') || lastUserMessage.includes('feno')) {
        reply = "Aceitamos com muita alegria doações em insumos direto no nosso sítio (como sacos de ração, feno, remédios e cabrestos). Também abrimos vagas de voluntariado periódicas para ajudar no trato direto dos cavalos aos finais de semana. Fale conosco se tiver interesse!";
    } else if (lastUserMessage.includes('como') || lastUserMessage.includes('doar') || lastUserMessage.includes('ajudar') || lastUserMessage.includes('pix') || lastUserMessage.includes('pagar') || lastUserMessage.includes('valor')) {
        reply = "Para doar é super rápido: você pode clicar em qualquer um dos botões rápidos de valor (como 'R$ 20', 'R$ 50') bem acima desta barra de digitação. O chat se fechará e abrirá a tela com o Pix Copia e Cola gerado na hora!";
    } else if (lastUserMessage.includes('obrigado') || lastUserMessage.includes('obrigada') || lastMessageIsGreeting(lastUserMessage)) {
        if (lastMessageIsGreeting(lastUserMessage)) {
            reply = "Olá! Seja muito bem-vindo. Eu sou o Ali! 🐴 É um prazer conversar com você. Gostaria de saber mais sobre o resgate de cavalos ou como fazer uma doação?";
        } else {
            reply = "De coração, eu é que agradeço pelo carinho e pela visita! Se puder nos ajudar a alimentar os cavalos hoje, basta escolher um valor nos botões de doação acima. Que Deus te abençoe! 🙏";
        }
    }
    
    setTimeout(() => {
        res.status(200).json({ reply });
    }, 600);
}

function lastMessageIsGreeting(msg) {
    const greetings = ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'eae'];
    return greetings.some(g => msg.startsWith(g) || msg === g);
}
