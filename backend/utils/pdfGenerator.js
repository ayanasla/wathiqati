const PDFDocument = require('pdfkit');

/**
 * Generate a comprehensive administrative document PDF with all request details
 * @param {Object} request - Request object from database
 * @returns {Promise<Buffer>} PDF buffer
 */
function generateRequestPDF(request) {
  return new Promise((resolve, reject) => {
    try {
      // Validate required data
      if (!request || !request.id) {
        const err = new Error('Invalid request object - missing ID');
        console.error('[PDF] Validation Error:', err.message);
        reject(err);
        return;
      }

      if (!request.requestNumber) {
        const err = new Error('Missing requestNumber - cannot generate PDF');
        console.error('[PDF] Validation Error:', err.message);
        reject(err);
        return;
      }

      console.log('[PDF] ============ Starting PDF generation ============');
      console.log('[PDF] Request Number:', request.requestNumber);
      console.log('[PDF] Request ID:', request.id);
      console.log('[PDF] Document Type:', request.documentType);
      console.log('[PDF] Status:', request.status);
      console.log('[PDF] First Name (FR):', request.firstNameFr);
      console.log('[PDF] Last Name (FR):', request.lastNameFr);
      console.log('[PDF] National ID:', request.nationalId);
      console.log('[PDF] Preparation Location:', request.preparationLocation);
      console.log('[PDF] Data Complete:', {
        hasId: !!request.id,
        hasRequestNumber: !!request.requestNumber,
        hasDocumentType: !!request.documentType,
        hasStatus: !!request.status,
        hasFirstNameFr: !!request.firstNameFr,
      });

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Document Request - ${request.requestNumber || 'Unknown'}`,
          Author: 'Wathiqati Administrative Portal',
          Subject: `${request.documentType || 'Document'} Request`,
        }
      });

      const chunks = [];
      let hasError = false;

      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        if (!hasError) {
          const buffer = Buffer.concat(chunks);
          console.log('[PDF] PDF generated successfully, size:', buffer.length, 'bytes');
          resolve(buffer);
        }
      });

      doc.on('error', (error) => {
        hasError = true;
        console.error('[PDF] PDF generation error:', error);
        reject(error);
      });

      // ========== HEADER ==========
      doc.fontSize(20).font('Helvetica-Bold').text('المملكة المغربية', { align: 'center' });
      doc.fontSize(20).font('Helvetica-Bold').text('KINGDOM OF MOROCCO', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(14).font('Helvetica-Bold').text('بوابة الوثائق الإدارية', { align: 'center' });
      doc.fontSize(14).font('Helvetica-Bold').text('ADMINISTRATIVE DOCUMENTS PORTAL', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text('Wathiqati - Système de Gestion des Demandes', { align: 'center' });
      doc.moveDown(1);

      // ========== REQUEST SUMMARY ==========
      doc.fontSize(12).font('Helvetica-Bold').text('REQUEST INFORMATION', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');

      const requestInfo = [
        ['Request Number:', request.requestNumber || 'N/A'],
        ['Document Type:', formatDocumentType(request.documentType || '')],
        ['Request Status:', formatStatus(request.status || 'pending')],
        ['Submission Date:', formatDate(request.createdAt)],
        ['Last Updated:', formatDate(request.updatedAt)],
        ['Municipality:', request.municipality || 'Not specified'],
        ['Preparation Location:', request.preparationLocation || 'Not specified'],
      ];

      requestInfo.forEach(([label, value]) => {
        doc.text(label, { continued: true }).font('Helvetica-Bold');
        doc.font('Helvetica').text(` ${value}`);
        doc.moveDown(0.25);
      });

      doc.moveDown(0.5);

      // ========== PERSONAL INFORMATION ==========
      doc.fontSize(12).font('Helvetica-Bold').text('PERSONAL INFORMATION', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');

      // French Information
      doc.fontSize(10).font('Helvetica-Bold').text('French Information:');
      doc.moveDown(0.15);
      doc.font('Helvetica');
      const frenchInfo = [
        ['Full Name:', `${(request.firstNameFr || '').trim()} ${(request.lastNameFr || '').trim()}`.trim() || 'N/A'],
        ['Date of Birth:', formatDate(request.dateOfBirth) || 'N/A'],
        ['Place of Birth:', request.placeOfBirthFr || 'N/A'],
        ['National ID (CIN):', request.nationalId || 'N/A'],
        ['Address:', request.addressFr || 'N/A'],
        ['Phone:', request.phone || 'N/A'],
        ['Father Name:', request.fatherNameFr || 'N/A'],
        ['Mother Name:', request.motherNameFr || 'N/A'],
      ];

      frenchInfo.forEach(([label, value]) => {
        if (value && value !== 'N/A' && value.trim()) {
          doc.text(label, { continued: true }).font('Helvetica-Bold');
          doc.font('Helvetica').text(` ${value}`);
          doc.moveDown(0.2);
        }
      });

      doc.moveDown(0.3);

      // Arabic Information
      doc.fontSize(10).font('Helvetica-Bold').text('Arabic Information (المعلومات بالعربية):');
      doc.moveDown(0.15);
      doc.font('Helvetica');
      const arabicInfo = [
        ['الاسم الكامل:', `${(request.firstNameAr || '').trim()} ${(request.lastNameAr || '').trim()}`.trim() || 'N/A'],
        ['مكان الازدياد:', request.placeOfBirthAr || 'N/A'],
        ['العنوان:', request.addressAr || 'N/A'],
        ['اسم الأب:', request.fatherNameAr || 'N/A'],
        ['اسم الأم:', request.motherNameAr || 'N/A'],
      ];

      arabicInfo.forEach(([label, value]) => {
        if (value && value !== 'N/A' && value.trim()) {
          doc.text(label, { continued: true }).font('Helvetica-Bold');
          doc.font('Helvetica').text(` ${value}`);
          doc.moveDown(0.2);
        }
      });

      doc.moveDown(0.5);

      // ========== REQUEST DETAILS ==========
      if (request.purpose) {
        doc.fontSize(12).font('Helvetica-Bold').text('REQUEST PURPOSE', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(request.purpose, { align: 'left', width: 480 });
        doc.moveDown(0.5);
      }

      // ========== APPROVAL/REJECTION INFO ==========
      if (request.status === 'approved' || request.status === 'document_generated') {
        doc.fontSize(12).font('Helvetica-Bold').text('APPROVAL INFORMATION', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text('Status:', { continued: true }).font('Helvetica-Bold');
        doc.font('Helvetica').text(` ${formatStatus(request.status)}`);
        doc.moveDown(0.2);
        doc.text('Approved Date:', { continued: true }).font('Helvetica-Bold');
        doc.font('Helvetica').text(` ${formatDate(request.updatedAt)}`);
        doc.moveDown(0.5);
      } else if (request.status === 'rejected') {
        doc.fontSize(12).font('Helvetica-Bold').text('REJECTION INFORMATION', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text('Status:', { continued: true }).font('Helvetica-Bold');
        doc.font('Helvetica').text(` ${formatStatus(request.status)}`);
        doc.moveDown(0.2);
        if (request.rejectionReason) {
          doc.text('Reason:', { continued: true }).font('Helvetica-Bold');
          doc.font('Helvetica').text(` ${request.rejectionReason}`, { align: 'left', width: 480 });
          doc.moveDown(0.2);
        }
      }

      // ========== DOCUMENT PICKUP LOCATION (HIGHLIGHTED SECTION) ==========
      doc.moveDown(0.5);

      // Highlighted background for pickup location
      const pageWidth = doc.page.width - 2 * doc.page.margins.left;
      const highlightHeight = 60;
      const highlightY = doc.y;

      // Draw highlighted background
      doc.rect(doc.page.margins.left, highlightY, pageWidth, highlightHeight)
         .fill('#f0f9ff'); // Light blue background

      // Reset fill color for text
      doc.fillColor('black');

      // Title
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af')
         .text('📍 DOCUMENT PICKUP LOCATION', doc.page.margins.left + 10, highlightY + 8);

      // Location
      doc.moveDown(0.3);
      const locationText = request.preparationLocation && request.preparationLocation.trim()
        ? request.preparationLocation
        : 'Location not available';

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1f2937')
         .text(locationText, doc.page.margins.left + 10);

      // Instruction
      doc.moveDown(0.2);
      doc.fontSize(10).font('Helvetica').fillColor('#374151')
         .text('Go to this location to collect your document.', doc.page.margins.left + 10);

      // Map instruction (only show if location is available)
      if (request.preparationLocation && request.preparationLocation.trim()) {
        doc.moveDown(0.2);
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#059669')
           .text('💡 View on Map: Search for this address on Google Maps to get directions', doc.page.margins.left + 10);
      }

      // Reset position after highlighted section
      doc.y = highlightY + highlightHeight + 10;
      doc.fillColor('black');

      // ========== ADMIN NOTES ==========
      if (request.adminNotes) {
        doc.moveDown(0.3);
        doc.fontSize(12).font('Helvetica-Bold').text('ADMINISTRATIVE NOTES', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(request.adminNotes, { align: 'left', width: 480 });
      }

      // ========== FOOTER & TIMESTAMP ==========
      doc.moveDown(1);
      doc.fontSize(8).font('Helvetica').text(
        '━'.repeat(80),
        { align: 'center' }
      );
      doc.moveDown(0.2);
      doc.fontSize(8).font('Helvetica').text(
        `Generated: ${new Date().toLocaleString()}`,
        { align: 'center' }
      );
      doc.text(
        'This document is generated electronically by the Wathiqati Administrative Portal',
        { align: 'center' }
      );
      doc.text(
        'وثيقة يتم إنشاؤها إلكترونياً بواسطة بوابة الوثائق الإدارية - واثقاتي',
        { align: 'center' }
      );

      doc.end();
    } catch (err) {
      console.error('[PDF] Error in PDF generation:', err);
      reject(err);
    }
  });
}

/**
 * Format document type for display
 */
function formatDocumentType(type) {
  const typeMap = {
    'certificat_residence': 'Certificate of Residence (Certificat de Résidence)',
    'certificat_vie': 'Certificate of Life (Certificat de Vie)',
    'certificat_celibat': 'Certificate of Marital Status (Certificat de Célibat)',
    'extrait_naissance': 'Birth Certificate Extract (Extrait de Naissance)',
    'certificat_bonne_vie': 'Certificate of Good Conduct (Certificat de Bonne Vie et Mœurs)',
    'fiche_etat_civil': 'Civil Status Sheet (Fiche d\'État Civil)',
    'legalisation_signature': 'Signature Legalization (Légalisation de Signature)',
    'certificat_nationalite': 'Certificate of Nationality (Certificat de Nationalité)',
  };
  return typeMap[type] || type;
}

/**
 * Format status for display
 */
function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'in_review': 'Under Review (En Révision)',
    'approved': 'Approved (Approuvée)',
    'rejected': 'Rejected (Rejetée)',
    'document_generated': 'Ready for Collection (Prêt pour Collecte)',
  };
  return statusMap[status] || status;
}

/**
 * Format dates in human-readable format
 */
function formatDate(date) {
  if (!date) return 'Not specified';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    console.warn('[PDF] Date formatting error:', err);
    return 'Invalid date';
  }
}

module.exports = { generateRequestPDF };