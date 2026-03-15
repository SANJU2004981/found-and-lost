const supabase = require('./config/supabase');

async function checkItemSchemas() {
    console.log('--- LOST_ITEMS DEBUG ---');
    const { data: lostData, error: lostError } = await supabase.from('lost_items').select('*').limit(1);
    if (lostError) console.error('Lost error:', lostError.message);
    else if (lostData[0]) console.log('Lost columns:', Object.keys(lostData[0]).join(', '));

    console.log('--- FOUND_ITEMS DEBUG ---');
    const { data: foundData, error: foundError } = await supabase.from('found_items').select('*').limit(1);
    if (foundError) console.error('Found error:', foundError.message);
    else if (foundData[0]) console.log('Found columns:', Object.keys(foundData[0]).join(', '));
}

checkItemSchemas();
