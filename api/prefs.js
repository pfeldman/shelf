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
      return res.json({ language: (pref && pref.language) || null });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const { language } = req.body || {};
      if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
        return res.status(400).json({ error: 'Unsupported language' });
      }

      const pref = await UserPref.findOneAndUpdate(
        { user_id: user.id },
        { $set: { language, updated_at: new Date() } },
        { new: true, upsert: true }
      );

      return res.json({ language: pref.language });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
};
