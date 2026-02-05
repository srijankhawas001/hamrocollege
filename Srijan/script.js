// State Management
let currentTheme = 'cosmic';
let currentType = 'qr';
let generatedCode = null;
let gallery = JSON.parse(localStorage.getItem('codeGallery')) || [];

// Theme Configurations
const themes = {
    cosmic: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        accent: '#06b6d4',
        bg: '#0f0a1e',
        bgSecondary: '#1a1332',
        bgCard: '#251b47',
        text: '#f8fafc',
        border: '#3730a3'
    },
    ocean: {
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        accent: '#10b981',
        bg: '#0a1628',
        bgSecondary: '#0f2744',
        bgCard: '#1a3a5c',
        text: '#f0f9ff',
        border: '#075985'
    },
    sunset: {
        primary: '#f97316',
        secondary: '#fb923c',
        accent: '#fbbf24',
        bg: '#1a0f0a',
        bgSecondary: '#2d1810',
        bgCard: '#422416',
        text: '#fff7ed',
        border: '#c2410c'
    },
    forest: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399',
        bg: '#0a1f14',
        bgSecondary: '#0f2f1f',
        bgCard: '#1a4d2e',
        text: '#f0fdf4',
        border: '#047857'
    },
    neon: {
        primary: '#a855f7',
        secondary: '#ec4899',
        accent: '#ef4444',
        bg: '#18091f',
        bgSecondary: '#2d1b3d',
        bgCard: '#3f2651',
        text: '#fdf4ff',
        border: '#7e22ce'
    },
    royal: {
        primary: '#4f46e5',
        secondary: '#7c3aed',
        accent: '#a855f7',
        bg: '#0f0a1f',
        bgSecondary: '#1a1333',
        bgCard: '#2d2250',
        text: '#eef2ff',
        border: '#4338ca'
    },
    cherry: {
        primary: '#be123c',
        secondary: '#e11d48',
        accent: '#f43f5e',
        bg: '#1f0a0f',
        bgSecondary: '#2d1014',
        bgCard: '#4a1c23',
        text: '#fff1f2',
        border: '#9f1239'
    },
    mint: {
        primary: '#06b6d4',
        secondary: '#14b8a6',
        accent: '#2dd4bf',
        bg: '#0a1f1f',
        bgSecondary: '#0f2f2e',
        bgCard: '#1a4d4a',
        text: '#f0fdfa',
        border: '#0891b2'
    }
};

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const typeButtons = document.querySelectorAll('.type-btn');
const themeCards = document.querySelectorAll('.theme-card');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const saveToGalleryBtn = document.getElementById('saveToGalleryBtn');
const codeDisplay = document.getElementById('codeDisplay');
const inputData = document.getElementById('inputData');
const dataType = document.getElementById('dataType');

// QR Options
const qrSize = document.getElementById('qrSize');
const qrSizeValue = document.getElementById('qrSizeValue');
const errorCorrection = document.getElementById('errorCorrection');
const qrOptions = document.querySelector('.qr-options');

// Barcode Options
const barcodeFormat = document.getElementById('barcodeFormat');
const barcodeWidth = document.getElementById('barcodeWidth');
const barcodeWidthValue = document.getElementById('barcodeWidthValue');
const barcodeHeight = document.getElementById('barcodeHeight');
const barcodeHeightValue = document.getElementById('barcodeHeightValue');
const barcodeOptions = document.querySelector('.barcode-options');

// Scan Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const scanPreview = document.getElementById('scanPreview');
const scanImage = document.getElementById('scanImage');
const scanResult = document.getElementById('scanResult');
const copyResultBtn = document.getElementById('copyResultBtn');
const resetScanBtn = document.getElementById('resetScanBtn');

// Gallery
const galleryGrid = document.getElementById('galleryGrid');

// Navigation
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;

        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');

        if (section === 'gallery') {
            renderGallery();
        }
    });
});

// Type Selection
typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentType = btn.dataset.type;

        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (currentType === 'qr') {
            qrOptions.style.display = 'block';
            barcodeOptions.style.display = 'none';
        } else {
            qrOptions.style.display = 'none';
            barcodeOptions.style.display = 'block';
        }
    });
});

// Theme Selection
themeCards.forEach(card => {
    card.addEventListener('click', () => {
        currentTheme = card.dataset.theme;

        themeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        applyTheme(currentTheme);
    });
});

// Apply Theme
function applyTheme(themeName) {
    const theme = themes[themeName];
    const root = document.documentElement;

    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-dark', theme.primaryDark || theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--bg-primary', theme.bg);
    root.style.setProperty('--bg-secondary', theme.bgSecondary);
    root.style.setProperty('--bg-card', theme.bgCard);
    root.style.setProperty('--text-primary', theme.text);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--shadow', `${theme.primary}50`);
}

// Slider Updates
qrSize.addEventListener('input', (e) => {
    qrSizeValue.textContent = e.target.value + 'px';
});

barcodeWidth.addEventListener('input', (e) => {
    barcodeWidthValue.textContent = e.target.value;
});

barcodeHeight.addEventListener('input', (e) => {
    barcodeHeightValue.textContent = e.target.value + 'px';
});

// Generate Code
generateBtn.addEventListener('click', () => {
    const data = inputData.value.trim();

    if (!data) {
        alert('Please enter some data to generate a code');
        return;
    }

    // Clear previous code
    codeDisplay.innerHTML = '';

    // Create container with theme colors
    const container = document.createElement('div');
    container.style.padding = '2rem';
    container.style.borderRadius = '12px';
    container.style.background = 'white';
    container.id = 'code-container';

    if (currentType === 'qr') {
        generateQRCode(data, container);
    } else {
        generateBarcode(data, container);
    }

    codeDisplay.appendChild(container);

    // Add success animation
    container.classList.add('success');
});

// Generate QR Code
function generateQRCode(data, container) {
    const theme = themes[currentTheme];
    const size = parseInt(qrSize.value);
    const correction = errorCorrection.value;

    // Format data based on type
    let formattedData = data;
    const type = dataType.value;

    switch (type) {
        case 'url':
            if (!data.startsWith('http')) {
                formattedData = 'https://' + data;
            }
            break;
        case 'email':
            formattedData = 'mailto:' + data;
            break;
        case 'phone':
            formattedData = 'tel:' + data;
            break;
        case 'sms':
            formattedData = 'sms:' + data;
            break;
        case 'wifi':
            // Format: WIFI:T:WPA;S:networkname;P:password;;
            formattedData = data;
            break;
    }

    const qrContainer = document.createElement('div');
    qrContainer.id = 'qrcode';
    qrContainer.style.display = 'inline-block';
    container.appendChild(qrContainer);

    try {
        // Clear any existing QR code
        qrContainer.innerHTML = '';

        const qr = new QRCode(qrContainer, {
            text: formattedData,
            width: size,
            height: size,
            colorDark: theme.primary,
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel[correction]
        });

        generatedCode = {
            type: 'qr',
            data: formattedData,
            theme: currentTheme,
            timestamp: Date.now()
        };

        console.log('QR Code generated successfully');
    } catch (e) {
        console.error('QR Code generation error:', e);
        container.innerHTML = '<div style="color: #ef4444; padding: 2rem; text-align: center;">Failed to generate QR code. Please try again.</div>';
    }
}

// Generate Barcode
function generateBarcode(data, container) {
    const theme = themes[currentTheme];
    const format = barcodeFormat.value;
    const width = parseFloat(barcodeWidth.value);
    const height = parseInt(barcodeHeight.value);

    // Validate and format data for barcode format
    let validData = data;

    if (format === 'EAN13') {
        validData = data.replace(/\D/g, '');
        if (validData.length < 12) {
            validData = validData.padEnd(12, '0');
        } else if (validData.length > 13) {
            validData = validData.substring(0, 13);
        }
    } else if (format === 'UPC') {
        validData = data.replace(/\D/g, '');
        if (validData.length < 11) {
            validData = validData.padEnd(11, '0');
        } else if (validData.length > 12) {
            validData = validData.substring(0, 12);
        }
    } else if (format === 'ITF14') {
        validData = data.replace(/\D/g, '');
        if (validData.length < 14) {
            validData = validData.padEnd(14, '0');
        } else {
            validData = validData.substring(0, 14);
        }
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'barcode';
    container.appendChild(canvas);

    try {
        JsBarcode(canvas, validData, {
            format: format,
            width: width,
            height: height,
            displayValue: true,
            lineColor: theme.primary,
            background: '#ffffff',
            margin: 10,
            fontSize: 16,
            textMargin: 5
        });

        generatedCode = {
            type: 'barcode',
            data: validData,
            theme: currentTheme,
            format: format,
            timestamp: Date.now()
        };

        console.log('Barcode generated successfully');
    } catch (e) {
        console.error('Barcode generation error:', e);
        container.innerHTML = `<div style="color: #ef4444; padding: 2rem; text-align: center;">
            <strong>Invalid data for ${format} format</strong><br><br>
            Please enter valid data. For numeric formats like EAN13/UPC, use only numbers.
        </div>`;
    }
}

// Download Code
downloadBtn.addEventListener('click', async () => {
    if (!generatedCode) {
        alert('Please generate a code first!');
        return;
    }

    const container = document.getElementById('code-container');

    if (!container) {
        alert('No code to download!');
        return;
    }

    try {
        // Show loading state
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<div class="loading" style="width: 20px; height: 20px; border: 2px solid white; border-top-color: transparent; border-radius: 50%;"></div>';
        downloadBtn.disabled = true;

        const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 3,
            logging: false,
            useCORS: true
        });

        const link = document.createElement('a');
        link.download = `${currentType}-code-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Reset button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;

        // Show success feedback
        downloadBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Downloaded!';
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
        }, 2000);

    } catch (e) {
        console.error('Download failed:', e);
        alert('Failed to download. Please try again.');
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
});

// Save to Gallery
saveToGalleryBtn.addEventListener('click', async () => {
    if (!generatedCode) {
        alert('Please generate a code first!');
        return;
    }

    const container = document.getElementById('code-container');

    if (!container) {
        alert('No code to save!');
        return;
    }

    try {
        // Show loading state
        const originalText = saveToGalleryBtn.innerHTML;
        saveToGalleryBtn.innerHTML = '<div class="loading" style="width: 20px; height: 20px; border: 2px solid white; border-top-color: transparent; border-radius: 50%;"></div>';
        saveToGalleryBtn.disabled = true;

        const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 3,
            logging: false,
            useCORS: true
        });

        const imageData = canvas.toDataURL('image/png');

        const galleryItem = {
            ...generatedCode,
            image: imageData,
            id: Date.now()
        };

        gallery.unshift(galleryItem);

        // Limit gallery to 50 items
        if (gallery.length > 50) {
            gallery = gallery.slice(0, 50);
        }

        localStorage.setItem('codeGallery', JSON.stringify(gallery));

        // Reset button and show success
        saveToGalleryBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Saved!';
        saveToGalleryBtn.disabled = false;

        setTimeout(() => {
            saveToGalleryBtn.innerHTML = originalText;
        }, 2000);

    } catch (e) {
        console.error('Save failed:', e);
        alert('Failed to save. Please try again.');
        const originalText = saveToGalleryBtn.innerHTML;
        saveToGalleryBtn.innerHTML = originalText;
        saveToGalleryBtn.disabled = false;
    }
});

// Scan Section - File Upload
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        processImage(file);
    }
});

// Process Uploaded Image
function processImage(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        scanImage.src = e.target.result;
        uploadArea.style.display = 'none';
        scanPreview.style.display = 'block';

        // Decode QR/Barcode
        decodeImage(e.target.result);
    };

    reader.readAsDataURL(file);
}

// Decode Image using jsQR and ZXing
async function decodeImage(imageDataUrl) {
    scanResult.innerHTML = '<div class="empty-state"><div class="loading" style="width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%;"></div><p>Scanning...</p></div>';

    const img = new Image();
    img.onload = async function () {
        // Create canvas to get image data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Try QR code first with jsQR
        let result = null;

        if (typeof jsQR !== 'undefined') {
            try {
                const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
                if (qrCode) {
                    result = qrCode.data;
                    displayScanResult(result, 'QR Code');
                    return;
                }
            } catch (e) {
                console.log('jsQR scan failed:', e);
            }
        }

        // Try barcode with ZXing
        if (typeof ZXing !== 'undefined') {
            try {
                const codeReader = new ZXing.BrowserMultiFormatReader();
                const zxingResult = await codeReader.decodeFromImageElement(img);
                if (zxingResult) {
                    result = zxingResult.text;
                    displayScanResult(result, zxingResult.format || 'Barcode');
                    return;
                }
            } catch (e) {
                console.log('ZXing scan failed:', e);
            }
        }

        // If no code detected
        scanResult.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style="color: #f59e0b;">No QR code or barcode detected in this image.</p>
                <small style="color: var(--text-secondary); margin-top: 0.5rem;">Make sure the image contains a clear, well-lit code.</small>
            </div>
        `;
        copyResultBtn.style.display = 'none';
    };

    img.onerror = function () {
        scanResult.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p style="color: #ef4444;">Failed to load image</p>
            </div>
        `;
        copyResultBtn.style.display = 'none';
    };

    img.src = imageDataUrl;
}

// Display scan result
function displayScanResult(text, type) {
    scanResult.innerHTML = `
        <div class="result-text">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <strong style="color: #10b981; font-size: 1.1rem;">Successfully Decoded!</strong>
            </div>
            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">Type: ${type}</div>
                <div style="word-break: break-all; font-size: 1rem; line-height: 1.6;">${escapeHtml(text)}</div>
            </div>
            ${isUrl(text) ? `<a href="${text}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">Open Link →</a>` : ''}
        </div>
    `;

    copyResultBtn.style.display = 'block';
    copyResultBtn.dataset.result = text;
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to check if text is URL
function isUrl(text) {
    try {
        new URL(text);
        return true;
    } catch {
        return text.startsWith('http://') || text.startsWith('https://');
    }
}

// Copy Result
copyResultBtn.addEventListener('click', () => {
    const result = copyResultBtn.dataset.result;

    navigator.clipboard.writeText(result).then(() => {
        const originalText = copyResultBtn.innerHTML;
        copyResultBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';

        setTimeout(() => {
            copyResultBtn.innerHTML = originalText;
        }, 2000);
    });
});

// Reset Scan
resetScanBtn.addEventListener('click', () => {
    uploadArea.style.display = 'flex';
    scanPreview.style.display = 'none';
    scanImage.src = '';
    fileInput.value = '';
    scanResult.innerHTML = `
        <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            <p>No result yet</p>
        </div>
    `;
    copyResultBtn.style.display = 'none';
});

// Render Gallery
function renderGallery() {
    if (gallery.length === 0) {
        galleryGrid.innerHTML = `
            <div class="empty-state large">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <h3>No saved codes yet</h3>
                <p>Generate and save codes to see them here</p>
            </div>
        `;
        return;
    }

    galleryGrid.innerHTML = gallery.map(item => `
        <div class="gallery-item" data-id="${item.id}">
            <div class="gallery-preview">
                <img src="${item.image}" alt="${item.type}">
            </div>
            <div class="gallery-info">
                <div style="margin-bottom: 0.5rem;">
                    <strong>${item.type.toUpperCase()}</strong> • ${item.theme}
                </div>
                <div style="font-size: 0.75rem; opacity: 0.7;">
                    ${new Date(item.timestamp).toLocaleDateString()}
                </div>
            </div>
            <div class="gallery-actions">
                <button onclick="downloadGalleryItem(${item.id})">Download</button>
                <button onclick="deleteGalleryItem(${item.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Download Gallery Item
window.downloadGalleryItem = (id) => {
    const item = gallery.find(i => i.id === id);
    if (!item) return;

    const link = document.createElement('a');
    link.download = `${item.type}-${item.id}.png`;
    link.href = item.image;
    link.click();
};

// Delete Gallery Item
window.deleteGalleryItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
        gallery = gallery.filter(i => i.id !== id);
        localStorage.setItem('codeGallery', JSON.stringify(gallery));
        renderGallery();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);

    // Add sample data based on type
    updateSampleData();
});

// Update sample data based on current type
function updateSampleData() {
    if (currentType === 'qr') {
        inputData.value = 'https://github.com';
        inputData.placeholder = 'Enter your text, URL, or data...';
    } else {
        inputData.value = '123456789012';
        inputData.placeholder = 'Enter numbers for barcode (e.g., 123456789012)...';
    }
}

// Update sample data when type changes
typeButtons.forEach(btn => {
    const originalClickHandler = btn.onclick;
    btn.addEventListener('click', () => {
        setTimeout(updateSampleData, 100);
    });
});
