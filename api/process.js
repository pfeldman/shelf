const { connectDB, Link, Category, serialize } = require('./_db');
const { processLink } = require('./_process');

module.exports = async function handler(req, res) {
  await connectDB();

  // POST /api/process — reprocess a link by ID
  if (req.method === 'POST') {
    try {
      const { id } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: 'Missing link ID' });
      }

      const link = await Link.findById(id);
      if (!link) {
        return res.status(404).json({ error: 'Link not found' });
      }

      // Mark as processing
      await Link.updateOne({ _id: link._id }, {
        $set: {
          status: 'processing',
          processing_started_at: new Date(),
          processing_step: 'Starting...',
        }
      });

      try {
        const updates = await processLink(link, Category);
        await Link.updateOne({ _id: link._id }, { $set: updates });
        const final = await Link.findById(id).lean();
        final._id = final._id.toString();
        if (final.category_id) final.category_id = final.category_id.toString();
        return res.json(final);
      } catch (processErr) {
        await Link.updateOne({ _id: link._id }, {
          $set: { status: 'error', error_message: String(processErr.message).slice(0, 500) }
        });
        return res.status(500).json({ error: processErr.message });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
