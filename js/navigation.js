// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // ---- INJECT COUNTDOWN BANNER ----
    const bannerHTML = `
        <div id="campaign-countdown-banner" style="position: fixed; top: 0; left: 0; width: 100%; height: 45px; background: linear-gradient(90deg, #c9a03d, #b88b2a); color: #fff; z-index: 2000; display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 600; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <i class="fas fa-calendar-check" style="margin-right: 10px;"></i>
            <span style="margin-right: 15px; letter-spacing: 0.5px;">ELECTION DAY: AUG 10, 2027</span>
            <span id="countdown-timer" style="background: rgba(0,0,0,0.2); padding: 4px 12px; border-radius: 20px; font-variant-numeric: tabular-nums;">-- Days --:--:--</span>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', bannerHTML);
    
    // Adjust top fixed navigation
    const mainNav = document.querySelector('.main-nav');
    if (mainNav) {
        mainNav.style.top = '45px';
    }
    
    // Adjust hero sections
    const heros = document.querySelectorAll('.hero');
    heros.forEach(hero => {
        hero.style.marginTop = '115px'; // usually 70, adding 45
    });

    // Countdown logic
    const targetDate = new Date('2027-08-10T00:00:00').getTime();
    const timerElement = document.getElementById('countdown-timer');
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            timerElement.innerHTML = "ELECTION DAY IS HERE!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerElement.innerHTML = `${days} Days ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
    // ---------------------------------

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close menu when clicking a link
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });
});