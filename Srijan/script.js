// State Management
let currentType = 'qr';
let generatedCode = null;
let gallery = JSON.parse(localStorage.getItem('codeGallery')) || [];
let logoImage = null;

// Custom QR Settings
let qrSettings = {
    fgColor: '#000000',
    bgColor: '#ffffff',
    useGradient: false,
    gradientColor: '#7c3aed',
    gradientType: 'linear',
    dotPattern: 'square',
    eyeStyle: 'square',
    logoSize: 20
};

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const typeButtons = document.querySelectorAll('.type-btn');
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
const qrDesignOptions = document.querySelector('.qr-design-options');

// Logo Elements
const logoUploadArea = document.getElementById('logoUploadArea');
const logoInput = document.getElementById('logoInput');
const logoPreview = document.getElementById('logoPreview');
const logoImageEl = document.getElementById('logoImage');
const removeLogo = document.getElementById('removeLogo');
const logoSizeSlider = document.getElementById('logoSize');
const logoSizeValue = document.getElementById('logoSizeValue');
const logoSizeControl = document.getElementById('logoSizeControl');

// Color Elements
const fgColor = document.getElementById('fgColor');
const fgColorHex = document.getElementById('fgColorHex');
const bgColor = document.getElementById('bgColor');
const bgColorHex = document.getElementById('bgColorHex');
const useGradient = document.getElementById('useGradient');
const gradientOptions = document.getElementById('gradientOptions');
const gradientColor = document.getElementById('gradientColor');
const gradientColorHex = document.getElementById('gradientColorHex');
const gradientType = document.getElementById('gradientType');

// Pattern Elements
const patternBtns = document.querySelectorAll('.pattern-btn');
const eyeBtns = document.querySelectorAll('.eye-btn');

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
            qrDesignOptions.style.display = 'block';
            barcodeOptions.style.display = 'none';
        } else {
            qrOptions.style.display = 'none';
            qrDesignOptions.style.display = 'none';
            barcodeOptions.style.display = 'block';
        }
        
        updateSampleData();
    });
});

// Logo Upload
logoUploadArea.addEventListener('click', () => {
    logoInput.click();
});

logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            logoImage = event.target.result;
            logoImageEl.src = logoImage;
            logoUploadArea.style.display = 'none';
            logoPreview.style.display = 'block';
            logoSizeControl.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

removeLogo.addEventListener('click', () => {
    logoImage = null;
    logoInput.value = '';
    logoUploadArea.style.display = 'flex';
    logoPreview.style.display = 'none';
    logoSizeControl.style.display = 'none';
});

logoSizeSlider.addEventListener('input', (e) => {
    qrSettings.logoSize = parseInt(e.target.value);
    logoSizeValue.textContent = e.target.value + '%';
});

// Color Pickers
fgColor.addEventListener('input', (e) => {
    qrSettings.fgColor = e.target.value;
    fgColorHex.value = e.target.value.toUpperCase();
});

fgColorHex.addEventListener('input', (e) => {
    let value = e.target.value;
    if (!value.startsWith('#')) value = '#' + value;
    if (/^#[0-9A-F]{6}$/i.test(value)) {
        qrSettings.fgColor = value;
        fgColor.value = value;
    }
});

bgColor.addEventListener('input', (e) => {
    qrSettings.bgColor = e.target.value;
    bgColorHex.value = e.target.value.toUpperCase();
});

bgColorHex.addEventListener('input', (e) => {
    let value = e.target.value;
    if (!value.startsWith('#')) value = '#' + value;
    if (/^#[0-9A-F]{6}$/i.test(value)) {
        qrSettings.bgColor = value;
        bgColor.value = value;
    }
});

gradientColor.addEventListener('input', (e) => {
    qrSettings.gradientColor = e.target.value;
    gradientColorHex.value = e.target.value.toUpperCase();
});

gradientColorHex.addEventListener('input', (e) => {
    let value = e.target.value;
    if (!value.startsWith('#')) value = '#' + value;
    if (/^#[0-9A-F]{6}$/i.test(value)) {
        qrSettings.gradientColor = value;
        gradientColor.value = value;
    }
});

// Color Preset Buttons
document.querySelectorAll('.color-preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = btn.dataset.color;
        const group = btn.closest('.color-section');
        
        if (group.querySelector('#fgColor')) {
            fgColor.value = color;
            fgColorHex.value = color.toUpperCase();
            qrSettings.fgColor = color;
        } else if (group.querySelector('#bgColor')) {
            bgColor.value = color;
            bgColorHex.value = color.toUpperCase();
            qrSettings.bgColor = color;
        } else if (group.querySelector('#gradientColor')) {
            gradientColor.value = color;
            gradientColorHex.value = color.toUpperCase();
            qrSettings.gradientColor = color;
        }
    });
});

// Gradient Toggle
useGradient.addEventListener('change', (e) => {
    qrSettings.useGradient = e.target.checked;
    gradientOptions.style.display = e.target.checked ? 'block' : 'none';
});

gradientType.addEventListener('change', (e) => {
    qrSettings.gradientType = e.target.value;
});

// Pattern Selection
patternBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        qrSettings.dotPattern = btn.dataset.pattern;
        patternBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Eye Style Selection
eyeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        qrSettings.eyeStyle = btn.dataset.eye;
        eyeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

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
    
    if (currentType === 'qr') {
        generateCustomQRCode(data);
    } else {
        generateBarcode(data);
    }
});

// Generate Custom QR Code with all styling
function generateCustomQRCode(data) {
    const size = parseInt(qrSize.value);
    const correction = errorCorrection.value;
    
    // Format data based on type
    let formattedData = data;
    const type = dataType.value;
    
    switch(type) {
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
            formattedData = data;
            break;
    }
    
    try {
        // Create QR code using qrcode-generator library for more control
        const typeNumber = 0; // Auto-detect
        const errorCorrectionLevel = correction;
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(formattedData);
        qr.make();
        
        const moduleCount = qr.getModuleCount();
        const cellSize = size / moduleCount;
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        
        // Add background
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', size);
        bgRect.setAttribute('height', size);
        bgRect.setAttribute('fill', qrSettings.bgColor);
        svg.appendChild(bgRect);
        
        // Create gradient if enabled
        if (qrSettings.useGradient) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 
                qrSettings.gradientType === 'linear' ? 'linearGradient' : 'radialGradient');
            gradient.setAttribute('id', 'qr-gradient');
            
            if (qrSettings.gradientType === 'linear') {
                gradient.setAttribute('x1', '0%');
                gradient.setAttribute('y1', '0%');
                gradient.setAttribute('x2', '100%');
                gradient.setAttribute('y2', '100%');
            }
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', qrSettings.fgColor);
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', qrSettings.gradientColor);
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            svg.appendChild(defs);
        }
        
        const fillColor = qrSettings.useGradient ? 'url(#qr-gradient)' : qrSettings.fgColor;
        
        // Draw QR code with custom patterns
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    const x = col * cellSize;
                    const y = row * cellSize;
                    
                    // Check if this is part of position detection pattern (corners)
                    const isCorner = (
                        (row < 7 && col < 7) || // Top-left
                        (row < 7 && col >= moduleCount - 7) || // Top-right
                        (row >= moduleCount - 7 && col < 7) // Bottom-left
                    );
                    
                    if (!isCorner) {
                        // Draw regular modules
                        drawModule(svg, x, y, cellSize, fillColor, qrSettings.dotPattern);
                    }
                }
            }
        }
        
        // Draw custom corner eyes
        drawCornerEyes(svg, cellSize, moduleCount, fillColor, qrSettings.eyeStyle);
        
        // Add logo if present
        if (logoImage) {
            const logoSizePixels = (size * qrSettings.logoSize) / 100;
            const logoX = (size - logoSizePixels) / 2;
            const logoY = (size - logoSizePixels) / 2;
            
            // White background for logo
            const logoBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            logoBg.setAttribute('x', logoX - 5);
            logoBg.setAttribute('y', logoY - 5);
            logoBg.setAttribute('width', logoSizePixels + 10);
            logoBg.setAttribute('height', logoSizePixels + 10);
            logoBg.setAttribute('fill', 'white');
            logoBg.setAttribute('rx', '8');
            svg.appendChild(logoBg);
            
            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoImage);
            image.setAttribute('x', logoX);
            image.setAttribute('y', logoY);
            image.setAttribute('width', logoSizePixels);
            image.setAttribute('height', logoSizePixels);
            svg.appendChild(image);
        }
        
        // Create container
        const container = document.createElement('div');
        container.style.padding = '2rem';
        container.style.borderRadius = '12px';
        container.style.background = 'white';
        container.style.display = 'inline-block';
        container.id = 'code-container';
        container.appendChild(svg);
        
        codeDisplay.appendChild(container);
        container.classList.add('success');
        
        generatedCode = {
            type: 'qr',
            data: formattedData,
            settings: { ...qrSettings },
            hasLogo: !!logoImage,
            timestamp: Date.now()
        };
        
    } catch (e) {
        console.error('QR Code generation error:', e);
        codeDisplay.innerHTML = '<div style="color: #ef4444; padding: 2rem; text-align: center;">Failed to generate QR code. Please try again.</div>';
    }
}

// Helper function to draw modules with different patterns
function drawModule(svg, x, y, size, fill, pattern) {
    let element;
    
    switch (pattern) {
        case 'dots':
            element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            element.setAttribute('cx', x + size / 2);
            element.setAttribute('cy', y + size / 2);
            element.setAttribute('r', size * 0.4);
            break;
        case 'rounded':
            element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            element.setAttribute('x', x);
            element.setAttribute('y', y);
            element.setAttribute('width', size);
            element.setAttribute('height', size);
            element.setAttribute('rx', size * 0.3);
            break;
        default: // square
            element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            element.setAttribute('x', x);
            element.setAttribute('y', y);
            element.setAttribute('width', size);
            element.setAttribute('height', size);
    }
    
    element.setAttribute('fill', fill);
    svg.appendChild(element);
}

// Helper function to draw custom corner eyes
function drawCornerEyes(svg, cellSize, moduleCount, fill, style) {
    const positions = [
        { x: 0, y: 0 }, // Top-left
        { x: moduleCount - 7, y: 0 }, // Top-right
        { x: 0, y: moduleCount - 7 } // Bottom-left
    ];
    
    positions.forEach(pos => {
        const x = pos.x * cellSize;
        const y = pos.y * cellSize;
        const eyeSize = 7 * cellSize;
        
        if (style === 'circle') {
            // Outer circle
            const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            outerCircle.setAttribute('cx', x + eyeSize / 2);
            outerCircle.setAttribute('cy', y + eyeSize / 2);
            outerCircle.setAttribute('r', eyeSize * 0.45);
            outerCircle.setAttribute('fill', 'none');
            outerCircle.setAttribute('stroke', fill);
            outerCircle.setAttribute('stroke-width', cellSize);
            svg.appendChild(outerCircle);
            
            // Inner circle
            const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            innerCircle.setAttribute('cx', x + eyeSize / 2);
            innerCircle.setAttribute('cy', y + eyeSize / 2);
            innerCircle.setAttribute('r', eyeSize * 0.2);
            innerCircle.setAttribute('fill', fill);
            svg.appendChild(innerCircle);
        } else if (style === 'rounded') {
            // Outer rounded square
            const outer = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            outer.setAttribute('x', x);
            outer.setAttribute('y', y);
            outer.setAttribute('width', eyeSize);
            outer.setAttribute('height', eyeSize);
            outer.setAttribute('fill', 'none');
            outer.setAttribute('stroke', fill);
            outer.setAttribute('stroke-width', cellSize);
            outer.setAttribute('rx', cellSize * 2);
            svg.appendChild(outer);
            
            // Inner rounded square
            const inner = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            inner.setAttribute('x', x + cellSize * 2);
            inner.setAttribute('y', y + cellSize * 2);
            inner.setAttribute('width', cellSize * 3);
            inner.setAttribute('height', cellSize * 3);
            inner.setAttribute('fill', fill);
            inner.setAttribute('rx', cellSize);
            svg.appendChild(inner);
        } else { // square
            // Outer square
            const outer = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            outer.setAttribute('x', x);
            outer.setAttribute('y', y);
            outer.setAttribute('width', eyeSize);
            outer.setAttribute('height', eyeSize);
            outer.setAttribute('fill', 'none');
            outer.setAttribute('stroke', fill);
            outer.setAttribute('stroke-width', cellSize);
            svg.appendChild(outer);
            
            // Inner square
            const inner = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            inner.setAttribute('x', x + cellSize * 2);
            inner.setAttribute('y', y + cellSize * 2);
            inner.setAttribute('width', cellSize * 3);
            inner.setAttribute('height', cellSize * 3);
            inner.setAttribute('fill', fill);
            svg.appendChild(inner);
        }
    });
}

// Generate Barcode (keep existing functionality)
function generateBarcode(data) {
    const format = barcodeFormat.value;
    const width = parseFloat(barcodeWidth.value);
    const height = parseInt(barcodeHeight.value);
    
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
    
    const container = document.createElement('div');
    container.style.padding = '2rem';
    container.style.borderRadius = '12px';
    container.style.background = 'white';
    container.style.display = 'inline-block';
    container.id = 'code-container';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'barcode';
    container.appendChild(canvas);
    
    try {
        JsBarcode(canvas, validData, {
            format: format,
            width: width,
            height: height,
            displayValue: true,
            lineColor: qrSettings.fgColor,
            background: qrSettings.bgColor,
            margin: 10,
            fontSize: 16,
            textMargin: 5
        });
        
        codeDisplay.appendChild(container);
        container.classList.add('success');
        
        generatedCode = {
            type: 'barcode',
            data: validData,
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
        codeDisplay.appendChild(container);
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
        
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        
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
        
        if (gallery.length > 50) {
            gallery = gallery.slice(0, 50);
        }
        
        localStorage.setItem('codeGallery', JSON.stringify(gallery));
        
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
        
        decodeImage(e.target.result);
    };
    
    reader.readAsDataURL(file);
}

// Decode Image using jsQR and ZXing
async function decodeImage(imageDataUrl) {
    scanResult.innerHTML = '<div class="empty-state"><div class="loading" style="width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%;"></div><p>Scanning...</p></div>';
    
    const img = new Image();
    img.onload = async function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
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
    
    img.onerror = function() {
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isUrl(text) {
    try {
        new URL(text);
        return true;
    } catch {
        return text.startsWith('http://') || text.startsWith('https://');
    }
}

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
                    <strong>${item.type.toUpperCase()}</strong>
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

window.downloadGalleryItem = (id) => {
    const item = gallery.find(i => i.id === id);
    if (!item) return;
    
    const link = document.createElement('a');
    link.download = `${item.type}-${item.id}.png`;
    link.href = item.image;
    link.click();
};

window.deleteGalleryItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
        gallery = gallery.filter(i => i.id !== id);
        localStorage.setItem('codeGallery', JSON.stringify(gallery));
        renderGallery();
    }
};

function updateSampleData() {
    if (currentType === 'qr') {
        inputData.value = 'https://github.com/srijankhawas001';
        inputData.placeholder = 'Enter your text, URL, or data...';
    } else {
        inputData.value = '123456789012';
        inputData.placeholder = 'Enter numbers for barcode (e.g., 123456789012)...';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateSampleData();
});
