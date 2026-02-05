/**
 * Tool Manager
 * Manages tool switching and rendering
 */

class ToolManager {
  constructor(canvasEngine, historyManager) {
    this.canvasEngine = canvasEngine;
    this.historyManager = historyManager;
    this.currentTool = 'basic';
    
    this.toolCategories = document.getElementById('tool-categories');
    this.toolContent = document.getElementById('tool-content');
    
    this.setupEventListeners();
    this.renderTool('basic');
  }

  setupEventListeners() {
    const toolBtns = this.toolCategories.querySelectorAll('.tool-category-btn');
    
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        this.switchTool(tool);
        
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  switchTool(tool) {
    this.currentTool = tool;
    this.renderTool(tool);
  }

  renderTool(tool) {
    switch (tool) {
      case 'basic':
        this.renderBasicTools();
        break;
      case 'enhance':
        this.renderEnhanceTools();
        break;
      case 'filters':
        this.renderFilterTools();
        break;
      case 'draw':
        this.renderDrawTools();
        break;
      case 'ocr':
        this.renderOCRTools();
        break;
      case 'watermark':
        this.renderWatermarkTools();
        break;
      default:
        this.toolContent.innerHTML = '<p>Tool not found</p>';
    }
  }

  renderBasicTools() {
    this.toolContent.innerHTML = `
      <div class="tool-section">
        <h3>Crop</h3>
        <div class="tool-control">
          <label>Aspect Ratio</label>
          <select class="input" id="crop-aspect">
            <option value="free">Free</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="4:3">4:3</option>
            <option value="16:9">16:9</option>
            <option value="3:2">3:2</option>
          </select>
        </div>
        <button class="btn btn-secondary" style="width: 100%;" disabled>Apply Crop (Coming Soon)</button>
      </div>

      <div class="tool-section">
        <h3>Resize</h3>
        <div class="tool-control">
          <label>Width (px)</label>
          <input type="number" class="input" id="resize-width" placeholder="Width">
        </div>
        <div class="tool-control">
          <label>Height (px)</label>
          <input type="number" class="input" id="resize-height" placeholder="Height">
        </div>
        <div class="tool-control">
          <label style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" id="resize-lock-aspect" checked>
            Lock Aspect Ratio
          </label>
        </div>
        <button class="btn btn-primary" style="width: 100%;" id="apply-resize">Apply Resize</button>
      </div>

      <div class="tool-section">
        <h3>Rotate & Flip</h3>
        <div class="tool-control">
          <label>Rotation</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
            <button class="btn btn-secondary" id="rotate-90">↻ 90°</button>
            <button class="btn btn-secondary" id="rotate-180">↻ 180°</button>
            <button class="btn btn-secondary" id="rotate-270">↻ 270°</button>
            <button class="btn btn-secondary" id="rotate-custom">Custom</button>
          </div>
        </div>
        <div class="tool-control">
          <label>Flip</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
            <button class="btn btn-secondary" id="flip-horizontal">↔ Horizontal</button>
            <button class="btn btn-secondary" id="flip-vertical">↕ Vertical</button>
          </div>
        </div>
      </div>

      <div class="tool-section">
        <h3>Format Converter</h3>
        <div class="tool-control">
          <label>Output Format</label>
          <select class="input" id="convert-format">
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: -0.5rem;">Format conversion happens during export</p>
      </div>
    `;

    this.setupBasicToolListeners();
  }

  setupBasicToolListeners() {
    // Resize
    const resizeWidth = document.getElementById('resize-width');
    const resizeHeight = document.getElementById('resize-height');
    const lockAspect = document.getElementById('resize-lock-aspect');
    const applyResize = document.getElementById('apply-resize');

    let aspectRatio = 1;

    if (this.canvasEngine && this.canvasEngine.workingImage) {
      const img = this.canvasEngine.workingImage;
      resizeWidth.value = img.width;
      resizeHeight.value = img.height;
      aspectRatio = img.width / img.height;
    }

    resizeWidth.addEventListener('input', () => {
      if (lockAspect.checked && resizeWidth.value) {
        resizeHeight.value = Math.round(resizeWidth.value / aspectRatio);
      }
    });

    resizeHeight.addEventListener('input', () => {
      if (lockAspect.checked && resizeHeight.value) {
        resizeWidth.value = Math.round(resizeHeight.value * aspectRatio);
      }
    });

    applyResize.addEventListener('click', () => {
      const width = parseInt(resizeWidth.value);
      const height = parseInt(resizeHeight.value);

      if (width && height && width > 0 && height > 0) {
        window.applyEdit({
          type: 'resize',
          params: { width, height }
        });
      }
    });

    // Rotate
    document.getElementById('rotate-90').addEventListener('click', () => {
      window.applyEdit({ type: 'rotate', angle: 90 });
    });

    document.getElementById('rotate-180').addEventListener('click', () => {
      window.applyEdit({ type: 'rotate', angle: 180 });
    });

    document.getElementById('rotate-270').addEventListener('click', () => {
      window.applyEdit({ type: 'rotate', angle: 270 });
    });

    document.getElementById('rotate-custom').addEventListener('click', () => {
      const angle = prompt('Enter rotation angle (degrees):');
      if (angle !== null) {
        const angleNum = parseFloat(angle);
        if (!isNaN(angleNum)) {
          window.applyEdit({ type: 'rotate', angle: angleNum });
        }
      }
    });

    // Flip
    document.getElementById('flip-horizontal').addEventListener('click', () => {
      window.applyEdit({ type: 'flip', direction: 'horizontal' });
    });

    document.getElementById('flip-vertical').addEventListener('click', () => {
      window.applyEdit({ type: 'flip', direction: 'vertical' });
    });
  }

  renderEnhanceTools() {
    this.toolContent.innerHTML = `
      <div class="tool-section">
        <h3>Adjustments</h3>
        
        <div class="tool-control">
          <label>Brightness</label>
          <div class="tool-control-row">
            <input type="range" class="slider" id="brightness-slider" min="-100" max="100" value="0">
            <span class="tool-value" id="brightness-value">0</span>
          </div>
        </div>

        <div class="tool-control">
          <label>Contrast</label>
          <div class="tool-control-row">
            <input type="range" class="slider" id="contrast-slider" min="-100" max="100" value="0">
            <span class="tool-value" id="contrast-value">0</span>
          </div>
        </div>

        <div class="tool-control">
          <label>Saturation</label>
          <div class="tool-control-row">
            <input type="range" class="slider" id="saturation-slider" min="0" max="2" step="0.1" value="1">
            <span class="tool-value" id="saturation-value">1.0</span>
          </div>
        </div>

        <button class="btn btn-secondary" style="width: 100%;" id="reset-adjustments">Reset All</button>
      </div>

      <div class="tool-section">
        <h3>Sharpness</h3>
        <div class="tool-control">
          <label>Amount</label>
          <div class="tool-control-row">
            <input type="range" class="slider" id="sharpness-slider" min="0" max="100" value="0">
            <span class="tool-value" id="sharpness-value">0</span>
          </div>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-tertiary);">Sharpness feature coming soon</p>
      </div>
    `;

    this.setupEnhanceToolListeners();
  }

  setupEnhanceToolListeners() {
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessValue = document.getElementById('brightness-value');
    const contrastSlider = document.getElementById('contrast-slider');
    const contrastValue = document.getElementById('contrast-value');
    const saturationSlider = document.getElementById('saturation-slider');
    const saturationValue = document.getElementById('saturation-value');
    const resetBtn = document.getElementById('reset-adjustments');

    brightnessSlider.addEventListener('input', () => {
      brightnessValue.textContent = brightnessSlider.value;
    });

    brightnessSlider.addEventListener('change', () => {
      window.applyEdit({
        type: 'brightness',
        value: parseInt(brightnessSlider.value)
      });
    });

    contrastSlider.addEventListener('input', () => {
      contrastValue.textContent = contrastSlider.value;
    });

    contrastSlider.addEventListener('change', () => {
      window.applyEdit({
        type: 'contrast',
        value: parseInt(contrastSlider.value)
      });
    });

    saturationSlider.addEventListener('input', () => {
      saturationValue.textContent = parseFloat(saturationSlider.value).toFixed(1);
    });

    saturationSlider.addEventListener('change', () => {
      window.applyEdit({
        type: 'saturation',
        value: parseFloat(saturationSlider.value)
      });
    });

    resetBtn.addEventListener('click', () => {
      brightnessSlider.value = 0;
      brightnessValue.textContent = '0';
      contrastSlider.value = 0;
      contrastValue.textContent = '0';
      saturationSlider.value = 1;
      saturationValue.textContent = '1.0';
    });
  }

  renderFilterTools() {
    this.toolContent.innerHTML = `
      <div class="tool-section">
        <h3>Preset Filters</h3>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Apply professional filters to your images
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
          <button class="btn btn-secondary" disabled>Grayscale</button>
          <button class="btn btn-secondary" disabled>Sepia</button>
          <button class="btn btn-secondary" disabled>Vintage</button>
          <button class="btn btn-secondary" disabled>Cool</button>
          <button class="btn btn-secondary" disabled>Warm</button>
          <button class="btn btn-secondary" disabled>High Contrast</button>
        </div>
        
        <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 1rem;">
          Filter presets coming soon
        </p>
      </div>

      <div class="tool-section">
        <h3>Blur</h3>
        <div class="tool-control">
          <label>Blur Amount</label>
          <div class="tool-control-row">
            <input type="range" class="slider" min="0" max="20" value="0" disabled>
            <span class="tool-value">0</span>
          </div>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-tertiary);">Blur tool coming soon</p>
      </div>
    `;
  }

  renderDrawTools() {
    this.toolContent.innerHTML = `
      <div class="tool-section">
        <h3>Drawing Tools</h3>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Draw and annotate on your images
        </p>
        
        <div class="tool-control">
          <label>Tool</label>
          <select class="input" disabled>
            <option>Pen</option>
            <option>Highlighter</option>
            <option>Arrow</option>
            <option>Rectangle</option>
            <option>Circle</option>
            <option>Text</option>
          </select>
        </div>

        <div class="tool-control">
          <label>Color</label>
          <input type="color" class="input" value="#3b82f6" disabled>
        </div>

        <div class="tool-control">
          <label>Stroke Width</label>
          <div class="tool-control-row">
            <input type="range" class="slider" min="1" max="50" value="5" disabled>
            <span class="tool-value">5</span>
          </div>
        </div>

        <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 1rem;">
          Drawing tools coming soon
        </p>
      </div>
    `;
  }

  renderOCRTools() {
    this.toolContent.innerHTML = `
      <div class="tool-section">
        <h3>Text Extraction (OCR)</h3>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Extract text from images and PDFs
        </p>
        
        <button class="btn btn-primary" style="width: 100%;" id="extract-text-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Extract Text
        </button>

        <div id="ocr-result" class="hidden" style="margin-top: 1rem;">
          <div class="tool-control">
            <label>Extracted Text</label>
            <textarea class="input" id="extracted-text" rows="8" readonly style="resize: vertical;"></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
            <button class="btn btn-secondary" id="copy-text-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
            <button class="btn btn-secondary" id="search-text-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search
            </button>
          </div>
        </div>

        <div id="ocr-loading" class="hidden" style="text-align: center; margin-top: 1rem;">
          <p style="color: var(--text-secondary);">Processing image...</p>
          <div style="margin-top: 0.5rem; animation: pulse 1.5s ease-in-out infinite;">⏳</div>
        </div>
      </div>

      <div class="tool-section">
        <h3>Translation</h3>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Translate extracted text
        </p>
        
        <div class="tool-control">
          <label>Target Language</label>
          <select class="input" disabled>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Chinese</option>
            <option>Japanese</option>
          </select>
        </div>

        <button class="btn btn-secondary" style="width: 100%;" disabled>Translate</button>
        
        <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 1rem;">
          Translation feature reserved for future implementation
        </p>
      </div>
    `;

    this.setupOCRToolListeners();
  }

  setupOCRToolListeners() {
    const extractBtn = document.getElementById('extract-text-btn');
    const ocrResult = document.getElementById('ocr-result');
    const ocrLoading = document.getElementById('ocr-loading');
    const extractedText = document.getElementById('extracted-text');
    const copyBtn = document.getElementById('copy-text-btn');
    const searchBtn = document.getElementById('search-text-btn');

    extractBtn.addEventListener('click', async () => {
      if (!this.canvasEngine || !this.canvasEngine.workingImage) {
        alert('No image loaded');
        return;
      }

      try {
        extractBtn.disabled = true;
        ocrLoading.classList.remove('hidden');
        ocrResult.classList.add('hidden');

        // Get image data URL
        const imageData = this.canvasEngine.getImageDataURL();

        // Simulate OCR (Tesseract.js would be loaded here)
        // For now, show placeholder
        await new Promise(resolve => setTimeout(resolve, 2000));

        extractedText.value = 'OCR functionality requires Tesseract.js library.\n\nTo enable:\n1. Include Tesseract.js CDN in HTML\n2. Implement OCR processing\n3. Extract and display text\n\nThis is a placeholder for demonstration.';

        ocrLoading.classList.add('hidden');
        ocrResult.classList.remove('hidden');

      } catch (error) {
        console.error('OCR error:', error);
        alert('Error extracting text');
      } finally {
        extractBtn.disabled = false;
      }
    });

    copyBtn.addEventListener('click', () => {
      extractedText.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
      }, 2000);
    });

    searchBtn.addEventListener('click', () => {
      const text = extractedText.value;
      if (text) {
        const query = prompt('Enter search term:');
        if (query) {
          const index = text.toLowerCase().indexOf(query.toLowerCase());
          if (index !== -1) {
            extractedText.focus();
            extractedText.setSelectionRange(index, index + query.length);
          } else {
            alert('Text not found');
          }
        }
      }
    });
  }

  renderWatermarkTools() {
    this.toolContent.innerHTML = `
      <div class="tool-section">
        <h3>Watermark</h3>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Add text or image watermarks
        </p>
        
        <div class="tool-control">
          <label>Watermark Type</label>
          <select class="input" disabled>
            <option>Text</option>
            <option>Image</option>
            <option>Logo</option>
          </select>
        </div>

        <div class="tool-control">
          <label>Text</label>
          <input type="text" class="input" placeholder="Enter watermark text" disabled>
        </div>

        <div class="tool-control">
          <label>Position</label>
          <select class="input" disabled>
            <option>Center</option>
            <option>Top Left</option>
            <option>Top Right</option>
            <option>Bottom Left</option>
            <option>Bottom Right</option>
          </select>
        </div>

        <div class="tool-control">
          <label>Opacity</label>
          <div class="tool-control-row">
            <input type="range" class="slider" min="0" max="100" value="50" disabled>
            <span class="tool-value">50%</span>
          </div>
        </div>

        <button class="btn btn-primary" style="width: 100%;" disabled>Add Watermark</button>
        
        <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 1rem;">
          Watermark engine coming soon
        </p>
      </div>
    `;
  }

}

export { ToolManager };
