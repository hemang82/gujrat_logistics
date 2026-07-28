require('dotenv').config({ path: '.env.local' });

async function testFetch() {
  const API_BASE = process.env.MASTERS_INDIA_API_BASE;
  const USERNAME = process.env.MASTERS_INDIA_USERNAME;
  const PASSWORD = process.env.MASTERS_INDIA_PASSWORD;
  const GSTIN = process.env.MASTERS_INDIA_GSTIN;
  const ewbNo = "321009218808"; // Demo number from PDF

  try {
    console.log('1. Fetching Token...');
    const authRes = await fetch(`${API_BASE}/token-auth/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    });
    const authData = await authRes.json();
    
    if (authData.error) {
      console.error('Auth Failed:', authData.error);
      return;
    }
    const token = authData.token;
    console.log('Token received successfully.');

    console.log(`2. Fetching EWB Details for ${ewbNo}...`);
    const ewbRes = await fetch(`${API_BASE}/getEwayBillData/?action=GetEwayBill&gstin=${GSTIN}&eway_bill_number=${ewbNo}`, {
      headers: { 'Authorization': `JWT ${token}` }
    });
    
    const ewbData = await ewbRes.json();
    console.log('EWB Response:', JSON.stringify(ewbData, null, 2));

  } catch (err) {
    console.error('Test script error:', err);
  }
}

testFetch();
