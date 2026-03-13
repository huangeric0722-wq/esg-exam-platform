/**
 * Anti-Cheat Utilities
 * Monitors user behavior like window switching or tab blurring.
 */

/**
 * Sets up event listeners to detect when the user leaves the current page/window.
 * @param {Function} onCheat Triggered when a cheat attempt is detected
 * @returns {Function} Cleanup function to remove listeners
 */
export const setupAntiCheatListeners = (onCheat) => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onCheat();
    }
  };

  const handleBlur = () => {
    // Only trigger if window is blurred but not hidden 
    // (e.g., tab switch within same window)
    if (!document.hidden) {
      onCheat();
    }
  };

  window.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleBlur);

  // Return cleanup function
  return () => {
    window.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleBlur);
  };
};
