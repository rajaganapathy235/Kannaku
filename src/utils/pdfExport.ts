import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Converts modern CSS color functions (like oklch, oklab, color()) to standard rgb()
 * so that html2canvas can parse them without throwing "unsupported color function" errors.
 */
function convertOklchToRgb(cssText: string): string {
  if (!cssText || (!cssText.includes('oklch') && !cssText.includes('oklab'))) {
    return cssText;
  }

  // Create a temporary element to let the browser resolve oklch to rgb
  const helper = document.createElement('div');
  helper.style.display = 'none';
  document.body.appendChild(helper);

  try {
    const result = cssText.replace(/oklch\([^)]+\)|oklab\([^)]+\)/gi, (match) => {
      try {
        helper.style.color = '#000000';
        helper.style.color = match;
        const computed = window.getComputedStyle(helper).color;
        return computed || '#1e293b';
      } catch {
        return '#1e293b';
      }
    });
    return result;
  } finally {
    if (helper.parentNode) {
      helper.parentNode.removeChild(helper);
    }
  }
}

export async function downloadInvoiceAsPdf(
  elementId: string,
  fileName: string = 'Invoice.pdf'
): Promise<boolean> {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Check if there are multiple dedicated A4 pages (.invoice-a4-page)
    const pageElements = Array.from(container.querySelectorAll<HTMLElement>('.invoice-a4-page'));
    const elementsToCapture = pageElements.length > 0 ? pageElements : [container];

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

    for (let i = 0; i < elementsToCapture.length; i++) {
      const pageEl = elementsToCapture[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2, // 2x for crisp text and barcodes/QR codes
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        onclone: (clonedDoc) => {
          // Sanitize all inline styles in style tags
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((styleTag) => {
            if (
              styleTag.textContent &&
              (styleTag.textContent.includes('oklch') || styleTag.textContent.includes('oklab'))
            ) {
              styleTag.textContent = convertOklchToRgb(styleTag.textContent);
            }
          });

          // Sanitize any elements with inline style attributes containing oklch
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((node) => {
            if (node instanceof HTMLElement) {
              const styleAttr = node.getAttribute('style');
              if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
                node.setAttribute('style', convertOklchToRgb(styleAttr));
              }
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      // If a single element exceeds 1 A4 page height (e.g. single long table), paginate cleanly
      if (imgHeight > pdfHeight + 5) {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        while (heightLeft > 5) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      }
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
}
