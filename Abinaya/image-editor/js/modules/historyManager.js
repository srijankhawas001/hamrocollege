/**
 * History Manager Module
 * Handles undo/redo functionality and edit history
 */

class HistoryManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 50;
  }

  /**
   * Add operation to history
   */
  addOperation(operation) {
    // Remove any operations after current index
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new operation
    this.history.push({
      ...operation,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Undo last operation
   */
  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.getCurrentState();
    }
    return null;
  }

  /**
   * Redo operation
   */
  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.getCurrentState();
    }
    return null;
  }

  /**
   * Check if undo is available
   */
  canUndo() {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state (all operations up to current index)
   */
  getCurrentState() {
    return this.history.slice(0, this.currentIndex + 1);
  }

  /**
   * Get all operations
   */
  getAllOperations() {
    return this.history;
  }

  /**
   * Clear history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history info
   */
  getInfo() {
    return {
      total: this.history.length,
      current: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }
}

export { HistoryManager };
