async function testHtml() {
  const resHome = await fetch('http://localhost:3000/');
  const textHome = await resHome.text();
  console.log('Home page status:', resHome.status);
  console.log('Home has Batch Verification in navbar:', textHome.includes('nav-verify-btn') && textHome.includes('Batch Verification'));
  console.log('Home has Batch Verification in mobile drawer:', textHome.includes('/batch-verification') && textHome.includes('mobile-nav-link'));

  const resVerify = await fetch('http://localhost:3000/batch-verification');
  const textVerify = await resVerify.text();
  console.log('Batch Verification status:', resVerify.status);
  console.log('Verify page has heading "Verify Your Product":', textVerify.includes('Verify Your Product'));
  console.log('Verify page has exact supporting text:', textVerify.includes('Enter the batch number printed on your Vintisk Pharma product packaging to verify its associated product document.'));
  console.log('Verify page has Batch Number input:', textVerify.includes('id="batchNumberInput"'));
  console.log('Verify page has Verify Batch button:', textVerify.includes('Verify Batch'));

  const resAdmin = await fetch('http://localhost:3000/admin');
  const textAdmin = await resAdmin.text();
  console.log('Admin page status:', resAdmin.status);
  console.log('Admin page has Admin Portal Sign In:', textAdmin.includes('Admin Portal Sign In'));
  console.log('Admin page has Batches table:', textAdmin.includes('batchesTableBody'));
}
testHtml().catch(console.error);
