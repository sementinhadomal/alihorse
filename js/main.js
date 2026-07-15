document.addEventListener('DOMContentLoaded', () => {
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

    // 5. Before & After Slider Interactive Controls
    const sliders = document.querySelectorAll('.comparison-slider');
    sliders.forEach(slider => {
        const beforeImg = slider.querySelector('.image-before');
        const handle = slider.querySelector('.slider-handle');
        const bar = slider.querySelector('.slider-bar');
        
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = slider.getBoundingClientRect();
            let position = ((clientX - rect.left) / rect.width) * 100;
            
            if (position < 0) position = 0;
            if (position > 100) position = 100;
            
            beforeImg.style.clipPath = `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`;
            handle.style.left = `${position}%`;
            bar.style.left = `${position}%`;
        };

        const startDragging = () => { isDragging = true; };
        const stopDragging = () => { isDragging = false; };

        // Mouse events
        handle.addEventListener('mousedown', startDragging);
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(e.clientX);
        });

        // Touch events for responsiveness
        handle.addEventListener('touchstart', startDragging, { passive: true });
        window.addEventListener('touchend', stopDragging);
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSlider(e.touches[0].clientX);
        }, { passive: true });

        // Click to move
        slider.addEventListener('click', (e) => {
            if (e.target !== handle && !handle.contains(e.target)) {
                updateSlider(e.clientX);
            }
        });
    });

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

    // Input fields
    const inputName = document.getElementById('donorName');
    const inputEmail = document.getElementById('donorEmail');
    const inputCpf = document.getElementById('donorCpf');
    
    let currentSelectedValue = '50'; // default starting choice

    // Format CPF typing helper
    if (inputCpf) {
        inputCpf.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 11) val = val.substring(0, 11);
            if (val.length > 9) {
                val = `${val.substring(0,3)}.${val.substring(3,6)}.${val.substring(6,9)}-${val.substring(9)}`;
            } else if (val.length > 6) {
                val = `${val.substring(0,3)}.${val.substring(3,6)}.${val.substring(6)}`;
            } else if (val.length > 3) {
                val = `${val.substring(0,3)}.${val.substring(3)}`;
            }
            e.target.value = val;
        });
    }

    const openCheckout = (initialValue = '') => {
        checkoutModal.classList.add('active');
        checkoutModal.setAttribute('aria-hidden', 'false');
        
        // Reset states
        stepInputDiv.style.display = 'block';
        stepPixDiv.style.display = 'none';
        
        if (initialValue) {
            currentSelectedValue = initialValue;
            checkoutCustomInput.value = '';
            
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
            checkoutCustomInput.value = ''; // clear custom
        });
    });

    // Custom input in modal
    if (checkoutCustomInput) {
        checkoutCustomInput.addEventListener('input', () => {
            // Remove active style from presets
            checkoutValBtns.forEach(b => b.classList.remove('active'));
            currentSelectedValue = checkoutCustomInput.value;
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
                checkoutCustomInput.value = customVal;
                checkoutValBtns.forEach(b => b.classList.remove('active'));
            } else {
                openCheckout('50'); // fallback
            }
        });
    }

    // CPF validator function
    function isValidCPF(cpf) {
        const cleanCpf = cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
        
        let sum = 0;
        let remainder;
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;
        
        return true;
    }

    // Checkout submission - Pix Generation Call
    if (btnDoarAgora) {
        btnDoarAgora.addEventListener('click', async () => {
            const finalVal = currentSelectedValue || checkoutCustomInput.value;
            const name = inputName.value.trim();
            const email = inputEmail.value.trim();
            const cpf = inputCpf.value.trim();

            if (!finalVal || parseFloat(finalVal) <= 0) {
                alert('Por favor, selecione ou digite um valor de doação válido.');
                return;
            }
            if (!name) {
                alert('Por favor, digite seu nome completo.');
                return;
            }
            if (!email || !email.includes('@')) {
                alert('Por favor, digite um e-mail válido.');
                return;
            }
            if (!cpf || !isValidCPF(cpf)) {
                alert('Por favor, digite um CPF válido.');
                return;
            }

            // Show loading state
            btnDoarAgora.disabled = true;
            btnDoarAgora.innerText = 'GERANDO COBRANÇA PIX...';

            try {
                const response = await fetch('/api/create-pix', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: finalVal,
                        name: name,
                        email: email,
                        cpf: cpf
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Não foi possível gerar a transação no momento.');
                }

                // Render dynamic QR Code & Code in Step 2
                pixQrImg.src = data.pix_qr_code;
                pixCodeText.value = data.pix_copia_cola;

                // Move UI to Pix Display step
                stepInputDiv.style.display = 'none';
                stepPixDiv.style.display = 'block';

            } catch (err) {
                alert(`Erro: ${err.message}`);
            } finally {
                btnDoarAgora.disabled = false;
                btnDoarAgora.innerText = '❤️ GERAR PIX DE DOAÇÃO';
            }
        });
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
});
