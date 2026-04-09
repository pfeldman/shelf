const { connectDB, Category, serialize } = require('../_db');

module.exports = async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing category ID' });
  }

  // PUT /api/categories/:id — update a category
  if (req.method === 'PUT') {
    try {
      const updates = req.body || {};
      const result = await Category.findByIdAndUpdate(id, { $set: updates }, { new: true });
      if (!result) return res.status(404).json({ error: 'Category not found' });
      return res.json(serialize(result));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/categories/:id — delete a category
  if (req.method === 'DELETE') {
    try {
      const result = await Category.findByIdAndDelete(id);
      if (!result) return res.status(404).json({ error: 'Category not found' });
      return res.json({ deleted: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
