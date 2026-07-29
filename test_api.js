async function testAPI() {
  const payload = {
    challanNo: "CH-TEST-API",
    userGstin: "05AAABC0181E1ZE",
    transporter_id: "05AAABB0639G1Z8",
    trip_no: "CH-TEST-API",
    vehicle_number: "GJ01AB1234",
    vehicle_type: "Regular",
    transportation_mode: "Road",
    from_place: "Ahmedabad",
    from_state: "Gujarat",
    eway_bill_list: [{ eway_bill_no: "123456789012" }, { eway_bill_no: "987654321098" }]
  };

  try {
    const res = await fetch('http://localhost:2001/api/admin/ewaybills/consolidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log('API Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testAPI();
