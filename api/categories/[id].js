const { connectDB, Category, serialize } = require('../_db');
const { verifyAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing category ID' });
  }

  // GET /api/categories/:id — get a single category (owner or shared member)
  if (req.method === 'GET') {
    try {
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ error: 'Category not found' });

      const isOwner = category.user_id === user.id;
      const isMember = (category.shared_with || []).some(sw => sw.user_id === user.id);
      if (!isOwner && !isMember) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const s = serialize(category);
      s.isOwner = isOwner;
      s.isShared = !!(s.shared_with && s.shared_with.length > 0);
      return res.json(s);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT /api/categories/:id — update a category (owner only)
  if (req.method === 'PUT') {
    try {
      const updates = req.body || {};
      const result = await Category.findOneAndUpdate(
        { _id: id, user_id: user.id },
        { $set: updates },
        { new: true }
      );
      if (!result) return res.status(404).json({ error: 'Category not found' });
      return res.json(serialize(result));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/categories/:id — delete a category (owner only)
  if (req.method === 'DELETE') {
    try {
      const result = await Category.findOneAndDelete({ _id: id, user_id: user.id });
      if (!result) return res.status(404).json({ error: 'Category not found' });
      return res.json({ deleted: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
