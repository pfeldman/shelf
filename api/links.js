const { connectDB, Link, Category, serialize } = require('./_db');
const { processLink } = require('./_process');
const { verifyAuth } = require('./_auth');

module.exports = async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();

  // GET /api/links — list links, optionally filter by category_id
  if (req.method === 'GET') {
    try {
      const { category_id } = req.query;
      const query = { user_id: user.id };
      if (category_id) query.category_id = category_id;
      const links = await Link.find(query).sort({ submitted_at: -1 }).lean();
      return res.json(links.map(doc => {
        doc._id = doc._id.toString();
        if (doc.category_id) doc.category_id = doc.category_id.toString();
        return doc;
      }));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/links — create a new link and process inline
  if (req.method === 'POST') {
    try {
      // Accept URL from query param, JSON body, or plain text
      let resolvedUrl = req.query.url;
      if (!resolvedUrl && req.body) {
        resolvedUrl = req.body.url || req.body.text;
      }
      if (!resolvedUrl) {
        return res.status(400).json({ error: 'No URL provided' });
      }

      const doc = await Link.create({
        user_id: user.id,
        url: resolvedUrl.trim(),
        status: 'pending',
        error_message: null,
        category_id: null,
        submitted_at: new Date(),
        processed_at: null,
        source_type: null,
        title: null,
        summary: null,
        thumbnail: null,
        extension_data: {},
      });

      // Return immediately to the client
      const response = serialize(doc);

      // Process inline (synchronously within this request)
      try {
        const updates = await processLink(doc, Category, user.id);
        await Link.updateOne({ _id: doc._id }, { $set: updates });
        Object.assign(response, updates);
        if (response.category_id) response.category_id = response.category_id.toString();
      } catch (processErr) {
        await Link.updateOne({ _id: doc._id }, {
          $set: { status: 'error', error_message: String(processErr.message).slice(0, 500) }
        });
        response.status = 'error';
        response.error_message = processErr.message;
      }

      return res.json(response);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/links — not used at this level (individual delete is in [id].js)
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
