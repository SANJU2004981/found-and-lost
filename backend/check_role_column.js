const supabase = require('./config/supabase');

async function checkUsersTable() {
    try {
        console.log('Checking users table structure...');
        
        // Try to fetch one row to see columns
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            console.error('Error fetching users table:', error.message);
            return;
        }

        console.log(`Found ${data.length} users in public.users table.`);
        data.forEach(user => {
            console.log(`ID: ${user.id} | Email: ${user.email} | Role: ${user.role}`);
        });

        if (data.length > 0) {
            console.log('RESULT: USERS_FOUND');
        } else {
            console.log('RESULT: TABLE_EMPTY');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkUsersTable();
