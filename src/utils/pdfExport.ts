import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Detects iOS (iPhone / iPad / iPod) environments including mobile Safari
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detects mobile devices (iOS / Android)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Converts modern CSS color functions (like oklch, oklab, color()) to standard rgb()
 * so that html2canvas can parse them without throwing "unsupported color function" errors.
 */
function convertOklchToRgb(cssText: string): string {
  if (!cssText || (!cssText.includes('oklch') && !cssText.includes('oklab'))) {
    return cssText;
  }

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

/**
 * High-reliability PDF export for GST Tax Invoices and Party Ledgers.
 * Works seamlessly on iOS Safari (iPhone/iPad), Android Chrome, and Desktop browsers.
 */
export async function downloadInvoiceAsPdf(
  elementId: string,
  fileName: string = 'Document.pdf'
): Promise<boolean> {
  const originalContainer = document.getElementById(elementId);
  if (!originalContainer) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  // Create an off-screen sandbox clone unconstrained by mobile viewport scaling or CSS transforms
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-99999px';
  sandbox.style.top = '0';
  sandbox.style.width = elementId === 'printable-ledger' ? '760px' : '800px';
  sandbox.style.backgroundColor = '#ffffff';
  sandbox.style.zIndex = '-9999';
  sandbox.style.transform = 'none';
  sandbox.style.opacity = '1';
  sandbox.style.overflow = 'visible';

  // Clone the printable tree
  const clone = originalContainer.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.padding = originalContainer.style.padding || '';
  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    // Wait for any embedded images (logos, stamps, signatures) to be fully ready
    const images = Array.from(sandbox.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
      )
    );

    // Identify distinct A4 pages (.invoice-a4-page) or treat container as single page
    const pageElements = Array.from(sandbox.querySelectorAll<HTMLElement>('.invoice-a4-page'));
    const elementsToCapture = pageElements.length > 0 ? pageElements : [clone];

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    for (let i = 0; i < elementsToCapture.length; i++) {
      const pageEl = elementsToCapture[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2, // 2x for sharp barcodes, text, and financial numbers
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 850,
        onclone: (clonedDoc) => {
          // Sanitize all CSS rules for color functions not supported by html2canvas
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((styleTag) => {
            if (
              styleTag.textContent &&
              (styleTag.textContent.includes('oklch') || styleTag.textContent.includes('oklab'))
            ) {
              styleTag.textContent = convertOklchToRgb(styleTag.textContent);
            }
          });

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

      // If single long page (e.g. multi-entry ledger), paginate across A4 sheets
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

    // Deliver PDF across iPhone (iOS Safari), Android, and Desktop
    const pdfBlob = pdf.output('blob');
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdfBlob);

    // 1. Mobile Web Share API: Try system share sheet on mobile devices
    if (isMobileDevice() && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: fileName,
          text: `Download ${fileName}`,
        });
        return true;
      } catch (shareError: any) {
        if (shareError?.name === 'AbortError') {
          return true; // User dismissed share sheet
        }
        console.warn('Web Share API deferred, switching to direct iOS/Android presentation:', shareError);
      }
    }

    // 2. Special handling for iPhone / iOS Safari where <a download> is blocked
    if (isIOS()) {
      // In iOS Safari, opening the PDF blob in a new tab immediately invokes iOS Safari's native PDF Viewer with AirPrint & Save to Files
      const newTab = window.open(blobUrl, '_blank');
      if (!newTab) {
        // If popup blocker intervened, navigate directly
        window.location.href = blobUrl;
      }
      return true;
    }

    // 3. Android & Desktop: Direct Blob Object URL download anchor
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = fileName;
    downloadAnchor.target = '_blank';
    downloadAnchor.rel = 'noopener noreferrer';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();

    setTimeout(() => {
      if (downloadAnchor.parentNode) {
        downloadAnchor.parentNode.removeChild(downloadAnchor);
      }
      URL.revokeObjectURL(blobUrl);
    }, 2000);

    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    try {
      await printDocumentElement(elementId);
    } catch {
      // ignore
    }
    return false;
  } finally {
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
}

/**
 * Universal Print Helper for GST Tax Invoices and Party Ledgers.
 * Renders the printable document cleanly across iPhone (iOS Safari), Android Chrome,
 * and Desktop browsers, solving WebKit blank-print and fixed modal overflow bugs.
 */
export async function printDocumentElement(elementId: string): Promise<boolean> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    window.print();
    return true;
  }

  // A. Special Handler for iOS Safari (iPhone & iPad)
  if (isIOS()) {
    // 1. Clean up any existing print mount
    const existingRoot = document.getElementById('kannaku-print-root');
    if (existingRoot && existingRoot.parentNode) {
      existingRoot.parentNode.removeChild(existingRoot);
    }

    // 2. Create dedicated direct body mount for iOS print rendering
    const printRoot = document.createElement('div');
    printRoot.id = 'kannaku-print-root';
    printRoot.className = 'kannaku-print-root';

    const clone = sourceElement.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.margin = '0 auto';
    clone.style.position = 'relative';
    clone.style.boxShadow = 'none';
    clone.style.border = elementId === 'printable-invoice' ? 'none' : '1px solid #cbd5e1';

    printRoot.appendChild(clone);
    document.body.appendChild(printRoot);
    document.body.classList.add('kannaku-printing');

    // Wait for images inside clone to be ready
    const cloneImages = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      cloneImages.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) resolve();
            else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
      )
    );

    await new Promise((r) => setTimeout(r, 150));

    try {
      window.print();
    } finally {
      // Remove iOS print mount after print dialog closes
      setTimeout(() => {
        document.body.classList.remove('kannaku-printing');
        if (printRoot.parentNode) {
          printRoot.parentNode.removeChild(printRoot);
        }
      }, 1200);
    }
    return true;
  }

  // B. Android Chrome & Desktop: Isolated print iframe context
  try {
    const oldIframe = document.getElementById('kannaku-print-iframe');
    if (oldIframe && oldIframe.parentNode) {
      oldIframe.parentNode.removeChild(oldIframe);
    }

    const printIframe = document.createElement('iframe');
    printIframe.id = 'kannaku-print-iframe';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0px';
    printIframe.style.height = '0px';
    printIframe.style.border = 'none';
    printIframe.style.visibility = 'hidden';
    printIframe.style.zIndex = '-9999';
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
    if (!iframeDoc) {
      window.print();
      return true;
    }

    // Collect all head stylesheets and links from parent
    let headStyles = '';
    const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleNodes.forEach((node) => {
      headStyles += node.outerHTML;
    });

    const printStyles = `
      <style>
        @page {
          size: A4 portrait;
          margin: 6mm 6mm 6mm 6mm;
        }
        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        html, body {
          background: #FFFFFF !important;
          color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          visibility: visible !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .no-print {
          display: none !important;
        }
        #printable-invoice, #printable-ledger, .printable-document {
          visibility: visible !important;
          position: static !important;
          width: 100% !important;
          max-width: 800px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          transform: none !important;
        }
        .invoice-a4-page {
          page-break-after: always;
          break-after: page;
          margin: 0 auto !important;
          box-shadow: none !important;
          border: 1.5px solid #000000 !important;
          min-height: 270mm !important;
          width: 100% !important;
          max-width: 800px !important;
          background: #FFFFFF !important;
          color: #000000 !important;
          transform: none !important;
        }
        .invoice-a4-page:last-child {
          page-break-after: avoid;
          break-after: avoid;
        }
        .printable-document {
          width: 100% !important;
          max-width: 760px !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          border: 1px solid #cbd5e1 !important;
          background: #FFFFFF !important;
        }
      </style>
    `;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Print Document</title>
          ${headStyles}
          ${printStyles}
        </head>
        <body style="background:#FFFFFF; margin:0; padding:4px;">
          <div id="print-content-wrapper">
            ${sourceElement.outerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for all images in iframe to load
    const iframeImages = Array.from(iframeDoc.querySelectorAll('img'));
    await Promise.all(
      iframeImages.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
      )
    );

    // Allow CSS layout calculation
    await new Promise((r) => setTimeout(r, 200));

    // Trigger printing inside iframe
    if (printIframe.contentWindow) {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
    } else {
      window.print();
    }

    // Clean up
    setTimeout(() => {
      if (printIframe.parentNode) {
        printIframe.parentNode.removeChild(printIframe);
      }
    }, 3000);

    return true;
  } catch (err) {
    console.warn('Iframe print error, invoking standard window.print() fallback:', err);
    window.print();
    return true;
  }
}
