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
    this.setupScrollListener();
    this.renderTool('basic');
  }

  setupScrollListener() {
    // Toggle tool-category visibility on wheel: scroll down -> hide, scroll up -> show
    this.toolContent.addEventListener('wheel', (e) => {
      if (e.deltaY > 0) {
        this.toolCategories.classList.add('collapsed');
      } else {
        this.toolCategories.classList.remove('collapsed');
      }
    }, { passive: true });
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
      case 'adjust':
        this.renderAdjustTools();
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
        <h3>Basic Edits</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
          <button class="btn btn-secondary" id="open-crop-tool">Crop</button>
          <button class="btn btn-secondary" id="open-move-tool">Move</button>
        </div>
        <div id="basic-tool-controls"></div>
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
          <label>Quick Rotate</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
            <button class="btn btn-secondary" id="rotate-90">90°</button>
            <button class="btn btn-secondary" id="rotate-180">180°</button>
            <button class="btn btn-secondary" id="rotate-270">270°</button>
          </div>
        </div>
        <div class="tool-control">
          <label>Custom Rotate</label>
          <div class="tool-control-row">
            <input type="range" class="slider" id="rotate-slider" min="-180" max="180" value="0">
            <span class="tool-value" id="rotate-value">0°</span>
          </div>
        </div>
        <div class="tool-control">
          <label>Flip</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
            <button class="btn btn-secondary" id="flip-horizontal">↔ Horiz</button>
            <button class="btn btn-secondary" id="flip-vertical">↕ Vert</button>
          </div>
        </div>
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

  renderAdjustTools() {
    this.toolContent.innerHTML = `
      <div class="tool-section">
        <h3>Adjust</h3>

        <div class="tool-control">
          <label>Brightness</label>
          <div class="tool-control-row">
            <input type="range" class="slider" id="brightness-slider" min="-10" max="10" value="0">
            <span class="tool-value" id="brightness-value">0</span>
          </div>
        </div>

        <div class="tool-control">
          <label>Sharpness</label>
          <div class="tool-control-row">
            <input type="range" class="slider" id="sharpness-slider" min="-10" max="10" value="0">
            <span class="tool-value" id="sharpness-value">0</span>
          </div>
        </div>

        <div class="tool-control">
          <label>Enhance (B/W)</label>
          <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
            <button class="btn btn-primary" id="apply-enhance">Apply Enhance</button>
          </div>
        </div>

        <button class="btn btn-secondary" style="width: 100%;" id="reset-adjustments">Reset All</button>
      </div>
    `;

    this.setupAdjustListeners();
  }

  setupEnhanceToolListeners() {
    // deprecated: use setupAdjustListeners()
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
        <h3>Full Watermark Tool</h3>
        
        <div class="tool-control">
          <label>Watermark Type</label>
          <div class="flex gap-sm">
            <button class="btn btn-secondary flex-1" id="wm-type-text">Text</button>
            <button class="btn btn-secondary flex-1" id="wm-type-image">Image</button>
          </div>
        </div>

        <div id="wm-controls">
          <div id="wm-text-input-group">
            <div class="tool-control">
              <label>Text Content</label>
              <input type="text" class="input" id="wm-text" placeholder="Enter text...">
            </div>
          </div>
          
          <div id="wm-image-input-group" style="display: none;">
            <div class="tool-control">
              <label>Select Image</label>
              <input type="file" class="input" id="wm-image-file" accept="image/*">
            </div>
          </div>

          <div class="tool-control">
            <label>Position X</label>
            <div class="tool-control-row">
              <input type="range" class="slider" id="wm-x" min="0" max="1000" value="50">
              <span class="tool-value" id="wm-x-val">50</span>
            </div>
          </div>
          <div class="tool-control">
            <label>Position Y</label>
            <div class="tool-control-row">
              <input type="range" class="slider" id="wm-y" min="0" max="1000" value="50">
              <span class="tool-value" id="wm-y-val">50</span>
            </div>
          </div>
          <div class="tool-control">
            <label>Size</label>
            <div class="tool-control-row">
              <input type="range" class="slider" id="wm-size" min="10" max="200" value="40">
              <span class="tool-value" id="wm-size-val">40</span>
            </div>
          </div>
          <div class="tool-control">
            <label>Opacity</label>
            <div class="tool-control-row">
              <input type="range" class="slider" id="wm-opacity" min="0" max="100" value="100">
              <span class="tool-value" id="wm-opacity-val">100</span>
            </div>
          </div>
          <div class="tool-control">
            <label>Color</label>
            <input type="color" class="input" id="wm-color" value="#ffffff">
          </div>
          <button class="btn btn-primary w-full" id="apply-watermark">Apply Watermark</button>
        </div>
      </div>
    `;

    this.setupWatermarkListeners();
  }

  setupSlider(sliderId, valueId, operationType, defaultValue = 0, step = 1) {
    const slider = document.getElementById(sliderId);
    const valueText = document.getElementById(valueId);
    if (!slider || !valueText) return;

    const updateValue = (val) => {
      const numVal = parseFloat(val);
      valueText.textContent = step < 1 ? numVal.toFixed(1) : Math.round(numVal);
      if (numVal !== defaultValue) {
        slider.classList.add('active');
      } else {
        slider.classList.remove('active');
      }
    };

    slider.addEventListener('input', () => updateValue(slider.value));
    
    slider.addEventListener('change', () => {
      if (operationType === 'brightness' || operationType === 'sharpness') {
        this.applyAdjustment(operationType, parseFloat(slider.value));
      } else if (operationType === 'rotate') {
        window.applyEdit({ type: 'rotate', angle: parseFloat(slider.value) });
      } else {
        window.applyEdit({ type: operationType, value: parseFloat(slider.value) });
      }
    });

    slider.addEventListener('dblclick', () => {
      slider.value = defaultValue;
      updateValue(defaultValue);
      if (operationType === 'brightness' || operationType === 'sharpness') {
        this.applyAdjustment(operationType, defaultValue);
      } else if (operationType === 'rotate') {
        window.applyEdit({ type: 'rotate', angle: defaultValue });
      } else {
        window.applyEdit({ type: operationType, value: defaultValue });
      }
    });
  }

  setupBasicToolListeners() {
    // Resize, Rotate, Flip as before...
    this.setupSlider('rotate-slider', 'rotate-value', 'rotate', 0);
    
    document.getElementById('rotate-90').addEventListener('click', () => window.applyEdit({ type: 'rotate', angle: 90 }));
    document.getElementById('rotate-180').addEventListener('click', () => window.applyEdit({ type: 'rotate', angle: 180 }));
    document.getElementById('rotate-270').addEventListener('click', () => window.applyEdit({ type: 'rotate', angle: 270 }));
    
    document.getElementById('apply-resize').addEventListener('click', () => {
      const w = parseInt(document.getElementById('resize-width').value);
      const h = parseInt(document.getElementById('resize-height').value);
      window.applyEdit({ type: 'resize', params: { width: w, height: h } });
    });

    document.getElementById('flip-horizontal').addEventListener('click', () => window.applyEdit({ type: 'flip', direction: 'horizontal' }));
    document.getElementById('flip-vertical').addEventListener('click', () => window.applyEdit({ type: 'flip', direction: 'vertical' }));
    
    // Crop/Move triggers
    document.getElementById('open-crop-tool').addEventListener('click', () => {
      const controls = document.getElementById('basic-tool-controls');
      controls.innerHTML = `
        <div class="tool-control">
          <label>Crop X</label><input type="number" class="input" id="crop-x" value="0">
        </div>
        <div class="tool-control">
          <label>Crop Y</label><input type="number" class="input" id="crop-y" value="0">
        </div>
        <div class="tool-control">
          <label>Crop Width</label><input type="number" class="input" id="crop-w" value="300">
        </div>
        <div class="tool-control">
          <label>Crop Height</label><input type="number" class="input" id="crop-h" value="300">
        </div>
        <button class="btn btn-primary w-full" id="apply-crop">Apply Crop</button>
      `;
      document.getElementById('apply-crop').addEventListener('click', () => {
        window.applyEdit({
          type: 'crop',
          params: {
            x: parseInt(document.getElementById('crop-x').value),
            y: parseInt(document.getElementById('crop-y').value),
            width: parseInt(document.getElementById('crop-w').value),
            height: parseInt(document.getElementById('crop-h').value)
          }
        });
      });
    });

    document.getElementById('open-move-tool').addEventListener('click', () => {
      const controls = document.getElementById('basic-tool-controls');
      controls.innerHTML = `
        <div class="tool-control">
          <label>Move X</label><div class="tool-control-row">
            <input type="range" class="slider" id="move-x" min="-500" max="500" value="0">
            <span class="tool-value" id="move-x-val">0</span>
          </div>
        </div>
        <div class="tool-control">
          <label>Move Y</label><div class="tool-control-row">
            <input type="range" class="slider" id="move-y" min="-500" max="500" value="0">
            <span class="tool-value" id="move-y-val">0</span>
          </div>
        </div>
      `;
      this.setupSlider('move-x', 'move-x-val', 'translate', 0);
      this.setupSlider('move-y', 'move-y-val', 'translate', 0);
    });
  }

  // kept for backward compat if called elsewhere; prefer setupAdjustListeners
  setupEnhanceToolListeners() {
  }

  // Centralized adjustment applier
  applyAdjustment(type, rawValue) {
    // Map UI range (-10..10) to engine-friendly values where needed
    let value = rawValue;
    if (type === 'brightness') {
      value = Number(rawValue) * 10; // scale to -100..100 for engine
      window.applyEdit({ type: 'brightness', value });
    } else if (type === 'sharpness') {
      value = Number(rawValue) * 10; // map -10..10 -> -100..100
      window.applyEdit({ type: 'sharpness', value });
    } else {
      // fallback for other slider-driven operations
      window.applyEdit({ type, value: Number(rawValue) });
    }
  }

  setupAdjustListeners() {
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessValue = document.getElementById('brightness-value');
    const sharpnessSlider = document.getElementById('sharpness-slider');
    const sharpnessValue = document.getElementById('sharpness-value');

    const updateText = (el, val) => { el.textContent = val; };

    if (brightnessSlider && brightnessValue) {
      brightnessSlider.addEventListener('input', () => updateText(brightnessValue, brightnessSlider.value));
      brightnessSlider.addEventListener('change', () => this.applyAdjustment('brightness', brightnessSlider.value));
      brightnessSlider.addEventListener('dblclick', () => { brightnessSlider.value = 0; updateText(brightnessValue, 0); this.applyAdjustment('brightness', 0); });
    }

    if (sharpnessSlider && sharpnessValue) {
      sharpnessSlider.addEventListener('input', () => updateText(sharpnessValue, sharpnessSlider.value));
      sharpnessSlider.addEventListener('change', () => this.applyAdjustment('sharpness', sharpnessSlider.value));
      sharpnessSlider.addEventListener('dblclick', () => { sharpnessSlider.value = 0; updateText(sharpnessValue, 0); this.applyAdjustment('sharpness', 0); });
    }

    const enhanceBtn = document.getElementById('apply-enhance');
    if (enhanceBtn) {
      enhanceBtn.addEventListener('click', () => {
        window.applyEdit({ type: 'enhance' });
      });
    }

    const resetBtn = document.getElementById('reset-adjustments');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (brightnessSlider) { brightnessSlider.value = 0; brightnessSlider.dispatchEvent(new Event('change', { bubbles: true })); }
        if (sharpnessSlider) { sharpnessSlider.value = 0; sharpnessSlider.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }
  }

  setupWatermarkListeners() {
    let wmType = 'text';
    let wmImageData = null;
    
    const textGroup = document.getElementById('wm-text-input-group');
    const imageGroup = document.getElementById('wm-image-input-group');
    const imageInput = document.getElementById('wm-image-file');

    document.getElementById('wm-type-text').addEventListener('click', () => {
      wmType = 'text';
      textGroup.style.display = 'block';
      imageGroup.style.display = 'none';
    });
    
    document.getElementById('wm-type-image').addEventListener('click', () => {
      wmType = 'image';
      textGroup.style.display = 'none';
      imageGroup.style.display = 'block';
    });

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          wmImageData = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    this.setupSlider('wm-x', 'wm-x-val', 'watermark_preview', 50);
    this.setupSlider('wm-y', 'wm-y-val', 'watermark_preview', 50);
    this.setupSlider('wm-size', 'wm-size-val', 'watermark_preview', 40);
    this.setupSlider('wm-opacity', 'wm-opacity-val', 'watermark_preview', 100);

    document.getElementById('apply-watermark').addEventListener('click', () => {
      const content = wmType === 'text' ? document.getElementById('wm-text').value : wmImageData;
      if (!content) {
        alert(wmType === 'text' ? 'Please enter text' : 'Please select an image');
        return;
      }
      
      // Calculate actual positions based on image size if possible
      // For now, we use simple pixel values from sliders
      window.applyEdit({
        type: 'watermark',
        params: {
          type: wmType,
          content: content,
          x: parseInt(document.getElementById('wm-x').value),
          y: parseInt(document.getElementById('wm-y').value),
          size: parseInt(document.getElementById('wm-size').value),
          opacity: parseInt(document.getElementById('wm-opacity').value),
          color: document.getElementById('wm-color').value
        }
      });
    });
  }

}

export { ToolManager };
