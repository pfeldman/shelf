const { connectDB, Category, serialize } = require('./_db');

module.exports = async function handler(req, res) {
  await connectDB();

  // GET /api/categories — list all categories
  if (req.method === 'GET') {
    try {
      const categories = await Category.find().sort({ name: 1 });
      return res.json(categories.map(serialize));
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

      // Return existing if slug already exists
      const existing = await Category.findOne({ slug });
      if (existing) return res.json(serialize(existing));

      const doc = await Category.create({
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
