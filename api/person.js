const { verifyAuth } = require('./_auth');
const { connectDB, UserPref } = require('./_db');
const tmdb = require('./_tmdb');

/**
 * GET /api/person?id=<tmdb_person_id>
 *
 * The profile behind every director and cast member shown on a link: who they
 * are, and what else they made. Proxied through the API so the TMDB key stays
 * on the server and the response follows the user's language.
 */
module.exports = async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!tmdb.isConfigured()) {
    return res.status(503).json({ error: 'TMDB is not configured on the server' });
  }

  const { id } = req.query;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'A numeric person id is required' });
  }

  try {
    await connectDB();
    const pref = await UserPref.findOne({ user_id: user.id }).lean();
    const language = (pref && pref.language) || 'en';

    const person = await tmdb.getPerson(id, language);
    if (!person) return res.status(404).json({ error: 'Person not found' });

    // These profiles do not change minute to minute, and the screen is often
    // reopened while browsing a cast list.
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.json(person);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
