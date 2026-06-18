const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'firstName lastName avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio, hometown, birthDate, gender } = req.body;
    const user = await User.findById(req.user._id);
    if (bio !== undefined) user.bio = bio;
    if (hometown !== undefined) user.hometown = hometown;
    if (birthDate !== undefined) user.birthDate = birthDate;
    if (gender !== undefined) user.gender = gender;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.user._id);
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.user._id);
    user.coverPhoto = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ coverPhoto: user.coverPhoto });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: req.user._id }
    }).select('firstName lastName avatar').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.friendRequests.some(r => r.from.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Request already sent' });
    }
    if (target.friends.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }
    target.friendRequests.push({ from: req.user._id, status: 'pending' });
    req.user.sentRequests.push(target._id);
    await target.save();
    await req.user.save();
    await Notification.create({ user: target._id, from: req.user._id, type: 'friend_request' });
    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    const request = req.user.friendRequests.find(
      r => r.from.toString() === target._id.toString() && r.status === 'pending'
    );
    if (!request) return res.status(400).json({ message: 'No pending request' });
    request.status = 'accepted';
    req.user.friends.push(target._id);
    target.friends.push(req.user._id);
    target.sentRequests = target.sentRequests.filter(id => id.toString() !== req.user._id.toString());
    await req.user.save();
    await target.save();
    await Notification.create({ user: target._id, from: req.user._id, type: 'friend_accept' });
    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.declineFriendRequest = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    req.user.friendRequests = req.user.friendRequests.filter(
      r => r.from.toString() !== target._id.toString()
    );
    target.sentRequests = target.sentRequests.filter(id => id.toString() !== req.user._id.toString());
    await req.user.save();
    await target.save();
    res.json({ message: 'Friend request declined' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unfriend = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    req.user.friends = req.user.friends.filter(id => id.toString() !== target._id.toString());
    target.friends = target.friends.filter(id => id.toString() !== req.user._id.toString());
    req.user.friendRequests = req.user.friendRequests.filter(
      r => r.from.toString() !== target._id.toString()
    );
    target.friendRequests = target.friendRequests.filter(
      r => r.from.toString() !== req.user._id.toString()
    );
    await req.user.save();
    await target.save();
    res.json({ message: 'Unfriended' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFriendSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends');
    const friendIds = user.friends.map(f => f._id.toString());
    friendIds.push(req.user._id.toString());
    const suggestions = await User.find({
      _id: { $nin: friendIds },
      'friendRequests.from': { $ne: req.user._id }
    })
      .select('firstName lastName avatar friends')
      .limit(10);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
