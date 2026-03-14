const supabase = require('./config/supabase');

async function testColumns() {
    console.log('Testing lost_items...');
    const { data: lostData, error: lostError } = await supabase
        .from('lost_items')
        .select('location, latitude, longitude')
        .limit(1);

    if (lostError) {
        console.error('Error in lost_items:', lostError.message);
    } else {
        console.log('lost_items columns exist! (or table is empty)');
    }

    console.log('Testing found_items...');
    const { data: foundData, error: foundError } = await supabase
        .from('found_items')
        .select('location, latitude, longitude')
        .limit(1);

    if (foundError) {
        console.error('Error in found_items:', foundError.message);
    } else {
        console.log('found_items columns exist! (or table is empty)');
    }
}

testColumns();
