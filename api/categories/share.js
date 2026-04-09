const { connectDB, Category, serialize } = require('../_db');
const { verifyAuth, getSupabaseAdmin } = require('../_auth');

module.exports = async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();

  // POST /api/categories/share — share a category with a user by email
  if (req.method === 'POST') {
    try {
      const { categoryId, email } = req.body || {};
      if (!categoryId || !email) {
        return res.status(400).json({ error: 'categoryId and email are required' });
      }

      // Only the owner can share
      const category = await Category.findOne({ _id: categoryId, user_id: user.id });
      if (!category) {
        return res.status(404).json({ error: 'Category not found or not owned by you' });
      }

      // Cannot share with yourself
      if (email.toLowerCase() === (user.email || '').toLowerCase()) {
        return res.status(400).json({ error: 'Cannot share with yourself' });
      }

      // Look up user by email in Supabase
      const admin = getSupabaseAdmin();
      const { data, error } = await admin.auth.admin.listUsers();
      if (error) {
        return res.status(500).json({ error: 'Could not look up user' });
      }

      const targetUser = data.users.find(u =>
        (u.email || '').toLowerCase() === email.toLowerCase()
      );

      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if already shared
      const alreadyShared = (category.shared_with || []).some(
        sw => sw.user_id === targetUser.id
      );
      if (alreadyShared) {
        return res.json(serialize(category));
      }

      // Add to shared_with
      const result = await Category.findOneAndUpdate(
        { _id: categoryId, user_id: user.id },
        { $push: { shared_with: { user_id: targetUser.id, email: email.toLowerCase() } } },
        { new: true }
      );

      return res.json(serialize(result));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/categories/share — remove a user from shared category
  if (req.method === 'DELETE') {
    try {
      const { categoryId, userId, ownerId } = req.body || {};
      if (!categoryId) {
        return res.status(400).json({ error: 'categoryId is required' });
      }

      // Case 1: Owner removing a member
      if (userId) {
        const category = await Category.findOne({ _id: categoryId, user_id: user.id });
        if (!category) {
          return res.status(404).json({ error: 'Category not found or not owned by you' });
        }
        const result = await Category.findOneAndUpdate(
          { _id: categoryId, user_id: user.id },
          { $pull: { shared_with: { user_id: userId } } },
          { new: true }
        );
        return res.json(serialize(result));
      }

      // Case 2: Member leaving (ownerId provided)
      if (ownerId) {
        const category = await Category.findOne({ _id: categoryId, user_id: ownerId });
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        // Check the user is actually a member
        const isMember = (category.shared_with || []).some(sw => sw.user_id === user.id);
        if (!isMember) {
          return res.status(403).json({ error: 'You are not a member of this category' });
        }
        const result = await Category.findOneAndUpdate(
          { _id: categoryId, user_id: ownerId },
          { $pull: { shared_with: { user_id: user.id } } },
          { new: true }
        );
        return res.json(serialize(result));
      }

      return res.status(400).json({ error: 'userId or ownerId is required' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'POST, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
