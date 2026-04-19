import Listing from '../models/listingmodel.js';

// Helper: normalize ObjectId fields to string 'id' for frontend
const formatListing = (listing) => {
  const obj = listing.toObject({ virtuals: false });
  obj.id = obj._id.toString();
  obj.donorId = obj.donorId?.toString?.() || obj.donorId;
  obj.receiverId = obj.receiverId?.toString?.() || obj.receiverId;
  obj.requests = (obj.requests || []).map((r) => {
    const rid = r.receiverId?._id?.toString?.() || r.receiverId?.toString?.() || r.receiverId;
    return {
      ...r,
      id: r._id.toString(),
      receiverId: rid,
      receiverIsVerified: r.receiverId?.isVerified || false,
    };
  });
  return obj;
};

// GET /api/listings  — all listings (public)
export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('requests.receiverId', 'isVerified')
      .sort({ createdAt: -1 });
    res.json(listings.map(formatListing));
  } catch (err) {
    console.error('Get listings error:', err);
    res.status(500).json({ message: 'Server error fetching listings' });
  }
};

// POST /api/listings  — donor creates a listing (protected, role=DONOR)
export const createListing = async (req, res) => {
  try {
    if (req.user.role !== 'DONOR') {
      return res.status(403).json({ message: 'Only donors can create listings' });
    }

    const { title, category, quantity, unit, expiry, location, description, image } = req.body;

    if (!title || !quantity || !expiry || !location) {
      return res.status(400).json({ message: 'Title, quantity, expiry and location are required' });
    }

    // Map category to theme
    let theme = {};
    switch (category) {
      case 'Fresh Produce':
        theme = { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-400', iconBg: 'bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/60 dark:to-emerald-800/60' };
        break;
      case 'Bakery & Grains':
        theme = { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-400', iconBg: 'bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/60 dark:to-amber-800/60' };
        break;
      case 'Prepared Meals':
        theme = { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-400', iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-900/60 dark:to-indigo-800/60' };
        break;
      default:
        theme = { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', iconBg: 'bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700' };
    }

    const listing = await Listing.create({
      title: title.trim(),
      category: category || 'Fresh Produce',
      quantity: Number(quantity),
      unit: unit || 'KG',
      expiry,
      location: location.trim(),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=640',
      donorId: req.user._id,
      donorName: req.user.name,
      donorType: 'RETAILER',
      theme,
    });

    res.status(201).json(formatListing(listing));
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ message: 'Server error creating listing' });
  }
};

// POST /api/listings/:id/request  — receiver requests a listing (protected, role=RECEIVER)
export const requestListing = async (req, res) => {
  try {
    if (req.user.role !== 'RECEIVER') {
      return res.status(403).json({ message: 'Only receivers can request listings' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'AVAILABLE') return res.status(400).json({ message: 'Listing is no longer available' });

    // Check for existing active request from this user
    const existing = listing.requests.find(
      (r) =>
        r.receiverId.toString() === req.user._id.toString() &&
        !['REJECTED', 'CANCELLED'].includes(r.status)
    );
    if (existing) return res.status(400).json({ message: 'You already have an active request for this listing' });

    listing.requests.unshift({
      receiverId: req.user._id,
      receiverName: req.user.name,
      receiverEmail: req.user.email,
      message: (req.body.message || '').toString().slice(0, 240),
      status: 'PENDING',
    });

    await listing.save();
    res.json(formatListing(listing));
  } catch (err) {
    console.error('Request listing error:', err);
    res.status(500).json({ message: 'Server error requesting listing' });
  }
};

// PUT /api/listings/:id/request/:rid/cancel  — receiver cancels their own request
export const cancelRequest = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // Allow cancelling by receiverId match OR by requestId match
    const request = listing.requests.find((r) => {
      const matchById = r._id.toString() === req.params.rid;
      const matchByUser = r.receiverId.toString() === req.user._id.toString() && !['REJECTED', 'CANCELLED'].includes(r.status);
      return matchById || matchByUser;
    });

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (!['PENDING', 'VERIFIED'].includes(request.status)) {
      return res.status(400).json({ message: 'Only pending or verified requests can be cancelled' });
    }

    request.status = 'CANCELLED';
    request.cancelledAt = new Date();
    await listing.save();
    res.json(formatListing(listing));
  } catch (err) {
    console.error('Cancel request error:', err);
    res.status(500).json({ message: 'Server error cancelling request' });
  }
};

// PUT /api/listings/:id/request/:rid/verify  — donor verifies a pending request
export const verifyRequest = async (req, res) => {
  try {
    if (req.user.role !== 'DONOR') return res.status(403).json({ message: 'Only donors can verify requests' });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this listing' });
    }

    const request = listing.requests.id(req.params.rid);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ message: 'Only pending requests can be verified' });

    request.status = 'VERIFIED';
    request.verifiedAt = new Date();
    request.verifiedBy = req.user._id;
    await listing.save();
    res.json(formatListing(listing));
  } catch (err) {
    console.error('Verify request error:', err);
    res.status(500).json({ message: 'Server error verifying request' });
  }
};

// PUT /api/listings/:id/request/:rid/accept  — donor accepts a verified request
export const acceptRequest = async (req, res) => {
  try {
    if (req.user.role !== 'DONOR') return res.status(403).json({ message: 'Only donors can accept requests' });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this listing' });
    }
    if (listing.status !== 'AVAILABLE') return res.status(400).json({ message: 'Listing is not available' });

    const selected = listing.requests.id(req.params.rid);
    if (!selected) return res.status(404).json({ message: 'Request not found' });
    if (selected.status !== 'VERIFIED') return res.status(400).json({ message: 'Request must be verified before acceptance' });

    const acceptedAt = new Date();

    // Accept selected, reject all others that are still active
    listing.requests.forEach((r) => {
      if (r._id.toString() === req.params.rid) {
        r.status = 'ACCEPTED';
        r.acceptedAt = acceptedAt;
        r.acceptedBy = req.user._id;
      } else if (['PENDING', 'VERIFIED'].includes(r.status)) {
        r.status = 'REJECTED';
        r.rejectedAt = acceptedAt;
        r.rejectedBy = req.user._id;
      }
    });

    listing.status = 'ACCEPTED';
    listing.receiverId = selected.receiverId;
    listing.receiverName = selected.receiverName;
    listing.acceptedRequestId = selected._id;
    listing.acceptedAt = acceptedAt;
    await listing.save();
    res.json(formatListing(listing));
  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ message: 'Server error accepting request' });
  }
};

// PUT /api/listings/:id/request/:rid/reject  — donor rejects a specific request
export const rejectRequest = async (req, res) => {
  try {
    if (req.user.role !== 'DONOR') return res.status(403).json({ message: 'Only donors can reject requests' });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this listing' });
    }

    const request = listing.requests.id(req.params.rid);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (!['PENDING', 'VERIFIED'].includes(request.status)) {
      return res.status(400).json({ message: 'Request cannot be rejected in its current state' });
    }

    request.status = 'REJECTED';
    request.rejectedAt = new Date();
    request.rejectedBy = req.user._id;
    await listing.save();
    res.json(formatListing(listing));
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ message: 'Server error rejecting request' });
  }
};

// PUT /api/listings/:id/cancel  — receiver cancels their accepted pickup
export const cancelListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (req.user.role === 'RECEIVER') {
      if (listing.status !== 'ACCEPTED' || listing.receiverId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You cannot cancel this listing' });
      }

      // Cancel the accepted request
      const acceptedReq = listing.requests.id(listing.acceptedRequestId);
      if (acceptedReq) {
        acceptedReq.status = 'CANCELLED';
        acceptedReq.cancelledAt = new Date();
      }

      listing.status = 'AVAILABLE';
      listing.receiverId = null;
      listing.receiverName = null;
      listing.acceptedRequestId = null;
      listing.acceptedAt = null;
      await listing.save();
    } else {
      return res.status(403).json({ message: 'Only receivers can cancel pickups' });
    }

    res.json(formatListing(listing));
  } catch (err) {
    console.error('Cancel listing error:', err);
    res.status(500).json({ message: 'Server error cancelling listing' });
  }
};
