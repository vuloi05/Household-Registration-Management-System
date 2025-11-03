/**
 * Helper functions for chatbot
 */

/**
 * Basic, safe Markdown renderer for small subset: bold, italics, line breaks
 * Escapes HTML first to avoid XSS and then applies simple Markdown replacements
 */
export const renderMarkdown = (rawText: string): string => {
  const escapeHtml = (unsafe: string) =>
    unsafe
      .replaceAll(/&/g, '&amp;')
      .replaceAll(/</g, '&lt;')
      .replaceAll(/>/g, '&gt;');

  let html = escapeHtml(rawText);
  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* (after bold to avoid conflicts)
  html = html.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, (_m, p1, p2) => `${p1}<em>${p2}</em>`);
  // Line breaks
  html = html.replace(/\n/g, '<br />');
  return html;
};

/**
 * Typewriter effect append
 */
export function appendTextByStep(
  setter: (t: string) => void,
  text: string,
  ms = 15,
  callback?: () => void
) {
  let i = 0;
  function step() {
    if (i <= text.length) {
      setter(text.slice(0, i));
      i++;
      setTimeout(step, ms);
    } else if (callback) {
      callback();
    }
  }
  step();
}

