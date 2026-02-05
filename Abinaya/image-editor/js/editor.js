/**
 * Editor Page Main Script
 * Orchestrates the editor functionality
 */

import { fileManager } from './modules/fileManager.js';
import { CanvasEngine } from './modules/canvasEngine.js';
import { HistoryManager } from './modules/historyManager.js';
import { ThemeManager } from './modules/themeManager.js';
import { ToolManager } from './components/toolManager.js';

// Initialize managers
const themeManager = new ThemeManager();
const historyManager = new HistoryManager();
let canvasEngine = null;
let toolManager = null;

// State
let showingBefore = false;

// DOM Elements
const canvas = document.getElementById('main-canvas');
const emptyState = document.getElementById('empty-state');
const fileList = document.getElementById('file-list');
const uploadMoreBtn = document.getElementById('upload-more-btn');
const fileInputEditor = document.getElementById('file-input-editor');
const userBtn = document.getElementById('user-btn');
const userDropdown = document.getElementById('user-dropdown');

// Canvas controls
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const fitScreenBtn = document.getElementById('fit-screen-btn');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const beforeAfterBtn = document.getElementById('before-after-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Export controls
const exportFormat = document.getElementById('export-format');
const exportQuality = document.getElementById('export-quality');
const qualityControl = document.getElementById('quality-control');
const qualityValue = document.getElementById('quality-value');
const downloadBtn = document.getElementById('download-btn');

// Initialize
window.addEventListener('DOMContentLoaded', init);

// PDF State
let pdfDoc = null;
let currentPdfPage = 1;
const pdfNavLeft = document.getElementById('pdf-nav-left');
const pdfNavRight = document.getElementById('pdf-nav-right');
const pdfSliderLeft = document.getElementById('pdf-page-slider-left');
const pdfSliderRight = document.getElementById('pdf-page-slider-right');


async function init() {
  // Initialize canvas engine
  canvasEngine = new CanvasEngine(canvas);
  
  // Initialize tool manager
  toolManager = new ToolManager(canvasEngine, historyManager);
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup theme toggle
  setupThemeToggle();
  
  // Render file list
  renderFileList();
  
  // Load active file or show empty state
  const activeFile = fileManager.getActiveFile();
  if (activeFile) {
    await loadFileIntoCanvas(activeFile);
  } else {
    // Show empty state if no files
    showEmptyState();
  }
  
  // Update history buttons
  updateHistoryButtons();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Upload more files
  uploadMoreBtn.addEventListener('click', () => {
    fileInputEditor.click();
  });
  
  fileInputEditor.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      try {
        await fileManager.addFiles(files);
        renderFileList();
        e.target.value = ''; // Reset input
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  });
  
  // User account dropdown
  userBtn.addEventListener('click', () => {
    userDropdown.classList.toggle('hidden');
  });
  
  document.addEventListener('click', (e) => {
    if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.add('hidden');
    }
  });
  
  // Canvas controls
  zoomInBtn.addEventListener('click', () => {
    canvasEngine.zoomIn();
  });
  
  zoomOutBtn.addEventListener('click', () => {
    canvasEngine.zoomOut();
  });
  
  fitScreenBtn.addEventListener('click', () => {
    canvasEngine.fitToScreen();
  });
  
  undoBtn.addEventListener('click', handleUndo);
  redoBtn.addEventListener('click', handleRedo);
  beforeAfterBtn.addEventListener('click', toggleBeforeAfter);
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  
  // Export controls
  exportFormat.addEventListener('change', () => {
    const format = exportFormat.value;
    if (format === 'image/png') {
      qualityControl.style.display = 'none';
    } else {
      qualityControl.style.display = 'block';
    }
  });
  
  exportQuality.addEventListener('input', () => {
    qualityValue.textContent = exportQuality.value + '%';
  });
  
  downloadBtn.addEventListener('click', handleDownload);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'z' && e.shiftKey || e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    } else if (e.key === 'Escape') {
      // Close fullscreen on ESC
      const fullscreenOverlay = document.querySelector('.fullscreen-overlay');
      if (fullscreenOverlay && !fullscreenOverlay.classList.contains('hidden')) {
        fullscreenOverlay.classList.add('hidden');
      }
    }
  });
  
  // Window resize
  window.addEventListener('resize', () => {
    if (canvasEngine) {
      canvasEngine.render();
    }
  });

  // PDF Page Sliders
  const handlePdfPageChange = async (e) => {
    const pageNum = parseInt(e.target.value);
    if (pdfDoc && pageNum !== currentPdfPage) {
      currentPdfPage = pageNum;
      pdfSliderLeft.value = pageNum;
      pdfSliderRight.value = pageNum;
      await renderPdfPage(pageNum);
    }
  };

  pdfSliderLeft.addEventListener('input', handlePdfPageChange);
  pdfSliderRight.addEventListener('input', handlePdfPageChange);
}

/**
 * Setup theme toggle
 */
function setupThemeToggle() {
  const themeBtns = document.querySelectorAll('.theme-btn');
  const currentTheme = themeManager.getCurrentTheme();
  
  themeBtns.forEach(btn => {
    if (btn.dataset.theme === currentTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      themeManager.setTheme(theme);
      
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/**
 * Render file list
 */
/**
 * Setup file list scroll behavior
 */
function setupFileListScroll() {
  const exportSection = document.getElementById('export-section');
  if (!fileList || !exportSection) return;

  fileList.addEventListener('scroll', () => {
    const fileItems = fileList.querySelectorAll('.file-item');
    const exportRect = exportSection.getBoundingClientRect();
    const fileListRect = fileList.getBoundingClientRect();
    
    // Calculate the scroll threshold (export section top position relative to file-list)
    const exportTopInList = exportRect.top - fileListRect.top + fileList.scrollTop;
    
    fileItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const itemTopInList = itemRect.top - fileListRect.top + fileList.scrollTop;
      const itemBottomInList = itemTopInList + item.offsetHeight;
      
      // If item is below the threshold, make it faded
      if (itemTopInList >= exportTopInList - item.offsetHeight) {
        const fade = Math.min(1, Math.max(0, (itemBottomInList - exportTopInList) / item.offsetHeight));
        item.style.opacity = 0.3 + (fade * 0.7); // Range from 0.3 to 1.0
      } else {
        item.style.opacity = '1';
      }
    });
  });
}

function renderFileList() {
  const files = fileManager.getAllFiles();
  const activeFile = fileManager.getActiveFile();
  
  fileList.innerHTML = '';
  
  files.forEach(file => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    if (activeFile && file.id === activeFile.id) {
      fileItem.classList.add('active');
    }
    
    const thumbnail = document.createElement('img');
    thumbnail.className = 'file-thumbnail';
    thumbnail.src = file.thumbnail || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>';
    thumbnail.alt = file.name;
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = file.name;
    fileName.title = file.name;
    
    const fileSize = document.createElement('div');
    fileSize.className = 'file-size';
    fileSize.textContent = fileManager.formatFileSize(file.size);
    
    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileSize);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove';
    removeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    removeBtn.title = 'Remove file';
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Remove ${file.name}?`)) {
        fileManager.removeFile(file.id);
        renderFileList();
        
        // Load new active file or show empty state
        const newActiveFile = fileManager.getActiveFile();
        if (newActiveFile) {
          loadFileIntoCanvas(newActiveFile);
        } else {
          canvasEngine.clear();
          showEmptyState();
        }
      }
    });
    
    fileItem.appendChild(thumbnail);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeBtn);
    
    fileItem.addEventListener('click', () => {
      fileManager.setActiveFile(file.id);
      renderFileList();
      loadFileIntoCanvas(file);
    });
    
    fileList.appendChild(fileItem);
  });
  
  // Setup scroll behavior after rendering
  setupFileListScroll();
}

/**
 * Load file into canvas
 */
async function loadFileIntoCanvas(file) {
  try {
    hideEmptyState();
    
    // Clear history for new file
    historyManager.clear();
    updateHistoryButtons();
    
    if (file.type === 'application/pdf') {
      await loadPdf(file.file);
      pdfNavLeft.style.display = 'flex';
      pdfNavRight.style.display = 'flex';
    } else {
      pdfNavLeft.style.display = 'none';
      pdfNavRight.style.display = 'none';
      pdfDoc = null;
      // Load image
      await canvasEngine.loadImage(file.file);
    }
    
  } catch (error) {
    console.error('Error loading file:', error);
    alert(`Error loading file: ${error.message}`);
  }
}

/**
 * Load PDF file
 */
async function loadPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  currentPdfPage = 1;
  const numPages = pdfDoc.numPages;
  
  pdfSliderLeft.max = numPages;
  pdfSliderLeft.min = 1;
  pdfSliderLeft.value = 1;
  
  pdfSliderRight.max = numPages;
  pdfSliderRight.min = 1;
  pdfSliderRight.value = 1;
  
  await renderPdfPage(1);
}

/**
 * Render specific PDF page to canvas
 */
async function renderPdfPage(pageNum) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2.0 }); // High quality
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = viewport.width;
  tempCanvas.height = viewport.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  await page.render({
    canvasContext: tempCtx,
    viewport: viewport
  }).promise;
  
  // Convert rendered page to image for CanvasEngine
  const dataURL = tempCanvas.toDataURL('image/png');
  const img = new Image();
  await new Promise(resolve => {
    img.onload = resolve;
    img.src = dataURL;
  });
  
  // Set as original image in canvas engine
  canvasEngine.originalImage = img;
  canvasEngine.workingImage = img;
  canvasEngine.editOperations = [];
  canvasEngine.render();
}


/**
 * Show empty state
 */
function showEmptyState() {
  emptyState.classList.remove('hidden');
  canvas.classList.add('hidden');
}

/**
 * Hide empty state
 */
function hideEmptyState() {
  emptyState.classList.add('hidden');
  canvas.classList.remove('hidden');
}

/**
 * Handle undo
 */
function handleUndo() {
  if (historyManager.canUndo()) {
    const operations = historyManager.undo();
    canvasEngine.editOperations = operations || [];
    canvasEngine.reprocessPipeline();
    updateHistoryButtons();
  }
}

/**
 * Handle redo
 */
function handleRedo() {
  if (historyManager.canRedo()) {
    const operations = historyManager.redo();
    canvasEngine.editOperations = operations || [];
    canvasEngine.reprocessPipeline();
    updateHistoryButtons();
  }
}

/**
 * Update history buttons
 */
function updateHistoryButtons() {
  undoBtn.disabled = !historyManager.canUndo();
  redoBtn.disabled = !historyManager.canRedo();
}

/**
 * Toggle before/after view
 */
function toggleBeforeAfter() {
  if (!canvasEngine.originalImage) return;
  
  showingBefore = !showingBefore;
  
  if (showingBefore) {
    // Show original
    const temp = canvasEngine.workingImage;
    canvasEngine.workingImage = canvasEngine.originalImage;
    canvasEngine.render();
    canvasEngine.workingImage = temp;
    beforeAfterBtn.style.background = 'var(--accent-primary)';
    beforeAfterBtn.style.color = 'white';
  } else {
    // Show edited
    canvasEngine.render();
    beforeAfterBtn.style.background = '';
    beforeAfterBtn.style.color = '';
  }
}

/**
 * Toggle fullscreen view
 */
function toggleFullscreen() {
  if (!canvasEngine || !canvasEngine.workingImage) {
    alert('No image to view in fullscreen');
    return;
  }
  
  // Create fullscreen overlay if it doesn't exist
  let overlay = document.querySelector('.fullscreen-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay hidden';
    
    const img = document.createElement('img');
    overlay.appendChild(img);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'fullscreen-close';
    closeBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.classList.add('hidden');
    });
    
    overlay.appendChild(closeBtn);
    overlay.addEventListener('click', () => {
      overlay.classList.add('hidden');
    });
    
    document.body.appendChild(overlay);
  }
  
  // Update image and show
  const img = overlay.querySelector('img');
  img.src = canvasEngine.getImageDataURL();
  overlay.classList.remove('hidden');
}

/**
 * Handle download
 */
function handleDownload() {
  if (!canvasEngine || !canvasEngine.workingImage) {
    alert('No image to download');
    return;
  }
  
  const format = exportFormat.value;
  const quality = parseInt(exportQuality.value) / 100;
  
  const dataURL = canvasEngine.getImageDataURL(format, quality);
  
  // Create download link
  const link = document.createElement('a');
  const activeFile = fileManager.getActiveFile();
  const fileName = activeFile ? activeFile.name.replace(/\.[^/.]+$/, '') : 'edited-image';
  const extension = format.split('/')[1];
  
  link.download = `${fileName}-edited.${extension}`;
  link.href = dataURL;
  link.click();
}

/**
 * Apply edit operation (called by tools)
 */
window.applyEdit = async function(operation) {
  await canvasEngine.applyOperation(operation);
  historyManager.addOperation(operation);
  updateHistoryButtons();
  
  // Reset before/after if showing before
  if (showingBefore) {
    showingBefore = false;
    beforeAfterBtn.style.background = '';
    beforeAfterBtn.style.color = '';
  }
};

// Export for tools
window.canvasEngine = canvasEngine;
window.historyManager = historyManager;
window.fileManager = fileManager;
