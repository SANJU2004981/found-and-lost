const supabase = require('./config/supabase');

async function findUsers() {
    console.log('Searching for users who have posted items...');
    
    const { data: lost, error: lostErr } = await supabase.from('lost_items').select('user_id').limit(10);
    const { data: found, error: foundErr } = await supabase.from('found_items').select('user_id').limit(10);

    const userIds = new Set();
    if (lost) lost.forEach(i => userIds.add(i.user_id));
    if (found) found.forEach(i => userIds.add(i.user_id));

    console.log('Unique user IDs found:', Array.from(userIds));
}

findUsers();
