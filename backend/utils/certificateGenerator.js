const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF certificate and returns the relative URL path.
 */
const generateCertificatePDF = (studentName, courseName, certificateId, date) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4'
      });

      const fileName = `cert-${certificateId}.pdf`;
      const destDir = path.join(__dirname, '../public/uploads/certificates');
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      const destPath = path.join(destDir, fileName);
      const writeStream = fs.createWriteStream(destPath);
      doc.pipe(writeStream);

      // Draw primary border (navy blue)
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(4)
         .stroke('#1e3a8a');

      // Draw secondary border (gold)
      doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52)
         .lineWidth(1.5)
         .stroke('#d97706');

      // Header Title
      doc.font('Helvetica-Bold')
         .fontSize(38)
         .fillColor('#1e3a8a')
         .text('CERTIFICATE OF COMPLETION', 0, 110, { align: 'center' });

      // Sub-header
      doc.font('Helvetica')
         .fontSize(16)
         .fillColor('#4b5563')
         .text('This is proudly presented to', 0, 175, { align: 'center' });

      // Student Name
      doc.font('Helvetica-Bold')
         .fontSize(30)
         .fillColor('#d97706')
         .text(studentName, 0, 215, { align: 'center' });

      // Description text
      doc.font('Helvetica')
         .fontSize(16)
         .fillColor('#4b5563')
         .text('for successfully completing the university-grade course', 0, 265, { align: 'center' });

      // Course Title
      doc.font('Helvetica-Bold')
         .fontSize(24)
         .fillColor('#1e3a8a')
         .text(courseName, 0, 295, { align: 'center' });

      // Divider line
      doc.moveTo(180, 350).lineTo(doc.page.width - 180, 350).lineWidth(1).stroke('#e5e7eb');

      // Footer: Date
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor('#6b7280')
         .text(`Issued On: ${date}`, 100, 375, { align: 'left', width: 250 });

      // Footer: Cert ID
      doc.text(`Certificate ID: ${certificateId}`, doc.page.width - 350, 375, { align: 'right', width: 250 });

      // Footer: Sign-off
      doc.font('Helvetica-Oblique')
         .fontSize(13)
         .fillColor('#374151')
         .text('EduLearn LMS Accreditation Board', 0, 440, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(`/uploads/certificates/${fileName}`);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateCertificatePDF;
