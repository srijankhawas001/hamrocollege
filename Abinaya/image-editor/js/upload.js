/**
 * Upload Page Script
 * Handles file upload and navigation to editor
 */

import { fileManager } from './modules/fileManager.js';

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const uploadProgress = document.getElementById('upload-progress');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');

// Event Listeners
browseBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', handleFileSelect);

// Drag and drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  
  const files = Array.from(e.dataTransfer.files);
  handleFiles(files);
});

// Click on drop zone to browse
dropZone.addEventListener('click', (e) => {
  if (e.target !== browseBtn) {
    fileInput.click();
  }
});

/**
 * Handle file selection
 */
function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  handleFiles(files);
}

/**
 * Handle files
 */
async function handleFiles(files) {
  if (files.length === 0) return;
  
  try {
    // Show progress
    uploadProgress.classList.remove('hidden');
    progressFill.style.width = '30%';
    progressText.textContent = `Processing ${files.length} file(s)...`;
    
    // Add files to manager
    await fileManager.addFiles(files);
    
    // Complete progress
    progressFill.style.width = '100%';
    progressText.textContent = 'Upload complete! Redirecting...';
    
    // Redirect to editor
    setTimeout(() => {
      window.location.href = 'editor.html';
    }, 500);
    
  } catch (error) {
    console.error('Error uploading files:', error);
    alert(`Error: ${error.message}`);
    uploadProgress.classList.add('hidden');
    progressFill.style.width = '0%';
  }
}

// Check if files already exist in session
window.addEventListener('DOMContentLoaded', () => {
  const existingFiles = fileManager.getAllFiles();
  if (existingFiles.length > 0) {
    // Redirect to editor if files exist
    window.location.href = 'editor.html';
  }
});
