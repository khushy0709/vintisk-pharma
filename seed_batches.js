const fs = require('fs');
const path = require('path');

async function seed() {
  const BASE_URL = 'http://localhost:3000';

  // Login
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Admin@Vintisk2026!' })
  });
  const cookie = loginRes.headers.get('set-cookie').split(';')[0];

  const testPdfPath = path.join(__dirname, 'test_batch_document.pdf');
  const pdfBytes = fs.readFileSync(testPdfPath);

  const batches = [
    {
      number: 'VP-2026-B01',
      product: 'PANTOVINT-DSR Capsules',
      expiry: '2027-12-31',
      status: 'active',
      filename: 'Pantovint_DSR_Release_Document.pdf'
    },
    {
      number: 'VP-2026-B02',
      product: 'VINCAL-D3 Softgel Capsules',
      expiry: '2028-06-30',
      status: 'active',
      filename: 'Vincal_D3_Release_Document.pdf'
    },
    {
      number: 'VP-2026-B03',
      product: 'VINTIM-CV 625 Tablets',
      expiry: '2026-09-30',
      status: 'inactive',
      filename: 'Vintim_CV_Release_Document.pdf'
    }
  ];

  for (const b of batches) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const bodyBuffer = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="batch_number"\r\n\r\n${b.number}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="product_name"\r\n\r\n${b.product}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="expiry_date"\r\n\r\n${b.expiry}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="status"\r\n\r\n${b.status}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="pdf_file"; filename="${b.filename}"\r\nContent-Type: application/pdf\r\n\r\n`),
      pdfBytes,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const res = await fetch(`${BASE_URL}/api/admin/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Cookie: cookie
      },
      body: bodyBuffer
    });

    const resData = await res.json();
    if (res.ok) {
      console.log(`✓ Seeded batch ${b.number}: ${b.product} (${b.status})`);
    } else if (resData.error === 'duplicate_batch') {
      console.log(`ℹ Batch ${b.number} already exists`);
    } else {
      console.log(`✗ Failed to seed batch ${b.number}:`, resData);
    }
  }
}

seed().catch(console.error);
