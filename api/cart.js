const { connectDB, CartItem, serialize } = require('./_db');
const { verifyAuth } = require('./_auth');

function capitalizeItem(text) {
  if (!text) return text;
  return text[0].toUpperCase() + text.slice(1);
}

module.exports = async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();

  // GET /api/cart — list cart items
  if (req.method === 'GET') {
    try {
      const items = await CartItem.find({ user_id: user.id }).sort({ completed: 1, added_at: 1 });
      return res.json(items.map(serialize));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/cart — add item(s) to cart
  if (req.method === 'POST') {
    try {
      const body = req.body || {};

      // Single item
      if (body.text) {
        const doc = await CartItem.create({
          user_id: user.id,
          text: capitalizeItem(body.text.trim()),
          completed: false,
          from_link_id: null,
          added_at: new Date(),
        });
        return res.json(serialize(doc));
      }

      // Batch items
      if (body.items && Array.isArray(body.items)) {
        const now = new Date();
        const fromLinkId = body.from_link_id || null;
        const docs = body.items
          .filter(item => item && item.trim())
          .map(item => ({
            user_id: user.id,
            text: capitalizeItem(item.trim()),
            completed: false,
            from_link_id: fromLinkId,
            added_at: now,
          }));

        if (docs.length === 0) {
          return res.status(400).json({ error: 'No items provided' });
        }

        const result = await CartItem.insertMany(docs);
        return res.json(result.map(serialize));
      }

      return res.status(400).json({ error: 'Provide "text" or "items"' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/cart — clear completed items
  if (req.method === 'DELETE') {
    try {
      const result = await CartItem.deleteMany({ user_id: user.id, completed: true });
      return res.json({ deleted: result.deletedCount });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
