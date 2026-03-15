const supabase = require('./config/supabase');

async function checkFoundSchema() {
    const { data, error } = await supabase.from('found_items').select('*').limit(1);
    if (error) {
        console.error('Error:', error.message);
    } else if (data && data.length > 0) {
        console.log('Columns in found_items:', Object.keys(data[0]));
    } else {
        console.log('found_items table is empty.');
    }
}

checkFoundSchema();
