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

// Initialize
window.addEventListener('DOMContentLoaded', init);

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
    }
  });
  
  // Window resize
  window.addEventListener('resize', () => {
    if (canvasEngine) {
      canvasEngine.render();
    }
  });
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
    
    // Load image
    await canvasEngine.loadImage(file.file);
    
  } catch (error) {
    console.error('Error loading file:', error);
    alert(`Error loading file: ${error.message}`);
  }
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
