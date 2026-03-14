const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { sendEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');

// Send a new message
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { item_id, receiver_id, message_text } = req.body;
        const sender_id = req.user.id;

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
            return res.status(400).json({ error: error.message });
        }

        // Fetch receiver's email from the users table
        const { data: receiverData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', receiver_id)
            .single();

        if (receiverData && receiverData.email) {
            const subject = "You've received a new message!";
            const text = "A new message has arrived regarding your item.\n\nPlease log in to your account to view it and reply.";
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
        res.status(500).json({ error: 'Server error sending message.' });
    }
});

// Get all messages for a specific item
router.get('/:item_id', authMiddleware, async (req, res) => {
    try {
        const { item_id } = req.params;

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('item_id', item_id)
            .order('created_at', { ascending: true }); // Chronological order 

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching messages.' });
    }
});

module.exports = router;
