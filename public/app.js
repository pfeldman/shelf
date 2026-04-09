// ── Configuration ──
const API_BASE = "";
let supabase = null;

// ── State ──
let categories = [];
let linksCache = {};
let allLinks = [];

// ── i18n ──
const SUPPORTED_LOCALES = ['en', 'es', 'fr'];

const translations = {
  en: {
    // Home
    'home.subtitle': 'Your curated links',
    'home.collections': 'Collections',
    'home.processing': '{n} link{s} processing\u2026',
    'home.no_links': 'No links yet. Share something!',
    'home.could_not_load': 'Could not load data',
    'home.could_not_refresh': 'Could not refresh',
    // History
    'history.subtitle': 'Timeline',
    'history.title': 'Recent Activity',
    'history.no_links': 'No links saved yet',
    'history.could_not_load': 'Could not load history',
    'history.links_saved': '{n} link{s} saved',
    // Category
    'category.subtitle': 'Collection',
    'category.no_links': 'No links in this collection yet',
    'category.no_matches': 'No matches',
    'category.could_not_load': 'Could not load links',
    'category.search_placeholder': 'Search {name}\u2026',
    'category.search_movie': 'Search by title, actor, director\u2026',
    'category.search_recipe': 'Search by title or ingredient\u2026',
    'category.all': 'All',
    'category.link_count': '{n} link{s}',
    // Link detail
    'link.not_found': 'Link not found',
    'link.details': 'Details',
    'link.open_original': 'Open original',
    'link.recategorize': 'Recategorize',
    'link.delete_link': 'Delete link',
    'link.tv_show': 'TV Show',
    'link.movie': 'Movie',
    'link.watched': 'Watched',
    'link.not_watched': 'Not watched',
    'link.director': 'Director',
    'link.directors': 'Directors',
    'link.cast': 'Cast',
    'link.where_to_watch': 'Where to watch',
    'link.ingredients': 'Ingredients',
    'link.instructions': 'Instructions',
    'link.add_ingredients_cart': 'Add ingredients to cart',
    'link.pages': '{n} pages',
    'link.filmography': 'Filmography',
    'link.prep': 'Prep',
    'link.cook': 'Cook',
    'link.servings': 'Servings',
    // Cart
    'cart.subtitle': 'Grocery',
    'cart.title': 'Cart',
    'cart.add_placeholder': 'Add an item...',
    'cart.empty': 'Your cart is empty',
    'cart.could_not_load': 'Could not load cart',
    'cart.completed': 'Completed',
    'cart.clear_completed': 'Clear {n} completed',
    'cart.failed_add': 'Failed to add item',
    'cart.failed_update': 'Failed to update item',
    'cart.failed_delete': 'Failed to delete item',
    'cart.failed_clear': 'Failed to clear items',
    'cart.cleared': 'Cleared {n} item{s}',
    'cart.ingredients_added': '{n} ingredient{s} added to cart',
    // Voice
    'voice.subtitle': 'Grocery',
    'voice.title': 'Voice',
    'voice.tap_start': 'Tap to start listening',
    'voice.tap_again': 'Tap to listen again',
    'voice.listening_hint': 'Separate items with "y" or pause between them',
    'voice.add_to_cart': 'Add to cart',
    'voice.add_n_to_cart': 'Add {n} item{s} to cart',
    'voice.added': '{n} item{s} added to cart',
    'voice.failed_add': 'Failed to add items',
    'voice.not_supported': 'Speech recognition not supported',
    'voice.could_not_start': 'Could not start microphone',
    'voice.mic_error': 'Mic error: {err}',
    // Add link
    'add.title': 'Add to Shelf',
    'add.description': 'Paste a URL, type a movie name, a recipe, or anything you want to save.',
    'add.placeholder': 'e.g. Parasite 2019, https://example.com, or paste a full recipe\u2026',
    'add.cancel': 'Cancel',
    'add.submit': 'Submit',
    'add.submitting': 'Submitting\u2026',
    'add.success': 'Added! Processing\u2026',
    'add.failed': 'Failed to add',
    // Recategorize
    'recat.title': 'Recategorize as...',
    'recat.hint_placeholder': 'Optional: add details to help AI (e.g. "it\'s a Korean movie from 2019")',
    'recat.movie': 'Movie',
    'recat.tv': 'TV Show',
    'recat.short': 'Short Film',
    'recat.recipe': 'Recipe',
    'recat.documentary': 'Documentary',
    'recat.book': 'Book',
    'recat.director': 'Director',
    'recat.generic': 'Generic',
    'recat.retry': 'Retry (auto-detect)',
    'recat.processing': 'Processing...',
    'recat.success': 'Reprocessing...',
    'recat.failed': 'Failed to recategorize',
    // Delete
    'delete.title': 'Delete this link?',
    'delete.confirm': 'This action cannot be undone.',
    'delete.cancel': 'Cancel',
    'delete.delete': 'Delete',
    'delete.success': 'Link deleted',
    'delete.failed': 'Failed to delete',
    // Watch
    'watch.marked_watched': 'Marked as watched',
    'watch.marked_unwatched': 'Marked as not watched',
    'watch.failed': 'Failed to update',
    // Settings
    'settings.title': 'Settings',
    'settings.sign_out': 'Sign Out',
    'settings.delete_account': 'Delete Account',
    'settings.close': 'Close',
    'settings.language': 'Language',
    'settings.confirm_logout': 'Sign out?',
    'settings.confirm_delete_1': 'Are you sure you want to delete your account? All your data will be permanently erased.',
    'settings.confirm_delete_2': 'This action cannot be undone. Are you completely sure?',
    'settings.delete_error': 'Error deleting account',
    // Update banner
    'update.available': 'Update available',
    'update.refresh': 'Refresh',
    // Time
    'time.just_now': 'just now',
    'time.minutes_ago': '{n}m ago',
    'time.hours_ago': '{n}h ago',
    'time.yesterday': 'yesterday',
    'time.days_ago': '{n}d ago',
    'time.weeks_ago': '{n}w ago',
    'time.months_ago': '{n}mo ago',
    // Misc
    'uncategorized': 'Uncategorized',
  },
  es: {
    // Home
    'home.subtitle': 'Tus links curados',
    'home.collections': 'Colecciones',
    'home.processing': '{n} link{s} procesando\u2026',
    'home.no_links': 'No hay links todav\u00eda. \u00a1Compart\u00ed algo!',
    'home.could_not_load': 'No se pudieron cargar los datos',
    'home.could_not_refresh': 'No se pudo actualizar',
    // History
    'history.subtitle': 'Cronolog\u00eda',
    'history.title': 'Actividad reciente',
    'history.no_links': 'No hay links guardados a\u00fan',
    'history.could_not_load': 'No se pudo cargar el historial',
    'history.links_saved': '{n} link{s} guardado{s}',
    // Category
    'category.subtitle': 'Colecci\u00f3n',
    'category.no_links': 'No hay links en esta colecci\u00f3n todav\u00eda',
    'category.no_matches': 'Sin resultados',
    'category.could_not_load': 'No se pudieron cargar los links',
    'category.search_placeholder': 'Buscar en {name}\u2026',
    'category.search_movie': 'Buscar por t\u00edtulo, actor, director\u2026',
    'category.search_recipe': 'Buscar por t\u00edtulo o ingrediente\u2026',
    'category.all': 'Todos',
    'category.link_count': '{n} link{s}',
    // Link detail
    'link.not_found': 'Link no encontrado',
    'link.details': 'Detalles',
    'link.open_original': 'Abrir original',
    'link.recategorize': 'Recategorizar',
    'link.delete_link': 'Eliminar link',
    'link.tv_show': 'Serie',
    'link.movie': 'Pel\u00edcula',
    'link.watched': 'Vista',
    'link.not_watched': 'No vista',
    'link.director': 'Director',
    'link.directors': 'Directores',
    'link.cast': 'Elenco',
    'link.where_to_watch': 'D\u00f3nde ver',
    'link.ingredients': 'Ingredientes',
    'link.instructions': 'Instrucciones',
    'link.add_ingredients_cart': 'Agregar ingredientes al carrito',
    'link.pages': '{n} p\u00e1ginas',
    'link.filmography': 'Filmograf\u00eda',
    'link.prep': 'Prep',
    'link.cook': 'Cocci\u00f3n',
    'link.servings': 'Porciones',
    // Cart
    'cart.subtitle': 'Compras',
    'cart.title': 'Carrito',
    'cart.add_placeholder': 'Agregar un \u00edtem...',
    'cart.empty': 'Tu carrito est\u00e1 vac\u00edo',
    'cart.could_not_load': 'No se pudo cargar el carrito',
    'cart.completed': 'Completados',
    'cart.clear_completed': 'Limpiar {n} completado{s}',
    'cart.failed_add': 'No se pudo agregar el \u00edtem',
    'cart.failed_update': 'No se pudo actualizar el \u00edtem',
    'cart.failed_delete': 'No se pudo eliminar el \u00edtem',
    'cart.failed_clear': 'No se pudieron limpiar los \u00edtems',
    'cart.cleared': '{n} \u00edtem{s} limpiado{s}',
    'cart.ingredients_added': '{n} ingrediente{s} agregado{s} al carrito',
    // Voice
    'voice.subtitle': 'Compras',
    'voice.title': 'Voz',
    'voice.tap_start': 'Toc\u00e1 para empezar a escuchar',
    'voice.tap_again': 'Toc\u00e1 para escuchar de nuevo',
    'voice.listening_hint': 'Separ\u00e1 los \u00edtems con "y" o hac\u00e9 una pausa entre ellos',
    'voice.add_to_cart': 'Agregar al carrito',
    'voice.add_n_to_cart': 'Agregar {n} \u00edtem{s} al carrito',
    'voice.added': '{n} \u00edtem{s} agregado{s} al carrito',
    'voice.failed_add': 'No se pudieron agregar los \u00edtems',
    'voice.not_supported': 'Reconocimiento de voz no disponible',
    'voice.could_not_start': 'No se pudo iniciar el micr\u00f3fono',
    'voice.mic_error': 'Error de micr\u00f3fono: {err}',
    // Add link
    'add.title': 'Agregar a Shelf',
    'add.description': 'Peg\u00e1 una URL, escrib\u00ed un nombre de pel\u00edcula, una receta, o lo que quieras guardar.',
    'add.placeholder': 'Ej: Parasite 2019, https://ejemplo.com, o peg\u00e1 una receta\u2026',
    'add.cancel': 'Cancelar',
    'add.submit': 'Enviar',
    'add.submitting': 'Enviando\u2026',
    'add.success': '\u00a1Agregado! Procesando\u2026',
    'add.failed': 'No se pudo agregar',
    // Recategorize
    'recat.title': 'Recategorizar como...',
    'recat.hint_placeholder': 'Opcional: agreg\u00e1 detalles para ayudar a la IA (ej: "es una pel\u00edcula coreana de 2019")',
    'recat.movie': 'Pel\u00edcula',
    'recat.tv': 'Serie',
    'recat.short': 'Cortometraje',
    'recat.recipe': 'Receta',
    'recat.documentary': 'Documental',
    'recat.book': 'Libro',
    'recat.director': 'Director',
    'recat.generic': 'Gen\u00e9rico',
    'recat.retry': 'Reintentar (auto-detectar)',
    'recat.processing': 'Procesando...',
    'recat.success': 'Reprocesando...',
    'recat.failed': 'No se pudo recategorizar',
    // Delete
    'delete.title': '\u00bfEliminar este link?',
    'delete.confirm': 'Esta acci\u00f3n no se puede deshacer.',
    'delete.cancel': 'Cancelar',
    'delete.delete': 'Eliminar',
    'delete.success': 'Link eliminado',
    'delete.failed': 'No se pudo eliminar',
    // Watch
    'watch.marked_watched': 'Marcada como vista',
    'watch.marked_unwatched': 'Marcada como no vista',
    'watch.failed': 'No se pudo actualizar',
    // Settings
    'settings.title': 'Ajustes',
    'settings.sign_out': 'Cerrar sesi\u00f3n',
    'settings.delete_account': 'Eliminar cuenta',
    'settings.close': 'Cerrar',
    'settings.language': 'Idioma',
    'settings.confirm_logout': '\u00bfCerrar sesi\u00f3n?',
    'settings.confirm_delete_1': '\u00bfEst\u00e1s seguro de que quer\u00e9s eliminar tu cuenta? Todos tus datos se borrar\u00e1n permanentemente.',
    'settings.confirm_delete_2': 'Esta acci\u00f3n no se puede deshacer. \u00bfEst\u00e1s completamente seguro?',
    'settings.delete_error': 'Error al eliminar la cuenta',
    // Update banner
    'update.available': 'Actualizaci\u00f3n disponible',
    'update.refresh': 'Actualizar',
    // Time
    'time.just_now': 'reci\u00e9n',
    'time.minutes_ago': 'hace {n}m',
    'time.hours_ago': 'hace {n}h',
    'time.yesterday': 'ayer',
    'time.days_ago': 'hace {n}d',
    'time.weeks_ago': 'hace {n}sem',
    'time.months_ago': 'hace {n}m',
    // Misc
    'uncategorized': 'Sin categor\u00eda',
  },
  fr: {
    // Home
    'home.subtitle': 'Vos liens organis\u00e9s',
    'home.collections': 'Collections',
    'home.processing': '{n} lien{s} en cours\u2026',
    'home.no_links': "Pas encore de liens. Partagez quelque chose\u00a0!",
    'home.could_not_load': 'Impossible de charger les donn\u00e9es',
    'home.could_not_refresh': 'Impossible de rafra\u00eechir',
    // History
    'history.subtitle': 'Chronologie',
    'history.title': 'Activit\u00e9 r\u00e9cente',
    'history.no_links': 'Aucun lien enregistr\u00e9',
    'history.could_not_load': "Impossible de charger l'historique",
    'history.links_saved': '{n} lien{s} enregistr\u00e9{s}',
    // Category
    'category.subtitle': 'Collection',
    'category.no_links': 'Pas encore de liens dans cette collection',
    'category.no_matches': 'Aucun r\u00e9sultat',
    'category.could_not_load': 'Impossible de charger les liens',
    'category.search_placeholder': 'Rechercher dans {name}\u2026',
    'category.search_movie': 'Rechercher par titre, acteur, r\u00e9alisateur\u2026',
    'category.search_recipe': 'Rechercher par titre ou ingr\u00e9dient\u2026',
    'category.all': 'Tout',
    'category.link_count': '{n} lien{s}',
    // Link detail
    'link.not_found': 'Lien introuvable',
    'link.details': 'D\u00e9tails',
    'link.open_original': "Ouvrir l'original",
    'link.recategorize': 'Recat\u00e9goriser',
    'link.delete_link': 'Supprimer le lien',
    'link.tv_show': 'S\u00e9rie',
    'link.movie': 'Film',
    'link.watched': 'Vu',
    'link.not_watched': 'Non vu',
    'link.director': 'R\u00e9alisateur',
    'link.directors': 'R\u00e9alisateurs',
    'link.cast': 'Distribution',
    'link.where_to_watch': 'O\u00f9 regarder',
    'link.ingredients': 'Ingr\u00e9dients',
    'link.instructions': 'Instructions',
    'link.add_ingredients_cart': 'Ajouter les ingr\u00e9dients au panier',
    'link.pages': '{n} pages',
    'link.filmography': 'Filmographie',
    'link.prep': 'Pr\u00e9p',
    'link.cook': 'Cuisson',
    'link.servings': 'Portions',
    // Cart
    'cart.subtitle': 'Courses',
    'cart.title': 'Panier',
    'cart.add_placeholder': 'Ajouter un article...',
    'cart.empty': 'Votre panier est vide',
    'cart.could_not_load': 'Impossible de charger le panier',
    'cart.completed': 'Termin\u00e9s',
    'cart.clear_completed': 'Effacer {n} termin\u00e9{s}',
    'cart.failed_add': "Impossible d'ajouter l'article",
    'cart.failed_update': "Impossible de mettre \u00e0 jour l'article",
    'cart.failed_delete': "Impossible de supprimer l'article",
    'cart.failed_clear': 'Impossible de supprimer les articles',
    'cart.cleared': '{n} article{s} effac\u00e9{s}',
    'cart.ingredients_added': '{n} ingr\u00e9dient{s} ajout\u00e9{s} au panier',
    // Voice
    'voice.subtitle': 'Courses',
    'voice.title': 'Voix',
    'voice.tap_start': 'Appuyez pour commencer',
    'voice.tap_again': 'Appuyez pour r\u00e9\u00e9couter',
    'voice.listening_hint': 'S\u00e9parez les articles avec "et" ou faites une pause',
    'voice.add_to_cart': 'Ajouter au panier',
    'voice.add_n_to_cart': 'Ajouter {n} article{s} au panier',
    'voice.added': '{n} article{s} ajout\u00e9{s} au panier',
    'voice.failed_add': "Impossible d'ajouter les articles",
    'voice.not_supported': 'Reconnaissance vocale non disponible',
    'voice.could_not_start': 'Impossible de d\u00e9marrer le microphone',
    'voice.mic_error': 'Erreur micro\u00a0: {err}',
    // Add link
    'add.title': 'Ajouter \u00e0 Shelf',
    'add.description': 'Collez une URL, tapez un nom de film, une recette, ou ce que vous voulez sauvegarder.',
    'add.placeholder': 'Ex\u00a0: Parasite 2019, https://exemple.com, ou collez une recette\u2026',
    'add.cancel': 'Annuler',
    'add.submit': 'Envoyer',
    'add.submitting': 'Envoi en cours\u2026',
    'add.success': 'Ajout\u00e9\u00a0! Traitement\u2026',
    'add.failed': "Impossible d'ajouter",
    // Recategorize
    'recat.title': 'Recat\u00e9goriser en...',
    'recat.hint_placeholder': 'Optionnel\u00a0: ajoutez des d\u00e9tails pour aider l\'IA (ex\u00a0: "c\'est un film cor\u00e9en de 2019")',
    'recat.movie': 'Film',
    'recat.tv': 'S\u00e9rie',
    'recat.short': 'Court m\u00e9trage',
    'recat.recipe': 'Recette',
    'recat.documentary': 'Documentaire',
    'recat.book': 'Livre',
    'recat.director': 'R\u00e9alisateur',
    'recat.generic': 'G\u00e9n\u00e9rique',
    'recat.retry': 'R\u00e9essayer (auto-d\u00e9tection)',
    'recat.processing': 'Traitement...',
    'recat.success': 'Retraitement...',
    'recat.failed': 'Impossible de recat\u00e9goriser',
    // Delete
    'delete.title': 'Supprimer ce lien\u00a0?',
    'delete.confirm': 'Cette action est irr\u00e9versible.',
    'delete.cancel': 'Annuler',
    'delete.delete': 'Supprimer',
    'delete.success': 'Lien supprim\u00e9',
    'delete.failed': 'Impossible de supprimer',
    // Watch
    'watch.marked_watched': 'Marqu\u00e9 comme vu',
    'watch.marked_unwatched': 'Marqu\u00e9 comme non vu',
    'watch.failed': 'Impossible de mettre \u00e0 jour',
    // Settings
    'settings.title': 'Param\u00e8tres',
    'settings.sign_out': 'D\u00e9connexion',
    'settings.delete_account': 'Supprimer le compte',
    'settings.close': 'Fermer',
    'settings.language': 'Langue',
    'settings.confirm_logout': 'Se d\u00e9connecter\u00a0?',
    'settings.confirm_delete_1': '\u00cates-vous s\u00fbr de vouloir supprimer votre compte\u00a0? Toutes vos donn\u00e9es seront d\u00e9finitivement effac\u00e9es.',
    'settings.confirm_delete_2': 'Cette action est irr\u00e9versible. \u00cates-vous absolument s\u00fbr\u00a0?',
    'settings.delete_error': 'Erreur lors de la suppression du compte',
    // Update banner
    'update.available': 'Mise \u00e0 jour disponible',
    'update.refresh': 'Rafra\u00eechir',
    // Time
    'time.just_now': "\u00e0 l'instant",
    'time.minutes_ago': 'il y a {n}m',
    'time.hours_ago': 'il y a {n}h',
    'time.yesterday': 'hier',
    'time.days_ago': 'il y a {n}j',
    'time.weeks_ago': 'il y a {n}sem',
    'time.months_ago': 'il y a {n}m',
    // Misc
    'uncategorized': 'Non class\u00e9',
  },
};

function detectLocale() {
  const stored = localStorage.getItem('shelf_language');
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  const nav = (navigator.language || 'en').split('-')[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(nav)) return nav;
  return 'en';
}

let currentLocale = detectLocale();

function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  currentLocale = locale;
  localStorage.setItem('shelf_language', locale);
}

function t(key, params) {
  const str = (translations[currentLocale] && translations[currentLocale][key])
    || (translations.en && translations.en[key])
    || key;
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => {
    if (k === 's' && params.n !== undefined) return params.n !== 1 ? 's' : '';
    return params[k] !== undefined ? params[k] : '';
  });
}

function getLocale() {
  return currentLocale;
}

const VOICE_LANG_MAP = { en: 'en-US', es: 'es-ES', fr: 'fr-FR' };

// Authenticated fetch helper - adds Authorization header to all API calls
async function authFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = '/login.html';
    return;
  }
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${session.access_token}`
  };
  return fetch(url, { ...options, headers });
}

// ── Icons ──
const ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>',
  eyeOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeClosed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

const CAT_ICONS = {
  'movies-shows': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 7h5"/><path d="M2 12h20"/><path d="M2 17h5"/><path d="M17 7h5"/><path d="M17 17h5"/></svg>',
  'peliculas': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 7h5"/><path d="M2 12h20"/><path d="M2 17h5"/><path d="M17 7h5"/><path d="M17 17h5"/></svg>',
  'series': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="3"/><path d="M8 20h8"/><path d="M12 20v-2"/><polygon points="10,9 10,15 15,12"/></svg>',
  'recetas': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5-1.3c1.5.8 3.2 1.3 5 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 11c0-2.2 1.8-4 4-4"/><circle cx="12" cy="13" r="1"/><path d="M9 16s1.5 1 3 1 3-1 3-1"/></svg>',
  'recipes': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5-1.3c1.5.8 3.2 1.3 5 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 11c0-2.2 1.8-4 4-4"/><circle cx="12" cy="13" r="1"/><path d="M9 16s1.5 1 3 1 3-1 3-1"/></svg>',
  'cooking': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M9 3v3"/><path d="M15 3v3"/><path d="M4 10h16a1 1 0 011 1v1a8 8 0 01-5 7.4V21H8v-1.6A8 8 0 013 12v-1a1 1 0 011-1z"/></svg>',
  'music': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  'articles': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4v4H7z"/><path d="M13 7h4"/><path d="M13 11h4"/><path d="M7 15h10"/><path d="M7 19h7"/></svg>',
  'tech': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>',
  'news': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4v4H7z"/><path d="M13 7h4"/><path d="M13 11h4"/><path d="M7 15h10"/><path d="M7 19h7"/></svg>',
  'shopping': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
  'travel': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
  'fitness': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>',
  'books': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8"/><path d="M8 11h5"/></svg>',
  'libros': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8"/><path d="M8 11h5"/></svg>',
  'documentales': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>',
  'directores': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a6 6 0 0112 0v2"/><path d="M16 3l2-1"/><path d="M18 5l2-1"/></svg>',
  'podcasts': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  'games': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11h4"/><path d="M8 9v4"/><path d="M15 12h.01"/><path d="M18 10h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/></svg>',
  'cortometrajes': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><polygon points="10,8 10,14 15,11"/><line x1="2" y1="21" x2="22" y2="21"/></svg>',
  'diy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
  'default': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
};

function getCategoryIcon(slug, categoryObj) {
  // 1. Check for AI-generated custom icon_svg on the category object
  if (categoryObj && categoryObj.icon_svg) {
    try {
      const svg = categoryObj.icon_svg;
      // Basic validation: must contain at least one SVG element
      if (/<(path|circle|rect|line|polyline|polygon|ellipse)\b/.test(svg)) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
      }
    } catch {
      // Fall through to hardcoded icons
    }
  }
  // 2. Fall back to hardcoded icons map
  return CAT_ICONS[slug] || CAT_ICONS.default;
}

// ── API ──
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await authFetch(`${API_BASE}${path}`, opts);
  if (!res) return null; // redirected to login
  if (res.status === 401) {
    window.location.href = '/login.html';
    return null;
  }
  if (!res.ok && res.status !== 404) throw new Error(`API ${res.status}`);
  if (res.status === 404) return null;
  return res.json();
}

async function fetchCategories() {
  categories = await api('GET', '/api/categories') || [];
  return categories;
}

async function fetchLinks(categoryId) {
  const path = categoryId ? `/api/links?category_id=${categoryId}` : '/api/links';
  const links = await api('GET', path) || [];
  return links;
}

async function deleteLink(id) {
  await api('DELETE', `/api/links/${id}`);
}

async function patchLink(id, updates) {
  return await api('PATCH', `/api/links/${id}`, updates);
}

// ── Cart API ──
async function fetchCart() {
  return await api('GET', '/api/cart') || [];
}

async function addCartItem(text) {
  return await api('POST', '/api/cart', { text });
}

async function addCartBatch(items, fromLinkId) {
  const body = { items };
  if (fromLinkId) body.from_link_id = fromLinkId;
  return await api('POST', '/api/cart/batch', body);
}

async function toggleCartItem(id) {
  return await api('PATCH', `/api/cart/${id}`);
}

async function deleteCartItem(id) {
  return await api('DELETE', `/api/cart/${id}`);
}

async function clearCompletedCart() {
  return await api('DELETE', '/api/cart');
}

// ── Routing ──
function getRoute() {
  const hash = location.hash || '#/';
  if (hash === '#/') return { screen: 'home' };
  if (hash === '#/cart') return { screen: 'cart' };
  if (hash === '#/voice') return { screen: 'voice' };
  if (hash === '#/history') return { screen: 'history' };
  const catMatch = hash.match(/^#\/category\/(.+)$/);
  if (catMatch) return { screen: 'category', id: catMatch[1] };
  const linkMatch = hash.match(/^#\/link\/(.+)$/);
  if (linkMatch) return { screen: 'link', id: linkMatch[1] };
  return { screen: 'home' };
}

function navigate(hash) {
  location.hash = hash;
}

// ── Rendering ──
const app = document.getElementById('app');

function render() {
  const route = getRoute();
  const fab = document.getElementById('cart-fab');
  if (fab) fab.style.display = (route.screen === 'cart' || route.screen === 'voice') ? 'none' : '';
  switch (route.screen) {
    case 'home': renderHome(); break;
    case 'category': renderCategory(route.id); break;
    case 'link': renderLink(route.id); break;
    case 'cart': renderCart(); break;
    case 'voice': renderVoice(); break;
    case 'history': renderHistory(); break;
    default: renderHome();
  }
  updateCartBadge();
}

async function refreshHome() {
  const btn = document.getElementById('refresh-btn');
  if (btn) btn.classList.add('spinning');
  try {
    const [cats, links] = await Promise.all([fetchCategories(), fetchLinks()]);
    allLinks = links;
    // Only update content area, not the whole page
    const route = getRoute();
    if (route.screen === 'home') renderHomeContent(cats, links);
  } catch {
    showToast(t('home.could_not_refresh'));
  }
  if (btn) btn.classList.remove('spinning');
}

async function renderHome() {
  // Show skeleton immediately
  app.innerHTML = `
    <div class="screen">
      <div class="home-header">
        <div class="home-brand"><h1>Shelf</h1><p>${esc(t('home.subtitle'))}</p></div>
        <div class="home-header-actions">
          <button class="refresh-btn" id="refresh-btn" onclick="refreshHome()">${ICONS.refresh}</button>
          <button class="add-link-btn" onclick="showAddLink()">${ICONS.plus}</button>
          <button class="refresh-btn" onclick="showSettings()" aria-label="Settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg></button>
        </div>
      </div>
      <div id="home-content">
        <p class="section-label">${esc(t('home.collections'))}</p>
        <div class="category-grid">
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
        </div>
      </div>
    </div>`;

  try {
    const [cats, links] = await Promise.all([fetchCategories(), fetchLinks()]);
    allLinks = links;
    renderHomeContent(cats, links);
  } catch (e) {
    document.getElementById('home-content').innerHTML = `<div class="empty-state"><span class="empty-state-icon">\u26a0\ufe0f</span><p class="empty-state-text">${esc(t('home.could_not_load'))}</p></div>`;
  }
}

function renderHomeContent(cats, links) {
  const pending = links.filter(l => l.status === 'pending' || l.status === 'processing');
  const countByCategory = {};
  links.filter(l => l.status === 'done' && l.category_id).forEach(l => {
    countByCategory[l.category_id] = (countByCategory[l.category_id] || 0) + 1;
  });

  let html = '';

  if (pending.length) {
    html += `
      <div class="pending-banner" onclick="this.querySelector('.pending-list').classList.toggle('expanded')">
        <div class="pending-header">
          <div class="pending-spinner"></div>
          <span class="pending-text">${esc(t('home.processing', { n: pending.length }))}</span>
          <span class="pending-chevron">${ICONS.chevron}</span>
        </div>
        <div class="pending-list">
          ${pending.map(l => `<div class="pending-item"><span class="pending-url">${esc(getDomain(l.url) || l.url)}</span>${l.processing_step ? `<span class="pending-step">${esc(l.processing_step)}</span>` : ''}</div>`).join('')}
        </div>
      </div>`;
  }

  if (cats.length === 0 && pending.length === 0) {
    html += `
      <div class="empty-state">
        <span class="empty-state-icon">\ud83d\udced</span>
        <p class="empty-state-text">${esc(t('home.no_links'))}</p>
      </div>`;
  } else if (cats.length > 0) {
    const nonEmpty = cats.filter(cat => countByCategory[cat._id] > 0);
    if (nonEmpty.length > 0) {
      html += `<p class="section-label">${esc(t('home.collections'))}</p><div class="category-grid stagger">`;
      nonEmpty.forEach(cat => {
        const count = countByCategory[cat._id];
        html += `
          <div class="category-card" onclick="navigate('#/category/${cat._id}')">
            <span class="category-icon">${getCategoryIcon(cat.slug, cat)}</span>
            <div class="category-name">${esc(cat.name)}</div>
            <div class="category-count">${esc(t('category.link_count', { n: count }))}</div>
          </div>`;
      });
      html += '</div>';
    }

    // History feed link
    const doneLinks = links.filter(l => l.status === 'done');
    if (doneLinks.length > 0) {
      html += `
        <div class="history-link" onclick="navigate('#/history')">
          <span class="history-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
          <div class="history-link-text">
            <div class="history-link-title">${esc(t('history.title'))}</div>
            <div class="history-link-subtitle">${esc(t('history.links_saved', { n: doneLinks.length }))}</div>
          </div>
          <span class="history-link-chevron">${ICONS.chevron}</span>
        </div>`;
    }
  }

  document.getElementById('home-content').innerHTML = html;
}

let categoryFilteredLinks = [];
let categoryExtType = 'generic';
let categoryActiveGenre = null;

function renderCategoryLinks(done, extType, query) {
  const listEl = document.getElementById('links-list');
  if (!listEl) return;

  let pool = done;

  // Apply genre filter for movies
  if (categoryActiveGenre && extType === 'movie') {
    pool = pool.filter(l => {
      const names = (l.extension_data || {}).genre_names || [];
      return names.includes(categoryActiveGenre);
    });
  }

  const filtered = query
    ? pool.filter(l => {
        const q = query.toLowerCase();
        if ((l.title || l.url).toLowerCase().includes(q)) return true;
        const ext = l.extension_data || {};
        // Movies: search actors and directors
        if (extType === 'movie') {
          const cast = ext.cast || [];
          const dirs = ext.directors || [];
          if (cast.some(a => a.name.toLowerCase().includes(q))) return true;
          if (dirs.some(d => d.name.toLowerCase().includes(q))) return true;
        }
        // Recipes: search ingredients
        if (extType === 'recipe') {
          const ings = ext.ingredients || [];
          if (ings.some(i => i.toLowerCase().includes(q))) return true;
        }
        return false;
      })
    : pool;

  if (filtered.length === 0) {
    listEl.innerHTML = query
      ? `<div class="empty-state"><span class="empty-state-icon">\ud83d\udd0d</span><p class="empty-state-text">${esc(t('category.no_matches'))}</p></div>`
      : `<div class="empty-state"><span class="empty-state-icon">\ud83d\udcc2</span><p class="empty-state-text">${esc(t('category.no_links'))}</p></div>`;
    listEl.className = 'poster-grid';
    return;
  }

  listEl.innerHTML = filtered.map(link => {
    const ext = link.extension_data || {};
    const hasCover = extType === 'movie' || extType === 'book' || extType === 'director';
    const thumbUrl = hasCover ? (ext.poster_url || ext.cover_url || ext.photo_url) : (ext.poster_url || ext.cover_url || ext.photo_url || link.thumbnail);
    const img = thumbUrl
      ? `<img class="poster-img" src="${esc(thumbUrl)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const watched = ext.watched || false;
    const watchBadge = extType === 'movie'
      ? `<button class="poster-watch-btn ${watched ? 'watched' : ''}" onclick="event.stopPropagation(); toggleWatchedFromList('${link._id}', ${!watched})">${watched ? ICONS.eyeOpen : ICONS.eyeClosed}</button>`
      : '';
    const rating = ext.rating ? Number(ext.rating) : null;
    const ratingBadge = rating
      ? `<div class="poster-rating">★ ${rating.toFixed(1)}/10</div>`
      : '';
    return `
      <div class="poster-card ${watched ? 'is-watched' : ''}" onclick="navigate('#/link/${link._id}')">
        <div class="poster-frame">
          ${img}
          <div class="poster-fallback" ${thumbUrl ? 'style="display:none"' : ''}>${CAT_ICONS.default}</div>
          ${watchBadge}
          ${ratingBadge}
        </div>
        <div class="poster-title">${esc(link.title || link.url)}</div>
      </div>`;
  }).join('');
  listEl.className = query ? 'poster-grid' : 'poster-grid stagger';
}

function handleCategoryFilter(e) {
  renderCategoryLinks(categoryFilteredLinks, categoryExtType, e.target.value);
}

function filterByGenre(genre) {
  categoryActiveGenre = genre;
  // Update chip active states
  document.querySelectorAll('.genre-chip').forEach(btn => {
    const isAll = btn.textContent === t('category.all');
    btn.classList.toggle('active', genre === null ? isAll : btn.textContent === genre);
  });
  const query = (document.getElementById('category-search') || {}).value || '';
  renderCategoryLinks(categoryFilteredLinks, categoryExtType, query);
}

function clearCategoryFilter() {
  const input = document.getElementById('category-search');
  if (input) {
    input.value = '';
    renderCategoryLinks(categoryFilteredLinks, categoryExtType, '');
    input.focus();
  }
}

async function renderCategory(categoryId) {
  const cat = categories.find(c => c._id === categoryId);
  const catName = cat ? cat.name : 'Links';

  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="back-btn" onclick="navigate('#/')">${ICONS.back}</button>
        <div>
          <div class="header-subtitle">${esc(t('category.subtitle'))}</div>
          <div class="header-title">${esc(catName)}</div>
        </div>
      </div>
      <div class="category-search-wrap" id="category-search-wrap" style="display:none">
        <input type="text" id="category-search" class="category-search" placeholder="${esc(t('category.search_placeholder', { name: catName.toLowerCase() }))}" autocomplete="off" oninput="handleCategoryFilter(event)">
        <button class="category-search-clear" id="category-search-clear" onclick="clearCategoryFilter()">${ICONS.close}</button>
      </div>
      <div class="genre-filter-wrap" id="genre-filter-wrap" style="display:none"></div>
      <div class="poster-grid stagger" id="links-list">
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-poster"></div>
      </div>
    </div>`;

  try {
    const links = await fetchLinks(categoryId);
    linksCache = {};
    links.forEach(l => linksCache[l._id] = l);

    const done = links.filter(l => l.status === 'done');

    if (done.length === 0) {
      document.getElementById('links-list').innerHTML = `<div class="empty-state"><span class="empty-state-icon">\ud83d\udcc2</span><p class="empty-state-text">${esc(t('category.no_links'))}</p></div>`;
      return;
    }

    categoryExtType = cat ? cat.extension_type : 'generic';
    if (categoryExtType === 'movie') {
      done.sort((a, b) => {
        const aw = (a.extension_data || {}).watched ? 1 : 0;
        const bw = (b.extension_data || {}).watched ? 1 : 0;
        if (aw !== bw) return aw - bw;
        const ar = Number((a.extension_data || {}).rating) || 0;
        const br = Number((b.extension_data || {}).rating) || 0;
        return br - ar;
      });
    }

    categoryFilteredLinks = done;
    categoryActiveGenre = null;
    document.getElementById('category-search-wrap').style.display = '';

    // Build genre filter for movie categories
    if (categoryExtType === 'movie') {
      const genreSet = new Set();
      done.forEach(l => {
        const names = (l.extension_data || {}).genre_names || [];
        names.forEach(g => genreSet.add(g));
      });
      const genres = [...genreSet].sort();
      if (genres.length) {
        const wrap = document.getElementById('genre-filter-wrap');
        wrap.style.display = '';
        wrap.innerHTML = `<button class="genre-chip active" onclick="filterByGenre(null)">${esc(t('category.all'))}</button>` +
          genres.map(g => `<button class="genre-chip" onclick="filterByGenre('${esc(g)}')">${esc(g)}</button>`).join('');
      }
      // Update placeholder to hint about people search
      const searchInput = document.getElementById('category-search');
      if (searchInput) searchInput.placeholder = t('category.search_movie');
    } else if (categoryExtType === 'recipe') {
      const searchInput = document.getElementById('category-search');
      if (searchInput) searchInput.placeholder = t('category.search_recipe');
    }

    renderCategoryLinks(done, categoryExtType, '');
  } catch (e) {
    document.getElementById('links-list').innerHTML = `<div class="empty-state"><span class="empty-state-icon">\u26a0\ufe0f</span><p class="empty-state-text">${esc(t('category.could_not_load'))}</p></div>`;
  }
}

async function renderLink(linkId) {
  let link = linksCache[linkId];
  if (!link) {
    // Fetch all links to find this one
    const all = allLinks.length ? allLinks : await fetchLinks();
    link = all.find(l => l._id === linkId);
  }
  if (!link) {
    app.innerHTML = `<div class="screen"><div class="empty-state"><span class="empty-state-icon">\ud83d\udd0d</span><p class="empty-state-text">${esc(t('link.not_found'))}</p></div></div>`;
    return;
  }

  const cat = categories.find(c => c._id === link.category_id);
  const ext = link.extension_data || {};
  const extType = cat ? cat.extension_type : 'generic';

  let html = `<div class="screen"><div class="header"><button class="back-btn" onclick="navigate('#/category/${link.category_id}')">${ICONS.back}</button><div><div class="header-subtitle">${esc(cat ? cat.name : 'Link')}</div><div class="header-title">${esc(t('link.details'))}</div></div></div>`;

  if (extType === 'movie') {
    html += renderMovieDetail(link, ext);
  } else if (extType === 'recipe') {
    html += renderRecipeDetail(link, ext);
  } else if (extType === 'book') {
    html += renderBookDetail(link, ext);
  } else if (extType === 'director') {
    html += renderDirectorDetail(link, ext);
  } else {
    html += renderGenericDetail(link);
  }

  html += `
    <div class="actions">
      <a href="${esc(link.url)}" target="_blank" rel="noopener" class="btn btn-primary">${ICONS.external} ${esc(t('link.open_original'))}</a>
      <button class="btn btn-secondary" onclick="showRecategorize('${link._id}')">${ICONS.refresh} ${esc(t('link.recategorize'))}</button>
      <button class="btn btn-danger" onclick="confirmDelete('${link._id}')">${ICONS.trash} ${esc(t('link.delete_link'))}</button>
    </div>
  </div>`;

  app.innerHTML = html;
}

function renderMovieDetail(link, ext) {
  let html = '';
  if (ext.poster_url) {
    html += `<img class="detail-poster" src="${esc(ext.poster_url)}" alt="${esc(link.title)}">`;
  } else if (link.thumbnail) {
    html += `<img class="detail-hero" src="${esc(link.thumbnail)}" alt="">`;
  }
  html += `<h2 class="detail-title">${esc(link.title || '')}</h2>`;
  html += '<div class="detail-meta">';
  if (ext.year) html += `<span class="detail-tag">${esc(String(ext.year))}</span>`;
  if (ext.media_type) html += `<span class="detail-tag accent">${ext.media_type === 'tv' ? esc(t('link.tv_show')) : esc(t('link.movie'))}</span>`;
  if (ext.genre_names && ext.genre_names.length) {
    ext.genre_names.forEach(g => html += `<span class="detail-tag">${esc(g)}</span>`);
  }
  html += '</div>';
  if (ext.rating) {
    html += `<div class="detail-rating"><span class="detail-rating-value">★ ${Number(ext.rating).toFixed(1)}/10</span><span class="detail-rating-label">TMDB</span></div>`;
  }
  // Watch status toggle
  const watched = ext.watched || false;
  html += `
    <button class="watch-toggle ${watched ? 'watched' : ''}" onclick="toggleWatched('${link._id}', ${!watched})">
      <span class="watch-icon">${watched ? ICONS.eyeOpen : ICONS.eyeClosed}</span>
      <span>${watched ? esc(t('link.watched')) : esc(t('link.not_watched'))}</span>
    </button>`;
  const summary = ext.overview || link.summary || '';
  if (summary) html += `<p class="detail-summary">${esc(summary)}</p>`;

  // Directors
  if (ext.directors && ext.directors.length) {
    html += `<h3 class="detail-section-title">${ext.directors.length === 1 ? esc(t('link.director')) : esc(t('link.directors'))}</h3>`;
    html += '<div class="people-row">';
    ext.directors.forEach(d => {
      const photo = d.photo_url
        ? `<img class="person-photo" src="${esc(d.photo_url)}" alt="${esc(d.name)}" loading="lazy">`
        : `<div class="person-photo person-photo-placeholder">${esc(d.name[0])}</div>`;
      html += `<div class="person-chip">${photo}<span class="person-name">${esc(d.name)}</span></div>`;
    });
    html += '</div>';
  }

  // Cast
  if (ext.cast && ext.cast.length) {
    html += `<h3 class="detail-section-title">${esc(t('link.cast'))}</h3>`;
    html += '<div class="people-row">';
    ext.cast.forEach(a => {
      const photo = a.photo_url
        ? `<img class="person-photo" src="${esc(a.photo_url)}" alt="${esc(a.name)}" loading="lazy">`
        : `<div class="person-photo person-photo-placeholder">${esc(a.name[0])}</div>`;
      html += `<div class="person-chip">${photo}<div class="person-info"><span class="person-name">${esc(a.name)}</span>${a.character ? `<span class="person-role">${esc(a.character)}</span>` : ''}</div></div>`;
    });
    html += '</div>';
  }

  // Streaming providers
  if (ext.watch_providers && ext.watch_providers.length) {
    html += `<h3 class="detail-section-title">${esc(t('link.where_to_watch'))}</h3>`;
    html += '<div class="providers-grid">';
    ext.watch_providers.forEach((p, i) => {
      const logo = p.logo_url
        ? `<img class="provider-logo" src="${esc(p.logo_url)}" alt="${esc(p.name)}">`
        : `<span class="provider-logo-placeholder">${esc(p.name[0])}</span>`;
      html += `
        <div class="provider-chip" onclick="toggleProviderCountries(${i})">
          ${logo}
          <span class="provider-name">${esc(p.name)}</span>
          <span class="provider-count">${p.countries.length}</span>
        </div>
        <div class="provider-countries" id="provider-countries-${i}">
          ${p.countries.map(c => `<span class="country-flag" onclick="event.stopPropagation(); showCountryName('${esc(c)}', this)">${countryFlag(c)}</span>`).join('')}
        </div>`;
    });
    html += '</div>';
  }

  return html;
}

function toggleProviderCountries(index) {
  const el = document.getElementById(`provider-countries-${index}`);
  if (el) el.classList.toggle('expanded');
}

function countryFlag(code) {
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

let countryNames = new Intl.DisplayNames([currentLocale], { type: 'region' });

function showCountryName(code, el) {
  // Remove any existing tooltip
  document.querySelectorAll('.country-tooltip').forEach(t => t.remove());
  const name = countryNames.of(code.toUpperCase()) || code;
  const tip = document.createElement('div');
  tip.className = 'country-tooltip';
  tip.textContent = name;
  el.style.position = 'relative';
  el.appendChild(tip);
  setTimeout(() => tip.remove(), 2000);
}

function renderRecipeDetail(link, ext) {
  let html = '';
  if (link.thumbnail) {
    html += `<img class="detail-hero" src="${esc(link.thumbnail)}" alt="">`;
  }
  html += `<h2 class="detail-title">${esc(link.title || '')}</h2>`;

  if (ext.prep_time || ext.cook_time || ext.servings) {
    html += '<div class="recipe-stats">';
    if (ext.prep_time) html += `<div class="recipe-stat"><span class="recipe-stat-value">${esc(ext.prep_time)}</span><span class="recipe-stat-label">${esc(t('link.prep'))}</span></div>`;
    if (ext.cook_time) html += `<div class="recipe-stat"><span class="recipe-stat-value">${esc(ext.cook_time)}</span><span class="recipe-stat-label">${esc(t('link.cook'))}</span></div>`;
    if (ext.servings) html += `<div class="recipe-stat"><span class="recipe-stat-value">${esc(ext.servings)}</span><span class="recipe-stat-label">${esc(t('link.servings'))}</span></div>`;
    html += '</div>';
  }

  if (ext.ingredients && ext.ingredients.length) {
    html += `<h3 class="detail-section-title">${esc(t('link.ingredients'))}</h3><ul class="ingredient-list">`;
    ext.ingredients.forEach(i => html += `<li>${esc(i)}</li>`);
    html += '</ul>';
    const ingId = '_ing_' + link._id;
    window[ingId] = ext.ingredients;
    html += `<button class="btn btn-secondary cart-ingredients-btn" onclick="addIngredientsToCart('${link._id}', window['${ingId}'])">${ICONS.cart} ${esc(t('link.add_ingredients_cart'))}</button>`;
  }

  if (ext.steps && ext.steps.length) {
    html += `<h3 class="detail-section-title">${esc(t('link.instructions'))}</h3><ol class="step-list">`;
    ext.steps.forEach(s => html += `<li>${esc(s)}</li>`);
    html += '</ol>';
  }

  if (link.summary) html += `<p class="detail-summary">${esc(link.summary)}</p>`;
  return html;
}

function renderBookDetail(link, ext) {
  let html = '';
  if (ext.cover_url) {
    html += `<img class="detail-poster" src="${esc(ext.cover_url)}" alt="${esc(link.title)}">`;
  } else if (link.thumbnail) {
    html += `<img class="detail-hero" src="${esc(link.thumbnail)}" alt="">`;
  }
  html += `<h2 class="detail-title">${esc(ext.ol_title || link.title || '')}</h2>`;
  if (ext.author) html += `<p class="book-author">${esc(ext.author)}</p>`;
  html += '<div class="detail-meta">';
  if (ext.year) html += `<span class="detail-tag">${esc(String(ext.year))}</span>`;
  if (ext.pages) html += `<span class="detail-tag">${esc(t('link.pages', { n: ext.pages }))}</span>`;
  html += '</div>';
  if (ext.rating) {
    html += `<div class="detail-rating"><span class="detail-rating-value">★ ${Number(ext.rating).toFixed(1)}/5</span><span class="detail-rating-label">Open Library</span></div>`;
  }
  if (ext.subjects && ext.subjects.length) {
    html += '<div class="book-subjects">';
    ext.subjects.forEach(s => html += `<span class="detail-tag">${esc(s)}</span>`);
    html += '</div>';
  }
  const summary = link.summary || '';
  if (summary) html += `<p class="detail-summary">${esc(summary)}</p>`;
  return html;
}

function renderDirectorDetail(link, ext) {
  let html = '';
  if (ext.photo_url) {
    html += `<img class="detail-poster" src="${esc(ext.photo_url)}" alt="${esc(link.title)}">`;
  }
  html += `<h2 class="detail-title">${esc(ext.tmdb_name || link.title || '')}</h2>`;
  html += '<div class="detail-meta">';
  if (ext.birthday) html += `<span class="detail-tag">${esc(ext.birthday)}</span>`;
  if (ext.place_of_birth) html += `<span class="detail-tag">${esc(ext.place_of_birth)}</span>`;
  html += '</div>';
  if (ext.biography) html += `<p class="detail-summary">${esc(ext.biography)}</p>`;
  if (ext.tmdb_url) {
    html += `<a href="${esc(ext.tmdb_url)}" target="_blank" rel="noopener" class="btn btn-secondary" style="margin:12px 0">${ICONS.external} TMDB profile</a>`;
  }
  if (ext.filmography && ext.filmography.length) {
    html += `<h3 class="detail-section-title">${esc(t('link.filmography'))}</h3>`;
    html += '<div class="director-filmography">';
    ext.filmography.forEach(f => {
      const poster = f.poster_url
        ? `<img src="${esc(f.poster_url)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : '';
      const ratingStr = f.rating ? `★ ${Number(f.rating).toFixed(1)}` : '';
      html += `
        <div class="film-card">
          <div class="film-poster">
            ${poster}
            <div class="poster-fallback" ${f.poster_url ? 'style="display:none"' : ''}>${CAT_ICONS.peliculas}</div>
          </div>
          <div class="film-title">${esc(f.title || '')}</div>
          <div class="film-meta">${esc(f.year || '')} ${ratingStr}</div>
        </div>`;
    });
    html += '</div>';
  }
  return html;
}

function renderGenericDetail(link) {
  let html = '';
  if (link.thumbnail) {
    html += `<img class="detail-hero" src="${esc(link.thumbnail)}" alt="">`;
  }
  html += `<h2 class="detail-title">${esc(link.title || '')}</h2>`;
  if (link.summary) html += `<p class="detail-summary">${esc(link.summary)}</p>`;
  return html;
}

// ── Relative time helper ──
function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return t('time.just_now');
  if (minutes < 60) return t('time.minutes_ago', { n: minutes });
  if (hours < 24) return t('time.hours_ago', { n: hours });
  if (days === 1) return t('time.yesterday');
  if (days < 7) return t('time.days_ago', { n: days });
  if (weeks < 5) return t('time.weeks_ago', { n: weeks });
  if (months < 12) return t('time.months_ago', { n: months });
  return new Date(dateStr).toLocaleDateString();
}

// ── History screen ──
async function renderHistory() {
  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="back-btn" onclick="navigate('#/')">${ICONS.back}</button>
        <div>
          <div class="header-subtitle">${esc(t('history.subtitle'))}</div>
          <div class="header-title">${esc(t('history.title'))}</div>
        </div>
      </div>
      <div id="history-list" class="history-list">
        <div class="skeleton skeleton-link" style="height:72px;margin-bottom:10px"></div>
        <div class="skeleton skeleton-link" style="height:72px;margin-bottom:10px"></div>
        <div class="skeleton skeleton-link" style="height:72px;margin-bottom:10px"></div>
        <div class="skeleton skeleton-link" style="height:72px;margin-bottom:10px"></div>
        <div class="skeleton skeleton-link" style="height:72px;margin-bottom:10px"></div>
      </div>
    </div>`;

  try {
    // Ensure categories are loaded
    if (categories.length === 0) await fetchCategories();
    const links = await fetchLinks();
    allLinks = links;
    const sorted = [...links].sort((a, b) => {
      const dateA = a.processed_at || a.submitted_at || a.created_at;
      const dateB = b.processed_at || b.submitted_at || b.created_at;
      return new Date(dateB) - new Date(dateA);
    });
    const done = sorted;

    const listEl = document.getElementById('history-list');
    if (!listEl) return;

    if (done.length === 0) {
      listEl.innerHTML = `<div class="empty-state"><span class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:40px;height:40px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span><p class="empty-state-text">${esc(t('history.no_links'))}</p></div>`;
      return;
    }

    // Build a category lookup map
    const catMap = {};
    categories.forEach(c => catMap[c._id] = c);

    listEl.innerHTML = '<div class="history-feed stagger">' + done.map(link => {
      const cat = catMap[link.category_id];
      const catName = cat ? cat.name : t('uncategorized');
      const catIcon = cat ? getCategoryIcon(cat.slug, cat) : CAT_ICONS.default;
      const ext = link.extension_data || {};
      const thumbUrl = ext.poster_url || ext.cover_url || ext.photo_url || link.thumbnail;
      const domain = getDomain(link.url);
      const date = link.processed_at || link.submitted_at;
      const ago = date ? timeAgo(date) : '';

      return `
        <div class="history-item" onclick="navigate('#/link/${link._id}')">
          <div class="history-thumb-wrap">
            ${thumbUrl
              ? `<img class="history-thumb" src="${esc(thumbUrl)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
              : ''}
            <div class="history-thumb-fallback" ${thumbUrl ? 'style="display:none"' : ''}>${catIcon}</div>
          </div>
          <div class="history-content">
            <div class="history-title">${esc(link.title || link.url)}</div>
            ${link.url ? `<div class="history-url">${esc(link.url)}</div>` : ''}
            <div class="history-meta">
              <span class="history-cat-badge"><span class="history-cat-icon">${catIcon}</span>${esc(catName)}</span>
              ${link.status !== 'done' ? `<span class="history-status">${esc(link.status)}</span>` : ''}
            </div>
            <div class="history-time">${esc(ago)}</div>
          </div>
        </div>`;
    }).join('') + '</div>';
  } catch (e) {
    const listEl = document.getElementById('history-list');
    if (listEl) listEl.innerHTML = `<div class="empty-state"><span class="empty-state-icon">&#9888;&#65039;</span><p class="empty-state-text">${esc(t('history.could_not_load'))}</p></div>`;
  }
}

// ── Cart screen ──
async function renderCart() {
  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="back-btn" onclick="navigate('#/')">${ICONS.back}</button>
        <div>
          <div class="header-subtitle">${esc(t('cart.subtitle'))}</div>
          <div class="header-title">${esc(t('cart.title'))}</div>
        </div>
      </div>
      <form class="cart-add-form" onsubmit="handleAddCartItem(event)">
        <input type="text" id="cart-input" class="cart-input" placeholder="${esc(t('cart.add_placeholder'))}" autocomplete="off">
        <button type="submit" class="cart-add-btn">${ICONS.plus}</button>
        <button type="button" class="cart-add-btn cart-mic-btn" onclick="navigate('#/voice')">${ICONS.mic}</button>
      </form>
      <div id="cart-list" class="cart-list">
        <div class="skeleton skeleton-link" style="height:48px;margin-bottom:8px"></div>
        <div class="skeleton skeleton-link" style="height:48px;margin-bottom:8px"></div>
        <div class="skeleton skeleton-link" style="height:48px"></div>
      </div>
    </div>`;

  try {
    const items = await fetchCart();
    renderCartItems(items);
  } catch {
    document.getElementById('cart-list').innerHTML = `<div class="empty-state"><span class="empty-state-icon">\u26a0\ufe0f</span><p class="empty-state-text">${esc(t('cart.could_not_load'))}</p></div>`;
  }
}

function renderCartItems(items) {
  const el = document.getElementById('cart-list');
  if (!el) return;

  if (items.length === 0) {
    el.innerHTML = `<div class="empty-state"><span class="empty-state-icon">${ICONS.cart}</span><p class="empty-state-text">${esc(t('cart.empty'))}</p></div>`;
    return;
  }

  const uncompleted = items.filter(i => !i.completed);
  const completed = items.filter(i => i.completed);

  let html = '';
  uncompleted.forEach(item => {
    html += `
      <div class="cart-item" data-id="${item._id}">
        <button class="cart-check" onclick="handleToggleCart('${item._id}')" aria-label="Mark complete"></button>
        <span class="cart-text">${esc(item.text)}</span>
        <button class="cart-delete" onclick="handleDeleteCart('${item._id}')" aria-label="Delete">${ICONS.trash}</button>
      </div>`;
  });

  if (completed.length) {
    html += `<div class="cart-section-label">${esc(t('cart.completed'))}</div>`;
    completed.forEach(item => {
      html += `
        <div class="cart-item completed" data-id="${item._id}">
          <button class="cart-check checked" onclick="handleToggleCart('${item._id}')" aria-label="Mark incomplete">${ICONS.check}</button>
          <span class="cart-text">${esc(item.text)}</span>
          <button class="cart-delete" onclick="handleDeleteCart('${item._id}')" aria-label="Delete">${ICONS.trash}</button>
        </div>`;
    });
    html += `<button class="btn btn-secondary cart-clear-btn" onclick="handleClearCompleted()">${esc(t('cart.clear_completed', { n: completed.length }))}</button>`;
  }

  el.innerHTML = html;
}

async function handleAddCartItem(e) {
  e.preventDefault();
  const input = document.getElementById('cart-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  try {
    await addCartItem(text);
    const items = await fetchCart();
    renderCartItems(items);
    updateCartBadge();
  } catch {
    showToast(t('cart.failed_add'));
  }
}

async function handleToggleCart(id) {
  try {
    await toggleCartItem(id);
    const items = await fetchCart();
    renderCartItems(items);
    updateCartBadge();
  } catch {
    showToast(t('cart.failed_update'));
  }
}

async function handleDeleteCart(id) {
  try {
    await deleteCartItem(id);
    const items = await fetchCart();
    renderCartItems(items);
    updateCartBadge();
  } catch {
    showToast(t('cart.failed_delete'));
  }
}

async function handleClearCompleted() {
  try {
    const result = await clearCompletedCart();
    const items = await fetchCart();
    renderCartItems(items);
    updateCartBadge();
    showToast(t('cart.cleared', { n: result.deleted }));
  } catch {
    showToast(t('cart.failed_clear'));
  }
}

async function addIngredientsToCart(linkId, ingredients) {
  try {
    const result = await addCartBatch(ingredients, linkId);
    updateCartBadge();
    showToast(t('cart.ingredients_added', { n: result.length }));
  } catch {
    showToast(t('cart.failed_add'));
  }
}

async function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  try {
    const items = await fetchCart();
    const count = items.filter(i => !i.completed).length;
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
  } catch {
    // silent
  }
}

// ── Voice screen ──
let voiceRecognition = null;
let voiceListening = false;
let voicePendingItems = [];
let voiceSilenceTimer = null;

function parseCartItems(text) {
  return text
    .split(/,|\by\b/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function renderVoice() {
  voicePendingItems = [];
  voiceListening = false;
  if (voiceRecognition) {
    try { voiceRecognition.stop(); } catch {}
    voiceRecognition = null;
  }

  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="back-btn" onclick="navigate('#/cart')">${ICONS.back}</button>
        <div>
          <div class="header-subtitle">${esc(t('voice.subtitle'))}</div>
          <div class="header-title">${esc(t('voice.title'))}</div>
        </div>
      </div>
      <div class="voice-container">
        <button class="voice-mic-btn" id="voice-mic-btn" onclick="toggleVoice()">
          ${ICONS.mic}
        </button>
        <p class="voice-hint" id="voice-hint">${esc(t('voice.tap_start'))}</p>
        <div class="voice-transcript" id="voice-transcript"></div>
        <div class="voice-items" id="voice-items"></div>
        <button class="btn btn-primary voice-add-btn" id="voice-add-btn" style="display:none" onclick="addVoiceItems()">
          ${ICONS.cart} ${esc(t('voice.add_to_cart'))}
        </button>
      </div>
    </div>`;

  // Auto-start listening
  setTimeout(() => startVoice(), 300);
}

function toggleVoice() {
  if (voiceListening) {
    stopVoice();
  } else {
    startVoice();
  }
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast(t('voice.not_supported'));
    return;
  }

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.lang = VOICE_LANG_MAP[currentLocale] || 'en-US';
  voiceRecognition.continuous = true;
  voiceRecognition.interimResults = true;

  const btn = document.getElementById('voice-mic-btn');
  const hint = document.getElementById('voice-hint');
  const transcript = document.getElementById('voice-transcript');

  voiceRecognition.onstart = () => {
    voiceListening = true;
    if (btn) btn.classList.add('listening');
    if (hint) hint.textContent = t('voice.listening_hint');
  };

  voiceRecognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        const items = parseCartItems(text);
        items.forEach(item => {
          if (!voicePendingItems.includes(item.toLowerCase())) {
            voicePendingItems.push(item.toLowerCase());
          }
        });
        renderVoiceItems();
        // Reset silence timer — auto-stop after 3s of silence
        resetSilenceTimer();
      } else {
        interim = text;
        // User is actively speaking, clear any pending stop
        clearSilenceTimer();
      }
    }
    if (transcript) {
      transcript.textContent = interim;
      transcript.style.display = interim ? '' : 'none';
    }
  };

  voiceRecognition.onerror = (event) => {
    if (event.error === 'no-speech') return;
    if (event.error === 'aborted') return;
    showToast(t('voice.mic_error', { err: event.error }));
    stopVoice();
  };

  voiceRecognition.onend = () => {
    // Auto-restart if still in listening mode (browser can stop after silence)
    if (voiceListening) {
      try { voiceRecognition.start(); } catch {}
    }
  };

  try {
    voiceRecognition.start();
  } catch {
    showToast(t('voice.could_not_start'));
  }
}

function resetSilenceTimer() {
  clearSilenceTimer();
  voiceSilenceTimer = setTimeout(() => {
    if (voiceListening && voicePendingItems.length > 0) {
      addVoiceItems();
    }
  }, 3000);
}

function clearSilenceTimer() {
  if (voiceSilenceTimer) {
    clearTimeout(voiceSilenceTimer);
    voiceSilenceTimer = null;
  }
}

function stopVoice() {
  voiceListening = false;
  clearSilenceTimer();
  if (voiceRecognition) {
    try { voiceRecognition.stop(); } catch {}
  }
  const btn = document.getElementById('voice-mic-btn');
  const hint = document.getElementById('voice-hint');
  const transcript = document.getElementById('voice-transcript');
  if (btn) btn.classList.remove('listening');
  if (hint) hint.textContent = voicePendingItems.length ? t('voice.tap_again') : t('voice.tap_start');
  if (transcript) { transcript.textContent = ''; transcript.style.display = 'none'; }
}

function renderVoiceItems() {
  const el = document.getElementById('voice-items');
  const addBtn = document.getElementById('voice-add-btn');
  if (!el) return;

  if (voicePendingItems.length === 0) {
    el.innerHTML = '';
    if (addBtn) addBtn.style.display = 'none';
    return;
  }

  el.innerHTML = voicePendingItems.map((item, i) => `
    <div class="voice-chip">
      <span>${esc(item)}</span>
      <button class="voice-chip-remove" onclick="removeVoiceItem(${i})">${ICONS.close}</button>
    </div>
  `).join('');

  if (addBtn) {
    addBtn.style.display = '';
    addBtn.innerHTML = `${ICONS.cart} ${esc(t('voice.add_n_to_cart', { n: voicePendingItems.length }))}`;
  }
}

function removeVoiceItem(index) {
  voicePendingItems.splice(index, 1);
  renderVoiceItems();
}

async function addVoiceItems() {
  if (voicePendingItems.length === 0) return;
  stopVoice();
  const items = [...voicePendingItems];
  try {
    await addCartBatch(items);
    updateCartBadge();
    showToast(t('voice.added', { n: items.length }));
    voicePendingItems = [];
    navigate('#/cart');
  } catch {
    showToast(t('voice.failed_add'));
  }
}

// ── Add link ──
function showAddLink() {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="confirm-sheet">
      <h3 class="confirm-title">${esc(t('add.title'))}</h3>
      <p class="confirm-text">${esc(t('add.description'))}</p>
      <textarea class="add-link-textarea" id="add-link-input" rows="4" placeholder="${esc(t('add.placeholder'))}"></textarea>
      <div class="confirm-actions">
        <button class="btn btn-danger" onclick="this.closest('.confirm-overlay').remove()">${esc(t('add.cancel'))}</button>
        <button class="btn btn-primary" id="add-link-submit" onclick="submitAddLink()">${esc(t('add.submit'))}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('add-link-input').focus();
}

async function submitAddLink() {
  const input = document.getElementById('add-link-input');
  const btn = document.getElementById('add-link-submit');
  const text = input.value.trim();
  if (!text) return;
  btn.textContent = t('add.submitting');
  btn.disabled = true;
  try {
    await api('POST', '/api/links', { text, language: currentLocale });
    document.querySelector('.confirm-overlay').remove();
    showToast(t('add.success'));
    refreshHome();
  } catch {
    showToast(t('add.failed'));
    btn.textContent = t('add.submit');
    btn.disabled = false;
  }
}

// ── Recategorize ──
function showRecategorize(linkId) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="confirm-sheet">
      <h3 class="confirm-title">${esc(t('recat.title'))}</h3>
      <input type="text" class="recat-hint-input" id="recat-hint" placeholder="${esc(t('recat.hint_placeholder'))}">
      <div class="recat-options">
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'movie', this)">${CAT_ICONS.peliculas} ${esc(t('recat.movie'))}</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'tv', this)">${CAT_ICONS.series} ${esc(t('recat.tv'))}</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'short', this)">${CAT_ICONS.cortometrajes} ${esc(t('recat.short'))}</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'recipe', this)">${CAT_ICONS.recetas} ${esc(t('recat.recipe'))}</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'documentary', this)">${CAT_ICONS.documentales} ${esc(t('recat.documentary'))}</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'book', this)">${CAT_ICONS.libros} ${esc(t('recat.book'))}</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'director', this)">${CAT_ICONS.directores} ${esc(t('recat.director'))}</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'generic', this)">${CAT_ICONS.default} ${esc(t('recat.generic'))}</button>
      </div>
      <button class="recat-btn recat-retry" onclick="doRecategorize('${linkId}', null, this)">${ICONS.refresh} ${esc(t('recat.retry'))}</button>
      <button class="btn btn-danger" style="width:100%;margin-top:10px" onclick="this.closest('.confirm-overlay').remove()">${esc(t('add.cancel'))}</button>
    </div>`;
  document.body.appendChild(overlay);
}

async function doRecategorize(linkId, type, btn) {
  const overlay = btn.closest('.confirm-overlay');
  const hint = document.getElementById('recat-hint')?.value?.trim() || '';
  btn.textContent = t('recat.processing');
  btn.disabled = true;
  try {
    const extData = {};
    if (type) extData.recategorize_as = type;
    if (hint) extData.user_hint = hint;
    await patchLink(linkId, {
      status: 'pending',
      extension_data: extData,
    });
    overlay.remove();
    showToast(t('recat.success'));
    navigate('#/');
  } catch {
    showToast(t('recat.failed'));
    overlay.remove();
  }
}

// ── Delete confirmation ──
function confirmDelete(linkId) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="confirm-sheet">
      <h3 class="confirm-title">${esc(t('delete.title'))}</h3>
      <p class="confirm-text">${esc(t('delete.confirm'))}</p>
      <div class="confirm-actions">
        <button class="btn btn-danger" onclick="this.closest('.confirm-overlay').remove()">${esc(t('delete.cancel'))}</button>
        <button class="btn btn-primary" id="confirm-delete-btn">${esc(t('delete.delete'))}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('confirm-delete-btn').onclick = async () => {
    overlay.remove();
    try {
      await deleteLink(linkId);
      showToast(t('delete.success'));
      navigate('#/');
    } catch {
      showToast(t('delete.failed'));
    }
  };
}

// ── Watch status toggle ──
async function toggleWatched(linkId, watched) {
  try {
    const link = linksCache[linkId] || allLinks.find(l => l._id === linkId);
    if (!link) return;
    const ext = { ...(link.extension_data || {}), watched };
    await patchLink(linkId, { extension_data: ext });
    link.extension_data = ext;
    linksCache[linkId] = link;
    renderLink(linkId);
    showToast(watched ? t('watch.marked_watched') : t('watch.marked_unwatched'));
  } catch {
    showToast(t('watch.failed'));
  }
}

async function toggleWatchedFromList(linkId, watched) {
  const btn = document.querySelector(`.poster-card [onclick*="${linkId}"]`);
  if (btn) btn.classList.add('updating');
  try {
    const link = linksCache[linkId] || allLinks.find(l => l._id === linkId);
    if (!link) return;
    const ext = { ...(link.extension_data || {}), watched };
    await patchLink(linkId, { extension_data: ext });
    link.extension_data = ext;
    linksCache[linkId] = link;
    // Update button in-place
    if (btn) {
      btn.classList.toggle('watched', watched);
      btn.innerHTML = watched ? ICONS.eyeOpen : ICONS.eyeClosed;
      btn.setAttribute('onclick', `event.stopPropagation(); toggleWatchedFromList('${linkId}', ${!watched})`);
      btn.classList.remove('updating');
    }
    showToast(watched ? t('watch.marked_watched') : t('watch.marked_unwatched'));
  } catch {
    if (btn) btn.classList.remove('updating');
    showToast(t('watch.failed'));
  }
}


// ── Helpers ──
function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 2500);
}

// ── Settings ──
function showSettings() {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  const langLabels = { en: 'English', es: 'Espa\u00f1ol', fr: 'Fran\u00e7ais' };
  overlay.innerHTML = `
    <div class="confirm-sheet">
      <h3 class="confirm-title">${esc(t('settings.title'))}</h3>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
        <div class="settings-lang-section">
          <label class="settings-lang-label">${esc(t('settings.language'))}</label>
          <div class="settings-lang-pills" id="lang-pills">
            ${SUPPORTED_LOCALES.map(loc => `<button class="lang-pill ${loc === currentLocale ? 'active' : ''}" data-lang="${loc}">${langLabels[loc]}</button>`).join('')}
          </div>
        </div>
        <button class="btn btn-secondary" id="settings-logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          ${esc(t('settings.sign_out'))}
        </button>
        <button class="btn btn-danger" id="settings-delete-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
          ${esc(t('settings.delete_account'))}
        </button>
      </div>
      <button class="btn btn-secondary" id="settings-close-btn" style="width:100%;margin-top:10px">${esc(t('settings.close'))}</button>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('lang-pills').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    const lang = btn.dataset.lang;
    if (lang === currentLocale) return;
    setLocale(lang);
    overlay.remove();
    countryNames = new Intl.DisplayNames([currentLocale], { type: 'region' });
    render();
  });
  document.getElementById('settings-logout-btn').addEventListener('click', () => { overlay.remove(); handleLogout(); });
  document.getElementById('settings-delete-btn').addEventListener('click', () => { overlay.remove(); handleDeleteAccount(); });
  document.getElementById('settings-close-btn').addEventListener('click', () => overlay.remove());
}

// ── Logout / Delete Account ──
async function handleLogout() {
  if (!confirm(t('settings.confirm_logout'))) return;
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}

async function handleDeleteAccount() {
  if (!confirm(t('settings.confirm_delete_1'))) return;
  if (!confirm(t('settings.confirm_delete_2'))) return;
  try {
    const res = await authFetch('/api/delete-account', { method: 'DELETE' });
    if (res && res.ok) {
      await supabase.auth.signOut();
      window.location.href = '/login.html';
    } else {
      showToast(t('settings.delete_error'));
    }
  } catch {
    showToast(t('settings.delete_error'));
  }
}

// ── Init ──
// Called by index.html after auth check passes
function bootApp(supabaseClient) {
  supabase = supabaseClient;

  // Bind cart-fab click
  const cartFab = document.getElementById('cart-fab');
  if (cartFab) {
    cartFab.addEventListener('click', () => navigate('#/cart'));
  }

  window.addEventListener('hashchange', render);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      // Check for updates every 60 seconds
      setInterval(() => reg.update(), 60000);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    });

    // When new SW takes over, reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
  render();
}

function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.className = 'update-banner';
  banner.innerHTML = `<span>${esc(t('update.available'))}</span><button onclick="applyUpdate()">${esc(t('update.refresh'))}</button>`;
  document.body.appendChild(banner);
}

function applyUpdate() {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg && reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}

// Expose for inline onclick handlers
window.navigate = navigate;
window.confirmDelete = confirmDelete;
window.toggleWatched = toggleWatched;
window.toggleWatchedFromList = toggleWatchedFromList;
window.applyUpdate = applyUpdate;
window.showRecategorize = showRecategorize;
window.doRecategorize = doRecategorize;
window.toggleProviderCountries = toggleProviderCountries;
window.showCountryName = showCountryName;
window.refreshHome = refreshHome;
window.handleAddCartItem = handleAddCartItem;
window.handleToggleCart = handleToggleCart;
window.handleDeleteCart = handleDeleteCart;
window.handleClearCompleted = handleClearCompleted;
window.addIngredientsToCart = addIngredientsToCart;
window.showAddLink = showAddLink;
window.submitAddLink = submitAddLink;
window.handleCategoryFilter = handleCategoryFilter;
window.clearCategoryFilter = clearCategoryFilter;
window.filterByGenre = filterByGenre;
window.toggleVoice = toggleVoice;
window.addVoiceItems = addVoiceItems;
window.removeVoiceItem = removeVoiceItem;
window.bootApp = bootApp;
window.handleLogout = handleLogout;
window.handleDeleteAccount = handleDeleteAccount;
window.showSettings = showSettings;
window.renderHistory = renderHistory;
window.t = t;
window.getLocale = getLocale;
window.setLocale = setLocale;
