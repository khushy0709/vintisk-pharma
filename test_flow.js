const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE BATCH VERIFICATION TESTS ---');

  const BASE_URL = 'http://localhost:3000';
  let adminCookie = '';

  // 1. Admin Login Test
  console.log('\n[1] Testing Admin Login...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Admin@Vintisk2026!' })
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const setCookie = loginRes.headers.get('set-cookie');
  if (setCookie) {
    adminCookie = setCookie.split(';')[0];
  }
  console.log('✓ Admin login successful. Session established.');

  // 2. Admin Check Auth Test
  console.log('\n[2] Testing Admin Auth Check (/api/admin/me)...');
  const meRes = await fetch(`${BASE_URL}/api/admin/me`, {
    headers: { Cookie: adminCookie }
  });
  const meData = await meRes.json();
  if (!meRes.ok || !meData.authenticated) {
    throw new Error('Admin auth check failed: ' + JSON.stringify(meData));
  }
  console.log('✓ Admin auth verified for user:', meData.user.username);

  // Clean up any existing test batch from prior runs
  const batchesRes = await fetch(`${BASE_URL}/api/admin/batches?search=VP-2026-B01`, {
    headers: { Cookie: adminCookie }
  });
  const batchesData = await batchesRes.json();
  if (batchesData.batches && batchesData.batches.length > 0) {
    for (const b of batchesData.batches) {
      if (b.batch_number.toUpperCase() === 'VP-2026-B01') {
        await fetch(`${BASE_URL}/api/admin/batches/${b.id}`, {
          method: 'DELETE',
          headers: { Cookie: adminCookie }
        });
        console.log('  (Cleaned up prior test batch ID:', b.id, ')');
      }
    }
  }

  // 3. Admin Add Batch Test
  console.log('\n[3] Testing Admin Add Batch with PDF Upload...');
  const testPdfPath = path.join(__dirname, 'test_batch_document.pdf');
  const pdfBytes = fs.readFileSync(testPdfPath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

  // Construct multipart/form-data
  let bodyBuffer = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="batch_number"\r\n\r\nVP-2026-B01\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="product_name"\r\n\r\nPANTOVINT-DSR Capsules\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="expiry_date"\r\n\r\n2027-12-31\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="status"\r\n\r\nactive\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="pdf_file"; filename="pantovint_dsr_batch_vp2026b01.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
    pdfBytes,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const addRes = await fetch(`${BASE_URL}/api/admin/batches`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: adminCookie
    },
    body: bodyBuffer
  });

  const addData = await addRes.json();
  if (!addRes.ok || !addData.success) {
    throw new Error('Add batch failed: ' + JSON.stringify(addData));
  }
  const createdBatch = addData.batch;
  console.log('✓ Batch added successfully. ID:', createdBatch.id, 'Batch No:', createdBatch.batch_number);

  // 4. Duplicate Batch Rejection Test
  console.log('\n[4] Testing Duplicate Batch Rejection...');
  const dupRes = await fetch(`${BASE_URL}/api/admin/batches`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: adminCookie
    },
    body: bodyBuffer
  });
  const dupData = await dupRes.json();
  if (dupRes.status !== 409 || dupData.error !== 'duplicate_batch') {
    throw new Error('Duplicate check failed! Expected 409, got: ' + dupRes.status);
  }
  console.log('✓ Duplicate batch correctly rejected with 409:', dupData.message);

  // 5. Customer Verification (Valid Batch) Test
  console.log('\n[5] Testing Customer Verification for Valid Batch (VP-2026-B01)...');
  const verifyRes = await fetch(`${BASE_URL}/api/verify-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_number: 'vp-2026-b01' }) // testing lowercase case-insensitivity
  });

  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData.success) {
    throw new Error('Batch verification failed: ' + JSON.stringify(verifyData));
  }
  if (verifyData.heading !== '✓ Batch Verified') {
    throw new Error('Heading mismatch! Got: ' + verifyData.heading);
  }
  if (verifyData.message !== 'This batch number is registered in the Vintisk Pharma verification system.') {
    throw new Error('Message mismatch! Got: ' + verifyData.message);
  }
  console.log('✓ Public verification returned success:');
  console.log('  Heading:', verifyData.heading);
  console.log('  Message:', verifyData.message);
  console.log('  Product:', verifyData.batch.product_name);
  console.log('  Document URL:', verifyData.document_url);

  // 6. Customer Document Fetch Test
  console.log('\n[6] Testing Secure Document Retrieval (/api/documents/batch/VP-2026-B01)...');
  const docRes = await fetch(`${BASE_URL}${verifyData.document_url}`);
  if (!docRes.ok) {
    throw new Error('Failed to retrieve PDF: status ' + docRes.status);
  }
  const contentType = docRes.headers.get('content-type');
  if (contentType !== 'application/pdf') {
    throw new Error('Invalid content-type: ' + contentType);
  }
  const pdfArrayBuf = await docRes.arrayBuffer();
  const pdfHeader = Buffer.from(pdfArrayBuf).subarray(0, 5).toString('utf8');
  if (pdfHeader !== '%PDF-') {
    throw new Error('Invalid PDF content received: ' + pdfHeader);
  }
  console.log('✓ PDF document streamed correctly. Size:', pdfArrayBuf.byteLength, 'bytes, Header:', pdfHeader);

  // 7. Customer Verification (Invalid / Not Found Batch) Test
  console.log('\n[7] Testing Customer Verification for Non-Existent Batch (VP-INVALID-999)...');
  const notFoundRes = await fetch(`${BASE_URL}/api/verify-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_number: 'VP-INVALID-999' })
  });

  const notFoundData = await notFoundRes.json();
  if (notFoundData.success !== false || notFoundData.error !== 'not_found') {
    throw new Error('Expected not_found error, got: ' + JSON.stringify(notFoundData));
  }
  if (notFoundData.heading !== 'Batch Not Found') {
    throw new Error('Heading mismatch! Got: ' + notFoundData.heading);
  }
  if (notFoundData.message !== 'We could not find a document associated with this batch number. Please check the batch number and try again. If the issue persists, please contact Vintisk Pharma.') {
    throw new Error('Message mismatch! Got: ' + notFoundData.message);
  }
  console.log('✓ Non-existent batch correctly returned:');
  console.log('  Heading:', notFoundData.heading);
  console.log('  Message:', notFoundData.message);

  // 8. Customer Verification (Empty Batch Input) Test
  console.log('\n[8] Testing Customer Verification for Empty Batch Number...');
  const emptyRes = await fetch(`${BASE_URL}/api/verify-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_number: '   ' })
  });
  const emptyData = await emptyRes.json();
  if (emptyRes.status !== 400 || emptyData.error !== 'empty_batch') {
    throw new Error('Empty batch check failed! Got: ' + JSON.stringify(emptyData));
  }
  console.log('✓ Empty batch correctly rejected with 400:', emptyData.message);

  // 9. Admin Status Toggle (Deactivate Batch) Test
  console.log('\n[9] Testing Admin Deactivate Batch...');
  const toggleRes = await fetch(`${BASE_URL}/api/admin/batches/${createdBatch.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie
    },
    body: JSON.stringify({ status: 'inactive' })
  });
  const toggleData = await toggleRes.json();
  if (!toggleRes.ok || !toggleData.success) {
    throw new Error('Failed to toggle status: ' + JSON.stringify(toggleData));
  }
  console.log('✓ Status toggled to inactive.');

  // 10. Customer Verification (Inactive Batch) Test
  console.log('\n[10] Testing Customer Verification on Inactive Batch...');
  const inactVerifyRes = await fetch(`${BASE_URL}/api/verify-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_number: 'VP-2026-B01' })
  });
  const inactVerifyData = await inactVerifyRes.json();
  if (inactVerifyData.success !== false || inactVerifyData.error !== 'inactive') {
    throw new Error('Expected inactive error, got: ' + JSON.stringify(inactVerifyData));
  }
  console.log('✓ Inactive batch correctly identified:');
  console.log('  Heading:', inactVerifyData.heading);
  console.log('  Message:', inactVerifyData.message);

  // 11. Customer Document Fetch on Inactive Batch (Forbidden)
  console.log('\n[11] Testing Document Download on Inactive Batch (without admin token)...');
  const forbiddenDocRes = await fetch(`${BASE_URL}/api/documents/batch/VP-2026-B01`);
  if (forbiddenDocRes.status !== 403) {
    throw new Error('Expected 403 Forbidden for inactive batch document, got: ' + forbiddenDocRes.status);
  }
  console.log('✓ Inactive batch document access correctly denied with 403 Forbidden.');

  // 12. Re-activate Batch for Customer Experience
  console.log('\n[12] Re-activating Batch...');
  await fetch(`${BASE_URL}/api/admin/batches/${createdBatch.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie
    },
    body: JSON.stringify({ status: 'active' })
  });
  console.log('✓ Batch reactivated.');

  console.log('\n=======================================================');
  console.log('ALL BACKEND & BUSINESS LOGIC TESTS PASSED SUCCESSFULLY!');
  console.log('=======================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
