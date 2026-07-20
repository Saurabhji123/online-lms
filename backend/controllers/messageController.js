const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get contacts list
// @route   GET /api/messages/contacts
// @access  Private
exports.getContacts = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('name email role');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get chat history
// @route   GET /api/messages/history/:contactId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const contactId = req.params.contactId;
    const selfId = req.user._id;

    const chatHistory = await Message.find({
      $or: [
        { senderId: selfId, receiverId: contactId },
        { senderId: contactId, receiverId: selfId }
      ]
    }).sort('createdAt');

    res.status(200).json({ success: true, data: chatHistory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Send a private message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!message || !receiverId) {
      return res.status(400).json({ success: false, error: 'Please enter message and receiver' });
    }

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      message
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('privateMessage', newMessage);
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
