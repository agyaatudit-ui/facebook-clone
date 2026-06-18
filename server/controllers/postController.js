const Post = require('../models/Post');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const post = await Post.create({ user: req.user._id, text, image });
    const populated = await Post.findById(post._id).populate('user', 'firstName lastName avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendIds = user.friends.map(f => f.toString());
    friendIds.push(req.user._id.toString());
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const posts = await Post.find({ user: { $in: friendIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'firstName lastName avatar')
      .populate('comments.user', 'firstName lastName avatar');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName avatar')
      .populate('comments.user', 'firstName lastName avatar');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const index = post.likes.indexOf(req.user._id);
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user._id);
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({ user: post.user, from: req.user._id, type: 'like', post: post._id });
      }
    }
    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = { user: req.user._id, text };
    post.comments.push(comment);
    await post.save();
    const updated = await Post.findById(post._id)
      .populate('comments.user', 'firstName lastName avatar');
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({ user: post.user, from: req.user._id, type: 'comment', post: post._id });
    }
    res.json(updated.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
