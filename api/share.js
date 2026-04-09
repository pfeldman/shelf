const { connectDB, Link, Category, serialize } = require('./_db');
const { processLink } = require('./_process');
const { getSupabaseAdmin } = require('./_auth');

/**
 * POST /api/share — Unauthenticated endpoint for iOS Share Extension.
 *
 * Accepts a URL + API key instead of a Bearer token.
 * Creates a link associated with the user's Supabase account (looked up via
 * the SHARE_DEFAULT_USER_ID env var, or the first user if not set).
 *
 * Body: { url: string, api_key: string, language?: string }
 */
module.exports = async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate API key
  const expectedKey = process.env.SHARE_API_KEY;
  if (!expectedKey) {
    console.error('SHARE_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { url, api_key, language = 'en' } = req.body || {};

  if (!api_key || api_key !== expectedKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  // Determine the user ID for the shared link
  const userId = process.env.SHARE_DEFAULT_USER_ID;
  if (!userId) {
    console.error('SHARE_DEFAULT_USER_ID environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  await connectDB();

  try {
    const doc = await Link.create({
      user_id: userId,
      url: url.trim(),
      status: 'pending',
      error_message: null,
      category_id: null,
      submitted_at: new Date(),
      processed_at: null,
      source_type: null,
      title: null,
      summary: null,
      thumbnail: null,
      extension_data: { source: 'share-extension' },
      language: language,
    });

    const response = serialize(doc);

    // Process inline (same as links.js)
    try {
      const updates = await processLink(doc, Category, userId, Link, language);
      if (updates.status === 'processing') {
        Object.assign(response, updates);
        return res.json(response);
      }
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
    console.error('Share endpoint error:', err);
    return res.status(500).json({ error: err.message });
  }
};
