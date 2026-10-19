'use client';

import { useEffect } from 'react';

/**
 * Global component that disables right-click context menu and text selection
 * across the entire website, while keeping input fields and textareas interactive.
 */
export default function DisableRightClickAndSelect() {
  useEffect(() => {
    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Text Selection via mouse/keyboard selection
    const handleSelectStart = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea'))
      ) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // 3. Disable Dragging of images, text, and elements
    const handleDragStart = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('dragstart', handleDragStart, true);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
    };
  }, []);

  return null;
}
