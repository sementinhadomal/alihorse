document.addEventListener('DOMContentLoaded', () => {
    let selectedValue = '30'; // Default selected value

    const valButtons = document.querySelectorAll('.val-btn');
    const btnDoarAgora = document.getElementById('btnDoarAgora');

    // 1. Preset value buttons selection
    valButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            valButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedValue = btn.getAttribute('data-value');
        });
    });

    // 2. Play VSL Video Unmuted
    const btnPlayHeroVideo = document.getElementById('btnPlayHeroVideo');
    const heroMediaContainer = document.getElementById('heroMediaContainer');
    
    if (btnPlayHeroVideo && heroMediaContainer) {
        btnPlayHeroVideo.addEventListener('click', () => {
            const videoEl = document.createElement('video');
            videoEl.src = 'assets/videos/video_principal.mp4';
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.muted = false; // Enabled sound
            videoEl.defaultMuted = false;
            videoEl.playsInline = true;
            videoEl.controls = true;
            videoEl.style.width = '100%';
            videoEl.style.height = '100%';
            videoEl.style.objectFit = 'cover';
            
            heroMediaContainer.innerHTML = '';
            heroMediaContainer.appendChild(videoEl);
        });
    }

    // 3. Create Pix and redirect to Upsell Page
    if (btnDoarAgora) {
        btnDoarAgora.addEventListener('click', async () => {
            btnDoarAgora.disabled = true;
            btnDoarAgora.innerText = 'GERANDO PIX...';

            try {
                // Fetch active UTM data from localStorage if available
                let utmData = {};
                try {
                    utmData = JSON.parse(localStorage.getItem('utmify_data')) || {};
                } catch(e) {}

                const response = await fetch('/api/create-pix', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: selectedValue,
                        description: 'Doação Ali Cavalos - Black Redirect (Recuperação)',
                        name: 'Doador Ali Cavalos (Recuperação)',
                        email: 'doador@alicavalos.org',
                        cpf: '11111111111',
                        utm: utmData
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Erro ao gerar Pix');

                // Save generated details to sessionStorage
                sessionStorage.setItem('first_pix_qr', data.pix_qr_code);
                sessionStorage.setItem('first_pix_code', data.pix_copia_cola);
                sessionStorage.setItem('first_pix_amount', selectedValue);

                // Redirect to Upsell page
                window.location.href = 'upsell.html';

            } catch (err) {
                alert(`Erro: ${err.message}`);
                btnDoarAgora.disabled = false;
                btnDoarAgora.innerText = '❤️ GERAR PIX DE DOAÇÃO';
            }
        });
    }
});
