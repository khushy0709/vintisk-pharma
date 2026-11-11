async function verifyAllCases() {
  const BASE_URL = 'http://localhost:3000';

  console.log('--- TESTING ALL PUBLIC VERIFICATION CASES ---');

  // Case 1: Valid Active Batch
  const r1 = await (await fetch(`${BASE_URL}/api/verify-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_number: 'VP-2026-B01' })
  })).json();
  console.log('\nCase 1 (VP-2026-B01):');
  console.log('  Success:', r1.success);
  console.log('  Heading:', r1.heading);
  console.log('  Message:', r1.message);
  console.log('  Document URL:', r1.document_url);

  // Case 2: Second Valid Active Batch
  const r2 = await (await fetch(`${BASE_URL}/api/verify-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_number: 'VP-2026-B02' })
  })).json();
  console.log('\nCase 2 (VP-2026-B02):');
  console.log('  Success:', r2.success);
  console.log('  Heading:', r2.heading);
  console.log('  Product:', r2.batch.product_name);

  // Case 3: Inactive Batch
  const r3 = await (await fetch(`${BASE_URL}/api/verify-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_number: 'VP-2026-B03' })
  })).json();
  console.log('\nCase 3 (VP-2026-B03 - Inactive):');
  console.log('  Success:', r3.success);
  console.log('  Heading:', r3.heading);
  console.log('  Message:', r3.message);

  // Case 4: Not Found Batch
  const r4 = await (await fetch(`${BASE_URL}/api/verify-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_number: 'UNKNOWN-12345' })
  })).json();
  console.log('\nCase 4 (UNKNOWN-12345 - Not Found):');
  console.log('  Success:', r4.success);
  console.log('  Heading:', r4.heading);
  console.log('  Message:', r4.message);

  // Case 5: Empty Input
  const r5 = await (await fetch(`${BASE_URL}/api/verify-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_number: '' })
  })).json();
  console.log('\nCase 5 (Empty Batch):');
  console.log('  Success:', r5.success);
  console.log('  Error:', r5.error);
  console.log('  Message:', r5.message);
}

verifyAllCases().catch(console.error);
