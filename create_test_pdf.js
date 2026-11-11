const fs = require('fs');
const path = require('path');

// Generate a valid minimal PDF 1.4 document
const pdfContent = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Resources <<
    /Font <<
      /F1 4 0 R
      /F2 5 0 R
    >>
  >>
  /Contents 6 0 R
>>
endobj
4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj
5 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>
endobj
6 0 obj
<<
  /Length 580
>>
stream
BT
/F1 20 Tf
50 720 Td
(VINTISK PHARMACEUTICALS PVT. LTD.) Tj
/F2 11 Tf
0 -24 Td
(Dedicated Towards Saving Lives! - Est. 2021) Tj
/F1 14 Tf
0 -36 Td
(OFFICIAL BATCH / PRODUCT RELEASE CERTIFICATE) Tj
/F2 11 Tf
0 -24 Td
(Batch Identification Code: VP-2026-B01) Tj
0 -18 Td
(Product Formulation: PANTOVINT-DSR Capsules) Tj
0 -18 Td
(Dosage Form: Gastro-Resistant Pantoprazole & Domperidone SR) Tj
0 -18 Td
(Manufacturing Standards: WHO-GMP Certified Partner Facility) Tj
0 -18 Td
(Expiry Date: 2027-12-31) Tj
0 -18 Td
(Document Classification: Official Marketing Release Documentation) Tj
0 -30 Td
(This document confirms that batch VP-2026-B01 is registered in the official) Tj
0 -16 Td
(Vintisk Pharma Verification System and satisfies all release criteria.) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000344 00000 n 
0000000417 00000 n 
trailer
<<
  /Size 7
  /Root 1 0 R
>>
startxref
1050
%%EOF
`;

const outputPath = path.join(__dirname, 'test_batch_document.pdf');
fs.writeFileSync(outputPath, pdfContent, 'utf8');
console.log('Sample test PDF created at:', outputPath);
