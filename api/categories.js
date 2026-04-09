const { connectDB, Category, serialize } = require('./_db');
const { verifyAuth } = require('./_auth');

module.exports = async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();

  // GET /api/categories — list own + shared categories
  if (req.method === 'GET') {
    try {
      // Own categories
      const ownCategories = await Category.find({ user_id: user.id }).sort({ name: 1 });
      const ownSerialized = ownCategories.map(c => {
        const s = serialize(c);
        s.isOwner = true;
        s.isShared = !!(s.shared_with && s.shared_with.length > 0);
        return s;
      });

      // Categories shared with this user
      const sharedCategories = await Category.find({
        'shared_with.user_id': user.id
      }).sort({ name: 1 });
      const sharedSerialized = sharedCategories.map(c => {
        const s = serialize(c);
        s.isOwner = false;
        s.isShared = true;
        return s;
      });

      return res.json([...ownSerialized, ...sharedSerialized]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/categories — create a category
  if (req.method === 'POST') {
    try {
      const { name, slug, extension_type } = req.body || {};
      if (!name || !slug) {
        return res.status(400).json({ error: 'name and slug are required' });
      }

      // Return existing if slug already exists for this user
      const existing = await Category.findOne({ slug, user_id: user.id });
      if (existing) return res.json(serialize(existing));

      const doc = await Category.create({
        user_id: user.id,
        name,
        slug,
        extension_type: extension_type || 'generic',
        created_at: new Date(),
      });

      return res.json(serialize(doc));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
