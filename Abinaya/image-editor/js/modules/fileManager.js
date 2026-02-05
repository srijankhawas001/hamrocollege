/**
 * File Manager Module
 * Handles file uploads, validation, storage, and management
 */

class FileManager {
  constructor() {
    this.files = [];
    this.activeFileId = null;
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.supportedFormats = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      pdf: ['application/pdf']
    };
    
    // Load files from sessionStorage on init
    this.loadFromSession();
  }

  /**
   * Validate file type and size
   */
  validateFile(file) {
    const allFormats = [...this.supportedFormats.image, ...this.supportedFormats.pdf];
    
    if (!allFormats.includes(file.type)) {
      throw new Error(`Unsupported file format: ${file.type}`);
    }
    
    if (file.size > this.maxFileSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 50MB)`);
    }
    
    return true;
  }

  /**
   * Add files to the manager
   */
  async addFiles(fileList) {
    const newFiles = [];
    
    for (const file of fileList) {
      try {
        this.validateFile(file);
        
        // Read file as data URL for storage
        const dataURL = await this.readFileAsDataURL(file);
        
        const fileData = {
          id: this.generateId(),
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          file: file,
          dataURL: dataURL, // Store data URL for persistence
          thumbnail: null,
          addedAt: Date.now()
        };
        
        // Generate thumbnail for images
        if (this.supportedFormats.image.includes(file.type)) {
          fileData.thumbnail = await this.generateThumbnail(file);
        }
        
        this.files.push(fileData);
        newFiles.push(fileData);
        
      } catch (error) {
        console.error(`Error adding file ${file.name}:`, error);
        throw error;
      }
    }
    
    // Set first file as active if none selected
    if (!this.activeFileId && this.files.length > 0) {
      this.activeFileId = this.files[0].id;
    }
    
    this.saveToSession();
    return newFiles;
  }

  /**
   * Generate thumbnail for image files
   */
  async generateThumbnail(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxSize = 100;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Remove file by ID
   */
  removeFile(fileId) {
    const index = this.files.findIndex(f => f.id === fileId);
    if (index !== -1) {
      this.files.splice(index, 1);
      
      // Update active file if removed
      if (this.activeFileId === fileId) {
        this.activeFileId = this.files.length > 0 ? this.files[0].id : null;
      }
      
      this.saveToSession();
      return true;
    }
    return false;
  }

  /**
   * Set active file
   */
  setActiveFile(fileId) {
    const file = this.files.find(f => f.id === fileId);
    if (file) {
      this.activeFileId = fileId;
      this.saveToSession();
      return file;
    }
    return null;
  }

  /**
   * Get active file
   */
  getActiveFile() {
    return this.files.find(f => f.id === this.activeFileId) || null;
  }

  /**
   * Get all files
   */
  getAllFiles() {
    return this.files;
  }

  /**
   * Clear all files
   */
  clearAll() {
    this.files = [];
    this.activeFileId = null;
    this.saveToSession();
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Save to sessionStorage
   */
  saveToSession() {
    try {
      const data = {
        files: this.files.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          lastModified: f.lastModified,
          dataURL: f.dataURL, // Save data URL
          thumbnail: f.thumbnail,
          addedAt: f.addedAt
        })),
        activeFileId: this.activeFileId
      };
      sessionStorage.setItem('imageEditor_files', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to session:', error);
    }
  }

  /**
   * Load from sessionStorage
   */
  loadFromSession() {
    try {
      const data = sessionStorage.getItem('imageEditor_files');
      if (data) {
        const parsed = JSON.parse(data);
        this.activeFileId = parsed.activeFileId;
        
        // Restore files from data URLs
        if (parsed.files && parsed.files.length > 0) {
          this.files = parsed.files.map(f => {
            // Convert data URL back to File object
            const file = this.dataURLtoFile(f.dataURL, f.name, f.type);
            return {
              ...f,
              file: file
            };
          });
        }
      }
    } catch (error) {
      console.error('Error loading from session:', error);
    }
  }

  /**
   * Read file as data URL
   */
  async readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Read file as array buffer
   */
  async readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convert data URL to File object
   */
  dataURLtoFile(dataURL, filename, mimeType) {
    // Convert base64 to binary
    const arr = dataURL.split(',');
    const mime = mimeType || arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }
}

// Export as singleton
export const fileManager = new FileManager();
