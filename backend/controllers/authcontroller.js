import jwt from 'jsonwebtoken';
import User from '../models/authmodel.js';



// Helper: sign a JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Helper: format user for response (strips password, adds id alias)
const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  bio: user.bio,
  avatar: user.avatar || '',
  is2FAEnabled: user.is2FAEnabled,
  isVerified: user.isVerified || false,
  isGoogleUser: !!user.googleId,
});


// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email. Please sign up first.', code: 'USER_NOT_FOUND' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

// PUT /api/auth/profile  (protected)
export const updateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.json({ user: formatUser(user) });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// PUT /api/auth/change-password  (protected)
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id);
    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// PUT /api/auth/toggle-2fa  (protected)
export const toggle2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.is2FAEnabled = !user.is2FAEnabled;
    await user.save();
    res.json({ user: formatUser(user) });
  } catch (err) {
    console.error('Toggle 2FA error:', err);
    res.status(500).json({ message: 'Server error toggling 2FA' });
  }
};

// DELETE /api/auth/account  (protected)
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};
// POST /api/auth/google
export const googleLogin = async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Fetch user info from Google using the access token
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` },
    });
    if (!googleRes.ok) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }
    const { sub: googleId, email, name, picture } = await googleRes.json();

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
        role: role || 'DONOR',
        isVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture || user.avatar;
      user.isVerified = true;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ message: 'Google sign-in failed' });
  }
};

