// Category mapping and correction utilities for NFIP RAP Builder
// Updated to match backend parser categories

// Priority categories that should appear first (matching backend)
export const PRIORITY_CATEGORIES = [
  'CLEANING',
  'GENERAL DEMOLITION',
  'WATER EXTRACTION & REMEDIATION',
  'TEMPORARY REPAIRS'
];

// All standard trade categories from backend parser
export const TRADE_CATEGORIES = [
  'CLEANING',
  'GENERAL DEMOLITION',
  'WATER EXTRACTION & REMEDIATION',
  'TEMPORARY REPAIRS',
  'APPLIANCES',
  'CABINETRY',
  'DOORS',
  'DRYWALL',
  'ELECTRICAL',
  'FINISH CARPENTRY / TRIMWORK',
  'FINISH HARDWARE',
  'FLOOR COVERING',
  'FLOOR COVERING - CARPET',
  'FLOOR COVERING - CERAMIC TILE',
  'FLOOR COVERING - LAMINATE',
  'FLOOR COVERING - STONE',
  'FLOOR COVERING - VINYL',
  'FLOOR COVERING - WOOD',
  'HEAT, VENT & AIR CONDITIONING',
  'HVAC',
  'INSULATION',
  'INTERIOR LATH & PLASTER',
  'LIGHT FIXTURES',
  'MIRRORS & SHOWER DOORS',
  'PAINTING & WOOD WALL FINISHES',
  'PANELING & WOOD WALL FINISHES',
  'PLUMBING',
  'SOFFIT, FASCIA, & GUTTER',
  'STUCCO & EXTERIOR PLASTER',
  'TEXTURE',
  'TILE',
  'TOILET & BATH ACCESSORIES',
  'TRIM',
  'WALLPAPER',
  'WINDOWS - ALUMINUM',
  'WINDOWS - SLIDING PATIO DOORS',
  'WINDOW TREATMENT',
  'GENERAL'
];

/**
 * Remove duplicate line items based on description, quantity, and unit
 * Note: Backend now handles this, but we keep it for compatibility
 * @param {Array} lineItems - Array of line items
 * @returns {Array} - Unique line items
 */
export function removeDuplicates(lineItems) {
  const seen = new Map();

  lineItems.forEach(item => {
    const key = `${item.description.trim().toUpperCase()}_${item.quantity}_${item.unit}`;
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  });

  return Array.from(seen.values());
}

/**
 * Sort categories with priority categories first (matches backend logic)
 * @param {Array} categories - Array of category names
 * @returns {Array} - Sorted categories
 */
export function sortCategories(categories) {
  const priority = [];
  const other = [];

  categories.forEach(cat => {
    if (PRIORITY_CATEGORIES.includes(cat)) {
      priority.push(cat);
    } else {
      other.push(cat);
    }
  });

  // Sort priority categories in the order defined
  priority.sort((a, b) => {
    return PRIORITY_CATEGORIES.indexOf(a) - PRIORITY_CATEGORIES.indexOf(b);
  });

  // Sort other categories alphabetically
  other.sort();

  return [...priority, ...other];
}

/**
 * Group line items by category with sorting
 * @param {Array} lineItems - Array of line items
 * @returns {Object} - Object with categories as keys
 */
export function groupByCategory(lineItems) {
  const grouped = {};

  lineItems.forEach(item => {
    const category = item.category || 'GENERAL';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  return grouped;
}

/**
 * Get category summary from line items
 * Creates summary similar to backend response
 * @param {Array} lineItems - Array of line items
 * @returns {Array} - Array of category summaries
 */
export function getCategorySummary(lineItems) {
  const grouped = groupByCategory(lineItems);
  const summaries = [];

  Object.entries(grouped).forEach(([category, items]) => {
    const summary = {
      name: category,
      item_count: items.length,
      rcv: items.reduce((sum, item) => sum + (item.rcv || 0), 0),
      depreciation: items.reduce((sum, item) => sum + (item.depreciation || 0), 0),
      acv: items.reduce((sum, item) => sum + (item.acv || 0), 0),
      unique_items: [...new Set(items.map(item => item.description))]
    };
    summaries.push(summary);
  });

  // Sort by priority
  return summaries.sort((a, b) => {
    const aPriority = PRIORITY_CATEGORIES.indexOf(a.name);
    const bPriority = PRIORITY_CATEGORIES.indexOf(b.name);

    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority;
    }
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;

    return a.name.localeCompare(b.name);
  });
}
