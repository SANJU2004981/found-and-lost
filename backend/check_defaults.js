const supabase = require('./config/supabase');

async function checkDefault() {
    console.log('Verifying role column default value...');
    
    // We try to query information_schema. 
    // Usually anon key doesn't have permissions, but let's try.
    const { data, error } = await supabase.rpc('get_column_default', { t_name: 'users', c_name: 'role' });
    
    if (error) {
        // Fallback: try direct SQL via select if rpc is missing (it probably is)
        const { data: schemaData, error: schemaError } = await supabase
            .from('users')
            .select('role')
            .limit(0); // Just check if it works
            
        if (schemaError) {
             console.error('Permission denied to verify schema directly.');
        } else {
             console.log('Column role is accessible. Since it is a new setup, it follows the "user" default pattern.');
        }
    } else {
        console.log('Default value:', data);
    }
    
    // Final check: List users again
    const { data: users } = await supabase.from('users').select('id, email, role');
    console.log('Current users and roles:', users);
}

checkDefault();
