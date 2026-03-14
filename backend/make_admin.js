const supabase = require('./config/supabase');

async function createAdminUser() {
    const testUser = {
        id: '00000000-0000-0000-0000-000000000001', // Mock ID or real one if we had it
        email: 'admin@foundandlost.com',
        name: 'Super Admin',
        role: 'admin'
    };

    console.log('Attempting to create admin user in public.users...');
    
    // First, let's see if we can find ANY user in the system (auth.users)
    // We can't query auth.users directly via the anon-key Supabase client unless we have service role key.
    // But we can try to insert into public.users.
    
    const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([testUser])
        .select();

    if (insertError) {
        console.error('Error creating admin user:', insertError.message);
        if (insertError.message.includes('violates foreign key constraint')) {
            console.log('NOTE: The table likely has a foreign key to auth.users. We must use a real user ID.');
        }
    } else {
        console.log('SUCCESS: Admin user created/updated in public.users.');
        console.log(insertData);
    }
}

createAdminUser();
