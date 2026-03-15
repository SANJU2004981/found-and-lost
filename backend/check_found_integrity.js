const supabase = require('./config/supabase');

async function checkFoundItemsIntegrity() {
    console.log('--- FOUND_ITEMS INTEGRITY CHECK ---');
    const { data, error } = await supabase.from('found_items').select('id, user_id').limit(10);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Found ${data.length} items.`);
        data.forEach(item => {
            console.log(`Item ${item.id} - user_id: ${item.user_id}`);
        });
    }
}

checkFoundItemsIntegrity();
