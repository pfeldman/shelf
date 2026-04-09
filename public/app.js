// ── Configuration ──
const API_BASE = "";
let supabase = null;

// ── State ──
let categories = [];
let linksCache = {};
let allLinks = [];

// ── i18n ──
const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'pt', 'de', 'it', 'ja', 'ko', 'zh', 'nl', 'ru', 'ar', 'hi', 'tr'];

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
    'link.pages': '{n} pages',
    'link.filmography': 'Filmography',
    'link.prep': 'Prep',
    'link.cook': 'Cook',
    'link.servings': 'Servings',
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
    'link.pages': '{n} p\u00e1ginas',
    'link.filmography': 'Filmograf\u00eda',
    'link.prep': 'Prep',
    'link.cook': 'Cocci\u00f3n',
    'link.servings': 'Porciones',
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
    'link.pages': '{n} pages',
    'link.filmography': 'Filmographie',
    'link.prep': 'Pr\u00e9p',
    'link.cook': 'Cuisson',
    'link.servings': 'Portions',
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
  pt: {
    // Home
    'home.subtitle': 'Seus links selecionados',
    'home.collections': 'Cole\u00e7\u00f5es',
    'home.processing': '{n} link{s} processando\u2026',
    'home.no_links': 'Nenhum link ainda. Compartilhe algo!',
    'home.could_not_load': 'N\u00e3o foi poss\u00edvel carregar os dados',
    'home.could_not_refresh': 'N\u00e3o foi poss\u00edvel atualizar',
    // History
    'history.subtitle': 'Cronologia',
    'history.title': 'Atividade recente',
    'history.no_links': 'Nenhum link salvo ainda',
    'history.could_not_load': 'N\u00e3o foi poss\u00edvel carregar o hist\u00f3rico',
    'history.links_saved': '{n} link{s} salvo{s}',
    // Category
    'category.subtitle': 'Cole\u00e7\u00e3o',
    'category.no_links': 'Nenhum link nesta cole\u00e7\u00e3o ainda',
    'category.no_matches': 'Sem resultados',
    'category.could_not_load': 'N\u00e3o foi poss\u00edvel carregar os links',
    'category.search_placeholder': 'Pesquisar em {name}\u2026',
    'category.search_movie': 'Pesquisar por t\u00edtulo, ator, diretor\u2026',
    'category.search_recipe': 'Pesquisar por t\u00edtulo ou ingrediente\u2026',
    'category.all': 'Todos',
    'category.link_count': '{n} link{s}',
    // Link detail
    'link.not_found': 'Link n\u00e3o encontrado',
    'link.details': 'Detalhes',
    'link.open_original': 'Abrir original',
    'link.recategorize': 'Recategorizar',
    'link.delete_link': 'Excluir link',
    'link.tv_show': 'S\u00e9rie',
    'link.movie': 'Filme',
    'link.watched': 'Assistido',
    'link.not_watched': 'N\u00e3o assistido',
    'link.director': 'Diretor',
    'link.directors': 'Diretores',
    'link.cast': 'Elenco',
    'link.where_to_watch': 'Onde assistir',
    'link.ingredients': 'Ingredientes',
    'link.instructions': 'Instru\u00e7\u00f5es',
    'link.pages': '{n} p\u00e1ginas',
    'link.filmography': 'Filmografia',
    'link.prep': 'Preparo',
    'link.cook': 'Cozimento',
    'link.servings': 'Por\u00e7\u00f5es',
    // Add link
    'add.title': 'Adicionar ao Shelf',
    'add.description': 'Cole uma URL, digite o nome de um filme, uma receita ou qualquer coisa que queira salvar.',
    'add.placeholder': 'Ex: Parasite 2019, https://exemplo.com, ou cole uma receita\u2026',
    'add.cancel': 'Cancelar',
    'add.submit': 'Enviar',
    'add.submitting': 'Enviando\u2026',
    'add.success': 'Adicionado! Processando\u2026',
    'add.failed': 'N\u00e3o foi poss\u00edvel adicionar',
    // Recategorize
    'recat.title': 'Recategorizar como...',
    'recat.hint_placeholder': 'Opcional: adicione detalhes para ajudar a IA (ex: "\u00e9 um filme coreano de 2019")',
    'recat.movie': 'Filme',
    'recat.tv': 'S\u00e9rie',
    'recat.short': 'Curta-metragem',
    'recat.recipe': 'Receita',
    'recat.documentary': 'Document\u00e1rio',
    'recat.book': 'Livro',
    'recat.director': 'Diretor',
    'recat.generic': 'Gen\u00e9rico',
    'recat.retry': 'Tentar novamente (auto-detectar)',
    'recat.processing': 'Processando...',
    'recat.success': 'Reprocessando...',
    'recat.failed': 'N\u00e3o foi poss\u00edvel recategorizar',
    // Delete
    'delete.title': 'Excluir este link?',
    'delete.confirm': 'Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita.',
    'delete.cancel': 'Cancelar',
    'delete.delete': 'Excluir',
    'delete.success': 'Link exclu\u00eddo',
    'delete.failed': 'N\u00e3o foi poss\u00edvel excluir',
    // Watch
    'watch.marked_watched': 'Marcado como assistido',
    'watch.marked_unwatched': 'Marcado como n\u00e3o assistido',
    'watch.failed': 'N\u00e3o foi poss\u00edvel atualizar',
    // Settings
    'settings.title': 'Configura\u00e7\u00f5es',
    'settings.sign_out': 'Sair',
    'settings.delete_account': 'Excluir conta',
    'settings.close': 'Fechar',
    'settings.language': 'Idioma',
    'settings.confirm_logout': 'Sair da conta?',
    'settings.confirm_delete_1': 'Tem certeza de que deseja excluir sua conta? Todos os seus dados ser\u00e3o apagados permanentemente.',
    'settings.confirm_delete_2': 'Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita. Tem certeza absoluta?',
    'settings.delete_error': 'Erro ao excluir a conta',
    // Update banner
    'update.available': 'Atualiza\u00e7\u00e3o dispon\u00edvel',
    'update.refresh': 'Atualizar',
    // Time
    'time.just_now': 'agora',
    'time.minutes_ago': 'h\u00e1 {n}min',
    'time.hours_ago': 'h\u00e1 {n}h',
    'time.yesterday': 'ontem',
    'time.days_ago': 'h\u00e1 {n}d',
    'time.weeks_ago': 'h\u00e1 {n}sem',
    'time.months_ago': 'h\u00e1 {n}m',
    // Misc
    'uncategorized': 'Sem categoria',
  },
  de: {
    // Home
    'home.subtitle': 'Deine kuratierten Links',
    'home.collections': 'Sammlungen',
    'home.processing': '{n} Link{s} werden verarbeitet\u2026',
    'home.no_links': 'Noch keine Links. Teile etwas!',
    'home.could_not_load': 'Daten konnten nicht geladen werden',
    'home.could_not_refresh': 'Aktualisierung fehlgeschlagen',
    // History
    'history.subtitle': 'Verlauf',
    'history.title': 'Letzte Aktivit\u00e4t',
    'history.no_links': 'Noch keine Links gespeichert',
    'history.could_not_load': 'Verlauf konnte nicht geladen werden',
    'history.links_saved': '{n} Link{s} gespeichert',
    // Category
    'category.subtitle': 'Sammlung',
    'category.no_links': 'Noch keine Links in dieser Sammlung',
    'category.no_matches': 'Keine Treffer',
    'category.could_not_load': 'Links konnten nicht geladen werden',
    'category.search_placeholder': 'In {name} suchen\u2026',
    'category.search_movie': 'Nach Titel, Schauspieler, Regisseur suchen\u2026',
    'category.search_recipe': 'Nach Titel oder Zutat suchen\u2026',
    'category.all': 'Alle',
    'category.link_count': '{n} Link{s}',
    // Link detail
    'link.not_found': 'Link nicht gefunden',
    'link.details': 'Details',
    'link.open_original': 'Original \u00f6ffnen',
    'link.recategorize': 'Neu kategorisieren',
    'link.delete_link': 'Link l\u00f6schen',
    'link.tv_show': 'Serie',
    'link.movie': 'Film',
    'link.watched': 'Gesehen',
    'link.not_watched': 'Nicht gesehen',
    'link.director': 'Regisseur',
    'link.directors': 'Regisseure',
    'link.cast': 'Besetzung',
    'link.where_to_watch': 'Wo ansehen',
    'link.ingredients': 'Zutaten',
    'link.instructions': 'Zubereitung',
    'link.pages': '{n} Seiten',
    'link.filmography': 'Filmografie',
    'link.prep': 'Vorbereitung',
    'link.cook': 'Kochzeit',
    'link.servings': 'Portionen',
    // Add link
    'add.title': 'Zu Shelf hinzuf\u00fcgen',
    'add.description': 'F\u00fcge eine URL ein, tippe einen Filmnamen, ein Rezept oder was du speichern m\u00f6chtest.',
    'add.placeholder': 'z.B. Parasite 2019, https://beispiel.de, oder ein Rezept einf\u00fcgen\u2026',
    'add.cancel': 'Abbrechen',
    'add.submit': 'Senden',
    'add.submitting': 'Wird gesendet\u2026',
    'add.success': 'Hinzugef\u00fcgt! Wird verarbeitet\u2026',
    'add.failed': 'Konnte nicht hinzugef\u00fcgt werden',
    // Recategorize
    'recat.title': 'Neu kategorisieren als...',
    'recat.hint_placeholder': 'Optional: Details hinzuf\u00fcgen (z.B. "es ist ein koreanischer Film von 2019")',
    'recat.movie': 'Film',
    'recat.tv': 'Serie',
    'recat.short': 'Kurzfilm',
    'recat.recipe': 'Rezept',
    'recat.documentary': 'Dokumentation',
    'recat.book': 'Buch',
    'recat.director': 'Regisseur',
    'recat.generic': 'Allgemein',
    'recat.retry': 'Erneut versuchen (automatisch)',
    'recat.processing': 'Wird verarbeitet...',
    'recat.success': 'Wird neu verarbeitet...',
    'recat.failed': 'Neu-Kategorisierung fehlgeschlagen',
    // Delete
    'delete.title': 'Diesen Link l\u00f6schen?',
    'delete.confirm': 'Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.',
    'delete.cancel': 'Abbrechen',
    'delete.delete': 'L\u00f6schen',
    'delete.success': 'Link gel\u00f6scht',
    'delete.failed': 'L\u00f6schen fehlgeschlagen',
    // Watch
    'watch.marked_watched': 'Als gesehen markiert',
    'watch.marked_unwatched': 'Als nicht gesehen markiert',
    'watch.failed': 'Aktualisierung fehlgeschlagen',
    // Settings
    'settings.title': 'Einstellungen',
    'settings.sign_out': 'Abmelden',
    'settings.delete_account': 'Konto l\u00f6schen',
    'settings.close': 'Schlie\u00dfen',
    'settings.language': 'Sprache',
    'settings.confirm_logout': 'Abmelden?',
    'settings.confirm_delete_1': 'Bist du sicher, dass du dein Konto l\u00f6schen m\u00f6chtest? Alle deine Daten werden dauerhaft gel\u00f6scht.',
    'settings.confirm_delete_2': 'Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden. Bist du absolut sicher?',
    'settings.delete_error': 'Fehler beim L\u00f6schen des Kontos',
    // Update banner
    'update.available': 'Update verf\u00fcgbar',
    'update.refresh': 'Aktualisieren',
    // Time
    'time.just_now': 'gerade eben',
    'time.minutes_ago': 'vor {n}Min',
    'time.hours_ago': 'vor {n}Std',
    'time.yesterday': 'gestern',
    'time.days_ago': 'vor {n}T',
    'time.weeks_ago': 'vor {n}W',
    'time.months_ago': 'vor {n}Mo',
    // Misc
    'uncategorized': 'Ohne Kategorie',
  },
  it: {
    // Home
    'home.subtitle': 'I tuoi link selezionati',
    'home.collections': 'Collezioni',
    'home.processing': '{n} link in elaborazione\u2026',
    'home.no_links': 'Nessun link ancora. Condividi qualcosa!',
    'home.could_not_load': 'Impossibile caricare i dati',
    'home.could_not_refresh': 'Impossibile aggiornare',
    // History
    'history.subtitle': 'Cronologia',
    'history.title': 'Attivit\u00e0 recente',
    'history.no_links': 'Nessun link salvato',
    'history.could_not_load': 'Impossibile caricare la cronologia',
    'history.links_saved': '{n} link salvat{s}',
    // Category
    'category.subtitle': 'Collezione',
    'category.no_links': 'Nessun link in questa collezione',
    'category.no_matches': 'Nessun risultato',
    'category.could_not_load': 'Impossibile caricare i link',
    'category.search_placeholder': 'Cerca in {name}\u2026',
    'category.search_movie': 'Cerca per titolo, attore, regista\u2026',
    'category.search_recipe': 'Cerca per titolo o ingrediente\u2026',
    'category.all': 'Tutti',
    'category.link_count': '{n} link',
    // Link detail
    'link.not_found': 'Link non trovato',
    'link.details': 'Dettagli',
    'link.open_original': 'Apri originale',
    'link.recategorize': 'Ricategorizza',
    'link.delete_link': 'Elimina link',
    'link.tv_show': 'Serie TV',
    'link.movie': 'Film',
    'link.watched': 'Visto',
    'link.not_watched': 'Non visto',
    'link.director': 'Regista',
    'link.directors': 'Registi',
    'link.cast': 'Cast',
    'link.where_to_watch': 'Dove guardare',
    'link.ingredients': 'Ingredienti',
    'link.instructions': 'Istruzioni',
    'link.pages': '{n} pagine',
    'link.filmography': 'Filmografia',
    'link.prep': 'Preparazione',
    'link.cook': 'Cottura',
    'link.servings': 'Porzioni',
    // Add link
    'add.title': 'Aggiungi a Shelf',
    'add.description': 'Incolla un URL, scrivi il nome di un film, una ricetta o qualsiasi cosa tu voglia salvare.',
    'add.placeholder': 'Es: Parasite 2019, https://esempio.com, o incolla una ricetta\u2026',
    'add.cancel': 'Annulla',
    'add.submit': 'Invia',
    'add.submitting': 'Invio in corso\u2026',
    'add.success': 'Aggiunto! Elaborazione\u2026',
    'add.failed': 'Impossibile aggiungere',
    // Recategorize
    'recat.title': 'Ricategorizza come...',
    'recat.hint_placeholder': 'Opzionale: aggiungi dettagli per aiutare l\'IA (es: "\u00e8 un film coreano del 2019")',
    'recat.movie': 'Film',
    'recat.tv': 'Serie TV',
    'recat.short': 'Cortometraggio',
    'recat.recipe': 'Ricetta',
    'recat.documentary': 'Documentario',
    'recat.book': 'Libro',
    'recat.director': 'Regista',
    'recat.generic': 'Generico',
    'recat.retry': 'Riprova (auto-rileva)',
    'recat.processing': 'Elaborazione...',
    'recat.success': 'Rielaborazione...',
    'recat.failed': 'Impossibile ricategorizzare',
    // Delete
    'delete.title': 'Eliminare questo link?',
    'delete.confirm': 'Questa azione non pu\u00f2 essere annullata.',
    'delete.cancel': 'Annulla',
    'delete.delete': 'Elimina',
    'delete.success': 'Link eliminato',
    'delete.failed': 'Impossibile eliminare',
    // Watch
    'watch.marked_watched': 'Segnato come visto',
    'watch.marked_unwatched': 'Segnato come non visto',
    'watch.failed': 'Impossibile aggiornare',
    // Settings
    'settings.title': 'Impostazioni',
    'settings.sign_out': 'Esci',
    'settings.delete_account': 'Elimina account',
    'settings.close': 'Chiudi',
    'settings.language': 'Lingua',
    'settings.confirm_logout': 'Disconnettersi?',
    'settings.confirm_delete_1': 'Sei sicuro di voler eliminare il tuo account? Tutti i tuoi dati verranno cancellati definitivamente.',
    'settings.confirm_delete_2': 'Questa azione \u00e8 irreversibile. Sei assolutamente sicuro?',
    'settings.delete_error': "Errore durante l'eliminazione dell'account",
    // Update banner
    'update.available': 'Aggiornamento disponibile',
    'update.refresh': 'Aggiorna',
    // Time
    'time.just_now': 'adesso',
    'time.minutes_ago': '{n}min fa',
    'time.hours_ago': '{n}h fa',
    'time.yesterday': 'ieri',
    'time.days_ago': '{n}g fa',
    'time.weeks_ago': '{n}sett fa',
    'time.months_ago': '{n}m fa',
    // Misc
    'uncategorized': 'Senza categoria',
  },
  ja: {
    // Home
    'home.subtitle': '\u3042\u306a\u305f\u306e\u53ce\u96c6\u30ea\u30f3\u30af',
    'home.collections': '\u30b3\u30ec\u30af\u30b7\u30e7\u30f3',
    'home.processing': '{n}\u4ef6\u306e\u30ea\u30f3\u30af\u3092\u51e6\u7406\u4e2d\u2026',
    'home.no_links': '\u307e\u3060\u30ea\u30f3\u30af\u304c\u3042\u308a\u307e\u305b\u3093\u3002\u4f55\u304b\u5171\u6709\u3057\u307e\u3057\u3087\u3046\uff01',
    'home.could_not_load': '\u30c7\u30fc\u30bf\u3092\u8aad\u307f\u8fbc\u3081\u307e\u305b\u3093\u3067\u3057\u305f',
    'home.could_not_refresh': '\u66f4\u65b0\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f',
    // History
    'history.subtitle': '\u5c65\u6b74',
    'history.title': '\u6700\u8fd1\u306e\u30a2\u30af\u30c6\u30a3\u30d3\u30c6\u30a3',
    'history.no_links': '\u4fdd\u5b58\u3055\u308c\u305f\u30ea\u30f3\u30af\u306f\u3042\u308a\u307e\u305b\u3093',
    'history.could_not_load': '\u5c65\u6b74\u3092\u8aad\u307f\u8fbc\u3081\u307e\u305b\u3093\u3067\u3057\u305f',
    'history.links_saved': '{n}\u4ef6\u306e\u30ea\u30f3\u30af\u3092\u4fdd\u5b58\u6e08\u307f',
    // Category
    'category.subtitle': '\u30b3\u30ec\u30af\u30b7\u30e7\u30f3',
    'category.no_links': '\u3053\u306e\u30b3\u30ec\u30af\u30b7\u30e7\u30f3\u306b\u306f\u307e\u3060\u30ea\u30f3\u30af\u304c\u3042\u308a\u307e\u305b\u3093',
    'category.no_matches': '\u8a72\u5f53\u306a\u3057',
    'category.could_not_load': '\u30ea\u30f3\u30af\u3092\u8aad\u307f\u8fbc\u3081\u307e\u305b\u3093\u3067\u3057\u305f',
    'category.search_placeholder': '{name}\u3067\u691c\u7d22\u2026',
    'category.search_movie': '\u30bf\u30a4\u30c8\u30eb\u3001\u4ff3\u512a\u3001\u76e3\u7763\u3067\u691c\u7d22\u2026',
    'category.search_recipe': '\u30bf\u30a4\u30c8\u30eb\u307e\u305f\u306f\u98df\u6750\u3067\u691c\u7d22\u2026',
    'category.all': '\u3059\u3079\u3066',
    'category.link_count': '{n}\u4ef6',
    // Link detail
    'link.not_found': '\u30ea\u30f3\u30af\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093',
    'link.details': '\u8a73\u7d30',
    'link.open_original': '\u5143\u306e\u30da\u30fc\u30b8\u3092\u958b\u304f',
    'link.recategorize': '\u518d\u5206\u985e',
    'link.delete_link': '\u30ea\u30f3\u30af\u3092\u524a\u9664',
    'link.tv_show': '\u30c9\u30e9\u30de',
    'link.movie': '\u6620\u753b',
    'link.watched': '\u8996\u8074\u6e08\u307f',
    'link.not_watched': '\u672a\u8996\u8074',
    'link.director': '\u76e3\u7763',
    'link.directors': '\u76e3\u7763',
    'link.cast': '\u30ad\u30e3\u30b9\u30c8',
    'link.where_to_watch': '\u8996\u8074\u65b9\u6cd5',
    'link.ingredients': '\u6750\u6599',
    'link.instructions': '\u4f5c\u308a\u65b9',
    'link.pages': '{n}\u30da\u30fc\u30b8',
    'link.filmography': '\u30d5\u30a3\u30eb\u30e2\u30b0\u30e9\u30d5\u30a3\u30fc',
    'link.prep': '\u4e0b\u6e96\u5099',
    'link.cook': '\u8abf\u7406',
    'link.servings': '\u4eba\u5206',
    // Add link
    'add.title': 'Shelf\u306b\u8ffd\u52a0',
    'add.description': 'URL\u3092\u8cbc\u308a\u4ed8\u3051\u308b\u304b\u3001\u6620\u753b\u540d\u3001\u30ec\u30b7\u30d4\u306a\u3069\u4fdd\u5b58\u3057\u305f\u3044\u3082\u306e\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    'add.placeholder': '\u4f8b: Parasite 2019\u3001https://example.com\u3001\u307e\u305f\u306f\u30ec\u30b7\u30d4\u3092\u8cbc\u308a\u4ed8\u3051\u2026',
    'add.cancel': '\u30ad\u30e3\u30f3\u30bb\u30eb',
    'add.submit': '\u9001\u4fe1',
    'add.submitting': '\u9001\u4fe1\u4e2d\u2026',
    'add.success': '\u8ffd\u52a0\u3057\u307e\u3057\u305f\uff01\u51e6\u7406\u4e2d\u2026',
    'add.failed': '\u8ffd\u52a0\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f',
    // Recategorize
    'recat.title': '\u518d\u5206\u985e...',
    'recat.hint_placeholder': '\u4efb\u610f: AI\u3092\u52a9\u3051\u308b\u8a73\u7d30\u3092\u8ffd\u52a0\uff08\u4f8b: \u300c2019\u5e74\u306e\u97d3\u56fd\u6620\u753b\u300d\uff09',
    'recat.movie': '\u6620\u753b',
    'recat.tv': '\u30c9\u30e9\u30de',
    'recat.short': '\u30b7\u30e7\u30fc\u30c8\u30d5\u30a3\u30eb\u30e0',
    'recat.recipe': '\u30ec\u30b7\u30d4',
    'recat.documentary': '\u30c9\u30ad\u30e5\u30e1\u30f3\u30bf\u30ea\u30fc',
    'recat.book': '\u672c',
    'recat.director': '\u76e3\u7763',
    'recat.generic': '\u305d\u306e\u4ed6',
    'recat.retry': '\u518d\u8a66\u884c\uff08\u81ea\u52d5\u691c\u51fa\uff09',
    'recat.processing': '\u51e6\u7406\u4e2d...',
    'recat.success': '\u518d\u51e6\u7406\u4e2d...',
    'recat.failed': '\u518d\u5206\u985e\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f',
    // Delete
    'delete.title': '\u3053\u306e\u30ea\u30f3\u30af\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f',
    'delete.confirm': '\u3053\u306e\u64cd\u4f5c\u306f\u53d6\u308a\u6d88\u305b\u307e\u305b\u3093\u3002',
    'delete.cancel': '\u30ad\u30e3\u30f3\u30bb\u30eb',
    'delete.delete': '\u524a\u9664',
    'delete.success': '\u30ea\u30f3\u30af\u3092\u524a\u9664\u3057\u307e\u3057\u305f',
    'delete.failed': '\u524a\u9664\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f',
    // Watch
    'watch.marked_watched': '\u8996\u8074\u6e08\u307f\u306b\u3057\u307e\u3057\u305f',
    'watch.marked_unwatched': '\u672a\u8996\u8074\u306b\u3057\u307e\u3057\u305f',
    'watch.failed': '\u66f4\u65b0\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f',
    // Settings
    'settings.title': '\u8a2d\u5b9a',
    'settings.sign_out': '\u30b5\u30a4\u30f3\u30a2\u30a6\u30c8',
    'settings.delete_account': '\u30a2\u30ab\u30a6\u30f3\u30c8\u3092\u524a\u9664',
    'settings.close': '\u9589\u3058\u308b',
    'settings.language': '\u8a00\u8a9e',
    'settings.confirm_logout': '\u30b5\u30a4\u30f3\u30a2\u30a6\u30c8\u3057\u307e\u3059\u304b\uff1f',
    'settings.confirm_delete_1': '\u30a2\u30ab\u30a6\u30f3\u30c8\u3092\u524a\u9664\u3057\u3066\u3082\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f\u3059\u3079\u3066\u306e\u30c7\u30fc\u30bf\u304c\u5b8c\u5168\u306b\u524a\u9664\u3055\u308c\u307e\u3059\u3002',
    'settings.confirm_delete_2': '\u3053\u306e\u64cd\u4f5c\u306f\u53d6\u308a\u6d88\u305b\u307e\u305b\u3093\u3002\u672c\u5f53\u306b\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f',
    'settings.delete_error': '\u30a2\u30ab\u30a6\u30f3\u30c8\u306e\u524a\u9664\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f',
    // Update banner
    'update.available': '\u30a2\u30c3\u30d7\u30c7\u30fc\u30c8\u304c\u3042\u308a\u307e\u3059',
    'update.refresh': '\u66f4\u65b0',
    // Time
    'time.just_now': '\u305f\u3063\u305f\u4eca',
    'time.minutes_ago': '{n}\u5206\u524d',
    'time.hours_ago': '{n}\u6642\u9593\u524d',
    'time.yesterday': '\u6628\u65e5',
    'time.days_ago': '{n}\u65e5\u524d',
    'time.weeks_ago': '{n}\u9031\u9593\u524d',
    'time.months_ago': '{n}\u30f6\u6708\u524d',
    // Misc
    'uncategorized': '\u672a\u5206\u985e',
  },
  ko: {
    // Home
    'home.subtitle': '\ub098\ub9cc\uc758 \ud050\ub808\uc774\uc158 \ub9c1\ud06c',
    'home.collections': '\ucee8\ub809\uc158',
    'home.processing': '{n}\uac1c \ub9c1\ud06c \ucc98\ub9ac \uc911\u2026',
    'home.no_links': '\uc544\uc9c1 \ub9c1\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4. \ubb34\uc5b8\uac00 \uacf5\uc720\ud574 \ubcf4\uc138\uc694!',
    'home.could_not_load': '\ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    'home.could_not_refresh': '\uc0c8\ub85c\uace0\uce68\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    // History
    'history.subtitle': '\ud0c0\uc784\ub77c\uc778',
    'history.title': '\ucd5c\uadfc \ud65c\ub3d9',
    'history.no_links': '\uc800\uc7a5\ub41c \ub9c1\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4',
    'history.could_not_load': '\uae30\ub85d\uc744 \ubd88\ub7ec\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    'history.links_saved': '{n}\uac1c \ub9c1\ud06c \uc800\uc7a5\ub428',
    // Category
    'category.subtitle': '\ucee8\ub809\uc158',
    'category.no_links': '\uc774 \ucee8\ub809\uc158\uc5d0 \ub9c1\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4',
    'category.no_matches': '\uacb0\uacfc \uc5c6\uc74c',
    'category.could_not_load': '\ub9c1\ud06c\ub97c \ubd88\ub7ec\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    'category.search_placeholder': '{name}\uc5d0\uc11c \uac80\uc0c9\u2026',
    'category.search_movie': '\uc81c\ubaa9, \ubc30\uc6b0, \uac10\ub3c5\uc73c\ub85c \uac80\uc0c9\u2026',
    'category.search_recipe': '\uc81c\ubaa9 \ub610\ub294 \uc7ac\ub8cc\ub85c \uac80\uc0c9\u2026',
    'category.all': '\uc804\uccb4',
    'category.link_count': '{n}\uac1c',
    // Link detail
    'link.not_found': '\ub9c1\ud06c\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    'link.details': '\uc0c1\uc138',
    'link.open_original': '\uc6d0\ubcf8 \uc5f4\uae30',
    'link.recategorize': '\uc7ac\ubd84\ub958',
    'link.delete_link': '\ub9c1\ud06c \uc0ad\uc81c',
    'link.tv_show': '\ub4dc\ub77c\ub9c8',
    'link.movie': '\uc601\ud654',
    'link.watched': '\uc2dc\uccad \uc644\ub8cc',
    'link.not_watched': '\ubbf8\uc2dc\uccad',
    'link.director': '\uac10\ub3c5',
    'link.directors': '\uac10\ub3c5',
    'link.cast': '\ucd9c\uc5f0\uc9c4',
    'link.where_to_watch': '\uc2dc\uccad \ubc29\ubc95',
    'link.ingredients': '\uc7ac\ub8cc',
    'link.instructions': '\ub9cc\ub4dc\ub294 \ubc95',
    'link.pages': '{n}\ud398\uc774\uc9c0',
    'link.filmography': '\ud544\ubaa8\uadf8\ub798\ud53c',
    'link.prep': '\uc900\ube44',
    'link.cook': '\uc870\ub9ac',
    'link.servings': '\uc778\ubd84',
    // Add link
    'add.title': 'Shelf\uc5d0 \ucd94\uac00',
    'add.description': 'URL\uc744 \ubd99\uc5ec\ub123\uac70\ub098 \uc601\ud654 \uc81c\ubaa9, \ub808\uc2dc\ud53c \ub4f1 \uc800\uc7a5\ud558\uace0 \uc2f6\uc740 \uac83\uc744 \uc785\ub825\ud558\uc138\uc694.',
    'add.placeholder': '\uc608: \uae30\uc0dd\ucda9 2019, https://example.com, \ub610\ub294 \ub808\uc2dc\ud53c \ubd99\uc5ec\ub123\uae30\u2026',
    'add.cancel': '\ucde8\uc18c',
    'add.submit': '\ubcf4\ub0b4\uae30',
    'add.submitting': '\ubcf4\ub0b4\ub294 \uc911\u2026',
    'add.success': '\ucd94\uac00\ub428! \ucc98\ub9ac \uc911\u2026',
    'add.failed': '\ucd94\uac00\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    // Recategorize
    'recat.title': '\uc7ac\ubd84\ub958...',
    'recat.hint_placeholder': '\uc120\ud0dd: AI\ub97c \ub3c4\uc640\uc904 \uc138\ubd80 \uc815\ubcf4 \ucd94\uac00 (\uc608: "2019\ub144 \ud55c\uad6d \uc601\ud654")',
    'recat.movie': '\uc601\ud654',
    'recat.tv': '\ub4dc\ub77c\ub9c8',
    'recat.short': '\ub2e8\ud3b8 \uc601\ud654',
    'recat.recipe': '\ub808\uc2dc\ud53c',
    'recat.documentary': '\ub2e4\ud050\uba58\ud130\ub9ac',
    'recat.book': '\ucc45',
    'recat.director': '\uac10\ub3c5',
    'recat.generic': '\uae30\ud0c0',
    'recat.retry': '\ub2e4\uc2dc \uc2dc\ub3c4 (\uc790\ub3d9 \uac10\uc9c0)',
    'recat.processing': '\ucc98\ub9ac \uc911...',
    'recat.success': '\uc7ac\ucc98\ub9ac \uc911...',
    'recat.failed': '\uc7ac\ubd84\ub958\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    // Delete
    'delete.title': '\uc774 \ub9c1\ud06c\ub97c \uc0ad\uc81c\ud560\uae4c\uc694?',
    'delete.confirm': '\uc774 \uc791\uc5c5\uc740 \ucde8\uc18c\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.',
    'delete.cancel': '\ucde8\uc18c',
    'delete.delete': '\uc0ad\uc81c',
    'delete.success': '\ub9c1\ud06c \uc0ad\uc81c \uc644\ub8cc',
    'delete.failed': '\uc0ad\uc81c\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    // Watch
    'watch.marked_watched': '\uc2dc\uccad \uc644\ub8cc\ub85c \ud45c\uc2dc',
    'watch.marked_unwatched': '\ubbf8\uc2dc\uccad\uc73c\ub85c \ud45c\uc2dc',
    'watch.failed': '\uc5c5\ub370\uc774\ud2b8\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    // Settings
    'settings.title': '\uc124\uc815',
    'settings.sign_out': '\ub85c\uadf8\uc544\uc6c3',
    'settings.delete_account': '\uacc4\uc815 \uc0ad\uc81c',
    'settings.close': '\ub2eb\uae30',
    'settings.language': '\uc5b8\uc5b4',
    'settings.confirm_logout': '\ub85c\uadf8\uc544\uc6c3\ud560\uae4c\uc694?',
    'settings.confirm_delete_1': '\uacc4\uc815\uc744 \uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c? \ubaa8\ub4e0 \ub370\uc774\ud130\uac00 \uc601\uad6c\uc801\uc73c\ub85c \uc0ad\uc81c\ub429\ub2c8\ub2e4.',
    'settings.confirm_delete_2': '\uc774 \uc791\uc5c5\uc740 \ucde8\uc18c\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \uc815\ub9d0 \ud655\uc2e4\ud569\ub2c8\uae4c?',
    'settings.delete_error': '\uacc4\uc815 \uc0ad\uc81c \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4',
    // Update banner
    'update.available': '\uc5c5\ub370\uc774\ud2b8 \uac00\ub2a5',
    'update.refresh': '\uc0c8\ub85c\uace0\uce68',
    // Time
    'time.just_now': '\ubc29\uae08',
    'time.minutes_ago': '{n}\ubd84 \uc804',
    'time.hours_ago': '{n}\uc2dc\uac04 \uc804',
    'time.yesterday': '\uc5b4\uc81c',
    'time.days_ago': '{n}\uc77c \uc804',
    'time.weeks_ago': '{n}\uc8fc \uc804',
    'time.months_ago': '{n}\uac1c\uc6d4 \uc804',
    // Misc
    'uncategorized': '\ubbf8\ubd84\ub958',
  },
  zh: {
    // Home
    'home.subtitle': '\u4f60\u7684\u7cbe\u9009\u94fe\u63a5',
    'home.collections': '\u5408\u96c6',
    'home.processing': '{n}\u4e2a\u94fe\u63a5\u5904\u7406\u4e2d\u2026',
    'home.no_links': '\u8fd8\u6ca1\u6709\u94fe\u63a5\u3002\u5206\u4eab\u4e00\u4e9b\u5427\uff01',
    'home.could_not_load': '\u65e0\u6cd5\u52a0\u8f7d\u6570\u636e',
    'home.could_not_refresh': '\u65e0\u6cd5\u5237\u65b0',
    // History
    'history.subtitle': '\u65f6\u95f4\u7ebf',
    'history.title': '\u6700\u8fd1\u6d3b\u52a8',
    'history.no_links': '\u8fd8\u6ca1\u6709\u4fdd\u5b58\u7684\u94fe\u63a5',
    'history.could_not_load': '\u65e0\u6cd5\u52a0\u8f7d\u5386\u53f2\u8bb0\u5f55',
    'history.links_saved': '\u5df2\u4fdd\u5b58{n}\u4e2a\u94fe\u63a5',
    // Category
    'category.subtitle': '\u5408\u96c6',
    'category.no_links': '\u8fd9\u4e2a\u5408\u96c6\u8fd8\u6ca1\u6709\u94fe\u63a5',
    'category.no_matches': '\u65e0\u7ed3\u679c',
    'category.could_not_load': '\u65e0\u6cd5\u52a0\u8f7d\u94fe\u63a5',
    'category.search_placeholder': '\u5728{name}\u4e2d\u641c\u7d22\u2026',
    'category.search_movie': '\u6309\u6807\u9898\u3001\u6f14\u5458\u3001\u5bfc\u6f14\u641c\u7d22\u2026',
    'category.search_recipe': '\u6309\u6807\u9898\u6216\u98df\u6750\u641c\u7d22\u2026',
    'category.all': '\u5168\u90e8',
    'category.link_count': '{n}\u4e2a',
    // Link detail
    'link.not_found': '\u94fe\u63a5\u672a\u627e\u5230',
    'link.details': '\u8be6\u60c5',
    'link.open_original': '\u6253\u5f00\u539f\u6587',
    'link.recategorize': '\u91cd\u65b0\u5206\u7c7b',
    'link.delete_link': '\u5220\u9664\u94fe\u63a5',
    'link.tv_show': '\u7535\u89c6\u5267',
    'link.movie': '\u7535\u5f71',
    'link.watched': '\u5df2\u770b',
    'link.not_watched': '\u672a\u770b',
    'link.director': '\u5bfc\u6f14',
    'link.directors': '\u5bfc\u6f14',
    'link.cast': '\u6f14\u5458',
    'link.where_to_watch': '\u5728\u54ea\u89c2\u770b',
    'link.ingredients': '\u98df\u6750',
    'link.instructions': '\u505a\u6cd5',
    'link.pages': '{n}\u9875',
    'link.filmography': '\u4f5c\u54c1\u5217\u8868',
    'link.prep': '\u51c6\u5907',
    'link.cook': '\u70f9\u996a',
    'link.servings': '\u4efd',
    // Add link
    'add.title': '\u6dfb\u52a0\u5230 Shelf',
    'add.description': '\u7c98\u8d34URL\uff0c\u8f93\u5165\u7535\u5f71\u540d\u79f0\u3001\u98df\u8c31\u6216\u4efb\u4f55\u4f60\u60f3\u4fdd\u5b58\u7684\u5185\u5bb9\u3002',
    'add.placeholder': '\u4f8b: \u5bc4\u751f\u866b 2019\u3001https://example.com\u3001\u6216\u7c98\u8d34\u98df\u8c31\u2026',
    'add.cancel': '\u53d6\u6d88',
    'add.submit': '\u63d0\u4ea4',
    'add.submitting': '\u63d0\u4ea4\u4e2d\u2026',
    'add.success': '\u5df2\u6dfb\u52a0\uff01\u5904\u7406\u4e2d\u2026',
    'add.failed': '\u65e0\u6cd5\u6dfb\u52a0',
    // Recategorize
    'recat.title': '\u91cd\u65b0\u5206\u7c7b\u4e3a...',
    'recat.hint_placeholder': '\u53ef\u9009: \u6dfb\u52a0\u8be6\u60c5\u5e2e\u52a9AI\uff08\u4f8b: \u201c\u8fd9\u662f2019\u5e74\u97e9\u56fd\u7535\u5f71\u201d\uff09',
    'recat.movie': '\u7535\u5f71',
    'recat.tv': '\u7535\u89c6\u5267',
    'recat.short': '\u77ed\u7247',
    'recat.recipe': '\u98df\u8c31',
    'recat.documentary': '\u7eaa\u5f55\u7247',
    'recat.book': '\u4e66\u7c4d',
    'recat.director': '\u5bfc\u6f14',
    'recat.generic': '\u5176\u4ed6',
    'recat.retry': '\u91cd\u8bd5\uff08\u81ea\u52a8\u68c0\u6d4b\uff09',
    'recat.processing': '\u5904\u7406\u4e2d...',
    'recat.success': '\u91cd\u65b0\u5904\u7406\u4e2d...',
    'recat.failed': '\u91cd\u65b0\u5206\u7c7b\u5931\u8d25',
    // Delete
    'delete.title': '\u5220\u9664\u6b64\u94fe\u63a5\uff1f',
    'delete.confirm': '\u6b64\u64cd\u4f5c\u65e0\u6cd5\u64a4\u9500\u3002',
    'delete.cancel': '\u53d6\u6d88',
    'delete.delete': '\u5220\u9664',
    'delete.success': '\u94fe\u63a5\u5df2\u5220\u9664',
    'delete.failed': '\u5220\u9664\u5931\u8d25',
    // Watch
    'watch.marked_watched': '\u5df2\u6807\u8bb0\u4e3a\u5df2\u770b',
    'watch.marked_unwatched': '\u5df2\u6807\u8bb0\u4e3a\u672a\u770b',
    'watch.failed': '\u66f4\u65b0\u5931\u8d25',
    // Settings
    'settings.title': '\u8bbe\u7f6e',
    'settings.sign_out': '\u9000\u51fa\u767b\u5f55',
    'settings.delete_account': '\u5220\u9664\u8d26\u6237',
    'settings.close': '\u5173\u95ed',
    'settings.language': '\u8bed\u8a00',
    'settings.confirm_logout': '\u786e\u8ba4\u9000\u51fa\uff1f',
    'settings.confirm_delete_1': '\u786e\u5b9a\u8981\u5220\u9664\u8d26\u6237\u5417\uff1f\u6240\u6709\u6570\u636e\u5c06\u88ab\u6c38\u4e45\u5220\u9664\u3002',
    'settings.confirm_delete_2': '\u6b64\u64cd\u4f5c\u65e0\u6cd5\u64a4\u9500\u3002\u4f60\u786e\u5b9a\u5417\uff1f',
    'settings.delete_error': '\u5220\u9664\u8d26\u6237\u65f6\u51fa\u9519',
    // Update banner
    'update.available': '\u6709\u65b0\u7248\u672c',
    'update.refresh': '\u5237\u65b0',
    // Time
    'time.just_now': '\u521a\u521a',
    'time.minutes_ago': '{n}\u5206\u949f\u524d',
    'time.hours_ago': '{n}\u5c0f\u65f6\u524d',
    'time.yesterday': '\u6628\u5929',
    'time.days_ago': '{n}\u5929\u524d',
    'time.weeks_ago': '{n}\u5468\u524d',
    'time.months_ago': '{n}\u4e2a\u6708\u524d',
    // Misc
    'uncategorized': '\u672a\u5206\u7c7b',
  },
  nl: {
    // Home
    'home.subtitle': 'Jouw samengestelde links',
    'home.collections': 'Collecties',
    'home.processing': '{n} link{s} worden verwerkt\u2026',
    'home.no_links': 'Nog geen links. Deel iets!',
    'home.could_not_load': 'Kan gegevens niet laden',
    'home.could_not_refresh': 'Kan niet vernieuwen',
    // History
    'history.subtitle': 'Tijdlijn',
    'history.title': 'Recente activiteit',
    'history.no_links': 'Nog geen links opgeslagen',
    'history.could_not_load': 'Kan geschiedenis niet laden',
    'history.links_saved': '{n} link{s} opgeslagen',
    // Category
    'category.subtitle': 'Collectie',
    'category.no_links': 'Nog geen links in deze collectie',
    'category.no_matches': 'Geen resultaten',
    'category.could_not_load': 'Kan links niet laden',
    'category.search_placeholder': 'Zoeken in {name}\u2026',
    'category.search_movie': 'Zoeken op titel, acteur, regisseur\u2026',
    'category.search_recipe': 'Zoeken op titel of ingredi\u00ebnt\u2026',
    'category.all': 'Alles',
    'category.link_count': '{n} link{s}',
    // Link detail
    'link.not_found': 'Link niet gevonden',
    'link.details': 'Details',
    'link.open_original': 'Origineel openen',
    'link.recategorize': 'Hercategoriseren',
    'link.delete_link': 'Link verwijderen',
    'link.tv_show': 'Serie',
    'link.movie': 'Film',
    'link.watched': 'Gezien',
    'link.not_watched': 'Niet gezien',
    'link.director': 'Regisseur',
    'link.directors': 'Regisseurs',
    'link.cast': 'Cast',
    'link.where_to_watch': 'Waar te kijken',
    'link.ingredients': 'Ingredi\u00ebnten',
    'link.instructions': 'Bereiding',
    'link.pages': "{n} pagina's",
    'link.filmography': 'Filmografie',
    'link.prep': 'Voorbereiden',
    'link.cook': 'Koken',
    'link.servings': 'Porties',
    // Add link
    'add.title': 'Toevoegen aan Shelf',
    'add.description': 'Plak een URL, typ een filmnaam, een recept, of wat je wilt opslaan.',
    'add.placeholder': 'Bijv: Parasite 2019, https://voorbeeld.nl, of plak een recept\u2026',
    'add.cancel': 'Annuleren',
    'add.submit': 'Verzenden',
    'add.submitting': 'Verzenden\u2026',
    'add.success': 'Toegevoegd! Verwerken\u2026',
    'add.failed': 'Kan niet toevoegen',
    // Recategorize
    'recat.title': 'Hercategoriseren als...',
    'recat.hint_placeholder': 'Optioneel: voeg details toe om AI te helpen (bijv. "het is een Koreaanse film uit 2019")',
    'recat.movie': 'Film',
    'recat.tv': 'Serie',
    'recat.short': 'Korte film',
    'recat.recipe': 'Recept',
    'recat.documentary': 'Documentaire',
    'recat.book': 'Boek',
    'recat.director': 'Regisseur',
    'recat.generic': 'Algemeen',
    'recat.retry': 'Opnieuw proberen (automatisch)',
    'recat.processing': 'Verwerken...',
    'recat.success': 'Opnieuw verwerken...',
    'recat.failed': 'Kan niet hercategoriseren',
    // Delete
    'delete.title': 'Deze link verwijderen?',
    'delete.confirm': 'Deze actie kan niet ongedaan worden gemaakt.',
    'delete.cancel': 'Annuleren',
    'delete.delete': 'Verwijderen',
    'delete.success': 'Link verwijderd',
    'delete.failed': 'Kan niet verwijderen',
    // Watch
    'watch.marked_watched': 'Gemarkeerd als gezien',
    'watch.marked_unwatched': 'Gemarkeerd als niet gezien',
    'watch.failed': 'Kan niet bijwerken',
    // Settings
    'settings.title': 'Instellingen',
    'settings.sign_out': 'Uitloggen',
    'settings.delete_account': 'Account verwijderen',
    'settings.close': 'Sluiten',
    'settings.language': 'Taal',
    'settings.confirm_logout': 'Uitloggen?',
    'settings.confirm_delete_1': 'Weet je zeker dat je je account wilt verwijderen? Al je gegevens worden permanent gewist.',
    'settings.confirm_delete_2': 'Deze actie kan niet ongedaan worden gemaakt. Weet je het absoluut zeker?',
    'settings.delete_error': 'Fout bij het verwijderen van account',
    // Update banner
    'update.available': 'Update beschikbaar',
    'update.refresh': 'Vernieuwen',
    // Time
    'time.just_now': 'zojuist',
    'time.minutes_ago': '{n}min geleden',
    'time.hours_ago': '{n}u geleden',
    'time.yesterday': 'gisteren',
    'time.days_ago': '{n}d geleden',
    'time.weeks_ago': '{n}w geleden',
    'time.months_ago': '{n}mnd geleden',
    // Misc
    'uncategorized': 'Ongecategoriseerd',
  },
  ru: {
    // Home
    'home.subtitle': '\u0412\u0430\u0448\u0438 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u044b\u0435 \u0441\u0441\u044b\u043b\u043a\u0438',
    'home.collections': '\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438',
    'home.processing': '\u041e\u0431\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f {n} \u0441\u0441\u044b\u043b\u043e\u043a\u2026',
    'home.no_links': '\u0421\u0441\u044b\u043b\u043e\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442. \u041f\u043e\u0434\u0435\u043b\u0438\u0442\u0435\u0441\u044c \u0447\u0435\u043c-\u043d\u0438\u0431\u0443\u0434\u044c!',
    'home.could_not_load': '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435',
    'home.could_not_refresh': '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c',
    // History
    'history.subtitle': '\u0425\u0440\u043e\u043d\u043e\u043b\u043e\u0433\u0438\u044f',
    'history.title': '\u041d\u0435\u0434\u0430\u0432\u043d\u044f\u044f \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c',
    'history.no_links': '\u0421\u043e\u0445\u0440\u0430\u043d\u0451\u043d\u043d\u044b\u0445 \u0441\u0441\u044b\u043b\u043e\u043a \u043d\u0435\u0442',
    'history.could_not_load': '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438\u0441\u0442\u043e\u0440\u0438\u044e',
    'history.links_saved': '{n} \u0441\u0441\u044b\u043b\u043e\u043a \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e',
    // Category
    'category.subtitle': '\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f',
    'category.no_links': '\u0412 \u044d\u0442\u043e\u0439 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0441\u0441\u044b\u043b\u043e\u043a',
    'category.no_matches': '\u041d\u0435\u0442 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u043e\u0432',
    'category.could_not_load': '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u0441\u044b\u043b\u043a\u0438',
    'category.search_placeholder': '\u041f\u043e\u0438\u0441\u043a \u0432 {name}\u2026',
    'category.search_movie': '\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e, \u0430\u043a\u0442\u0451\u0440\u0443, \u0440\u0435\u0436\u0438\u0441\u0441\u0451\u0440\u0443\u2026',
    'category.search_recipe': '\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e \u0438\u043b\u0438 \u0438\u043d\u0433\u0440\u0435\u0434\u0438\u0435\u043d\u0442\u0443\u2026',
    'category.all': '\u0412\u0441\u0435',
    'category.link_count': '{n} \u0441\u0441\u044b\u043b\u043e\u043a',
    // Link detail
    'link.not_found': '\u0421\u0441\u044b\u043b\u043a\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430',
    'link.details': '\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438',
    'link.open_original': '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043e\u0440\u0438\u0433\u0438\u043d\u0430\u043b',
    'link.recategorize': '\u041f\u0435\u0440\u0435\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c',
    'link.delete_link': '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0441\u0441\u044b\u043b\u043a\u0443',
    'link.tv_show': '\u0421\u0435\u0440\u0438\u0430\u043b',
    'link.movie': '\u0424\u0438\u043b\u044c\u043c',
    'link.watched': '\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u043e',
    'link.not_watched': '\u041d\u0435 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u043e',
    'link.director': '\u0420\u0435\u0436\u0438\u0441\u0441\u0451\u0440',
    'link.directors': '\u0420\u0435\u0436\u0438\u0441\u0441\u0451\u0440\u044b',
    'link.cast': '\u0410\u043a\u0442\u0451\u0440\u044b',
    'link.where_to_watch': '\u0413\u0434\u0435 \u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c',
    'link.ingredients': '\u0418\u043d\u0433\u0440\u0435\u0434\u0438\u0435\u043d\u0442\u044b',
    'link.instructions': '\u0418\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f',
    'link.pages': '{n} \u0441\u0442\u0440.',
    'link.filmography': '\u0424\u0438\u043b\u044c\u043c\u043e\u0433\u0440\u0430\u0444\u0438\u044f',
    'link.prep': '\u041f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430',
    'link.cook': '\u0413\u043e\u0442\u043e\u0432\u043a\u0430',
    'link.servings': '\u041f\u043e\u0440\u0446\u0438\u0439',
    // Add link
    'add.title': '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0432 Shelf',
    'add.description': '\u0412\u0441\u0442\u0430\u0432\u044c\u0442\u0435 URL, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0444\u0438\u043b\u044c\u043c\u0430, \u0440\u0435\u0446\u0435\u043f\u0442 \u0438\u043b\u0438 \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c.',
    'add.placeholder': '\u041d\u0430\u043f\u0440: \u041f\u0430\u0440\u0430\u0437\u0438\u0442\u044b 2019, https://example.com \u0438\u043b\u0438 \u0440\u0435\u0446\u0435\u043f\u0442\u2026',
    'add.cancel': '\u041e\u0442\u043c\u0435\u043d\u0430',
    'add.submit': '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c',
    'add.submitting': '\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430\u2026',
    'add.success': '\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e! \u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430\u2026',
    'add.failed': '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c',
    // Recategorize
    'recat.title': '\u041f\u0435\u0440\u0435\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u0430\u043a...',
    'recat.hint_placeholder': '\u041d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e: \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0434\u0435\u0442\u0430\u043b\u0438 \u0434\u043b\u044f AI (\u043d\u0430\u043f\u0440: \u00ab\u044d\u0442\u043e \u043a\u043e\u0440\u0435\u0439\u0441\u043a\u0438\u0439 \u0444\u0438\u043b\u044c\u043c 2019 \u0433\u043e\u0434\u0430\u00bb)',
    'recat.movie': '\u0424\u0438\u043b\u044c\u043c',
    'recat.tv': '\u0421\u0435\u0440\u0438\u0430\u043b',
    'recat.short': '\u041a\u043e\u0440\u043e\u0442\u043a\u043e\u043c\u0435\u0442\u0440\u0430\u0436\u043a\u0430',
    'recat.recipe': '\u0420\u0435\u0446\u0435\u043f\u0442',
    'recat.documentary': '\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u043b\u044c\u043d\u044b\u0439',
    'recat.book': '\u041a\u043d\u0438\u0433\u0430',
    'recat.director': '\u0420\u0435\u0436\u0438\u0441\u0441\u0451\u0440',
    'recat.generic': '\u041e\u0431\u0449\u0435\u0435',
    'recat.retry': '\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c (\u0430\u0432\u0442\u043e\u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435)',
    'recat.processing': '\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430...',
    'recat.success': '\u041f\u0435\u0440\u0435\u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430...',
    'recat.failed': '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u0435\u0440\u0435\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c',
    // Delete
    'delete.title': '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u0443 \u0441\u0441\u044b\u043b\u043a\u0443?',
    'delete.confirm': '\u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c.',
    'delete.cancel': '\u041e\u0442\u043c\u0435\u043d\u0430',
    'delete.delete': '\u0423\u0434\u0430\u043b\u0438\u0442\u044c',
    'delete.success': '\u0421\u0441\u044b\u043b\u043a\u0430 \u0443\u0434\u0430\u043b\u0435\u043d\u0430',
    'delete.failed': '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c',
    // Watch
    'watch.marked_watched': '\u041e\u0442\u043c\u0435\u0447\u0435\u043d\u043e \u043a\u0430\u043a \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u043d\u043e\u0435',
    'watch.marked_unwatched': '\u041e\u0442\u043c\u0435\u0447\u0435\u043d\u043e \u043a\u0430\u043a \u043d\u0435 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u043d\u043e\u0435',
    'watch.failed': '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c',
    // Settings
    'settings.title': '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438',
    'settings.sign_out': '\u0412\u044b\u0439\u0442\u0438',
    'settings.delete_account': '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0430\u043a\u043a\u0430\u0443\u043d\u0442',
    'settings.close': '\u0417\u0430\u043a\u0440\u044b\u0442\u044c',
    'settings.language': '\u042f\u0437\u044b\u043a',
    'settings.confirm_logout': '\u0412\u044b\u0439\u0442\u0438?',
    'settings.confirm_delete_1': '\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0430\u043a\u043a\u0430\u0443\u043d\u0442? \u0412\u0441\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0431\u0443\u0434\u0443\u0442 \u0443\u0434\u0430\u043b\u0435\u043d\u044b \u043d\u0430\u0432\u0441\u0435\u0433\u0434\u0430.',
    'settings.confirm_delete_2': '\u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c. \u0412\u044b \u0430\u0431\u0441\u043e\u043b\u044e\u0442\u043d\u043e \u0443\u0432\u0435\u0440\u0435\u043d\u044b?',
    'settings.delete_error': '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u0438 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430',
    // Update banner
    'update.available': '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435',
    'update.refresh': '\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c',
    // Time
    'time.just_now': '\u0442\u043e\u043b\u044c\u043a\u043e \u0447\u0442\u043e',
    'time.minutes_ago': '{n}\u043c\u0438\u043d \u043d\u0430\u0437\u0430\u0434',
    'time.hours_ago': '{n}\u0447 \u043d\u0430\u0437\u0430\u0434',
    'time.yesterday': '\u0432\u0447\u0435\u0440\u0430',
    'time.days_ago': '{n}\u0434 \u043d\u0430\u0437\u0430\u0434',
    'time.weeks_ago': '{n}\u043d\u0435\u0434 \u043d\u0430\u0437\u0430\u0434',
    'time.months_ago': '{n}\u043c\u0435\u0441 \u043d\u0430\u0437\u0430\u0434',
    // Misc
    'uncategorized': '\u0411\u0435\u0437 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438',
  },
  ar: {
    // Home
    'home.subtitle': '\u0631\u0648\u0627\u0628\u0637\u0643 \u0627\u0644\u0645\u062e\u062a\u0627\u0631\u0629',
    'home.collections': '\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0627\u062a',
    'home.processing': '\u062c\u0627\u0631\u064a \u0645\u0639\u0627\u0644\u062c\u0629 {n} \u0631\u0627\u0628\u0637\u2026',
    'home.no_links': '\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u0648\u0627\u0628\u0637 \u0628\u0639\u062f. \u0634\u0627\u0631\u0643 \u0634\u064a\u0626\u0627\u064b!',
    'home.could_not_load': '\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a',
    'home.could_not_refresh': '\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062a\u062d\u062f\u064a\u062b',
    // History
    'history.subtitle': '\u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064a',
    'history.title': '\u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0623\u062e\u064a\u0631',
    'history.no_links': '\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u0648\u0627\u0628\u0637 \u0645\u062d\u0641\u0648\u0638\u0629',
    'history.could_not_load': '\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0633\u062c\u0644',
    'history.links_saved': '\u062a\u0645 \u062d\u0641\u0638 {n} \u0631\u0627\u0628\u0637',
    // Category
    'category.subtitle': '\u0645\u062c\u0645\u0648\u0639\u0629',
    'category.no_links': '\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u0648\u0627\u0628\u0637 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 \u0628\u0639\u062f',
    'category.no_matches': '\u0644\u0627 \u0646\u062a\u0627\u0626\u062c',
    'category.could_not_load': '\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0631\u0648\u0627\u0628\u0637',
    'category.search_placeholder': '\u0627\u0644\u0628\u062d\u062b \u0641\u064a {name}\u2026',
    'category.search_movie': '\u0627\u0644\u0628\u062d\u062b \u0628\u0627\u0644\u0639\u0646\u0648\u0627\u0646\u060c \u0627\u0644\u0645\u0645\u062b\u0644\u060c \u0627\u0644\u0645\u062e\u0631\u062c\u2026',
    'category.search_recipe': '\u0627\u0644\u0628\u062d\u062b \u0628\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0623\u0648 \u0627\u0644\u0645\u0643\u0648\u0651\u0646\u2026',
    'category.all': '\u0627\u0644\u0643\u0644',
    'category.link_count': '{n} \u0631\u0627\u0628\u0637',
    // Link detail
    'link.not_found': '\u0627\u0644\u0631\u0627\u0628\u0637 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f',
    'link.details': '\u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644',
    'link.open_original': '\u0641\u062a\u062d \u0627\u0644\u0623\u0635\u0644\u064a',
    'link.recategorize': '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0635\u0646\u064a\u0641',
    'link.delete_link': '\u062d\u0630\u0641 \u0627\u0644\u0631\u0627\u0628\u0637',
    'link.tv_show': '\u0645\u0633\u0644\u0633\u0644',
    'link.movie': '\u0641\u064a\u0644\u0645',
    'link.watched': '\u062a\u0645\u062a \u0627\u0644\u0645\u0634\u0627\u0647\u062f\u0629',
    'link.not_watched': '\u0644\u0645 \u064a\u064f\u0634\u0627\u0647\u064e\u062f',
    'link.director': '\u0627\u0644\u0645\u062e\u0631\u062c',
    'link.directors': '\u0627\u0644\u0645\u062e\u0631\u062c\u0648\u0646',
    'link.cast': '\u0627\u0644\u0645\u0645\u062b\u0644\u0648\u0646',
    'link.where_to_watch': '\u0623\u064a\u0646 \u062a\u0634\u0627\u0647\u062f',
    'link.ingredients': '\u0627\u0644\u0645\u0643\u0648\u0651\u0646\u0627\u062a',
    'link.instructions': '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062a\u062d\u0636\u064a\u0631',
    'link.pages': '{n} \u0635\u0641\u062d\u0629',
    'link.filmography': '\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0633\u064a\u0646\u0645\u0627\u0626\u064a\u0629',
    'link.prep': '\u0627\u0644\u062a\u062d\u0636\u064a\u0631',
    'link.cook': '\u0627\u0644\u0637\u0647\u064a',
    'link.servings': '\u0627\u0644\u062d\u0635\u0635',
    // Add link
    'add.title': '\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 Shelf',
    'add.description': '\u0627\u0644\u0635\u0642 \u0631\u0627\u0628\u0637\u0627\u064b\u060c \u0627\u0643\u062a\u0628 \u0627\u0633\u0645 \u0641\u064a\u0644\u0645\u060c \u0648\u0635\u0641\u0629\u060c \u0623\u0648 \u0623\u064a \u0634\u064a\u0621 \u062a\u0631\u064a\u062f \u062d\u0641\u0638\u0647.',
    'add.placeholder': '\u0645\u062b\u0644: Parasite 2019\u060c https://example.com\u060c \u0623\u0648 \u0627\u0644\u0635\u0642 \u0648\u0635\u0641\u0629\u2026',
    'add.cancel': '\u0625\u0644\u063a\u0627\u0621',
    'add.submit': '\u0625\u0631\u0633\u0627\u0644',
    'add.submitting': '\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u2026',
    'add.success': '\u062a\u0645\u062a \u0627\u0644\u0625\u0636\u0627\u0641\u0629! \u062c\u0627\u0631\u064a \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629\u2026',
    'add.failed': '\u062a\u0639\u0630\u0651\u0631\u062a \u0627\u0644\u0625\u0636\u0627\u0641\u0629',
    // Recategorize
    'recat.title': '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0635\u0646\u064a\u0641 \u0643\u0640...',
    'recat.hint_placeholder': '\u0627\u062e\u062a\u064a\u0627\u0631\u064a: \u0623\u0636\u0641 \u062a\u0641\u0627\u0635\u064a\u0644 \u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a (\u0645\u062b\u0644: \u00ab\u0641\u064a\u0644\u0645 \u0643\u0648\u0631\u064a \u0645\u0646 2019\u00bb)',
    'recat.movie': '\u0641\u064a\u0644\u0645',
    'recat.tv': '\u0645\u0633\u0644\u0633\u0644',
    'recat.short': '\u0641\u064a\u0644\u0645 \u0642\u0635\u064a\u0631',
    'recat.recipe': '\u0648\u0635\u0641\u0629',
    'recat.documentary': '\u0648\u062b\u0627\u0626\u0642\u064a',
    'recat.book': '\u0643\u062a\u0627\u0628',
    'recat.director': '\u0645\u062e\u0631\u062c',
    'recat.generic': '\u0639\u0627\u0645',
    'recat.retry': '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 (\u0643\u0634\u0641 \u062a\u0644\u0642\u0627\u0626\u064a)',
    'recat.processing': '\u062c\u0627\u0631\u064a \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629...',
    'recat.success': '\u062c\u0627\u0631\u064a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629...',
    'recat.failed': '\u062a\u0639\u0630\u0651\u0631\u062a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0635\u0646\u064a\u0641',
    // Delete
    'delete.title': '\u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637\u061f',
    'delete.confirm': '\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062c\u0631\u0627\u0621.',
    'delete.cancel': '\u0625\u0644\u063a\u0627\u0621',
    'delete.delete': '\u062d\u0630\u0641',
    'delete.success': '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0631\u0627\u0628\u0637',
    'delete.failed': '\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062d\u0630\u0641',
    // Watch
    'watch.marked_watched': '\u062a\u0645 \u0648\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u0645\u064f\u0634\u0627\u0647\u064e\u062f',
    'watch.marked_unwatched': '\u062a\u0645 \u0648\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u063a\u064a\u0631 \u0645\u064f\u0634\u0627\u0647\u064e\u062f',
    'watch.failed': '\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062a\u062d\u062f\u064a\u062b',
    // Settings
    'settings.title': '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
    'settings.sign_out': '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c',
    'settings.delete_account': '\u062d\u0630\u0641 \u0627\u0644\u062d\u0633\u0627\u0628',
    'settings.close': '\u0625\u063a\u0644\u0627\u0642',
    'settings.language': '\u0627\u0644\u0644\u063a\u0629',
    'settings.confirm_logout': '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c\u061f',
    'settings.confirm_delete_1': '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u062d\u0633\u0627\u0628\u0643\u061f \u0633\u064a\u062a\u0645 \u062d\u0630\u0641 \u062c\u0645\u064a\u0639 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0646\u0647\u0627\u0626\u064a\u0627\u064b.',
    'settings.confirm_delete_2': '\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639 \u0639\u0646 \u0647\u0630\u0627. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u062a\u0645\u0627\u0645\u0627\u064b\u061f',
    'settings.delete_error': '\u062e\u0637\u0623 \u0641\u064a \u062d\u0630\u0641 \u0627\u0644\u062d\u0633\u0627\u0628',
    // Update banner
    'update.available': '\u062a\u062d\u062f\u064a\u062b \u0645\u062a\u0627\u062d',
    'update.refresh': '\u062a\u062d\u062f\u064a\u062b',
    // Time
    'time.just_now': '\u0627\u0644\u0622\u0646',
    'time.minutes_ago': '\u0645\u0646\u0630 {n}\u062f',
    'time.hours_ago': '\u0645\u0646\u0630 {n}\u0633',
    'time.yesterday': '\u0623\u0645\u0633',
    'time.days_ago': '\u0645\u0646\u0630 {n}\u064a',
    'time.weeks_ago': '\u0645\u0646\u0630 {n}\u0623\u0633\u0628\u0648\u0639',
    'time.months_ago': '\u0645\u0646\u0630 {n}\u0634\u0647\u0631',
    // Misc
    'uncategorized': '\u063a\u064a\u0631 \u0645\u0635\u0646\u0641',
  },
  hi: {
    // Home
    'home.subtitle': '\u0906\u092a\u0915\u0947 \u091a\u0941\u0928\u0947 \u0939\u0941\u090f \u0932\u093f\u0902\u0915',
    'home.collections': '\u0938\u0902\u0917\u094d\u0930\u0939',
    'home.processing': '{n} \u0932\u093f\u0902\u0915 \u092a\u094d\u0930\u094b\u0938\u0947\u0938 \u0939\u094b \u0930\u0939\u0947 \u0939\u0948\u0902\u2026',
    'home.no_links': '\u0905\u092d\u0940 \u0915\u094b\u0908 \u0932\u093f\u0902\u0915 \u0928\u0939\u0940\u0902\u0964 \u0915\u0941\u091b \u0936\u0947\u092f\u0930 \u0915\u0930\u0947\u0902!',
    'home.could_not_load': '\u0921\u0947\u091f\u093e \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e',
    'home.could_not_refresh': '\u0930\u093f\u092b\u094d\u0930\u0947\u0936 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e',
    // History
    'history.subtitle': '\u0938\u092e\u092f\u0930\u0947\u0916\u093e',
    'history.title': '\u0939\u093e\u0932 \u0915\u0940 \u0917\u0924\u093f\u0935\u093f\u0927\u093f',
    'history.no_links': '\u0905\u092d\u0940 \u0915\u094b\u0908 \u0932\u093f\u0902\u0915 \u0938\u0939\u0947\u091c\u0947 \u0928\u0939\u0940\u0902 \u0939\u0948\u0902',
    'history.could_not_load': '\u0907\u0924\u093f\u0939\u093e\u0938 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e',
    'history.links_saved': '{n} \u0932\u093f\u0902\u0915 \u0938\u0939\u0947\u091c\u0947 \u0917\u090f',
    // Category
    'category.subtitle': '\u0938\u0902\u0917\u094d\u0930\u0939',
    'category.no_links': '\u0907\u0938 \u0938\u0902\u0917\u094d\u0930\u0939 \u092e\u0947\u0902 \u0905\u092d\u0940 \u0915\u094b\u0908 \u0932\u093f\u0902\u0915 \u0928\u0939\u0940\u0902',
    'category.no_matches': '\u0915\u094b\u0908 \u092a\u0930\u093f\u0923\u093e\u092e \u0928\u0939\u0940\u0902',
    'category.could_not_load': '\u0932\u093f\u0902\u0915 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0947',
    'category.search_placeholder': '{name} \u092e\u0947\u0902 \u0916\u094b\u091c\u0947\u0902\u2026',
    'category.search_movie': '\u0936\u0940\u0930\u094d\u0937\u0915, \u0905\u092d\u093f\u0928\u0947\u0924\u093e, \u0928\u093f\u0930\u094d\u0926\u0947\u0936\u0915 \u0938\u0947 \u0916\u094b\u091c\u0947\u0902\u2026',
    'category.search_recipe': '\u0936\u0940\u0930\u094d\u0937\u0915 \u092f\u093e \u0938\u093e\u092e\u0917\u094d\u0930\u0940 \u0938\u0947 \u0916\u094b\u091c\u0947\u0902\u2026',
    'category.all': '\u0938\u092d\u0940',
    'category.link_count': '{n} \u0932\u093f\u0902\u0915',
    // Link detail
    'link.not_found': '\u0932\u093f\u0902\u0915 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e',
    'link.details': '\u0935\u093f\u0935\u0930\u0923',
    'link.open_original': '\u092e\u0942\u0932 \u0916\u094b\u0932\u0947\u0902',
    'link.recategorize': '\u092a\u0941\u0928\u0930\u094d\u0935\u0930\u094d\u0917\u0940\u0915\u0930\u0923',
    'link.delete_link': '\u0932\u093f\u0902\u0915 \u0939\u091f\u093e\u090f\u0902',
    'link.tv_show': '\u0936\u094b',
    'link.movie': '\u092b\u093f\u0932\u094d\u092e',
    'link.watched': '\u0926\u0947\u0916\u093e \u0917\u092f\u093e',
    'link.not_watched': '\u0928\u0939\u0940\u0902 \u0926\u0947\u0916\u093e',
    'link.director': '\u0928\u093f\u0930\u094d\u0926\u0947\u0936\u0915',
    'link.directors': '\u0928\u093f\u0930\u094d\u0926\u0947\u0936\u0915',
    'link.cast': '\u0915\u0932\u093e\u0915\u093e\u0930',
    'link.where_to_watch': '\u0915\u0939\u093e\u0901 \u0926\u0947\u0916\u0947\u0902',
    'link.ingredients': '\u0938\u093e\u092e\u0917\u094d\u0930\u0940',
    'link.instructions': '\u0935\u093f\u0927\u093f',
    'link.pages': '{n} \u092a\u0943\u0937\u094d\u0920',
    'link.filmography': '\u092b\u093f\u0932\u094d\u092e\u094b\u0917\u094d\u0930\u093e\u092b\u0940',
    'link.prep': '\u0924\u0948\u092f\u093e\u0930\u0940',
    'link.cook': '\u092a\u0915\u093e\u0928\u093e',
    'link.servings': '\u0938\u0930\u094d\u0935\u093f\u0902\u0917',
    // Add link
    'add.title': 'Shelf \u092e\u0947\u0902 \u091c\u094b\u0921\u093c\u0947\u0902',
    'add.description': 'URL \u092a\u0947\u0938\u094d\u091f \u0915\u0930\u0947\u0902, \u092b\u093f\u0932\u094d\u092e \u0915\u093e \u0928\u093e\u092e, \u0930\u0947\u0938\u093f\u092a\u0940, \u092f\u093e \u091c\u094b \u092d\u0940 \u0938\u0939\u0947\u091c\u0928\u093e \u091a\u093e\u0939\u0947\u0902 \u0932\u093f\u0916\u0947\u0902\u0964',
    'add.placeholder': '\u0909\u0926\u093e: Parasite 2019, https://example.com, \u092f\u093e \u0930\u0947\u0938\u093f\u092a\u0940 \u092a\u0947\u0938\u094d\u091f \u0915\u0930\u0947\u0902\u2026',
    'add.cancel': '\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902',
    'add.submit': '\u091c\u092e\u093e \u0915\u0930\u0947\u0902',
    'add.submitting': '\u091c\u092e\u093e \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026',
    'add.success': '\u091c\u094b\u0921\u093c\u093e \u0917\u092f\u093e! \u092a\u094d\u0930\u094b\u0938\u0947\u0938 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026',
    'add.failed': '\u091c\u094b\u0921\u093c\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932',
    // Recategorize
    'recat.title': '\u092a\u0941\u0928\u0930\u094d\u0935\u0930\u094d\u0917\u0940\u0915\u0930\u0923...',
    'recat.hint_placeholder': '\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915: AI \u0915\u0940 \u092e\u0926\u0926 \u0915\u0947 \u0932\u093f\u090f \u0935\u093f\u0935\u0930\u0923 \u091c\u094b\u0921\u093c\u0947\u0902 (\u0909\u0926\u093e: "2019 \u0915\u0940 \u0915\u094b\u0930\u093f\u092f\u0928 \u092b\u093f\u0932\u094d\u092e")',
    'recat.movie': '\u092b\u093f\u0932\u094d\u092e',
    'recat.tv': '\u0936\u094b',
    'recat.short': '\u0932\u0918\u0941 \u092b\u093f\u0932\u094d\u092e',
    'recat.recipe': '\u0930\u0947\u0938\u093f\u092a\u0940',
    'recat.documentary': '\u0921\u0949\u0915\u094d\u092f\u0942\u092e\u0947\u0902\u091f\u094d\u0930\u0940',
    'recat.book': '\u0915\u093f\u0924\u093e\u092c',
    'recat.director': '\u0928\u093f\u0930\u094d\u0926\u0947\u0936\u0915',
    'recat.generic': '\u0938\u093e\u092e\u093e\u0928\u094d\u092f',
    'recat.retry': '\u092b\u093f\u0930 \u0938\u0947 \u0915\u094b\u0936\u093f\u0936 (\u0911\u091f\u094b-\u0921\u093f\u091f\u0947\u0915\u094d\u091f)',
    'recat.processing': '\u092a\u094d\u0930\u094b\u0938\u0947\u0938 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...',
    'recat.success': '\u092a\u0941\u0928\u0930\u094d\u092a\u094d\u0930\u094b\u0938\u0947\u0938\u093f\u0902\u0917...',
    'recat.failed': '\u092a\u0941\u0928\u0930\u094d\u0935\u0930\u094d\u0917\u0940\u0915\u0930\u0923 \u0935\u093f\u092b\u0932',
    // Delete
    'delete.title': '\u0915\u094d\u092f\u093e \u092f\u0939 \u0932\u093f\u0902\u0915 \u0939\u091f\u093e\u090f\u0902?',
    'delete.confirm': '\u092f\u0939 \u0915\u094d\u0930\u093f\u092f\u093e \u0935\u093e\u092a\u0938 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0924\u0940\u0964',
    'delete.cancel': '\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902',
    'delete.delete': '\u0939\u091f\u093e\u090f\u0902',
    'delete.success': '\u0932\u093f\u0902\u0915 \u0939\u091f\u093e\u092f\u093e \u0917\u092f\u093e',
    'delete.failed': '\u0939\u091f\u093e\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932',
    // Watch
    'watch.marked_watched': '\u0926\u0947\u0916\u093e \u0917\u092f\u093e \u091a\u093f\u0939\u094d\u0928\u093f\u0924',
    'watch.marked_unwatched': '\u0928\u0939\u0940\u0902 \u0926\u0947\u0916\u093e \u091a\u093f\u0939\u094d\u0928\u093f\u0924',
    'watch.failed': '\u0905\u092a\u0921\u0947\u091f \u0935\u093f\u092b\u0932',
    // Settings
    'settings.title': '\u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938',
    'settings.sign_out': '\u0932\u0949\u0917 \u0906\u0909\u091f',
    'settings.delete_account': '\u0916\u093e\u0924\u093e \u0939\u091f\u093e\u090f\u0902',
    'settings.close': '\u092c\u0902\u0926 \u0915\u0930\u0947\u0902',
    'settings.language': '\u092d\u093e\u0937\u093e',
    'settings.confirm_logout': '\u0932\u0949\u0917 \u0906\u0909\u091f \u0915\u0930\u0947\u0902?',
    'settings.confirm_delete_1': '\u0915\u094d\u092f\u093e \u0906\u092a \u0935\u093e\u0915\u0908 \u0905\u092a\u0928\u093e \u0916\u093e\u0924\u093e \u0939\u091f\u093e\u0928\u093e \u091a\u093e\u0939\u0924\u0947 \u0939\u0948\u0902? \u0938\u092d\u0940 \u0921\u0947\u091f\u093e \u0938\u094d\u0925\u093e\u092f\u0940 \u0930\u0942\u092a \u0938\u0947 \u092e\u093f\u091f \u091c\u093e\u090f\u0917\u093e\u0964',
    'settings.confirm_delete_2': '\u092f\u0939 \u0915\u094d\u0930\u093f\u092f\u093e \u0935\u093e\u092a\u0938 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0924\u0940\u0964 \u0915\u094d\u092f\u093e \u0906\u092a \u092a\u0942\u0930\u0940 \u0924\u0930\u0939 \u0938\u0941\u0928\u093f\u0936\u094d\u091a\u093f\u0924 \u0939\u0948\u0902?',
    'settings.delete_error': '\u0916\u093e\u0924\u093e \u0939\u091f\u093e\u0928\u0947 \u092e\u0947\u0902 \u0924\u094d\u0930\u0941\u091f\u093f',
    // Update banner
    'update.available': '\u0905\u092a\u0921\u0947\u091f \u0909\u092a\u0932\u092c\u094d\u0927',
    'update.refresh': '\u0930\u093f\u092b\u094d\u0930\u0947\u0936',
    // Time
    'time.just_now': '\u0905\u092d\u0940',
    'time.minutes_ago': '{n}\u092e\u093f\u0928\u091f \u092a\u0939\u0932\u0947',
    'time.hours_ago': '{n}\u0918\u0902\u091f\u0947 \u092a\u0939\u0932\u0947',
    'time.yesterday': '\u0915\u0932',
    'time.days_ago': '{n}\u0926\u093f\u0928 \u092a\u0939\u0932\u0947',
    'time.weeks_ago': '{n}\u0939\u092b\u094d\u0924\u0947 \u092a\u0939\u0932\u0947',
    'time.months_ago': '{n}\u092e\u0939\u0940\u0928\u0947 \u092a\u0939\u0932\u0947',
    // Misc
    'uncategorized': '\u0936\u094d\u0930\u0947\u0923\u0940\u0930\u0939\u093f\u0924',
  },
  tr: {
    // Home
    'home.subtitle': 'Se\u00e7ilmi\u015f ba\u011flant\u0131lar\u0131n',
    'home.collections': 'Koleksiyonlar',
    'home.processing': '{n} ba\u011flant\u0131 i\u015fleniyor\u2026',
    'home.no_links': 'Hen\u00fcz ba\u011flant\u0131 yok. Bir \u015fey payla\u015f!',
    'home.could_not_load': 'Veriler y\u00fcklenemedi',
    'home.could_not_refresh': 'Yenilenemedi',
    // History
    'history.subtitle': 'Zaman \u00e7izelgesi',
    'history.title': 'Son etkinlik',
    'history.no_links': 'Hen\u00fcz kaydedilmi\u015f ba\u011flant\u0131 yok',
    'history.could_not_load': 'Ge\u00e7mi\u015f y\u00fcklenemedi',
    'history.links_saved': '{n} ba\u011flant\u0131 kaydedildi',
    // Category
    'category.subtitle': 'Koleksiyon',
    'category.no_links': 'Bu koleksiyonda hen\u00fcz ba\u011flant\u0131 yok',
    'category.no_matches': 'Sonu\u00e7 bulunamad\u0131',
    'category.could_not_load': 'Ba\u011flant\u0131lar y\u00fcklenemedi',
    'category.search_placeholder': '{name} i\u00e7inde ara\u2026',
    'category.search_movie': 'Ba\u015fl\u0131k, oyuncu, y\u00f6netmen ile ara\u2026',
    'category.search_recipe': 'Ba\u015fl\u0131k veya malzeme ile ara\u2026',
    'category.all': 'T\u00fcm\u00fc',
    'category.link_count': '{n} ba\u011flant\u0131',
    // Link detail
    'link.not_found': 'Ba\u011flant\u0131 bulunamad\u0131',
    'link.details': 'Detaylar',
    'link.open_original': 'Orijinali a\u00e7',
    'link.recategorize': 'Yeniden kategorize et',
    'link.delete_link': 'Ba\u011flant\u0131y\u0131 sil',
    'link.tv_show': 'Dizi',
    'link.movie': 'Film',
    'link.watched': '\u0130zlendi',
    'link.not_watched': '\u0130zlenmedi',
    'link.director': 'Y\u00f6netmen',
    'link.directors': 'Y\u00f6netmenler',
    'link.cast': 'Oyuncular',
    'link.where_to_watch': 'Nerede izlenir',
    'link.ingredients': 'Malzemeler',
    'link.instructions': 'Tarif',
    'link.pages': '{n} sayfa',
    'link.filmography': 'Filmografi',
    'link.prep': 'Haz\u0131rl\u0131k',
    'link.cook': 'Pi\u015firme',
    'link.servings': 'Ki\u015fi',
    // Add link
    'add.title': "Shelf'e ekle",
    'add.description': 'URL yap\u0131\u015ft\u0131r\u0131n, film ad\u0131, tarif veya kaydetmek istedi\u011finiz her\u015feyi yaz\u0131n.',
    'add.placeholder': '\u00d6rn: Parazit 2019, https://ornek.com, veya tarif yap\u0131\u015ft\u0131r\u0131n\u2026',
    'add.cancel': '\u0130ptal',
    'add.submit': 'G\u00f6nder',
    'add.submitting': 'G\u00f6nderiliyor\u2026',
    'add.success': 'Eklendi! \u0130\u015fleniyor\u2026',
    'add.failed': 'Eklenemedi',
    // Recategorize
    'recat.title': 'Yeniden kategorize et...',
    'recat.hint_placeholder': '\u0130ste\u011fe ba\u011fl\u0131: AI\'ya yard\u0131mc\u0131 olacak detay ekleyin (\u00f6rn: "2019 Kore filmi")',
    'recat.movie': 'Film',
    'recat.tv': 'Dizi',
    'recat.short': 'K\u0131sa Film',
    'recat.recipe': 'Tarif',
    'recat.documentary': 'Belgesel',
    'recat.book': 'Kitap',
    'recat.director': 'Y\u00f6netmen',
    'recat.generic': 'Genel',
    'recat.retry': 'Tekrar dene (otomatik)',
    'recat.processing': '\u0130\u015fleniyor...',
    'recat.success': 'Yeniden i\u015fleniyor...',
    'recat.failed': 'Yeniden kategorize edilemedi',
    // Delete
    'delete.title': 'Bu ba\u011flant\u0131y\u0131 silmek istiyor musunuz?',
    'delete.confirm': 'Bu i\u015flem geri al\u0131namaz.',
    'delete.cancel': '\u0130ptal',
    'delete.delete': 'Sil',
    'delete.success': 'Ba\u011flant\u0131 silindi',
    'delete.failed': 'Silinemedi',
    // Watch
    'watch.marked_watched': '\u0130zlendi olarak i\u015faretlendi',
    'watch.marked_unwatched': '\u0130zlenmedi olarak i\u015faretlendi',
    'watch.failed': 'G\u00fcncellenemedi',
    // Settings
    'settings.title': 'Ayarlar',
    'settings.sign_out': '\u00c7\u0131k\u0131\u015f yap',
    'settings.delete_account': 'Hesab\u0131 sil',
    'settings.close': 'Kapat',
    'settings.language': 'Dil',
    'settings.confirm_logout': '\u00c7\u0131k\u0131\u015f yapmak istiyor musunuz?',
    'settings.confirm_delete_1': 'Hesab\u0131n\u0131z\u0131 silmek istedi\u011finizden emin misiniz? T\u00fcm verileriniz kal\u0131c\u0131 olarak silinecektir.',
    'settings.confirm_delete_2': 'Bu i\u015flem geri al\u0131namaz. Kesinlikle emin misiniz?',
    'settings.delete_error': 'Hesap silinirken hata olu\u015ftu',
    // Update banner
    'update.available': 'G\u00fcncelleme mevcut',
    'update.refresh': 'Yenile',
    // Time
    'time.just_now': 'az \u00f6nce',
    'time.minutes_ago': '{n}dk \u00f6nce',
    'time.hours_ago': '{n}sa \u00f6nce',
    'time.yesterday': 'd\u00fcn',
    'time.days_ago': '{n}g \u00f6nce',
    'time.weeks_ago': '{n}hf \u00f6nce',
    'time.months_ago': '{n}ay \u00f6nce',
    // Misc
    'uncategorized': 'Kategorisiz',
  },
};

function detectLocale() {
  const stored = localStorage.getItem('shelf_language');
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  const nav = (navigator.language || 'en').split('-')[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(nav)) return nav;
  return 'en';
}

const RTL_LOCALES = ['ar'];

function applyDirection() {
  const dir = RTL_LOCALES.includes(currentLocale) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', currentLocale);
}

let currentLocale = detectLocale();
applyDirection();

function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  currentLocale = locale;
  localStorage.setItem('shelf_language', locale);
  applyDirection();
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
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
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

// ── Routing ──
function getRoute() {
  const hash = location.hash || '#/';
  if (hash === '#/') return { screen: 'home' };
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
  switch (route.screen) {
    case 'home': renderHome(); break;
    case 'category': renderCategory(route.id); break;
    case 'link': renderLink(route.id); break;
    case 'history': renderHistory(); break;
    default: renderHome();
  }
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
    startPollingIfNeeded();
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
    startPollingIfNeeded();
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
          ${pending.map(l => `<div class="pending-item"><span class="pending-url">${esc(getDomain(l.url) || l.url)}</span></div>`).join('')}
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
  const langLabels = { en: 'English', es: 'Espa\u00f1ol', fr: 'Fran\u00e7ais', pt: 'Portugu\u00eas', de: 'Deutsch', it: 'Italiano', ja: '\u65e5\u672c\u8a9e', ko: '\ud55c\uad6d\uc5b4', zh: '\u4e2d\u6587', nl: 'Nederlands', ru: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', ar: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', hi: '\u0939\u093f\u0928\u094d\u0926\u0940', tr: 'T\u00fcrk\u00e7e' };
  overlay.innerHTML = `
    <div class="confirm-sheet">
      <h3 class="confirm-title">${esc(t('settings.title'))}</h3>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
        <div class="settings-lang-section">
          <label class="settings-lang-label">${esc(t('settings.language'))}</label>
          <div class="settings-lang-grid" id="lang-pills">
            ${SUPPORTED_LOCALES.map(loc => `<button class="lang-pill ${loc === currentLocale ? 'active' : ''}" data-lang="${loc}"><span class="lang-pill-code">${loc.toUpperCase()}</span><span class="lang-pill-name">${langLabels[loc]}</span></button>`).join('')}
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
// ── Auto-polling for processing links ──
let pollTimer = null;

function startPollingIfNeeded() {
  // Stop any existing poll
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }

  // Check if any links are still processing
  const hasProcessing = allLinks.some(l => l.status === 'pending' || l.status === 'processing');
  if (!hasProcessing) return;

  console.log('[poll] Starting poll — found processing links');
  pollTimer = setInterval(async () => {
    try {
      console.log('[poll] Checking...');
      const fresh = await fetchLinks();
      const still = fresh.some(l => l.status === 'pending' || l.status === 'processing');
      allLinks = fresh;

      if (!still) {
        console.log('[poll] All done — stopping poll');
        clearInterval(pollTimer);
        pollTimer = null;
        // Re-render with fresh data
        const cats = await fetchCategories();
        const route = getRoute();
        if (route.screen === 'home') {
          renderHomeContent(cats, fresh);
        } else {
          render();
        }
      }
    } catch (e) { console.log('[poll] Error:', e); }
  }, 5000);
}

function bootApp(supabaseClient) {
  supabase = supabaseClient;

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
window.showAddLink = showAddLink;
window.submitAddLink = submitAddLink;
window.handleCategoryFilter = handleCategoryFilter;
window.clearCategoryFilter = clearCategoryFilter;
window.filterByGenre = filterByGenre;
window.bootApp = bootApp;
window.handleLogout = handleLogout;
window.handleDeleteAccount = handleDeleteAccount;
window.showSettings = showSettings;
window.renderHistory = renderHistory;
window.t = t;
window.getLocale = getLocale;
window.setLocale = setLocale;
