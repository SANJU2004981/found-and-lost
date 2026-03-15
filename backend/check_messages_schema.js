const supabase = require('./config/supabase');

async function checkMessagesSchema() {
    console.log('--- MESSAGES TABLE DEBUG ---');
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error accessing public.messages:', error.message);
    } else {
        console.log('public.messages table exists.');
        const sample = data[0];
        if (sample) {
            console.log('Existing columns:', Object.keys(sample).join(', '));
        } else {
            console.log('Table is empty. Cannot determine columns via sample.');
        }
    }
}

checkMessagesSchema();
