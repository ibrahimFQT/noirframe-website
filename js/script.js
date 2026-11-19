// 1. THEME TOGGLE
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
        } else {
            body.setAttribute('data-theme', 'dark');
        }
    });
}

// 2. NAVBAR SCROLL & SMOOTH EYE-TRACKING
const navbar = document.getElementById('navbar');
const sparkleIcon = document.getElementById('sparkleEye');

window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

let eyeCurrentX = 0, eyeCurrentY = 0;
let eyeTargetX = 0, eyeTargetY = 0;
const maxMove = 8; 

document.addEventListener('mousemove', (e) => {
    if (navbar && navbar.classList.contains('scrolled') && sparkleIcon) {
        const rect = sparkleIcon.getBoundingClientRect();
        const iconCenterX = rect.left + rect.width / 2;
        const iconCenterY = rect.top + rect.height / 2;

        const deltaX = e.clientX - iconCenterX;
        const deltaY = e.clientY - iconCenterY;

        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.min(Math.hypot(deltaX, deltaY) * 0.06, maxMove);

        eyeTargetX = Math.cos(angle) * distance;
        eyeTargetY = Math.sin(angle) * distance;
    } else {
        eyeTargetX = 0;
        eyeTargetY = 0;
    }
});

function animateEye() {
    eyeCurrentX += (eyeTargetX - eyeCurrentX) * 0.1;
    eyeCurrentY += (eyeTargetY - eyeCurrentY) * 0.1;

    if (sparkleIcon) {
        if (navbar && navbar.classList.contains('scrolled')) {
            sparkleIcon.style.transform = `scale(1) translate(${eyeCurrentX}px, ${eyeCurrentY}px)`;
        } else {
            sparkleIcon.style.transform = '';
            eyeCurrentX = 0; eyeCurrentY = 0;
        }
    }
    requestAnimationFrame(animateEye);
}
animateEye();

// 3. SHOPPING CART LOGIC (Fixed for Global Scope)
let cart = JSON.parse(localStorage.getItem('noirframe_cart')) || [];

const cartToggleBtn = document.getElementById('cartToggleBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalPrice = document.getElementById('cartTotalPrice');

function toggleCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('open');
        renderCart();
    }
}
if (cartToggleBtn) cartToggleBtn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

function renderCart() {
    let total = 0;
    let count = 0;

    // Hitung total harga & jumlah terlepas dari apakah container ada atau tidak (untuk badge navbar)
    cart.forEach((item) => {
        total += item.price * item.quantity;
        count += item.quantity;
    });

    if (cartBadge) cartBadge.textContent = count;
    if (cartTotalPrice) cartTotalPrice.textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total);

    // Render HTML hanya jika container tersedia di halaman saat ini
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}</p>
                    <div class="cart-controls">
                        <button onclick="updateQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }
    
    localStorage.setItem('noirframe_cart', JSON.stringify(cart));
}

window.updateQty = function(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    renderCart();
}

const addButtons = document.querySelectorAll('.add-to-cart-btn');
addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = btn.getAttribute('data-name');
        const price = parseInt(btn.getAttribute('data-price'));
        const image = btn.getAttribute('data-image');

        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }
        
        renderCart();
        if (cartSidebar && cartOverlay && !cartSidebar.classList.contains('open')) {
            toggleCart();
        }
    });
});
renderCart(); // Inisialisasi awal saat load

// 4. MARQUEE JUMP EFFECT
const marqueeText = document.getElementById('marqueeText');
if (marqueeText) {
    const text = marqueeText.textContent.trim();
    marqueeText.innerHTML = ''; 
    for (let char of text) {
        const span = document.createElement('span');
        span.textContent = char;
        if (char === ' ') {
            span.innerHTML = '&nbsp;';
        } else {
            span.classList.add('marquee-char');
        }
        marqueeText.appendChild(span);
    }
}

// 5. SCRATCH TO WIN MINIGAME
const scratchCanvas = document.getElementById('scratchCanvas');
if (scratchCanvas) {
    const ctx = scratchCanvas.getContext('2d');
    let isDrawing = false;
    
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, 300, 150);
    ctx.font = '22px Anton';
    ctx.fillStyle = '#FF2A6D';
    ctx.textAlign = 'center';
    ctx.fillText('GOSOK DI SINI', 150, 85);

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        // Support for both mouse and touch events securely
        let clientX = evt.clientX;
        let clientY = evt.clientY;
        
        if (evt.touches && evt.touches.length > 0) {
            clientX = evt.touches[0].clientX;
            clientY = evt.touches[0].clientY;
        }

        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function scratch(e) {
        if (!isDrawing) return;
        if (e.cancelable) e.preventDefault();
        const pos = getMousePos(scratchCanvas, e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2, false);
        ctx.fill();
    }

    scratchCanvas.addEventListener('mousedown', () => isDrawing = true);
    scratchCanvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', () => isDrawing = false);
    
    scratchCanvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
    scratchCanvas.addEventListener('touchmove', scratch, { passive: false });
    window.addEventListener('touchend', () => isDrawing = false);
}

// 6. CANVAS ANIMATION (HERO, CTA, & SCRATCH BG)
function initCanvasAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const mouse = { x: null, y: null, radius: 150 };
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    const particles = [];
    const count = Math.min(width > 768 ? 40 : 20, 45);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width, y: Math.random() * height,
            vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
            radius: Math.random() * 2.5 + 1.5
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        const isDark = body.getAttribute('data-theme') === 'dark';
        const particleColor = isDark ? 'rgba(255, 42, 109, 0.75)' : 'rgba(255, 42, 109, 0.55)';
        const lineColor = isDark ? 'rgba(255, 42, 109, 0.2)' : 'rgba(255, 42, 109, 0.14)';

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.x += p.vx; p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = particleColor; ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 130) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = lineColor; ctx.lineWidth = 1; ctx.stroke();
                }
            }

            if (mouse.x !== null && mouse.y !== null) {
                let mDist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                if (mDist < mouse.radius) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = 'rgba(255, 42, 109, 0.5)'; ctx.lineWidth = 1.2; ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

initCanvasAnimation('heroCanvas');
initCanvasAnimation('ctaCanvas');
initCanvasAnimation('scratchBgCanvas'); 

// 7. CUSTOM CURSOR & SPARKLES
const cursor = document.querySelector('.cursor-dot');
document.addEventListener('mousemove', (e) => {
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
    if (Math.random() > 0.85) createSparkle(e.clientX, e.clientY);
});

window.createSparkle = function(x, y) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.left = x + 'px'; 
    sparkle.style.top = y + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => { 
        if(document.body.contains(sparkle)) sparkle.remove(); 
    }, 800);
}

// 8. MAGNETIC BUTTON EFFECT
const magneticBtns = document.querySelectorAll('.magnetic');
magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0px, 0px)'; });
});

// 9. 3D TILT CARDS
const tiltCards = document.querySelectorAll('.tilt');
tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        const centerX = rect.width / 2; const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    });
});

// 10. REVEAL ON SCROLL
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, observerOptions);
document.querySelectorAll('.reveal-text').forEach(el => { observer.observe(el); });

// --- ABOUT PAGE 8 UNIQUE FEATURES LOGIC ---

// 1. Live Drama Stats (Counter Animation)
const counters = document.querySelectorAll('.counter');
const speed = 200; 
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = +counter.getAttribute('data-target');
            const updateCount = () => {
                const count = +counter.innerText;
                const inc = target / speed;
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
            counterObserver.unobserve(counter);
        }
    });
});
counters.forEach(counter => counterObserver.observe(counter));

// 2. Draggable Stickers (Fixed for Mobile Touch)
const stickers = document.querySelectorAll('.draggable-sticker');
stickers.forEach(sticker => {
    let isDragging = false, startX, startY, initialX, initialY;
    
    const dragStart = (e) => {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX; 
        startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        initialX = sticker.offsetLeft; 
        initialY = sticker.offsetTop;
        sticker.style.zIndex = 100;
    };
    
    const dragMove = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault(); // Mencegah scroll saat geser sticker di HP
        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        const dx = currentX - startX; 
        const dy = currentY - startY;
        sticker.style.left = `${initialX + dx}px`;
        sticker.style.top = `${initialY + dy}px`;
    };
    
    const dragEnd = () => {
        isDragging = false;
        sticker.style.zIndex = 1;
    };

    // Mouse Events
    sticker.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);

    // Touch Events untuk Mobile
    sticker.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);
});

// 3. Wheel of Chaos
window.spinWheel = function() {
    const wheel = document.getElementById('moodWheel');
    const result = document.getElementById('moodResult');
    if(!wheel || !result) return;
    const moods = ["Nangis Darah 🩸", "Kaya Raya 💸", "Revisi Lagi 🔄", "Turu 💤", "Burnout 🔥"];
    const randomDegree = Math.floor(Math.random() * 3600) + 360; 
    wheel.style.transform = `rotate(${randomDegree}deg)`;
    result.innerText = "Mikir...";
    setTimeout(() => {
        result.innerText = moods[Math.floor(Math.random() * moods.length)];
    }, 2000);
}

// 4. Secret Terminal
const terminal = document.getElementById('terminalInput');
if(terminal) {
    terminal.addEventListener('keyup', (e) => {
        if (e.target.value.toLowerCase() === 'noir') {
            e.target.value = "ACCESS GRANTED! 🎉";
            e.target.style.color = "#FF2A6D";
            for(let i = 0; i < 30; i++) {
                setTimeout(() => {
                    if (typeof window.createSparkle === 'function') {
                        window.createSparkle(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
                    }
                }, i * 50);
            }
        }
    });
}

// 5. Rage Click Easter Egg
const rageBtn = document.getElementById('rageBtn');
if(rageBtn) {
    let clickCount = 0;
    rageBtn.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 1) rageBtn.innerText = "I SAID DONT!";
        if (clickCount === 3) rageBtn.innerText = "STOP IT!!";
        if (clickCount >= 5) {
            document.body.classList.add('rage-mode');
            rageBtn.innerText = "YOU BROKE IT!";
            setTimeout(() => { 
                document.body.classList.remove('rage-mode'); 
                clickCount = 0; 
                rageBtn.innerText = "DANGER"; 
            }, 2000);
        }
    });
}

// 6. Emoji Trail Cursor
const trailArea = document.getElementById('emoji-trail-area');
if(trailArea) {
    const emojis = ['✨','💖','💀','🔥'];
    trailArea.addEventListener('mousemove', (e) => {
        if(Math.random() > 0.9) {
            const emoji = document.createElement('div');
            emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.left = e.clientX + 'px';
            emoji.style.top = e.clientY + 'px';
            emoji.style.fontSize = '20px';
            emoji.style.pointerEvents = 'none';
            emoji.style.animation = 'fadeOut 1s forwards';
            emoji.style.zIndex = '9999';
            document.body.appendChild(emoji);
            setTimeout(() => emoji.remove(), 1000);
        }
    });
}

// 7. Dynamic Sassy Greeting (Missing Feature 1/2)
const greetingElement = document.getElementById('sassyGreeting');
if(greetingElement) {
    const hour = new Date().getHours();
    let message = "Welcome to the chaos.";
    if (hour < 12) message = "Pagi. Udah ngopi belum? Jangan sampai tremor.";
    else if (hour < 18) message = "Siang. Tetap semangat pura-pura sibuknya.";
    else message = "Malam. Mending tidur daripada overthinking.";
    
    greetingElement.innerText = message;
}

// 8. Secret Konami Code / Chaos Mode (Missing Feature 2/2)
let secretBuffer = '';
document.addEventListener('keydown', (e) => {
    secretBuffer += e.key.toLowerCase();
    if (secretBuffer.length > 5) {
        secretBuffer = secretBuffer.slice(1); // Keep buffer exactly 5 chars
    }
    if (secretBuffer === 'chaos') {
        document.body.style.filter = document.body.style.filter === 'invert(1)' ? 'none' : 'invert(1)';
        secretBuffer = ''; // Reset after triggering
    }
});

// === 11. CONTACT PAGE LOGIC ===

// Sassy Form Submission & Fake Loading
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formFeedback = document.getElementById('formFeedback');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Animasi loading pada tombol
        const originalText = submitBtn.innerText;
        submitBtn.innerHTML = "Mengirim Drama... ⏳";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        // Simulasi pengiriman (Fake Delay)
        setTimeout(() => {
            contactForm.style.display = 'none';
            formFeedback.style.display = 'flex';
            formFeedback.innerHTML = `
                <h3 style="color: #FF2A6D; font-size: 2rem; margin-bottom: 10px;">Pesan Mendarat! 🚀</h3>
                <p style="margin-bottom: 20px;">Pesanmu udah masuk. Kami akan balas (kalau nggak lagi sibuk rebahan atau overthinking).</p>
                <button class="magnetic" onclick="location.reload()" style="padding: 10px 20px; background: #FF2A6D; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Spam Lagi?</button>
            `;
            
            // Ledakan Sparkle saat sukses
            for(let i = 0; i < 20; i++) {
                setTimeout(() => {
                    if (typeof window.createSparkle === 'function') {
                        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 300;
                        const y = window.innerHeight / 2 + (Math.random() - 0.5) * 300;
                        window.createSparkle(x, y);
                    }
                }, i * 50);
            }
        }, 2000);
    });
}

// Character Counter with Attitude
const messageInput = document.getElementById('messageInput');
const charCount = document.getElementById('charCount');

if (messageInput && charCount) {
    messageInput.addEventListener('input', (e) => {
        const len = e.target.value.length;
        if (len === 0) charCount.innerText = "0/500 (Masih kosong bre, ayo ketik sesuatu!)";
        else if (len < 30) charCount.innerText = `${len}/500 (Kurang panjang, tambahin lagi dramanya.)`;
        else if (len > 450) charCount.innerText = `${len}/500 (Buset, panjang amat, mau bikin novel?)`;
        else charCount.innerText = `${len}/500 (Mantap, lanjutkan keluh kesahmu.)`;
    });
}