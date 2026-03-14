const supabase = require('./config/supabase');

async function debugSchema() {
    console.log('--- SCHEMA DEBUG ---');
    
    // Check if table users exists and what its columns are
    // We can use a query that intentionally fails or use the RPC if accessible, 
    // but the simplest way is to try to fetch the role column.
    
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (error) {
        console.log('Error accessing public.users:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('ACTION: CREATE TABLE users');
        }
    } else {
        console.log('public.users table exists.');
        const sample = data[0];
        if (sample) {
            console.log('Existing columns:', Object.keys(sample).join(', '));
            if ('role' in sample) {
                console.log('Role column: EXISTS');
            } else {
                console.log('Role column: MISSING');
            }
        } else {
            console.log('Table is empty. Checking role column via select...');
            const { error: roleErr } = await supabase.from('users').select('role').limit(1);
            if (roleErr && roleErr.message.includes('column "role" does not exist')) {
                console.log('Role column: MISSING');
            } else {
                console.log('Role column: EXISTS or unknown');
            }
        }
    }
}

debugSchema();
