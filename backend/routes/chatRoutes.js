const router = require('express').Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Configure nodemailer transporter from env; fall back to Ethereal for development/testing
let transporter;
const configuredHost = process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.example.com';
if (configuredHost && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    console.log('Using configured SMTP host:', process.env.SMTP_HOST);
} else {
    // create a test account on Ethereal for development
    nodemailer.createTestAccount().then((testAccount) => {
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log('No SMTP configured — using Ethereal test account:', testAccount.user);
    }).catch(err => {
        console.error('Failed to create Ethereal test account:', err);
    });
}

// Helper to compute conversation id (sorted pair)
function makeConversationId(a, b) {
    const ids = [String(a), String(b)].sort();
    return ids.join('--');
}

// Get messages for a conversation (by otherUserId) optional itemId query param
router.get('/messages/:otherUserId', auth, async (req, res) => {
    try {
        const otherUserId = req.params.otherUserId;
        const { itemId } = req.query;
        
        // Find messages where:
        // (user is sender AND otherUser is receiver) OR
        // (otherUser is sender AND user is receiver)
        const query = {
            $or: [
                { senderId: req.user.id, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: req.user.id }
            ]
        };
        
        if (itemId) query.itemId = itemId;

        const messages = await Message.find(query)
            .sort({ timestamp: 1 })
            .limit(200)
            .lean();

        res.json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
});

// Send a message
router.post('/message', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'receiverId and content are required' });
        }

        const conversationId = makeConversationId(req.user.id, receiverId);

        const message = new Message({
            senderId: req.user.id,
            receiverId,
            conversationId,
            content,
            itemId: req.body.itemId || null
        });

        const saved = await message.save();

        // Attempt to notify receiver via email (non-blocking)
        (async () => {
            try {
                const receiver = await User.findById(receiverId).lean();
                if (receiver && receiver.email) {
                    const mailOptions = {
                        from: process.env.EMAIL_FROM || 'no-reply@example.com',
                        to: receiver.email,
                        subject: `New message from ${req.user.username || 'a user'}`,
                        text: `You have received a new message: "${content}"\n\nVisit the item page to reply.`
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            console.error('Error sending notification email:', err);
                        } else {
                            console.log('Notification email sent:', info && info.response);
                            const preview = nodemailer.getTestMessageUrl(info);
                            if (preview) console.log('Preview URL:', preview);
                        }
                    });
                }
            } catch (emailErr) {
                console.error('Failed to send notification email:', emailErr);
            }
        })();

        res.status(201).json(saved);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Send a test notification to the authenticated user's email
router.post('/notify-test', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user || !user.email) return res.status(400).json({ error: 'No email found for user' });

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'no-reply@example.com',
            to: user.email,
            subject: 'Test notification from Any-Rent',
            text: 'This is a test email to confirm notifications are working.'
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Test email failed:', err);
                return res.status(500).json({ error: 'Failed to send test email' });
            }
            console.log('Test email sent:', info && info.response);
            const preview = nodemailer.getTestMessageUrl(info);
            return res.json({ success: true, info, preview });
        });
    } catch (err) {
        console.error('Error in notify-test:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Inbox: list conversation partners with last message
router.get('/inbox', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new mongoose.Types.ObjectId(String(userId));

        // Aggregate to find the last message per conversation partner
        const conversations = await Message.aggregate([
            { $match: { $or: [{ senderId: userObjectId }, { receiverId: userObjectId }] } },
            { $project: { senderId: 1, receiverId: 1, content: 1, timestamp: 1, itemId: 1 } },
            { $sort: { timestamp: -1 } },
            { $group: {
                _id: {
                    partner: { $cond: [ { $eq: ['$senderId', userObjectId] }, '$receiverId', '$senderId' ] }
                },
                lastMessage: { $first: '$$ROOT' }
            }}
        ]).exec();

        // Populate partner info
        const results = await Promise.all(conversations.map(async (c) => {
            const partnerId = c._id.partner;
            const partner = await User.findById(partnerId).select('username email').lean();
            return { partner, lastMessage: c.lastMessage };
        }));

        res.json(results);
    } catch (err) {
        console.error('Error fetching inbox:', err);
        res.status(500).json({ error: 'Failed to fetch inbox' });
    }
});

module.exports = router;

