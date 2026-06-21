const router = require('express').Router();
const Resource = require('../models/Resource');
const ReferralCentre = require('../models/ReferralCentre');
const authMiddleware = require('../middlewares/authMiddleware');

// Get all resources with search and language filters
router.get('/', async (req, res) => {
  try {
    const { search, lang } = req.query;
    const activeLang = lang || 'en';
    let query = { isActive: true };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { 'title.en': searchRegex },
        { 'title.hi': searchRegex },
        { 'description.en': searchRegex },
        { 'description.hi': searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const resources = await Resource.find(query);
    
    // Map resources to expected localized frontend structure
    const localizedResources = resources.map(r => {
      const titleStr = r.title[activeLang] || r.title.en;
      const descStr = r.description[activeLang] || r.description.en;
      return {
        id: r._id.toString(),
        category: r.category,
        title: titleStr,
        name: titleStr,
        content: descStr,
        desc: descStr,
        summary: descStr,
        iconName: r.tags.includes('eviction') ? 'Scale' : (r.tags.includes('deposit') ? 'Shield' : 'TrendingUp'),
        eligibility: activeLang === 'hi' ? 'EWS/LIG/MIG पात्रता' : 'EWS/LIG/MIG Eligible',
        sourceUrl: r.sourceUrl,
        tags: r.tags
      };
    });

    return res.status(200).json(localizedResources);
  } catch (error) {
    console.error('Get Resources Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get referral centres
router.get('/referrals', async (req, res) => {
  try {
    const { type, city, lang } = req.query;
    const activeLang = lang || 'en';
    let query = {};

    if (type) {
      query.type = type;
    }
    if (city && city.trim() !== '') {
      // Case insensitive match for city
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    const referrals = await ReferralCentre.find(query);
    
    // Localize referral centres to prevent rendering objects directly
    const localizedReferrals = referrals.map(ref => ({
      id: ref._id.toString(),
      name: ref.name[activeLang] || ref.name.en,
      address: ref.address ? (ref.address[activeLang] || ref.address.en) : '',
      phone: ref.phone || '',
      additionalPhone: ref.additionalPhone || '',
      website: ref.website || '',
      type: ref.type,
      city: ref.city,
      state: ref.state,
      note: ref.note ? (ref.note[activeLang] || ref.note.en) : ''
    }));

    return res.status(200).json(localizedReferrals);
  } catch (error) {
    console.error('Get Referrals Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Bookmark a resource
router.post('/bookmark/:resourceId', authMiddleware, async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (!req.user.bookmarks.includes(resourceId)) {
      req.user.bookmarks.push(resourceId);
      await req.user.save();
    }

    return res.status(200).json({ success: true, bookmarks: req.user.bookmarks });
  } catch (error) {
    console.error('Bookmark Resource Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Remove bookmark
router.delete('/bookmark/:resourceId', authMiddleware, async (req, res) => {
  try {
    const { resourceId } = req.params;

    req.user.bookmarks = req.user.bookmarks.filter(id => id.toString() !== resourceId);
    await req.user.save();

    return res.status(200).json({ success: true, bookmarks: req.user.bookmarks });
  } catch (error) {
    console.error('Remove Bookmark Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
