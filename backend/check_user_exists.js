const supabase = require('./config/supabase');

async function checkUser(id) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) console.error(`User ${id} not found in public.users:`, error.message);
    else console.log(`User ${id} exists in public.users:`, data.email);
}

checkUser('112349af-95e5-4236-8dfb-d02c5fd23e11');
