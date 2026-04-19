import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    user: { type: String },
    content: { type: String },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    avatar: { type: String, default: '🍁' },
    type: {
      type: String,
      enum: ['NORMAL', 'GOAL', 'ALERT'],
      default: 'NORMAL',
    },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replies: [replySchema],
    theme: {
      type: String,
      default: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
