// Describes every editable content type once. The admin list pages, forms,
// validation and save actions are all generated from these definitions.
// Plain data only: it is passed to Client Components.

export type FieldType =
  | "text"
  | "slug"
  | "email"
  | "url"
  | "number"
  | "boolean"
  | "select"
  | "category"
  | "localized"
  | "localizedLong"
  | "image"
  | "images"
  | "specs";

export type FieldDef = {
  /** Database column. */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  /** For slugs: the field to build the slug from when left empty. */
  from?: string;
  /** Half-width on large screens. */
  half?: boolean;
};

export type EntityKey = "products" | "categories" | "services" | "projects" | "partners" | "media";

export type EntityDef = {
  key: EntityKey;
  table: string;
  /** URL segment under /admin. */
  segment: string;
  singular: string;
  plural: string;
  intro: string;
  /** Cache tags refreshed on the public site after a change. */
  tags: string[];
  titleField: string;
  imageField?: string;
  /** Column shown as a coloured status chip in the list. */
  statusField?: string;
  /** Columns to sort the admin list by, in order. */
  order: string[];
  fields: FieldDef[];
};

export const STOCK_STATUSES = [
  { value: "in_stock", label: "En stock" },
  { value: "on_order", label: "Sur commande" },
  { value: "preorder", label: "Précommande ouverte" },
];

const sortOrder: FieldDef = {
  name: "sort_order",
  label: "Ordre d'affichage",
  type: "number",
  help: "Les plus petits nombres apparaissent en premier.",
  half: true,
};
const active: FieldDef = {
  name: "active",
  label: "Visible sur le site",
  type: "boolean",
  half: true,
};

export const entities: Record<EntityKey, EntityDef> = {
  products: {
    key: "products",
    table: "products",
    segment: "produits",
    singular: "produit",
    plural: "Produits",
    intro: "Le catalogue public : fiches, caractéristiques techniques, photos et disponibilité.",
    tags: ["catalog"],
    titleField: "name",
    imageField: "image_urls",
    statusField: "stock_status",
    order: ["sort_order"],
    fields: [
      { name: "name", label: "Nom du produit", type: "localized", required: true },
      { name: "slug", label: "Adresse de la page", type: "slug", from: "name", help: "Partie de l'URL après /produits/. Laissez vide pour la générer depuis le nom.", half: true },
      { name: "category_id", label: "Catégorie", type: "category", half: true },
      { name: "summary", label: "Résumé (cartes et haut de fiche)", type: "localizedLong" },
      { name: "description", label: "Description", type: "localizedLong" },
      { name: "specs", label: "Caractéristiques techniques", type: "specs" },
      { name: "image_urls", label: "Photos", type: "images", help: "La première photo sert d'image principale." },
      { name: "datasheet_url", label: "Lien de la fiche technique (PDF)", type: "url" },
      { name: "stock_status", label: "Disponibilité", type: "select", options: STOCK_STATUSES, required: true, half: true },
      { name: "lead_time", label: "Délai affiché", type: "localized", help: "Ex. : 6 à 8 semaines. Laissez vide pour ne rien afficher." },
      { name: "preorder_enabled", label: "Précommande ouverte", type: "boolean", help: "Affiche le bouton « Précommander » sur la fiche.", half: true },
      { name: "featured", label: "Mis en avant", type: "boolean", half: true },
      sortOrder,
      active,
    ],
  },
  categories: {
    key: "categories",
    table: "categories",
    segment: "categories",
    singular: "catégorie",
    plural: "Catégories",
    intro: "Les gammes du catalogue. Leurs photos illustrent aussi la section Solutions de l'accueil.",
    tags: ["catalog"],
    titleField: "name",
    imageField: "image_url",
    order: ["sort_order"],
    fields: [
      { name: "name", label: "Nom", type: "localized", required: true },
      { name: "slug", label: "Identifiant dans l'URL", type: "slug", from: "name", help: "Utilisé dans les liens ?categorie=… Évitez de le modifier une fois publié.", half: true },
      {
        name: "kind",
        label: "Type",
        type: "select",
        required: true,
        half: true,
        options: [
          { value: "ups", label: "UPS" },
          { value: "solar", label: "Solaire" },
          { value: "battery", label: "Batteries" },
          { value: "generator", label: "Générateurs" },
          { value: "component", label: "Composants" },
        ],
      },
      { name: "description", label: "Description", type: "localizedLong" },
      { name: "image_url", label: "Photo", type: "image" },
      sortOrder,
    ],
  },
  services: {
    key: "services",
    table: "services",
    segment: "services",
    singular: "service",
    plural: "Services",
    intro: "Les services présentés sur la page SAV continu.",
    tags: ["services"],
    titleField: "name",
    imageField: "image_url",
    order: ["sort_order"],
    fields: [
      { name: "name", label: "Nom", type: "localized", required: true },
      { name: "slug", label: "Identifiant", type: "slug", from: "name", half: true },
      { name: "summary", label: "Résumé", type: "localizedLong" },
      { name: "description", label: "Description", type: "localizedLong" },
      { name: "image_url", label: "Photo", type: "image" },
      sortOrder,
      active,
    ],
  },
  projects: {
    key: "projects",
    table: "projects",
    segment: "realisations",
    singular: "réalisation",
    plural: "Réalisations",
    intro: "Les chantiers présentés sur l'accueil. Photos d'installations uniquement, sans personnes.",
    tags: ["projects"],
    titleField: "client",
    imageField: "image_url",
    order: ["sort_order"],
    fields: [
      { name: "client", label: "Client", type: "text", required: true, half: true },
      { name: "year", label: "Année", type: "number", half: true },
      { name: "title", label: "Titre", type: "localized", required: true },
      { name: "slug", label: "Identifiant", type: "slug", from: "client", half: true },
      { name: "summary", label: "Résumé", type: "localizedLong" },
      { name: "image_url", label: "Photo", type: "image" },
      sortOrder,
      active,
    ],
  },
  partners: {
    key: "partners",
    table: "partners",
    segment: "partenaires",
    singular: "partenaire",
    plural: "Partenaires",
    intro: "Clients et marques du bandeau animé de l'accueil et de la page À propos. Sans logo, le nom s'affiche en texte.",
    tags: ["partners"],
    titleField: "name",
    imageField: "logo_url",
    statusField: "kind",
    order: ["kind", "sort_order"],
    fields: [
      { name: "name", label: "Nom", type: "text", required: true, half: true },
      {
        name: "kind",
        label: "Rangée",
        type: "select",
        required: true,
        half: true,
        options: [
          { value: "client", label: "Clients" },
          { value: "brand", label: "Marques" },
        ],
      },
      { name: "logo_url", label: "Logo", type: "image", help: "PNG ou SVG sur fond transparent de préférence." },
      { name: "website_url", label: "Site web", type: "url" },
      sortOrder,
      active,
    ],
  },
  media: {
    key: "media",
    table: "media",
    segment: "medias",
    singular: "média",
    plural: "Médiathèque",
    intro: "Vos liens d'images et de documents, réutilisables dans tous les champs photo et logo.",
    tags: [],
    titleField: "alt",
    imageField: "url",
    statusField: "kind",
    order: ["created_at"],
    fields: [
      { name: "url", label: "Lien de l'image ou du document", type: "image", required: true, help: "Collez le lien complet (https://…). Un aperçu s'affiche pour les images." },
      { name: "alt", label: "Description de l'image", type: "localized", help: "Lue par les lecteurs d'écran ; décrivez ce que montre la photo." },
      {
        name: "kind",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { value: "photo", label: "Photo" },
          { value: "logo", label: "Logo" },
          { value: "partner", label: "Logo partenaire" },
          { value: "document", label: "Document" },
        ],
      },
    ],
  },
};

export const entityBySegment = (segment: string): EntityDef | undefined =>
  Object.values(entities).find((entity) => entity.segment === segment);

/** Site settings (single row) use the same form engine. */
export const settingsFields: FieldDef[] = [
  { name: "company_name", label: "Nom de l'entreprise", type: "text", required: true, half: true, help: "Utilisé dans le logo texte, les titres et le pied de page." },
  { name: "founded_year", label: "Année de création", type: "number", required: true, half: true, help: "L'âge de l'entreprise (« 33 ans ») est calculé à partir de cette année." },
  { name: "phone", label: "Téléphone", type: "text", required: true, half: true },
  { name: "whatsapp", label: "WhatsApp", type: "text", half: true },
  { name: "email", label: "E-mail public", type: "email", half: true },
  { name: "notification_email", label: "E-mail qui reçoit les demandes", type: "email", half: true, help: "Chaque demande de devis ou précommande y est envoyée." },
  { name: "address", label: "Adresse", type: "localized" },
  { name: "hours", label: "Horaires", type: "localized" },
  { name: "logo_url", label: "Logo (fonds clairs)", type: "image", help: "Vide : le logo texte Powertech est utilisé." },
  { name: "logo_dark_url", label: "Logo (pied de page sombre)", type: "image" },
  { name: "hero_image_url", label: "Photo de la bannière d'accueil", type: "image", required: true },
  { name: "hero_image_alt", label: "Description de la photo de bannière", type: "localized" },
  { name: "legal_form", label: "Forme juridique", type: "text", half: true, help: "Affichée dans les mentions légales." },
  { name: "tax_id", label: "NIF (numéro d'identification fiscale)", type: "text", half: true },
  { name: "publication_director", label: "Directeur ou directrice de la publication", type: "text", half: true },
  { name: "legal_address", label: "Adresse du siège social", type: "localized", help: "Vide : l'adresse de contact est utilisée." },
];
