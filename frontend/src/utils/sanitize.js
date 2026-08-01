/**
 * Robust client-side HTML sanitizer using DOMParser.
 * Specifically configured with a safe allowlist for rich text and basic formatting.
 * Blocks all event handlers (on*), scripts, malicious iframes, and javascript: links.
 */
export function sanitizeHtml(html, options = {}) {
  if (!html) return '';
  if (typeof window === 'undefined') return html; // Fallback during SSR

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Dynamic PDF links inside any table to premium dual buttons transformation
    const tables = doc.querySelectorAll('table');
    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr, tr');
      rows.forEach(row => {
        const tds = row.querySelectorAll('td');
        tds.forEach((td) => {
          const anchor = td.querySelector('a');
          if (anchor && !td.querySelector('.syllabus-actions-wrapper')) {
            let fileUrl = (anchor.getAttribute('href') || '').replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');
            const lowerUrl = fileUrl.toLowerCase();
            const isPdf = lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf?') || lowerUrl.includes('/pdf');
            if (isPdf) {
              // Extract a descriptive title from this row for the download filename and tooltips
              let itemTitle = '';
              if (tds[1]) itemTitle = tds[1].textContent.trim();
              if (!itemTitle && tds[0]) itemTitle = tds[0].textContent.trim();
              if (!itemTitle || itemTitle.length < 2 || /^\d+$/.test(itemTitle)) {
                itemTitle = anchor.textContent.trim();
              }
              if (!itemTitle || itemTitle === 'View' || itemTitle === 'Download' || itemTitle.toLowerCase().includes('attachment')) {
                itemTitle = 'Attachment';
              }
              
              const safeTitle = itemTitle.replace(/[^a-zA-Z0-9]/g, '_');
              
              // Set the cell content to the premium dual actions wrapper
              const wrapperHtml = `
                <span class="syllabus-actions-wrapper" style="display: inline-flex !important; gap: 10px !important; align-items: center !important; vertical-align: middle !important; padding: 4px 0 !important;">
                  <a href="${fileUrl}" target="_blank" class="syllabus-action-btn view" title="View ${itemTitle}" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 36px !important; height: 36px !important; border-radius: 8px !important; background-color: #ecfdf5 !important; color: #059669 !important; border: 1.5px solid #a7f3d0 !important; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; cursor: pointer !important; text-decoration: none !important; padding: 0 !important;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px !important; height: 18px !important; stroke-width: 2.5 !important; transition: transform 0.2s ease !important;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </a>
                  <a href="${fileUrl}" download="${safeTitle}.pdf" class="syllabus-action-btn download" title="Download ${itemTitle}" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 36px !important; height: 36px !important; border-radius: 8px !important; background-color: #eff6ff !important; color: #1d4ed8 !important; border: 1.5px solid #bfdbfe !important; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; cursor: pointer !important; text-decoration: none !important; padding: 0 !important;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px !important; height: 18px !important; stroke-width: 2.5 !important; transition: transform 0.2s ease !important;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </a>
                </span>
              `.trim();
              
              const temp = doc.createElement('div');
              temp.innerHTML = wrapperHtml;
              const wrapperNode = temp.firstChild;
              if (anchor.parentNode) {
                anchor.parentNode.replaceChild(wrapperNode, anchor);
              }
            }
          }
        });
      });
    });

    // Dynamic standalone PDF buttons/links to 1-row table transformation
    const allLinks = doc.querySelectorAll('a');
    allLinks.forEach(anchor => {
      // Check if it's a PDF link and NOT inside a table
      if (!anchor.closest('table')) {
        const fileUrl = anchor.getAttribute('href') || '';
        const lowerUrl = fileUrl.toLowerCase();
        const isPdf = lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf?') || lowerUrl.includes('/pdf');
        if (isPdf) {
          // Get the label text of the button
          let buttonText = anchor.textContent.trim();
          
          // Remove any inline SVGs or extra spaces in the label text
          buttonText = buttonText.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
          if (!buttonText || buttonText === 'View' || buttonText === 'Download' || buttonText.toLowerCase().includes('attachment')) {
            buttonText = 'ATTACHMENT FILE';
          }
          
          const safeTitle = buttonText.replace(/[^a-zA-Z0-9]/g, '_');
          
          // Create a beautiful 1-row table matching the university style
          const tableHtml = `
            <table style="width: 100% !important; border-collapse: collapse !important; margin: 15px 0 !important; font-family: Arial, sans-serif !important; border: 1px solid #dee2e6 !important; box-shadow: 0 4px 10px rgba(0,0,0,0.03) !important;">
              <tbody>
                <tr style="background-color: #ffffff !important; border-bottom: 1px solid #dee2e6 !important;">
                  <td style="padding: 15px 12px !important; text-align: left !important; color: #444 !important; font-size: 13.5px !important; font-weight: bold !important; line-height: 1.6 !important; vertical-align: middle !important;">
                    📄 ${buttonText.toUpperCase()}
                  </td>
                  <td style="padding: 15px 12px !important; text-align: right !important; width: 110px !important; vertical-align: middle !important;">
                    <span class="syllabus-actions-wrapper" style="display: inline-flex !important; gap: 10px !important; align-items: center !important; justify-content: flex-end !important; vertical-align: middle !important;">
                      <a href="${fileUrl}" target="_blank" class="syllabus-action-btn view" title="View ${buttonText}" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 36px !important; height: 36px !important; border-radius: 8px !important; background-color: #ecfdf5 !important; color: #059669 !important; border: 1.5px solid #a7f3d0 !important; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; cursor: pointer !important; text-decoration: none !important; padding: 0 !important;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px !important; height: 18px !important; stroke-width: 2.5 !important; transition: transform 0.2s ease !important;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </a>
                      <a href="${fileUrl}" download="${safeTitle}.pdf" class="syllabus-action-btn download" title="Download ${buttonText}" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 36px !important; height: 36px !important; border-radius: 8px !important; background-color: #eff6ff !important; color: #1d4ed8 !important; border: 1.5px solid #bfdbfe !important; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; cursor: pointer !important; text-decoration: none !important; padding: 0 !important;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px !important; height: 18px !important; stroke-width: 2.5 !important; transition: transform 0.2s ease !important;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </a>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          `.trim();
          
          const parent = anchor.parentNode;
          const temp = doc.createElement('div');
          temp.innerHTML = tableHtml;
          const tableNode = temp.firstChild;
          
          if (parent && parent.tagName.toLowerCase() === 'div' && parent.childNodes.length === 1) {
            parent.parentNode.replaceChild(tableNode, parent);
          } else if (parent) {
            parent.replaceChild(tableNode, anchor);
          }
        }
      }
    });

    // Safe tags allowlist
    const allowedTags = new Set([
      'a', 'img', 'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'span', 'div', 'strong', 'em', 'u', 's', 'b', 'i',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre',
      'svg', 'g', 'path', 'circle', 'rect', 'polygon', 'polyline', 'line'
    ]);

    // Safe attributes allowlist
    const allowedAttributes = {
      '*': ['class', 'id', 'style'],
      'a': ['href', 'target', 'rel', 'title', 'download'],
      'img': ['src', 'alt', 'width', 'height', 'title'],
      'iframe': ['src', 'width', 'height', 'title', 'frameborder', 'allow', 'allowfullscreen', 'style', 'class'],
      'svg': ['xmlns', 'viewbox', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'class'],
      'path': ['d', 'fill', 'stroke', 'stroke-width'],
      'circle': ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'],
      'rect': ['x', 'y', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'rx', 'ry'],
      'polygon': ['points', 'fill', 'stroke', 'stroke-width'],
      'polyline': ['points', 'fill', 'stroke', 'stroke-width'],
      'line': ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width']
    };

    const sanitizeElement = (el) => {
      const tagName = el.tagName.toLowerCase();

      // 1. Remove script, style, object, embed, applet elements completely
      if (tagName === 'script' || tagName === 'object' || tagName === 'embed' || tagName === 'applet' || tagName === 'style') {
        el.remove();
        return;
      }

      // 2. Validate iframe (only allow explicitly safe ones, i.e. YouTube embeds)
      if (tagName === 'iframe') {
        const src = el.getAttribute('src') || '';
        const isYoutube = src.includes('youtube.com/embed/') || src.includes('youtu.be/');
        if (!isYoutube) {
          el.remove();
          return;
        }
      }

      // 3. Remove non-allowed elements but preserve their text/children
      if (!allowedTags.has(tagName) && tagName !== 'iframe') {
        while (el.firstChild) {
          el.parentNode.insertBefore(el.firstChild, el);
        }
        el.remove();
        return;
      }

      // 4. Sanitize attributes
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const attrName = attr.name.toLowerCase();

        // Block all inline event handlers (on*)
        if (attrName.startsWith('on')) {
          el.removeAttribute(attr.name);
          continue;
        }

        const tagAllowedAttrs = allowedAttributes[tagName] || [];
        const globalAllowedAttrs = allowedAttributes['*'] || [];

        if (!tagAllowedAttrs.includes(attrName) && !globalAllowedAttrs.includes(attrName)) {
          el.removeAttribute(attr.name);
          continue;
        }

        // Deep check for URL attributes to prevent javascript: or data: XSS payloads
        if (attrName === 'href' || attrName === 'src') {
          const val = attr.value.trim().toLowerCase();
          if (val.startsWith('javascript:') || (val.startsWith('data:') && !val.startsWith('data:image/'))) {
            el.removeAttribute(attr.name);
          }
        }
      }

      // 5. Recurse through all child elements
      const childNodes = Array.from(el.childNodes);
      for (const child of childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          sanitizeElement(child);
        }
      }
    };

    // Sanitize the entire DOM tree starting from body
    const bodyChildren = Array.from(doc.body.childNodes);
    for (const child of bodyChildren) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        sanitizeElement(child);
      }
    }

    return doc.body.innerHTML;
  } catch (err) {
    console.error('HTML Sanitization failed, falling back to safe empty output:', err);
    return '';
  }
}
