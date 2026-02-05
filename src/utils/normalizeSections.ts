// Section configuration interface (matches SiteSettings)
export interface SectionConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

// Default sections — source of truth for known section IDs and default values
export const defaultSections: SectionConfig[] = [
  { id: 'hero', label: 'Hero Banner', visible: true, order: 0 },
  { id: 'announcements', label: 'Announcements', visible: true, order: 1 },
  { id: 'stats', label: 'Statistics', visible: true, order: 2 },
  { id: 'about', label: 'About Section', visible: true, order: 3 },
  { id: 'featured-events', label: 'Featured Events', visible: true, order: 4 },
  { id: 'upcoming-events', label: 'Upcoming Events', visible: true, order: 5 },
  { id: 'why-join', label: 'Why Join Us', visible: true, order: 6 },
  { id: 'cta', label: 'Call to Action', visible: true, order: 7 },
  { id: 'gallery', label: 'Gallery Preview', visible: true, order: 8 },
];

const defaultsMap = new Map(defaultSections.map((s) => [s.id, s]));

/** Type guard: checks if a value looks like a partial SectionConfig */
export function isSectionLike(x: unknown): x is Partial<SectionConfig> {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as Record<string, unknown>).id === 'string'
  );
}

/**
 * Normalizes raw Firestore data into a valid SectionConfig array.
 *
 * 1. Accepts raw Firestore data (could be anything — treat as unknown)
 * 2. Validates each item is an object with a string id
 * 3. Only keeps items whose id matches a known default section
 * 4. Fills missing fields (label, visible, order) from defaults
 * 5. Adds any default sections missing from the DB data
 * 6. Re-sorts by order and re-indexes (order = array index)
 */
export function normalizeSections(input: unknown): SectionConfig[] {
  const items = Array.isArray(input) ? input : [];
  const seen = new Set<string>();
  const result: SectionConfig[] = [];

  for (const item of items) {
    if (!isSectionLike(item)) continue;

    const id = item.id as string;
    const defaults = defaultsMap.get(id);
    if (!defaults) continue; // Unknown section — skip
    if (seen.has(id)) continue; // Duplicate — skip
    seen.add(id);

    result.push({
      id,
      label: typeof item.label === 'string' ? item.label : defaults.label,
      visible: typeof item.visible === 'boolean' ? item.visible : defaults.visible,
      order: typeof item.order === 'number' ? item.order : defaults.order,
    });
  }

  // Add any default sections not present in the data
  for (const def of defaultSections) {
    if (!seen.has(def.id)) {
      result.push({ ...def });
    }
  }

  // Sort by order and re-index
  result.sort((a, b) => a.order - b.order);
  return result.map((s, i) => ({ ...s, order: i }));
}

/**
 * Compares two section arrays field-by-field (id, label, visible, order).
 * Both arrays are sorted by order before comparison.
 */
export function sectionsEqual(a: SectionConfig[], b: SectionConfig[]): boolean {
  if (a.length !== b.length) return false;

  const sortedA = [...a].sort((x, y) => x.order - y.order);
  const sortedB = [...b].sort((x, y) => x.order - y.order);

  return sortedA.every(
    (sa, i) =>
      sa.id === sortedB[i].id &&
      sa.label === sortedB[i].label &&
      sa.visible === sortedB[i].visible &&
      sa.order === sortedB[i].order
  );
}
