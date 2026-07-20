document.addEventListener('DOMContentLoaded', () => {
    // 1. Load First Pix Data from SessionStorage
    const firstQr = sessionStorage.getItem('first_pix_qr');
    const firstCode = sessionStorage.getItem('first_pix_code');
    const firstAmount = sessionStorage.getItem('first_pix_amount') || '0';

    const txtFirstAmount = document.getElementById('txtFirstAmount');
    const lblFirstAmount = document.getElementById('lblFirstAmount');
    const firstPixQr = document.getElementById('firstPixQr');
    const firstPixCode = document.getElementById('firstPixCode');
    const btnCopyFirstPix = document.getElementById('btnCopyFirstPix');
    const copyStatusText = document.getElementById('copyStatusText');

    if (txtFirstAmount) txtFirstAmount.innerText = `R$ ${parseFloat(firstAmount).toFixed(2).replace('.', ',')}`;
    if (lblFirstAmount) lblFirstAmount.innerText = `${parseFloat(firstAmount).toFixed(2).replace('.', ',')}`;
    if (firstPixQr && firstQr) firstPixQr.src = firstQr;
    if (firstPixCode && firstCode) firstPixCode.value = firstCode;

    // 2. Copy First Pix to Clipboard
    if (btnCopyFirstPix && firstPixCode) {
        btnCopyFirstPix.addEventListener('click', () => {
            firstPixCode.select();
            firstPixCode.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(firstPixCode.value).then(() => {
                if (copyStatusText) {
                    copyStatusText.style.display = 'block';
                    setTimeout(() => { copyStatusText.style.display = 'none'; }, 3000);
                }
            });
        });
    }

    // 3. VSL Video Playback (Unmuted on click)
    const btnPlayHeroVideo = document.getElementById('btnPlayHeroVideo');
    const heroMediaContainer = document.getElementById('heroMediaContainer');
    
    if (btnPlayHeroVideo && heroMediaContainer) {
        btnPlayHeroVideo.addEventListener('click', () => {
            const videoEl = document.createElement('video');
            videoEl.src = 'assets/videos/video_principal.mp4';
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.muted = false; // Play with sound
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

    // 4. Secondary Pix Generation Flow (Upsell Options)
    const upsellButtons = document.querySelectorAll('.upsell-btn');
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutClose = document.getElementById('checkoutClose');
    const secondPixQr = document.getElementById('secondPixQr');
    const secondPixCode = document.getElementById('secondPixCode');
    const btnCopySecondPix = document.getElementById('btnCopySecondPix');
    const secondCopyStatusText = document.getElementById('secondCopyStatusText');

    const openCheckoutModal = () => {
        checkoutModal.classList.add('active');
        checkoutModal.setAttribute('aria-hidden', 'false');
    };

    const closeCheckoutModal = () => {
        checkoutModal.classList.remove('active');
        checkoutModal.setAttribute('aria-hidden', 'true');
    };

    if (checkoutClose) checkoutClose.addEventListener('click', closeCheckoutModal);

    upsellButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const val = btn.getAttribute('data-upsell-value');
            
            // Disable buttons temporarily
            upsellButtons.forEach(b => b.style.pointerEvents = 'none');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span style="font-size: 1rem; font-weight:600;">GERANDO PIX EXTRA...</span>`;

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
                        amount: val,
                        name: 'Doador Ali Cavalos (Upsell)',
                        email: 'doador@alicavalos.org',
                        cpf: '11111111111',
                        utm: utmData
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Erro ao processar');

                if (secondPixQr) secondPixQr.src = data.pix_qr_code;
                if (secondPixCode) secondPixCode.value = data.pix_copia_cola;

                openCheckoutModal();

            } catch (err) {
                alert(`Erro ao gerar Pix extra: ${err.message}`);
            } finally {
                btn.innerHTML = originalText;
                upsellButtons.forEach(b => b.style.pointerEvents = 'auto');
            }
        });
    });

    if (btnCopySecondPix && secondPixCode) {
        btnCopySecondPix.addEventListener('click', () => {
            secondPixCode.select();
            secondPixCode.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(secondPixCode.value).then(() => {
                if (secondCopyStatusText) {
                    secondCopyStatusText.style.display = 'block';
                    setTimeout(() => { secondCopyStatusText.style.display = 'none'; }, 3000);
                }
            });
        });
    }
});
