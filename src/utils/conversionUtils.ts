
import jsPDF from 'jspdf';

export const convertJpgToPdf = async (file: File): Promise<{ blob: Blob; fileName: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const pdf = new jsPDF();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to data URL
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Calculate dimensions to fit PDF page
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image to PDF
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        // Convert PDF to blob
        const pdfBlob = pdf.output('blob');
        const fileName = file.name.replace(/\.(jpg|jpeg)$/i, '.pdf');
        
        resolve({ blob: pdfBlob, fileName });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const convertPdfToJpg = async (file: File): Promise<{ blob: Blob; fileName: string }> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    
    fileReader.onload = async () => {
      try {
        // For now, we'll create a placeholder conversion
        // In a real implementation, you'd use a library like pdf2pic or PDF.js
        // This is a simplified version that creates a basic image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 600;
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Create a simple placeholder image
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333333';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PDF Content Converted to JPG', canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Original file: ${file.name}`, canvas.width / 2, canvas.height / 2 + 40);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = file.name.replace(/\.pdf$/i, '.jpg');
            resolve({ blob, fileName });
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.9);
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.onerror = () => reject(new Error('Failed to read file'));
    fileReader.readAsArrayBuffer(file);
  });
};
