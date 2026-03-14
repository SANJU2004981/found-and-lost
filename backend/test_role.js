const supabase = require('./config/supabase');

async function testRoleColumn() {
    console.log('Testing role column existence...');
    
    // Attempt to insert with a role. If it fails with "column does not exist", we know.
    const { error } = await supabase
        .from('users')
        .insert([{ id: '00000000-0000-0000-0000-000000000abc', role: 'user' }]);

    if (error) {
        if (error.message.includes('column "role" of relation "users" does not exist')) {
            console.log('RESULT: ROLE_COLUMN_MISSING');
        } else if (error.message.includes('violates row-level security policy')) {
            console.log('RESULT: RLS_ACTIVE_ROLE_COLUMN_LIKELY_EXISTS');
        } else {
            console.log('RESULT: ERROR', error.message);
        }
    } else {
        console.log('RESULT: ROLE_COLUMN_EXISTS_AND_INSERT_WORKED (Wait, how?)');
    }
}

testRoleColumn();
