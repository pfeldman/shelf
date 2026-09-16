const mongoose = require('mongoose');

let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'linker',
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ── Schemas ──

const linkSchema = new mongoose.Schema({
  user_id: { type: String },
  url: { type: String, required: true },
  status: { type: String, default: 'pending' },
  error_message: { type: String, default: null },
  category_id: { type: mongoose.Schema.Types.ObjectId, default: null },
  submitted_at: { type: Date, default: Date.now },
  processed_at: { type: Date, default: null },
  processing_started_at: { type: Date, default: null },
  processing_step: { type: String, default: null },
  source_type: { type: String, default: null },
  title: { type: String, default: null },
  summary: { type: String, default: null },
  thumbnail: { type: String, default: null },
  extension_data: { type: mongoose.Schema.Types.Mixed, default: {} },
  // null means "not specified": fall back to the user's saved preference.
  language: { type: String, default: null },
}, { collection: 'links', versionKey: false });

const categorySchema = new mongoose.Schema({
  user_id: { type: String },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  extension_type: { type: String, default: 'generic' },
  icon_svg: { type: String },
  shared_with: [{
    user_id: { type: String, required: true },
    email: { type: String, required: true },
  }],
  created_at: { type: Date, default: Date.now },
}, { collection: 'categories', versionKey: false });

// A slug is unique WITHIN one user, not globally. The collection used to carry
// a unique index on `slug` alone, which let the first user to claim a name
// block every other user from ever creating a category with it, failing their
// links with E11000. Declared here so the constraint cannot silently come back.
categorySchema.index({ user_id: 1, slug: 1 }, { unique: true });

// The language a user wants their content written in. It is a property of the
// person, not of the link: a recipe from an English video should still be
// stored in the language the user reads. Supabase owns identity, so this is the
// one place app-level preferences live.
const userPrefSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  language: { type: String, default: 'en' },
  updated_at: { type: Date, default: Date.now },
}, { collection: 'user_prefs', versionKey: false });

// Use existing models if they exist (hot-reload safe)
const Link = mongoose.models.Link || mongoose.model('Link', linkSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const UserPref = mongoose.models.UserPref || mongoose.model('UserPref', userPrefSchema);

/**
 * The language to write a link's content in.
 * The link's own value wins when set, since it records what the client asked
 * for at capture time; otherwise fall back to the user's saved preference.
 */
async function resolveLanguage(link, userId) {
  if (link && link.language) return link.language;
  if (!userId) return 'en';
  try {
    const pref = await UserPref.findOne({ user_id: userId }).lean();
    return (pref && pref.language) || 'en';
  } catch {
    return 'en';
  }
}

// ── Serialization helper ──
function serialize(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj._id) obj._id = obj._id.toString();
  if (obj.category_id) obj.category_id = obj.category_id.toString();
  return obj;
}

module.exports = { connectDB, Link, Category, UserPref, serialize, resolveLanguage };
