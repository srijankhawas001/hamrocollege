/**
 * Canvas Engine Module
 * Handles image rendering, zoom, pan, and non-destructive editing
 */

class CanvasEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d', { willReadFrequently: true });
    
    // Image buffers
    this.originalImage = null;
    this.workingImage = null;
    
    // Transform state
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.rotation = 0;
    
    // Pan interaction
    this.isPanning = false;
    this.lastPanX = 0;
    this.lastPanY = 0;
    
    // Edit pipeline
    this.editOperations = [];
    
    this.setupEventListeners();
  }

  /**
   * Load image from file or data URL
   */
  async loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.originalImage = img;
        this.workingImage = img;
        this.resetTransform();
        this.render();
        resolve(img);
      };
      
      img.onerror = reject;
      
      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      }
    });
  }

  /**
   * Render the canvas
   */
  render() {
    if (!this.workingImage) return;
    
    const img = this.workingImage;
    
    // Calculate canvas size
    const containerWidth = this.canvas.parentElement.clientWidth;
    const containerHeight = this.canvas.parentElement.clientHeight;
    
    // Set canvas size
    this.canvas.width = containerWidth;
    this.canvas.height = containerHeight;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Calculate image dimensions to fit canvas
    let drawWidth = img.width * this.zoom;
    let drawHeight = img.height * this.zoom;
    
    // Center image
    const x = (this.canvas.width - drawWidth) / 2 + this.panX;
    const y = (this.canvas.height - drawHeight) / 2 + this.panY;
    
    // Save context state
    this.ctx.save();
    
    // Apply rotation if needed
    if (this.rotation !== 0) {
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.rotate(this.rotation * Math.PI / 180);
      this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    }
    
    // Draw image
    this.ctx.drawImage(img, x, y, drawWidth, drawHeight);
    
    // Restore context state
    this.ctx.restore();
  }

  /**
   * Zoom in
   */
  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.2, 5);
    this.render();
  }

  /**
   * Zoom out
   */
  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.2, 0.1);
    this.render();
  }

  /**
   * Fit to screen
   */
  fitToScreen() {
    if (!this.workingImage) return;
    
    const img = this.workingImage;
    const containerWidth = this.canvas.parentElement.clientWidth - 40;
    const containerHeight = this.canvas.parentElement.clientHeight - 40;
    
    const scaleX = containerWidth / img.width;
    const scaleY = containerHeight / img.height;
    
    this.zoom = Math.min(scaleX, scaleY);
    this.panX = 0;
    this.panY = 0;
    this.render();
  }

  /**
   * Reset transform
   */
  resetTransform() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.rotation = 0;
    this.fitToScreen();
  }

  /**
   * Apply edit operation
   */
  async applyOperation(operation) {
    if (!this.originalImage) return;
    
    this.editOperations.push(operation);
    await this.reprocessPipeline();
  }

  /**
   * Reprocess entire edit pipeline
   */
  async reprocessPipeline() {
    if (!this.originalImage) return;
    
    // Start with original image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = this.originalImage.width;
    canvas.height = this.originalImage.height;
    ctx.drawImage(this.originalImage, 0, 0);
    
    // Apply each operation in sequence
    for (const operation of this.editOperations) {
      await this.executeOperation(canvas, ctx, operation);
    }
    
    // Create new image from processed canvas
    const processedImage = new Image();
    await new Promise((resolve) => {
      processedImage.onload = resolve;
      processedImage.src = canvas.toDataURL();
    });
    
    this.workingImage = processedImage;
    this.render();
  }

  /**
   * Execute single operation
   */
  async executeOperation(canvas, ctx, operation) {
    switch (operation.type) {
      case 'brightness':
        this.applyBrightness(ctx, canvas.width, canvas.height, operation.value);
        break;
      case 'contrast':
        this.applyContrast(ctx, canvas.width, canvas.height, operation.value);
        break;
      case 'saturation':
        this.applySaturation(ctx, canvas.width, canvas.height, operation.value);
        break;
      case 'crop':
        this.applyCrop(canvas, ctx, operation.params);
        break;
      case 'resize':
        this.applyResize(canvas, ctx, operation.params);
        break;
      case 'rotate':
        this.applyRotate(canvas, ctx, operation.angle);
        break;
      case 'flip':
        this.applyFlip(canvas, ctx, operation.direction);
        break;
      default:
        console.warn('Unknown operation:', operation.type);
    }
  }

  /**
   * Apply brightness adjustment
   */
  applyBrightness(ctx, width, height, value) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] += value;     // R
      data[i + 1] += value; // G
      data[i + 2] += value; // B
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply contrast adjustment
   */
  applyContrast(ctx, width, height, value) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128;         // R
      data[i + 1] = factor * (data[i + 1] - 128) + 128; // G
      data[i + 2] = factor * (data[i + 2] - 128) + 128; // B
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply saturation adjustment
   */
  applySaturation(ctx, width, height, value) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
      data[i] = gray + value * (data[i] - gray);
      data[i + 1] = gray + value * (data[i + 1] - gray);
      data[i + 2] = gray + value * (data[i + 2] - gray);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply crop
   */
  applyCrop(canvas, ctx, params) {
    const { x, y, width, height } = params;
    const imageData = ctx.getImageData(x, y, width, height);
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply resize
   */
  applyResize(canvas, ctx, params) {
    const { width, height } = params;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(tempCanvas, 0, 0, width, height);
  }

  /**
   * Apply rotation
   */
  applyRotate(canvas, ctx, angle) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    
    const radians = angle * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    canvas.width = Math.abs(tempCanvas.width * cos) + Math.abs(tempCanvas.height * sin);
    canvas.height = Math.abs(tempCanvas.width * sin) + Math.abs(tempCanvas.height * cos);
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Apply flip
   */
  applyFlip(canvas, ctx, direction) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (direction === 'horizontal') {
      ctx.scale(-1, 1);
      ctx.drawImage(tempCanvas, -canvas.width, 0);
    } else {
      ctx.scale(1, -1);
      ctx.drawImage(tempCanvas, 0, -canvas.height);
    }
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Get current image as data URL
   */
  getImageDataURL(format = 'image/png', quality = 1.0) {
    if (!this.workingImage) return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = this.workingImage.width;
    canvas.height = this.workingImage.height;
    ctx.drawImage(this.workingImage, 0, 0);
    
    return canvas.toDataURL(format, quality);
  }

  /**
   * Clear canvas
   */
  clear() {
    this.originalImage = null;
    this.workingImage = null;
    this.editOperations = [];
    this.resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Setup event listeners for pan
   */
  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.isPanning = true;
        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        const deltaX = e.clientX - this.lastPanX;
        const deltaY = e.clientY - this.lastPanY;
        
        this.panX += deltaX;
        this.panY += deltaY;
        
        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;
        
        this.render();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isPanning = false;
      this.canvas.style.cursor = 'grab';
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isPanning = false;
      this.canvas.style.cursor = 'default';
    });

    // Zoom with mouse wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    });
  }
}

export { CanvasEngine };
