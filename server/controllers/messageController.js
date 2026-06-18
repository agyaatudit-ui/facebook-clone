const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'firstName lastName avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 }
    }).populate('participants', 'firstName lastName avatar');
    if (existing) return res.json(existing);
    const conversation = await Conversation.create({
      participants: [req.user._id, userId]
    });
    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'firstName lastName avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: Date.now()
    });
    const populated = await Message.findById(message._id)
      .populate('sender', 'firstName lastName avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
