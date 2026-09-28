import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
}

export async function downloadElementAsPdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const { 
    fileName = 'desta-family-tree.pdf',
    orientation = 'portrait'
  } = options;

  // Use scale 2 for crisp vector-like text rendering of Amharic fonts
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: orientation === 'landscape' ? 1400 : 1000,
  });

  const isLandscape = orientation === 'landscape';
  const pdf = new jsPDF(isLandscape ? 'l' : 'p', 'mm', 'a4');
  
  const pageWidth = isLandscape ? 297 : 210;
  const pageHeight = isLandscape ? 210 : 297;
  
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Subsequent pages
  while (heightLeft > 5) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}
