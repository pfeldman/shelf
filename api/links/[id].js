const { connectDB, Link, Category, serialize } = require('../_db');
const { processLink } = require('../_process');
const { verifyAuth } = require('../_auth');

// Helper: check if user can access a link (own link or in a shared category)
async function canAccessLink(link, userId) {
  if (link.user_id === userId) return true;
  if (link.category_id) {
    const category = await Category.findById(link.category_id);
    if (category) {
      const isOwner = category.user_id === userId;
      const isMember = (category.shared_with || []).some(sw => sw.user_id === userId);
      return isOwner || isMember;
    }
  }
  return false;
}

module.exports = async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing link ID' });
  }

  // GET /api/links/:id — get a single link (own or in shared category)
  if (req.method === 'GET') {
    try {
      const link = await Link.findById(id).lean();
      if (!link) return res.status(404).json({ error: 'Link not found' });
      const hasAccess = await canAccessLink(link, user.id);
      if (!hasAccess) return res.status(404).json({ error: 'Link not found' });
      link._id = link._id.toString();
      if (link.category_id) link.category_id = link.category_id.toString();
      return res.json(link);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH /api/links/:id — update a link
  if (req.method === 'PATCH') {
    try {
      const updates = req.body || {};
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // If status is set back to 'pending', trigger reprocessing
      const shouldReprocess = updates.status === 'pending';

      const result = await Link.findOneAndUpdate(
        { _id: id, user_id: user.id },
        { $set: updates },
        { new: true }
      );
      if (!result) return res.status(404).json({ error: 'Link not found' });

      if (shouldReprocess) {
        try {
          const processUpdates = await processLink(result, Category, user.id, undefined, result.language || 'en');
          await Link.updateOne({ _id: result._id }, { $set: processUpdates });
          const final = await Link.findById(id).lean();
          final._id = final._id.toString();
          if (final.category_id) final.category_id = final.category_id.toString();
          return res.json(final);
        } catch (processErr) {
          await Link.updateOne({ _id: result._id }, {
            $set: { status: 'error', error_message: String(processErr.message).slice(0, 500) }
          });
          const final = await Link.findById(id).lean();
          final._id = final._id.toString();
          if (final.category_id) final.category_id = final.category_id.toString();
          return res.json(final);
        }
      }

      return res.json(serialize(result));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT /api/links/:id — full update
  if (req.method === 'PUT') {
    try {
      const updates = req.body || {};
      const result = await Link.findOneAndUpdate(
        { _id: id, user_id: user.id },
        { $set: updates },
        { new: true }
      );
      if (!result) return res.status(404).json({ error: 'Link not found' });
      return res.json(serialize(result));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/links/:id — delete a link
  if (req.method === 'DELETE') {
    try {
      const result = await Link.findOneAndDelete({ _id: id, user_id: user.id });
      if (!result) return res.status(404).json({ error: 'Link not found' });
      return res.json({ deleted: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'GET, PATCH, PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
