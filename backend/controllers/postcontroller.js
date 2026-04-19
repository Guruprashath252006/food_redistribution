import Post from '../models/postmodel.js';

// GET /api/posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(
      posts.map((p) => {
        const obj = p.toObject();
        obj.id = obj._id.toString();
        obj.replies = (obj.replies || []).map((r) => ({ ...r, id: r._id?.toString() }));
        return obj;
      })
    );
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};

// POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

    const avatar = req.user.role === 'DONOR' ? '🏢' : '🏥';
    const theme =
      req.user.role === 'DONOR'
        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
        : 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400';

    const post = await Post.create({
      user: req.user.name,
      avatar,
      type: 'NORMAL',
      content: content.trim(),
      theme,
    });

    const obj = post.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

// PUT /api/posts/:id/like
export const likePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const obj = post.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ message: 'Server error liking post' });
  }
};

// POST /api/posts/:id/reply
export const replyToPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Reply content is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.replies.push({ user: req.user.name, content: content.trim() });
    await post.save();

    const obj = post.toObject();
    obj.id = obj._id.toString();
    obj.replies = (obj.replies || []).map((r) => ({ ...r, id: r._id?.toString() }));
    res.json(obj);
  } catch (err) {
    console.error('Reply to post error:', err);
    res.status(500).json({ message: 'Server error replying to post' });
  }
};
