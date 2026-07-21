document.addEventListener('DOMContentLoaded', () => {
    // UTM Parameter Capture & Storage
    function captureUtmParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'src', 'sck'];
            const current = JSON.parse(localStorage.getItem('ali_cavalos.utm') || '{}');
            const updated = {};
            
            utmKeys.forEach(key => {
                const val = params.get(key);
                updated[key] = val !== null ? val : (current[key] || '');
            });
            
            localStorage.setItem('ali_cavalos.utm', JSON.stringify(updated));
        } catch (e) {
            console.error('Error capturing UTMs:', e);
        }
    }
    
    function getUtmData() {
        try {
            return JSON.parse(localStorage.getItem('ali_cavalos.utm') || '{}');
        } catch (e) {
            return {};
        }
    }

    // Initialize UTM capture
    captureUtmParams();

    // 1. Mobile Menu Toggle
    const menuBtn = document.getElementById('menuBtn');
    const nav = document.getElementById('nav');
    
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            const isActive = nav.classList.contains('active');
            menuBtn.setAttribute('aria-expanded', isActive);
            menuBtn.innerHTML = isActive ? '&#x2715;' : '&#x2630;'; // X or Hamburger
        });
    }

    // Header scroll background change
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Observer
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Gallery Lightbox Handler
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryCards = document.querySelectorAll('.gallery-card');

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const imgSrc = card.querySelector('img').getAttribute('data-fullsrc') || card.querySelector('img').getAttribute('src');
            lightboxImg.setAttribute('src', imgSrc);
            lightbox.style.display = 'flex';
            lightbox.setAttribute('aria-hidden', 'false');
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.style.display = 'none';
            lightbox.setAttribute('aria-hidden', 'true');
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
                lightbox.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // 4. Video Play Cards on Demand
    const videoThumbs = document.querySelectorAll('.video-thumbnail-container');
    videoThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const videoUrl = thumb.getAttribute('data-video');
            const isLocal = thumb.getAttribute('data-local') === 'true';
            
            if (isLocal) {
                // Local Video
                const videoEl = document.createElement('video');
                videoEl.setAttribute('src', videoUrl);
                videoEl.setAttribute('controls', 'true');
                videoEl.setAttribute('autoplay', 'true');
                videoEl.style.width = '100%';
                videoEl.style.height = '100%';
                videoEl.style.objectFit = 'cover';
                thumb.innerHTML = '';
                thumb.appendChild(videoEl);
            } else {
                // YouTube Embed
                const iframe = document.createElement('iframe');
                iframe.setAttribute('src', `https://www.youtube.com/embed/${videoUrl}?autoplay=1`);
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                thumb.innerHTML = '';
                thumb.appendChild(iframe);
            }
        });
    });

    // 4. Video Play Cards on Demand (Hidden/Removed placeholder)
    // Note: Video play features are ready for when video links are provided.
    const btnPlayHeroVideo = document.getElementById('btnPlayHeroVideo');
    const heroMediaContainer = document.getElementById('heroMediaContainer');
    
    if (btnPlayHeroVideo && heroMediaContainer) {
        btnPlayHeroVideo.addEventListener('click', () => {
            const videoEl = document.createElement('video');
            videoEl.src = 'assets/videos/video_principal.mp4';
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.muted = false; // Enabled audio since user clicked play button
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

    // 6. Checkout Modal & Donation Value Selection
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutClose = document.getElementById('checkoutClose');
    const openModalBtns = document.querySelectorAll('.btn-open-donation');
    const checkoutValBtns = document.querySelectorAll('.checkout-val-btn');
    const checkoutCustomInput = document.getElementById('checkoutCustomValue');
    const btnDoarAgora = document.getElementById('btnDoarAgora');
    
    // UI steps inside the modal
    const stepInputDiv = document.getElementById('checkoutStepInput');
    const stepPixDiv = document.getElementById('checkoutStepPix');
    const pixQrImg = document.getElementById('pixQrImg');
    const pixCodeText = document.getElementById('pixCodeText');
    const btnCopyPix = document.getElementById('btnCopyPix');
    const btnBackToInput = document.getElementById('btnBackToInput');

    let currentSelectedValue = '50'; // default starting choice

    const shippingFieldsContainer = document.getElementById('shippingFieldsContainer');
    const shippingNameInput = document.getElementById('shippingName');
    const shippingPhoneInput = document.getElementById('shippingPhone');
    const shippingCepInput = document.getElementById('shippingCep');
    const shippingAddressInput = document.getElementById('shippingAddress');
    const shippingCityInput = document.getElementById('shippingCity');

    const updateShippingFieldsVisibility = (val) => {
        const numVal = parseFloat(val) || 0;
        if (shippingFieldsContainer) {
            if (numVal >= 50) {
                shippingFieldsContainer.style.display = 'block';
            } else {
                shippingFieldsContainer.style.display = 'none';
            }
        }
        if (typeof window.updateModalColarDisplay === 'function') {
            window.updateModalColarDisplay();
        }
    };

    const openCheckout = (initialValue = '') => {
        checkoutModal.classList.add('active');
        checkoutModal.setAttribute('aria-hidden', 'false');
        
        // Reset states
        stepInputDiv.style.display = 'block';
        stepPixDiv.style.display = 'none';

        // Reset Order Bump Pix screen element to default state
        const orderBumpPixContainer = document.getElementById('orderBumpPixContainer');
        if (orderBumpPixContainer) {
            orderBumpPixContainer.style.display = 'flex';
            orderBumpPixContainer.style.background = 'rgba(245, 158, 11, 0.06)';
            orderBumpPixContainer.style.borderColor = 'var(--color-accent)';
            orderBumpPixContainer.innerHTML = `
                <div style="font-size: 0.85rem; color: var(--color-text-dark); font-weight: 500; line-height: 1.35; width: 100%;">
                    <span style="font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 0.25rem;">🐴 Ajudar Mais Cavalos (Doação Extra)</span>
                    Escolha um valor adicional para apoiar no tratamento de outros cavalos resgatados. Ajude para que, da próxima vez, não precise chegar a essa urgência:
                </div>
                <div style="display: flex; gap: 1rem; margin: 0.15rem 0; width: 100%;">
                    <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; font-weight: bold; color: var(--color-primary); cursor: pointer; user-select: none;">
                        <input type="radio" name="extraAmountOption" value="10" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--color-accent);"> + R$ 10,00
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; font-weight: bold; color: var(--color-primary); cursor: pointer; user-select: none;">
                        <input type="radio" name="extraAmountOption" value="15" checked style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--color-accent);"> + R$ 15,00
                    </label>
                </div>
                <button class="btn btn-primary" id="btnUpdatePix" style="width: 100%; border-radius: 6px; padding: 0.6rem; font-size: 0.9rem; background-color: var(--color-accent); color: var(--color-primary); font-weight: bold; border: none; cursor: pointer;">⚡ ATUALIZAR PIX COM VALOR EXTRA</button>
            `;
            setupPostBumpListeners();
        }
        
        if (initialValue) {
            currentSelectedValue = initialValue;
            if (checkoutCustomInput) checkoutCustomInput.value = '';
            
            // Highlight selected button, remove active from others
            checkoutValBtns.forEach(btn => {
                const btnVal = btn.getAttribute('data-value');
                if (btnVal === initialValue) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        updateShippingFieldsVisibility(currentSelectedValue);

        // Expose globally for chatbot widget integration
        window.openCheckout = openCheckout;
    };

    const closeCheckout = () => {
        checkoutModal.classList.remove('active');
        checkoutModal.setAttribute('aria-hidden', 'true');
    };

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const value = btn.getAttribute('data-donate-value');
            openCheckout(value);
        });
    });

    if (checkoutClose) {
        checkoutClose.addEventListener('click', closeCheckout);
    }

    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                closeCheckout();
            }
        });
    }

    // Modal quick value buttons
    checkoutValBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            checkoutValBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSelectedValue = btn.getAttribute('data-value');
            if (checkoutCustomInput) checkoutCustomInput.value = ''; // clear custom
            updateShippingFieldsVisibility(currentSelectedValue);
        });
    });

    // Custom input in modal
    if (checkoutCustomInput) {
        checkoutCustomInput.addEventListener('input', () => {
            // Remove active style from presets
            checkoutValBtns.forEach(b => b.classList.remove('active'));
            currentSelectedValue = checkoutCustomInput.value;
            updateShippingFieldsVisibility(currentSelectedValue);
        });
    }

    // Custom donation inputs from the page's Donation section
    const pageCustomValueInput = document.getElementById('customValueInput');
    const pageCustomDonateBtn = document.getElementById('pageCustomDonateBtn');
    if (pageCustomDonateBtn && pageCustomValueInput) {
        pageCustomDonateBtn.addEventListener('click', () => {
            const customVal = pageCustomValueInput.value.trim();
            if (customVal && parseFloat(customVal) > 0) {
                openCheckout(customVal);
                // Set custom input inside the modal
                if (checkoutCustomInput) checkoutCustomInput.value = customVal;
                checkoutValBtns.forEach(b => b.classList.remove('active'));
            } else {
                openCheckout('50'); // fallback
            }
        });
    }

    let timerInterval = null;
    function startPixCountdown() {
        const timerSpan = document.getElementById('pixTimer');
        if (!timerSpan) return;
        
        let timeLeft = 600; // 10 minutes in seconds
        
        if (timerInterval) clearInterval(timerInterval);
        
        timerSpan.innerText = '10:00';
        
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerSpan.innerText = 'Expirado';
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerSpan.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Checkout submission - Pix Generation Call
    if (btnDoarAgora) {
        btnDoarAgora.addEventListener('click', async () => {
            const finalVal = currentSelectedValue || (checkoutCustomInput ? checkoutCustomInput.value : 0);
            const numVal = parseFloat(finalVal) || 0;

            if (!finalVal || numVal <= 0) {
                alert('Por favor, selecione ou digite um valor de doação válido.');
                return;
            }

            let payerName = 'Doador Ali Cavalos';

            // Validate shipping fields if donation is R$ 50 or higher (receives necklace)
            if (numVal >= 50) {
                const sName = shippingNameInput ? shippingNameInput.value.trim() : '';
                const sPhone = shippingPhoneInput ? shippingPhoneInput.value.trim() : '';
                const sCep = shippingCepInput ? shippingCepInput.value.trim() : '';
                const sAddress = shippingAddressInput ? shippingAddressInput.value.trim() : '';
                const sCity = shippingCityInput ? shippingCityInput.value.trim() : '';

                if (!sName || !sPhone || !sAddress) {
                    alert('Por favor, preencha o seu Nome, Telefone/WhatsApp e Endereço para o envio do seu Colar de presente!');
                    if (!sName && shippingNameInput) shippingNameInput.focus();
                    else if (!sPhone && shippingPhoneInput) shippingPhoneInput.focus();
                    else if (!sAddress && shippingAddressInput) shippingAddressInput.focus();
                    return;
                }

                payerName = sName;

                // Save shipping details locally for order fulfillment (NOT sent to Paradise Pay)
                try {
                    localStorage.setItem('ali_cavalos.shipping_info', JSON.stringify({
                        name: sName,
                        phone: sPhone,
                        cep: sCep,
                        address: sAddress,
                        city: sCity,
                        amount: numVal,
                        timestamp: new Date().toISOString()
                    }));
                } catch (e) {}
            }

            // Show loading state
            btnDoarAgora.disabled = true;
            btnDoarAgora.innerText = 'GERANDO COBRANÇA PIX...';

            const pixQrLoader = document.getElementById('pixQrLoader');
            if (pixQrLoader) pixQrLoader.style.display = 'flex';
            if (pixQrImg) pixQrImg.style.display = 'none';

            try {
                /* Payload sent to Paradise Pay & CAPI - Includes userAgent for Meta CAPI compliance */
                const response = await fetch('/api/create-pix', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: finalVal.toString(),
                        name: payerName,
                        email: 'doador@alicavalos.org',
                        cpf: '11111111111',
                        userAgent: window.navigator.userAgent,
                        utm: getUtmData()
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Não foi possível gerar a transação no momento.');
                }

                // Store details in sessionStorage
                sessionStorage.setItem('first_pix_qr', data.pix_qr_code);
                sessionStorage.setItem('first_pix_code', data.pix_copia_cola);
                sessionStorage.setItem('first_pix_amount', finalVal.toString());

                // Render dynamic QR Code & Code in Step 2 of the modal
                pixQrImg.src = data.pix_qr_code;
                pixCodeText.value = data.pix_copia_cola;

                // Notify Utmify frontend script with user_agent for Meta CAPI
                try {
                    if (window.utmify && typeof window.utmify.track === 'function') {
                        window.utmify.track('InitiateCheckout', { 
                            amount: parseFloat(finalVal),
                            client_user_agent: window.navigator.userAgent,
                            user_agent: window.navigator.userAgent
                        });
                        window.utmify.track('PixGenerated', { 
                            amount: parseFloat(finalVal),
                            client_user_agent: window.navigator.userAgent,
                            user_agent: window.navigator.userAgent
                        });
                    }
                } catch (uErr) {}

                // Start timer
                startPixCountdown();

                // Move UI to Pix Display step
                stepInputDiv.style.display = 'none';
                stepPixDiv.style.display = 'block';

            } catch (err) {
                alert(`Erro: ${err.message}`);
            } finally {
                btnDoarAgora.disabled = false;
                btnDoarAgora.innerText = '❤️ GERAR PIX DE DOAÇÃO';
                if (pixQrLoader) pixQrLoader.style.display = 'none';
                if (pixQrImg) pixQrImg.style.display = 'block';
            }
        });
    }

    // Post-generation Order Bump update handler
    function setupPostBumpListeners() {
        const btnUpdatePix = document.getElementById('btnUpdatePix');
        const orderBumpPixContainer = document.getElementById('orderBumpPixContainer');

        if (btnUpdatePix) {
            btnUpdatePix.addEventListener('click', async () => {
                const selectedRadio = document.querySelector('input[name="extraAmountOption"]:checked');
                const extraAmount = selectedRadio ? parseFloat(selectedRadio.value) : 15;

                const currentAmount = parseFloat(sessionStorage.getItem('first_pix_amount')) || 0;
                const newAmount = currentAmount + extraAmount;

                btnUpdatePix.disabled = true;
                btnUpdatePix.innerText = '⚡ ATUALIZANDO COBRANÇA...';

                const pixQrLoader = document.getElementById('pixQrLoader');
                if (pixQrLoader) pixQrLoader.style.display = 'flex';
                if (pixQrImg) pixQrImg.style.display = 'none';

                try {
                    const response = await fetch('/api/create-pix', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: newAmount.toString(),
                            name: 'Doador Ali Cavalos (Update)',
                            email: 'doador@alicavalos.org',
                            cpf: '11111111111',
                            utm: getUtmData()
                        })
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Erro ao atualizar Pix');

                    // Store new values
                    sessionStorage.setItem('first_pix_qr', data.pix_qr_code);
                    sessionStorage.setItem('first_pix_code', data.pix_copia_cola);
                    sessionStorage.setItem('first_pix_amount', newAmount.toString());

                    // Re-render elements
                    pixQrImg.src = data.pix_qr_code;
                    pixCodeText.value = data.pix_copia_cola;

                    // Restart timer on new update
                    startPixCountdown();

                    // Transition container to success view
                    if (orderBumpPixContainer) {
                        orderBumpPixContainer.style.background = '#f0fdf4';
                        orderBumpPixContainer.style.borderColor = 'var(--color-success)';
                        orderBumpPixContainer.innerHTML = `
                            <div style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; justify-content: center; width: 100%; padding: 0.25rem 0;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>Doação Atualizada! + R$ ${extraAmount} inclusos no Pix acima.</span>
                            </div>
                        `;
                    }

                } catch (err) {
                    alert(`Erro: ${err.message}`);
                    btnUpdatePix.disabled = false;
                    btnUpdatePix.innerText = '⚡ ATUALIZAR PIX COM VALOR EXTRA';
                } finally {
                    if (pixQrLoader) pixQrLoader.style.display = 'none';
                    if (pixQrImg) pixQrImg.style.display = 'block';
                }
            });
        }
    }

    // Copy Pix Chave to Clipboard
    if (btnCopyPix && pixCodeText) {
        btnCopyPix.addEventListener('click', () => {
            pixCodeText.select();
            pixCodeText.setSelectionRange(0, 99999); // For mobile devices
            navigator.clipboard.writeText(pixCodeText.value)
                .then(() => {
                    const originalText = btnCopyPix.innerText;
                    btnCopyPix.innerText = 'Copiado!';
                    btnCopyPix.style.backgroundColor = 'var(--color-success)';
                    btnCopyPix.style.color = 'var(--color-white)';
                    
                    setTimeout(() => {
                        btnCopyPix.innerText = originalText;
                        btnCopyPix.style.backgroundColor = 'var(--color-primary)';
                        btnCopyPix.style.color = 'var(--color-white)';
                    }, 2000);
                })
                .catch(() => {
                    alert('Erro ao copiar chave. Selecione o texto e copie manualmente.');
                });
        });
    }

    // Go back from QR screen to values screen
    if (btnBackToInput) {
        btnBackToInput.addEventListener('click', () => {
            stepPixDiv.style.display = 'none';
            stepInputDiv.style.display = 'block';
        });
    }

    // --- Enhanced Anti-Cloning & Content Protection ---
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('selectstart', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
    document.addEventListener('dragstart', (e) => e.preventDefault());

    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'K')) || 
            (e.ctrlKey && (e.key === 'U' || e.key === 'S' || e.key === 'A' || e.key === 'P')) ||
            (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'U' || e.key === 'C'))
        ) {
            e.preventDefault();
            return false;
        }
    });

    // Console & Inspection Deterrent
    (function() {
        if (window.console) {
            window.console.log = function() {};
            window.console.warn = function() {};
            window.console.error = function() {};
        }
    })();

    // 7. Success Stories Read More
    const toggleStoryBtns = document.querySelectorAll('.toggle-story-btn');
    toggleStoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.story-card');
            const fullStory = card.querySelector('.story-full');
            const isOpened = fullStory.classList.contains('active');
            
            if (isOpened) {
                fullStory.classList.remove('active');
                btn.innerText = 'Ver história completa';
            } else {
                fullStory.classList.add('active');
                btn.innerText = 'Fechar história';
            }
        });
    });

    // 8. FAQ Accordion Dropdowns
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            // Close other items
            faqItems.forEach(i => {
                if (i !== item) {
                    i.classList.remove('active');
                    i.querySelector('.faq-answer').style.maxHeight = null;
                }
            });
            
            if (isOpen) {
                item.classList.remove('active');
                item.querySelector('.faq-answer').style.maxHeight = null;
            } else {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // --- Back Redirect Disabled ---

    // --- 4 Colares Color & Modal Handlers ---
    window._selectedColarColors = { 1: 'gold', 2: 'gold', 3: 'gold', 4: 'gold' };
    window._activeColarNum = 2; // Default to Colar Elo Infinito

    const colarTitles = {
        1: 'Colar Esperança Equina',
        2: 'Colar Elo Infinito',
        3: 'Colar Espírito Livre',
        4: 'Étriers Elegance'
    };

    window.updateModalColarDisplay = function() {
        const modalPreview = document.getElementById('modalColarPreview');
        const numVal = parseFloat(currentSelectedValue) || 0;

        if (modalPreview) {
            if (numVal >= 50) {
                modalPreview.style.display = 'flex';
                const num = window._activeColarNum || 2;
                const color = window._selectedColarColors[num] || 'gold';
                const imgEl = document.getElementById('modalColarImg');
                const titleEl = document.getElementById('modalColarTitle');
                const badgeEl = document.getElementById('modalColarBadge');

                if (imgEl) imgEl.src = `assets/images/necklace-${num}-${color}.png`;
                if (titleEl) titleEl.innerText = colarTitles[num] || 'Colar Elo Infinito';
                if (badgeEl) {
                    if (color === 'gold') {
                        badgeEl.innerText = '✦ Ouro';
                        badgeEl.style.color = '#92400e';
                        badgeEl.style.background = '#fffbebf5';
                        badgeEl.style.borderColor = '#d97706';
                    } else {
                        badgeEl.innerText = '✦ Prata';
                        badgeEl.style.color = '#1e293b';
                        badgeEl.style.background = '#f1f5f9';
                        badgeEl.style.borderColor = '#64748b';
                    }
                }
            } else {
                modalPreview.style.display = 'none';
            }
        }
    };

    window.setColarColor = function(num, color) {
        window._selectedColarColors[num] = color;
        const choiceGold = document.getElementById('colar-choice-' + num + '-gold');
        const choiceSilver = document.getElementById('colar-choice-' + num + '-silver');
        const btnGold = document.getElementById('colar-btn-' + num + '-gold');
        const btnSilver = document.getElementById('colar-btn-' + num + '-silver');

        if (choiceGold && choiceSilver) {
            choiceGold.classList.remove('active-gold', 'active-silver');
            choiceSilver.classList.remove('active-gold', 'active-silver');
            if (color === 'gold') choiceGold.classList.add('active-gold');
            else choiceSilver.classList.add('active-silver');
        }

        if (btnGold && btnSilver) {
            btnGold.classList.remove('active-gold', 'active-silver');
            btnSilver.classList.remove('active-silver', 'active-gold');
            if (color === 'gold') btnGold.classList.add('active-gold');
            else btnSilver.classList.add('active-silver');
        }

        window.updateModalColarDisplay();
    };

    window.setModalColarColor = function(color) {
        const num = window._activeColarNum || 2;
        window.setColarColor(num, color);
    };

    window.openColarModal = function(num) {
        window._activeColarNum = num || 2;
        openCheckout('50');
        window.updateModalColarDisplay();
    };
});
