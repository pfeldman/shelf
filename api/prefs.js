const { connectDB, UserPref } = require('./_db');
const { verifyAuth } = require('./_auth');

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'pt', 'de', 'it', 'ja', 'ko', 'zh', 'nl', 'ru', 'ar', 'hi', 'tr'];

/**
 * GET  /api/prefs  -> { language }
 * PUT  /api/prefs  <- { language }
 *
 * The language the user wants their content written in. The client picks it in
 * settings; it lives here so the video worker, which never sees the browser,
 * can write a recipe in Spanish even when the video is in English.
 */
module.exports = async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();

  if (req.method === 'GET') {
    try {
      const pref = await UserPref.findOne({ user_id: user.id }).lean();
      return res.json({
        language: (pref && pref.language) || null,
        category_order: (pref && pref.category_order) || null,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const { language, category_order } = req.body || {};

      // Either field can be sent on its own, so a language change never wipes
      // the saved order and vice versa.
      const updates = { updated_at: new Date() };

      if (language !== undefined) {
        if (!SUPPORTED_LANGUAGES.includes(language)) {
          return res.status(400).json({ error: 'Unsupported language' });
        }
        updates.language = language;
      }

      if (category_order !== undefined) {
        if (!Array.isArray(category_order) || category_order.length > 200
            || category_order.some(id => typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id))) {
          return res.status(400).json({ error: 'category_order must be an array of category ids' });
        }
        updates.category_order = category_order;
      }

      if (Object.keys(updates).length === 1) {
        return res.status(400).json({ error: 'Nothing to update' });
      }

      const pref = await UserPref.findOneAndUpdate(
        { user_id: user.id },
        { $set: updates },
        { new: true, upsert: true }
      );

      return res.json({ language: pref.language, category_order: pref.category_order || null });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
};
