const { connectDB, CartItem, serialize } = require('../_db');

function capitalizeItem(text) {
  if (!text) return text;
  return text[0].toUpperCase() + text.slice(1);
}

module.exports = async function handler(req, res) {
  await connectDB();

  // POST /api/cart/batch — add multiple items at once
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const items = body.items;
      const fromLinkId = body.from_link_id || null;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'items array is required' });
      }

      const now = new Date();
      const docs = items
        .filter(item => item && item.trim())
        .map(item => ({
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
