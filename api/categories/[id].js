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

  // PUT /api/categories/:id — update a category
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

  // DELETE /api/categories/:id — delete a category
  if (req.method === 'DELETE') {
    try {
      const result = await Category.findOneAndDelete({ _id: id, user_id: user.id });
      if (!result) return res.status(404).json({ error: 'Category not found' });
      return res.json({ deleted: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
