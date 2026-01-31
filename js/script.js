// Click sounds - soft and pleasant
let audioContext = null;
let audioInitialized = false;

function initAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioInitialized = true;
        } catch (e) {
            console.log('AudioContext not supported');
        }
    }
}

function playClick() {
    if (!audioInitialized) {
        initAudio();
    }
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1000;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.015, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
    } catch (e) {
        // Ignore audio errors
    }
}

function playClose() {
    if (!audioInitialized) {
        initAudio();
    }
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.12);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.012, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.12);
    } catch (e) {
        // Ignore audio errors
    }
}

// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('ring');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Create particles
    if (Math.random() > 0.85) {
        createParticle(mouseX, mouseY);
    }
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    const tx = (Math.random() - 0.5) * 100;
    const ty = (Math.random() - 0.5) * 100;
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1200);
}

function animate() {
    cursorX += (mouseX - cursorX) * 0.3;
    cursorY += (mouseY - cursorY) * 0.3;
    cursor.style.left = cursorX - 4 + 'px';
    cursor.style.top = cursorY - 4 + 'px';

    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX - 16 + 'px';
    ring.style.top = ringY - 16 + 'px';

    requestAnimationFrame(animate);
}
animate();

// Modals
function openModal(id) {
    playClick();
    const modal = document.getElementById(id);
    modal.classList.remove('closing');
    modal.classList.add('active');
    const content = modal.querySelector('.modal-content');
    content.classList.remove('closing');
}

function closeModal(id) {
    playClose();
    const modal = document.getElementById(id);
    const content = modal.querySelector('.modal-content');
    
    modal.classList.add('closing');
    content.classList.add('closing');
    
    setTimeout(() => {
        modal.classList.remove('active', 'closing');
        content.classList.remove('closing');
    }, 300);
}

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.id);
    });
});

// Draggable modals - FIXED smooth dragging
let isDragging = false;
let currentModal = null;
let offsetX = 0;
let offsetY = 0;

document.querySelectorAll('.modal-content').forEach(modalContent => {
    const header = modalContent.querySelector('.modal-header');
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.close')) return;
        
        isDragging = true;
        currentModal = modalContent;
        
        const rect = modalContent.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        header.style.cursor = 'grabbing';
        e.preventDefault();
    });
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentModal) return;
    
    e.preventDefault();
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    currentModal.style.left = x + 'px';
    currentModal.style.top = y + 'px';
    currentModal.style.transform = 'none';
    currentModal.style.margin = '0';
});

document.addEventListener('mouseup', () => {
    if (isDragging && currentModal) {
        const header = currentModal.querySelector('.modal-header');
        header.style.cursor = 'grab';
    }
    isDragging = false;
    currentModal = null;
});

// Music Player
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const repeatBtn = document.getElementById('repeatBtn');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const trackName = document.getElementById('trackName');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const albumCover = document.getElementById('albumCover');

const tracks = [
    { 
        name: 'люблю москву, но снится лондон',
        artist: 'ivycraft',
        url: 'tracks/ivy.mp3',
        cover: 'covers/track1.jpg'
    },
    { 
        name: 'RIP',
        artist: 'anonymous ember',
        url: 'tracks/R.I.P.mp3',
        cover: 'covers/track2.jpg'
    },
    { 
        name: 'Pretty Cvnt',
        artist: 'sewerslvt',
        url: 'tracks/sewer.mp3',
        cover: 'covers/track3.jpg'
    }
];

let currentTrack = 0;
let isPlaying = false;
let isMuted = false;
let isRepeat = false;

// Dynamic Island - объявляем ЗДЕСЬ, до использования
let island = null;
let islandCover = null;
let islandTrackName = null;

function updateIsland() {
    if (!island) {
        island = document.getElementById('dynamicIsland');
        islandCover = document.getElementById('islandCover');
        islandTrackName = document.getElementById('islandTrackName');
        
        if (!island) {
            console.error('❌ Island element NOT FOUND!');
            return;
        }
        console.log('✅ Island element found!');
    }
    
    // Update track info (only track name, no artist)
    const track = tracks[currentTrack];
    if (islandTrackName) {
        islandTrackName.textContent = track.name;
    }
    
    // Update cover
    if (islandCover && track.cover) {
        islandCover.style.backgroundImage = `url('${track.cover}')`;
    }
    
    if (isPlaying) {
        console.log('🎵 Island activating');
        island.classList.add('active');
    } else {
        console.log('⏸️ Island deactivating');
        island.classList.remove('active');
    }
}

function loadTrack(index) {
    const track = tracks[index];
    audio.src = track.url;
    trackName.textContent = `${track.artist} - ${track.name}`;
    
    // Update album cover in modal
    if (albumCover && track.cover) {
        albumCover.style.backgroundImage = `url('${track.cover}')`;
    }
    
    audio.load();
}

function togglePlay() {
    console.log('togglePlay called, current isPlaying:', isPlaying);
    if (isPlaying) {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        isPlaying = false;
    } else {
        if (!audio.src) loadTrack(currentTrack);
        audio.play().catch(err => console.error('Play error:', err));
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
    }
    console.log('togglePlay finished, new isPlaying:', isPlaying);
    updateIsland();
}

function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    if (isPlaying) audio.play();
    updateIsland();
}

function prevTrack() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
    if (isPlaying) audio.play();
    updateIsland();
}

function toggleMute() {
    isMuted = !isMuted;
    audio.muted = isMuted;
    if (isMuted) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        volumeSlider.value = 0;
        volumeValue.textContent = '0%';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        volumeSlider.value = audio.volume * 100;
        volumeValue.textContent = Math.round(audio.volume * 100) + '%';
    }
}

function updateVolumeIcon(volume) {
    if (volume === 0 || isMuted) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 50) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    audio.loop = isRepeat;
    if (isRepeat) {
        repeatBtn.style.color = '#a78bfa';
        repeatBtn.style.background = 'rgba(167, 139, 250, 0.2)';
    } else {
        repeatBtn.style.color = '';
        repeatBtn.style.background = '';
    }
}

playBtn.addEventListener('click', () => {
    playClick();
    togglePlay();
});
nextBtn.addEventListener('click', () => {
    playClick();
    nextTrack();
});
prevBtn.addEventListener('click', () => {
    playClick();
    prevTrack();
});
repeatBtn.addEventListener('click', () => {
    playClick();
    toggleRepeat();
});
volumeBtn.addEventListener('click', () => {
    playClick();
    toggleMute();
});

// Volume slider control
volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    audio.volume = volume;
    volumeValue.textContent = e.target.value + '%';
    updateVolumeIcon(e.target.value);
    
    if (volume > 0 && isMuted) {
        isMuted = false;
        audio.muted = false;
    }
});

// Initialize volume
audio.volume = 1;
volumeSlider.value = 100;
volumeValue.textContent = '100%';

audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = percent + '%';
    
    const mins = Math.floor(audio.currentTime / 60);
    const secs = Math.floor(audio.currentTime % 60);
    currentTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    if (audio.duration) {
        const dMins = Math.floor(audio.duration / 60);
        const dSecs = Math.floor(audio.duration % 60);
        duration.textContent = `${dMins}:${dSecs.toString().padStart(2, '0')}`;
    }
});

audio.addEventListener('ended', () => {
    if (!isRepeat) {
        nextTrack();
    }
});

// Progress bar - FIXED smooth dragging
let isProgressDragging = false;

progressBar.addEventListener('mousedown', (e) => {
    isProgressDragging = true;
    updateProgress(e);
});

progressBar.addEventListener('mousemove', (e) => {
    if (!isProgressDragging) return;
    updateProgress(e);
});

document.addEventListener('mouseup', () => {
    if (isProgressDragging) {
        isProgressDragging = false;
    }
});

function updateProgress(e) {
    playClick();
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = percent * audio.duration;
}

loadTrack(currentTrack);

// Theme System
const themes = {
    purple: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#a78bfa', tech: '#8b5cf6' },
    blue: { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', accent: '#60a5fa', tech: '#3b82f6' },
    pink: { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accent: '#f472b6', tech: '#ec4899' },
    green: { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', accent: '#34d399', tech: '#10b981' },
    orange: { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', accent: '#fb923c', tech: '#f97316' },
    red: { gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', accent: '#f87171', tech: '#ef4444' },
    cyan: { gradient: 'linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)', accent: '#22d3ee', tech: '#06b6d4' },
    violet: { gradient: 'linear-gradient(135deg, #d946ef 0%, #f472b6 100%)', accent: '#e879f9', tech: '#d946ef' },
    gold: { gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', accent: '#fbbf24', tech: '#f59e0b' },
    dark: { gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)', accent: '#9ca3af', tech: '#6b7280' }
};

function applyTheme(themeName) {
    playClick();
    const theme = themes[themeName];
    if (!theme) return;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--gradient-main', theme.gradient);
    
    // Update all gradient text elements
    const style = document.createElement('style');
    style.id = 'theme-style';
    const oldStyle = document.getElementById('theme-style');
    if (oldStyle) oldStyle.remove();
    
    style.textContent = `
        .gradient-text {
            background: ${theme.gradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 200% 200%;
            animation: gradientShift 8s ease infinite;
        }
        .accent-text {
            color: ${theme.accent};
        }
        .tech-highlight {
            color: ${theme.tech};
            background: ${theme.tech}15;
            border-color: ${theme.tech}33;
        }
        .section-icon {
            background: ${theme.gradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .hero::before {
            background: radial-gradient(circle, ${theme.accent}26 0%, transparent 70%);
        }
        .hero-link:hover {
            border-color: ${theme.accent}66;
            box-shadow: 0 8px 24px ${theme.accent}33;
        }
        .project-year {
            background: ${theme.accent}1a;
            border-color: ${theme.accent}33;
        }
        .project-link:hover {
            color: ${theme.accent};
            background: ${theme.accent}1a;
            border-color: ${theme.accent}4d;
        }
        .project-subtitle {
            color: ${theme.tech};
        }
        .project-tag {
            background: ${theme.tech}14;
            border-color: ${theme.tech}33;
            color: ${theme.tech};
        }
        .tech-badge {
            background: ${theme.accent}14;
            border-color: ${theme.accent}26;
            color: ${theme.accent};
        }
        .tech-badge:hover {
            background: ${theme.accent}26;
            border-color: ${theme.accent}4d;
        }
    `;
    
    document.head.appendChild(style);
    
    // Mark active theme
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', themeName);
}

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'purple';
    applyTheme(savedTheme);
});

// Unified Color Editor (old code - can be removed or kept for custom colors)
const rSlider = document.getElementById('rSlider');
const gSlider = document.getElementById('gSlider');
const bSlider = document.getElementById('bSlider');
const hexInput = document.getElementById('hexInput');
const colorPreview = document.getElementById('colorPreview');
const rVal = document.getElementById('rVal');
const gVal = document.getElementById('gVal');
const bVal = document.getElementById('bVal');
const applyBtn = document.getElementById('applyBtn');
const hexGradient = document.getElementById('hexGradient');
const gradientPicker = document.getElementById('gradientPicker');

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function updatePreview() {
    const r = rSlider.value;
    const g = gSlider.value;
    const b = bSlider.value;
    const hex = rgbToHex(r, g, b);
    
    hexInput.value = hex;
    colorPreview.style.background = hex;
    rVal.textContent = r;
    gVal.textContent = g;
    bVal.textContent = b;
}

[rSlider, gSlider, bSlider].forEach(slider => {
    slider.addEventListener('input', () => {
        updatePreview();
    });
});

hexInput.addEventListener('input', (e) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('#')) val = '#' + val;
    
    if (/^#[0-9A-F]{6}$/i.test(val)) {
        const rgb = hexToRgb(val);
        if (rgb) {
            rSlider.value = rgb.r;
            gSlider.value = rgb.g;
            bSlider.value = rgb.b;
            rVal.textContent = rgb.r;
            gVal.textContent = rgb.g;
            bVal.textContent = rgb.b;
            colorPreview.style.background = val;
        }
    }
});

// Hex gradient picker - FIXED smooth dragging
let isGradientDragging = false;

hexGradient.addEventListener('mousedown', (e) => {
    isGradientDragging = true;
    updateGradientColor(e);
});

hexGradient.addEventListener('mousemove', (e) => {
    if (!isGradientDragging) return;
    updateGradientColor(e);
});

document.addEventListener('mouseup', () => {
    isGradientDragging = false;
});

function updateGradientColor(e) {
    playClick();
    const rect = hexGradient.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    
    gradientPicker.style.left = (percent * 100) + '%';
    
    const hue = percent * 360;
    const rgb = hslToRgb(hue / 360, 1, 0.5);
    
    rSlider.value = rgb.r;
    gSlider.value = rgb.g;
    bSlider.value = rgb.b;
    updatePreview();
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// Apply theme
applyBtn.addEventListener('click', () => {
    playClick();
    const color = hexInput.value;
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--secondary', color);
    document.documentElement.style.setProperty('--accent', color);
});

// Initialize
updatePreview();

// Color inputs
const colors = [
    { box: 'primaryBox', input: 'primaryInput', var: '--primary' },
    { box: 'secondaryBox', input: 'secondaryInput', var: '--secondary' },
    { box: 'accentBox', input: 'accentInput', var: '--accent' },
    { box: 'bgBox', input: 'bgInput', var: '--bg' }
];

colors.forEach(c => {
    const box = document.getElementById(c.box);
    const input = document.getElementById(c.input);

    input.addEventListener('input', (e) => {
        let val = e.target.value.toUpperCase();
        if (!val.startsWith('#')) val = '#' + val;
        
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            box.style.background = val;
            document.documentElement.style.setProperty(c.var, val);
            playClick();
        }
    });

    box.addEventListener('click', () => {
        playClick();
        input.focus();
    });
});

// Scroll progress
window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const percent = (window.scrollY / h) * 100;
    document.getElementById('scrollProgress').style.width = percent + '%';
});

// Hover effects with click sounds
document.querySelectorAll('.btn, .player-btn, .card, .close, .preset, .apply-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
        ring.style.transform = 'scale(1.5)';
        ring.style.borderColor = 'rgba(10, 132, 255, 0.8)';
    });
    el.addEventListener('mouseleave', () => {
        ring.style.transform = 'scale(1)';
        ring.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    });
});

// Parallax (disabled on mobile)
const isMobile = window.innerWidth <= 768;
if (!isMobile) {
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero');
        if (hero) {
            const scroll = window.pageYOffset;
            hero.style.transform = `translateY(${scroll * 0.4}px)`;
            hero.style.opacity = 1 - (scroll / 600);
        }
    });
}

// ============================================
// Telegram уведомления о посещении сайта
// ============================================
const WORKER_URL = 'YOUR_WORKER_URL_HERE'; // Замени на URL твоего Cloudflare Worker

async function notifyTelegram() {
    // Проверяем, что URL настроен
    if (WORKER_URL === 'YOUR_WORKER_URL_HERE') {
        console.log('⚠️ Telegram notifications: Worker URL not configured');
        return;
    }

    try {
        await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                page: window.location.href,
                referrer: document.referrer || 'Direct'
            })
        });
        console.log('✅ Telegram notification sent');
    } catch (error) {
        // Тихо игнорируем ошибки, чтобы не мешать работе сайта
        console.log('❌ Telegram notification failed:', error.message);
    }
}

// Отправляем уведомление при загрузке страницы
// Задержка 2 секунды, чтобы не считать случайные заходы
setTimeout(() => {
    notifyTelegram();
}, 2000);

