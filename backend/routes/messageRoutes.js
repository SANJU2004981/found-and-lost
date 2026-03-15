const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { sendEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');

// Send a new message
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { item_id, receiver_id, message_text } = req.body;
        const sender_id = req.user.id;
        const token = req.token;

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

        console.log('[CHAT] Attempting to send message with user context:', { item_id, sender_id, receiver_id });

        const { data, error } = await userSupabase
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
            console.error('[CHAT] Supabase insert error:', error);
            return res.status(400).json({ 
                error: error.message, 
                code: error.code
            });
        }

        // Fetch receiver's email from the users table (using authenticated context)
        const { data: receiverData } = await userSupabase
            .from('users')
            .select('email')
            .eq('id', receiver_id)
            .single();

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

        const { data, error } = await userSupabase
            .from('messages')
            .select('*')
            .eq('item_id', item_id)
            .order('created_at', { ascending: true }); 

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
