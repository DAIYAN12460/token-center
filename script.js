// script.js

// ===== DOM Elements =====
const tokenDisplay = document.getElementById('tokenDisplay');
const statusDiv = document.getElementById('status');

// ===== Token Functions =====
function generateToken() {
    const chars = '0123456789abcdef';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars[Math.floor(Math.random() * 16)];
    }
    
    tokenDisplay.textContent = `🔑 ${token}`;
    tokenDisplay.className = 'token-box active';
    
    // Save to localStorage
    localStorage.setItem('lastToken', token);
    localStorage.setItem('tokenTimestamp', Date.now());
    
    showStatus('success', '✅ নতুন টোকেন তৈরি হয়েছে!');
    
    // Auto copy
    copyToClipboard(token);
}

function copyToken() {
    const token = getTokenFromDisplay();
    
    if (!token || token.includes('তৈরি')) {
        showStatus('error', '❌ আগে টোকেন তৈরি করুন!');
        return;
    }
    
    copyToClipboard(token);
    showStatus('success', '✅ টোকেন কপি হয়েছে!');
}

function getTokenFromDisplay() {
    const text = tokenDisplay.textContent;
    return text.replace('🔑', '').trim();
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// ===== Account Functions =====
async function getAccountData() {
    const token = getTokenFromDisplay();
    
    if (!token || token.includes('তৈরি')) {
        showStatus('error', '❌ আগে টোকেন তৈরি করুন!');
        return;
    }
    
    showStatus('info', '⏳ ডেটা আনা হচ্ছে...');
    
    try {
        const response = await fetch(`https://login.KillerSharmaBot.online/login?access_token=${token}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.localconfig) {
            throw new Error('localconfig পাওয়া যায়নি');
        }
        
        // Download localconfig.json
        downloadLocalConfig(data.localconfig);
        
        // Show account info
        const accountInfo = `
            ✅ অ্যাকাউন্ট পাওয়া গেছে!<br>
            <strong>নাম:</strong> ${data.nickname || 'N/A'}<br>
            <strong>ID:</strong> ${data.account_id || 'N/A'}<br>
            <strong>লেভেল:</strong> ${data.level || 'N/A'}<br>
            <strong>এক্সপাইর:</strong> ${formatDate(data.expiry_time)}
        `;
        showStatus('success', accountInfo);
        
        // Save account info
        localStorage.setItem('lastAccount', JSON.stringify({
            name: data.nickname,
            id: data.account_id,
            level: data.level
        }));
        
    } catch (error) {
        showStatus('error', `❌ ${error.message}`);
    }
}

function downloadLocalConfig(localconfig) {
    const jsonString = JSON.stringify(localconfig, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localconfig.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('bn-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===== Open Game =====
function openGame() {
    const token = getTokenFromDisplay();
    
    if (!token || token.includes('তৈরি')) {
        showStatus('error', '❌ আগে টোকেন তৈরি করুন!');
        return;
    }
    
    const url = `https://login.KillerSharmaBot.online/login?access_token=${token}`;
    window.open(url, '_blank');
    showStatus('success', '🚀 গেম লগইন পেজ খোলা হয়েছে!');
}

// ===== Status Functions =====
function showStatus(type, message) {
    statusDiv.className = `status show ${type}`;
    statusDiv.innerHTML = message;
    
    if (type !== 'error') {
        clearTimeout(statusDiv._timeout);
        statusDiv._timeout = setTimeout(() => {
            statusDiv.className = 'status';
            statusDiv.innerHTML = '';
        }, 8000);
    }
}

// ===== Dark Mode =====
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    const btn = document.querySelector('.dark-toggle');
    btn.textContent = isDark ? '☀️' : '🌙';
}

// ===== Load Saved Data =====
function loadSavedData() {
    // Load token
    const lastToken = localStorage.getItem('lastToken');
    if (lastToken) {
        tokenDisplay.textContent = `🔑 ${lastToken}`;
        tokenDisplay.className = 'token-box active';
    }
    
    // Load dark mode
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const btn = document.querySelector('.dark-toggle');
        if (btn) btn.textContent = '☀️';
    }
    
    // Load account info
    const accountData = localStorage.getItem('lastAccount');
    if (accountData) {
        try {
            const data = JSON.parse(accountData);
            // Show in status
            const info = `
                📱 শেষ অ্যাকাউন্ট:<br>
                <strong>${data.name}</strong> (${data.id})<br>
                লেভেল: ${data.level}
            `;
            showStatus('info', info);
        } catch (e) {}
    }
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'g' || e.key === 'G') {
        generateToken();
    }
    if (e.key === 'c' || e.key === 'C') {
        copyToken();
    }
    if (e.key === 'd' || e.key === 'D') {
        getAccountData();
    }
    if (e.key === 'o' || e.key === 'O') {
        openGame();
    }
});

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    
    // Add dark mode toggle if not exists
    if (!document.querySelector('.dark-toggle')) {
        const btn = document.createElement('button');
        btn.className = 'dark-toggle';
        btn.textContent = '🌙';
        btn.onclick = toggleDarkMode;
        document.body.appendChild(btn);
    }
});

// ===== Service Worker for PWA =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch(() => console.log('SW failed'));
}