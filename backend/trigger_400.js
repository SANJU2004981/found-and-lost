const supabase = require('./config/supabase');

async function trigger400() {
    const item_id = "7f98f152-ab0a-40fb-b79e-dcfb5e567541";
    const receiver_id = "a54336a0-ca8d-42fe-9d99-71095868eb98";
    const message_text = "hello";
    const sender_id = "60a87f58-0000-4000-8000-000000000000"; // Mock sender

    console.log('[DEBUG] Attempting insert with:', { item_id, sender_id, receiver_id, message_text });

    const { data, error } = await supabase
        .from('messages')
        .insert([
            {
                item_id,
                sender_id,
                receiver_id,
                message_text,
                created_at: new Date().toISOString()
            }
        ])
        .select();

    if (error) {
        console.error('[DEBUG] Insert Error:', error);
    } else {
        console.log('[DEBUG] Insert Success:', data);
    }
}

trigger400();
