const { connectDB, Link, Category } = require('./_db');
const { verifyAuth } = require('./_auth');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();

  try {
    // Delete all user's data from MongoDB
    await Link.deleteMany({ user_id: user.id });
    await Category.deleteMany({ user_id: user.id });

    // Delete Supabase auth account
    const supabaseAdmin = createClient(
      'https://fqelzbjdseukdujnxeqg.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) {
      return res.status(500).json({ error: 'Error deleting account' });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
