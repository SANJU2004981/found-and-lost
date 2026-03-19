const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { sendEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');

// Send a new message
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { item_id, item_type, receiver_id, message_text } = req.body;
        const sender_id = req.user.id;
        const token = req.token;

        // Validate required fields
        if (!item_id || !item_type || !receiver_id || !message_text) {
            return res.status(400).json({
                error: 'Missing required fields: item_id, item_type, receiver_id, message_text',
            });
        }

        if (!['lost', 'found'].includes(item_type)) {
            return res.status(400).json({ error: `Invalid item_type: "${item_type}". Must be "lost" or "found".` });
        }

        // Create a scoped client with the user's token to satisfy RLS
        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        console.log('[CHAT] Sending message:', { item_id, item_type, sender_id, receiver_id });

        const { data, error } = await userSupabase
            .from('messages')
            .insert([
                {
                    item_id,
                    item_type,
                    sender_id,
                    receiver_id,
                    message_text,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('[CHAT] Supabase insert error:', error);
            return res.status(400).json({
                error: error.message,
                code: error.code
            });
        }

        // Fetch receiver's profile from the users table (using authenticated context)
        const { data: receiverData, error: profileError } = await userSupabase
            .from('users')
            .select('id, email, name')
            .eq('id', receiver_id)
            .single();

        if (profileError) {
            console.warn('[CHAT] Could not fetch receiver profile:', profileError.message);
            // We don't fail the message insert, but log it
        }

        if (receiverData && receiverData.email) {
            const subject = "You've received a new message!";
            const text = `A new message has arrived regarding your item.\n\nMessage preview: "${message_text}"\n\nPlease log in to your account to view it and reply.`;
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4CAF50;">New Message Received!</h2>
                    <p>A new message has arrived regarding your item.</p>
                    <p><strong>Message preview:</strong> "${message_text}"</p>
                    <p>Please log in to your account on Found & Lost to view the full conversation and reply.</p>
                </div>
            `;

            // Trigger the email service safely
            try {
                const emailResult = await sendEmail(receiverData.email, subject, text, html);
                if (!emailResult.success) {
                    console.log('Email delivery failed but message was saved:', emailResult.error);
                }
            } catch (emailErr) {
                console.error('Unexpected error while sending email:', emailErr);
            }
        }

        res.status(201).json({ message: 'Message sent successfully!', messageData: data[0] });
    } catch (err) {
        console.error('[CHAT] POST message server error:', err);
        res.status(500).json({ error: 'Server error sending message.' });
    }
});

// Get all messages for a specific item
router.get('/:item_id', authMiddleware, async (req, res) => {
    try {
        const { item_id } = req.params;
        const { item_type } = req.query;
        const token = req.token;

        // Create a scoped client with the user's token
        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        let query = userSupabase
            .from('messages')
            .select('*')
            .eq('item_id', item_id);

        if (item_type) {
            query = query.eq('item_type', item_type);
        }

        const { data, error } = await query.order('created_at', { ascending: true });

        if (error) {
            console.error('[CHAT] Supabase select error:', error);
            return res.status(400).json({
                error: error.message,
                code: error.code
            });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('[CHAT] GET messages error:', err);
        res.status(500).json({ error: 'Server error fetching messages.' });
    }
});

module.exports = router;
