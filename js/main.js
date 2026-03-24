// Wait for A-Frame to be ready
window.addEventListener('load', function() {
    console.log('Enhanced campaign website initialized');
    
    // Setup all interactive elements
    setupInteractiveElements();
    setupInfoSpheres();
    setupSpatialAudio();
    setupQA();
    setupCameraMovement();
    
    // Initialize WebSocket connection for real-time Q&A
    initWebSocket();
});

// Enhanced Interactive Elements
function setupInteractiveElements() {
    const interactiveItems = document.querySelectorAll('.interactive');
    const infoPanel = document.getElementById('info-panel');
    const issueTitle = document.getElementById('issue-title');
    const issueDescription = document.getElementById('issue-description');
    const closeInfo = document.getElementById('close-info');
    
    // Expanded issue data with more details
    const issues = {
        'economy': {
            title: 'Economic Prosperity for All',
            description: '✅ Create 50,000 new local jobs\n✅ Support small businesses with low-interest loans\n✅ Ensure fair wages for every worker\n✅ Tax relief for middle-class families\n✅ Incentives for sustainable business growth\n✅ Job training programs for emerging industries',
            stats: 'Job Creation Goal: 50,000 | Small Business Support: $100M Fund | Average Wage Increase: 15%'
        },
        'healthcare': {
            title: 'Healthcare is a Human Right',
            description: '🏥 Expand access to affordable healthcare\n💊 Lower prescription drug costs by 40%\n🏥 Invest $50M in community health centers\n👨‍👩‍👧 No one goes bankrupt from medical bills\n🧠 Mental health services for all\n👴 Senior care and prescription drug reform',
            stats: 'Drug Cost Reduction: 40% | New Health Centers: 25 | Mental Health Access: 100% Coverage'
        },
        'education': {
            title: 'Quality Education for Every Child',
            description: '📚 Increase teacher salaries by 20%\n💻 Modernize schools with technology\n🎓 Tuition-free community college\n👶 Expand early childhood education\n🏫 Repair and upgrade school facilities\n📖 Universal pre-K for all children',
            stats: 'Teacher Pay Increase: 20% | Tech Investment: $75M | College Access: Tuition-Free'
        }
    };
    
    // Add click handlers with enhanced effects
    interactiveItems.forEach(item => {
        item.addEventListener('click', function() {
            const id = this.id;
            if (issues[id]) {
                showInfoPanel(issues[id]);
                
                // Add visual feedback
                this.setAttribute('scale', '1.1 1.1 1.1');
                setTimeout(() => {
                    this.setAttribute('scale', '1 1 1');
                }, 200);
                
                // Play click sound if available
                playSound('click');
            }
        });
        
        // Enhanced hover effects
        item.addEventListener('mouseenter', function() {
            this.setAttribute('scale', '1.08 1.08 1.08');
            this.setAttribute('material', 'emissive', '#333333');
            
            // Increase particle intensity
            const particles = this.querySelector('[particle-system]');
            if (particles) {
                particles.setAttribute('particle-system', 'particleCount', 60);
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.setAttribute('scale', '1 1 1');
            this.setAttribute('material', 'emissive', '#000000');
            
            // Reset particles
            const particles = this.querySelector('[particle-system]');
            if (particles) {
                particles.setAttribute('particle-system', 'particleCount', 30);
            }
        });
    });
    
    // Close info panel with animation
    closeInfo.addEventListener('click', function() {
        infoPanel.classList.add('hidden');
    });
}

// Setup interactive info spheres
function setupInfoSpheres() {
    const spheres = document.querySelectorAll('.info-sphere');
    
    const infoData = {
        'info-sphere-1': {
            title: 'Campaign Milestones',
            content: '🏆 10,000 doors knocked\n📞 25,000 calls made\n🤝 500 volunteers joined\n🗳️ 5,000 voters registered\n✨ Join us in making history!'
        },
        'info-sphere-2': {
            title: 'Ways to Get Involved',
            content: '✋ Volunteer for canvassing\n📢 Host a neighborhood event\n💪 Join phone banking\n💰 Make a contribution\n🗣️ Share on social media\n🏠 Display a yard sign'
        }
    };
    
    spheres.forEach(sphere => {
        sphere.addEventListener('click', function() {
            const id = this.id;
            if (infoData[id]) {
                showInfoPanel({
                    title: infoData[id].title,
                    description: infoData[id].content,
                    stats: 'Click anywhere to close'
                });
            }
            
            // Add bounce effect
            this.setAttribute('scale', '1.5 1.5 1.5');
            setTimeout(() => {
                this.setAttribute('scale', '1 1 1');
            }, 300);
        });
        
        sphere.addEventListener('mouseenter', function() {
            this.setAttribute('color', '#f39c12');
        });
        
        sphere.addEventListener('mouseleave', function() {
            this.setAttribute('color', '#e67e22');
        });
    });
}

// Spatial Audio Setup
function setupSpatialAudio() {
    const audioEntity = document.getElementById('audio-source');
    const camera = document.getElementById('camera');
    
    // Check if audio element exists
    if (audioEntity) {
        // Audio will get louder as user gets closer to stage
        const updateAudioVolume = () => {
            if (camera && audioEntity) {
                const cameraPos = camera.getAttribute('position');
                const audioPos = audioEntity.getAttribute('position');
                
                if (cameraPos && audioPos) {
                    const dx = cameraPos.x - audioPos.x;
                    const dz = cameraPos.z - audioPos.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    
                    // Volume increases as distance decreases
                    let volume = Math.max(0, Math.min(0.5, 1 - (distance / 8)));
                    audioEntity.setAttribute('sound', 'volume', volume);
                }
            }
        };
        
        // Update volume every frame
        setInterval(updateAudioVolume, 100);
        
        // Auto-play audio with user interaction (browser policy requires user gesture)
        const startAudio = () => {
            audioEntity.components.sound.playSound();
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
        };
        
        document.addEventListener('click', startAudio);
        document.addEventListener('keydown', startAudio);
    }
}

// Camera Movement Helper
function setupCameraMovement() {
    const camera = document.getElementById('camera');
    
    // Add movement instructions overlay
    const instructions = document.createElement('div');
    instructions.className = 'movement-instructions';
    instructions.innerHTML = '🎮 Use WASD to move • 🖱️ Mouse to look around';
    instructions.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        font-family: monospace;
    `;
    document.body.appendChild(instructions);
    
    // Fade out instructions after 5 seconds
    setTimeout(() => {
        instructions.style.opacity = '0';
        instructions.style.transition = 'opacity 1s';
        setTimeout(() => instructions.remove(), 1000);
    }, 5000);
}

// Sound effect helper
function playSound(type) {
    // Simple beep using Web Audio API
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = type === 'click' ? 440 : 880;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
        oscillator.stop(audioCtx.currentTime + 0.2);
    } catch(e) {
        console.log('Audio not supported');
    }
}

// Enhanced info panel display
function showInfoPanel(issue) {
    const infoPanel = document.getElementById('info-panel');
    const issueTitle = document.getElementById('issue-title');
    const issueDescription = document.getElementById('issue-description');
    
    // Format description with line breaks
    const formattedDescription = issue.description.replace(/\n/g, '<br>');
    
    issueTitle.textContent = issue.title;
    issueDescription.innerHTML = formattedDescription;
    
    if (issue.stats) {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'issue-stats';
        statsDiv.style.cssText = 'margin-top: 10px; padding-top: 10px; border-top: 1px solid #e67e22; font-size: 0.8rem; color: #e67e22;';
        statsDiv.innerHTML = issue.stats;
        
        // Remove old stats if exists
        const oldStats = issueDescription.querySelector('.issue-stats');
        if (oldStats) oldStats.remove();
        
        issueDescription.appendChild(statsDiv);
    }
    
    infoPanel.classList.remove('hidden');
    
    // Auto-hide after 15 seconds
    clearTimeout(window.infoTimeout);
    window.infoTimeout = setTimeout(() => {
        infoPanel.classList.add('hidden');
    }, 15000);
}

// Enhanced Q&A setup with animations
function setupQA() {
    const toggleBtn = document.getElementById('toggle-qa');
    const qaWindow = document.getElementById('qa-window');
    const qaForm = document.getElementById('qa-form');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            qaWindow.classList.toggle('hidden');
            
            // Add bounce animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    }
    
    if (qaForm) {
        qaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('qa-name').value.trim() || 'Supporter';
            const question = document.getElementById('qa-question').value.trim();
            
            if (question) {
                submitQuestion(name, question);
                qaForm.reset();
                
                // Show confirmation
                showNotification('Question submitted!', 'success');
            }
        });
    }
}

// Notification system
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        pointer-events: none;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Placeholder for WebSocket (will be fully implemented in Step 3)
let ws = null;

function initWebSocket() {
    console.log('WebSocket will be initialized in Step 3 for real-time Q&A');
}

// Export functions for debugging
window.debug = {
    showInfoPanel,
    playSound,
    showNotification
};