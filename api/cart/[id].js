const { connectDB, CartItem, serialize } = require('../_db');
const { verifyAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing item ID' });
  }

  // PATCH /api/cart/:id — toggle completed status
  if (req.method === 'PATCH') {
    try {
      const doc = await CartItem.findOne({ _id: id, user_id: user.id });
      if (!doc) return res.status(404).json({ error: 'Item not found' });
      doc.completed = !doc.completed;
      await doc.save();
      return res.json(serialize(doc));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/cart/:id — delete a cart item
  if (req.method === 'DELETE') {
    try {
      const result = await CartItem.findOneAndDelete({ _id: id, user_id: user.id });
      if (!result) return res.status(404).json({ error: 'Item not found' });
      return res.json({ deleted: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
