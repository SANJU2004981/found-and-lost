const supabase = require('./config/supabase');

async function testAPIs() {
    const userId = "550e8400-e29b-41d4-a716-446655440000";

    console.log('\n--- Testing POST /api/lost ---');
    const lostResponse = await fetch('http://localhost:5000/api/lost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Black Wallet',
            description: 'Lost my black leather wallet near the bus stand',
            location: 'Coimbatore Bus Stand',
            latitude: 11.0168,
            longitude: 76.9558,
            user_id: userId,
            date_lost: new Date().toISOString().split('T')[0]
        })
    });
    const lostResult = await lostResponse.json();
    console.log(lostResponse.status === 201 ? 'Success!' : 'Failed:', lostResult);

    console.log('\n--- Testing POST /api/found ---');
    const foundResponse = await fetch('http://localhost:5000/api/found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Found Keys',
            description: 'Found a set of keys',
            location: 'Coimbatore Railway Station',
            latitude: 11.0000,
            longitude: 76.9600,
            user_id: userId,
            date_found: new Date().toISOString().split('T')[0]
        })
    });
    const foundResult = await foundResponse.json();
    console.log(foundResponse.status === 201 ? 'Success!' : 'Failed:', foundResult);

    console.log('\n--- Testing GET /api/map ---');
    const mapResponse = await fetch('http://localhost:5000/api/map');
    const mapResult = await mapResponse.json();

    if (mapResponse.ok) {
        console.log(`Successfully fetched ${mapResult.length} map items!`);
        console.log(mapResult);
    } else {
        console.log('Failed GET map:', mapResult);
    }
}

testAPIs();
