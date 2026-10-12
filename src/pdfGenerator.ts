import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface GeneratePdfOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  quality?: 'standard' | 'high' | 'ultra';
  isCircularPoster?: boolean;
}

/**
 * Ensures all document fonts (including Google Fonts Noto Serif/Sans Ethiopic)
 * are completely ready before rendering canvas.
 */
async function ensureFontsLoaded(): Promise<void> {
  if (document && 'fonts' in document && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if font ready promise rejects
    }
  }
}

/**
 * Downloads an HTML element as an ultra high-quality PDF document.
 * Supports DPI scaling up to 3x/4x for crisp print shop quality text.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const { 
    fileName = 'desta-family-tree.pdf',
    orientation = 'portrait',
    quality = 'high',
    isCircularPoster = false,
  } = options;

  await ensureFontsLoaded();

  // Dynamic scale factor based on quality setting:
  // - 'standard': 2x (good for quick screen sharing)
  // - 'high': 3x (300 DPI equivalent for sharp printing of Ethiopic typography)
  // - 'ultra': 4x (ultra-sharp vector-grade detail)
  const scale = quality === 'ultra' ? 4 : quality === 'high' ? 3 : 2;

  const isLandscape = orientation === 'landscape';

  // Render element to high-res canvas with html2canvas-pro
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    allowTaint: true,
    backgroundColor: '#ffffff',
    windowWidth: isLandscape ? 1600 : 1200,
    imageTimeout: 15000,
    onclone: (clonedDoc) => {
      // Ensure cloned elements retain pristine font anti-aliasing and visible bounds
      const el = clonedDoc.getElementById('pdf-printable-content');
      if (el) {
        el.style.setProperty('-webkit-font-smoothing', 'antialiased');
        el.style.setProperty('text-rendering', 'optimizeLegibility');
      }
    }
  });

  // Calculate PDF dimensions
  // Standard A4 dimensions in mm: 210 x 297 (or landscape 297 x 210)
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = isLandscape ? 297 : 210;
  const pageHeight = isLandscape ? 210 : 297;

  // Use lossless PNG for crisp vectors and text edges without JPEG compression artifacts
  const imgData = canvas.toDataURL('image/png', 1.0);

  // If it's a dedicated circular tree poster, fit nicely onto a single magnificent page or multi-page
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (isCircularPoster && imgHeight <= pageHeight + 20) {
    // Center it vertically if it fits on a single poster page
    const verticalOffset = Math.max(0, (pageHeight - imgHeight) / 2);
    pdf.addImage(imgData, 'PNG', 0, verticalOffset, imgWidth, Math.min(imgHeight, pageHeight), undefined, 'FAST');
  } else {
    // Multi-page slicing with clean margin offsets
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Subsequent pages
    while (heightLeft > 5) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }
  }

  pdf.save(fileName);
}

