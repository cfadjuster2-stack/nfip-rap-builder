// Category mapping and correction utilities for NFIP RAP Builder

// Priority categories that should appear first
export const PRIORITY_CATEGORIES = [
  'Cleaning',
  'General Demolition',
  'Water Extraction and Mitigation'
];

// Standard trade categories
export const TRADE_CATEGORIES = [
  'Cleaning',
  'General Demolition',
  'Water Extraction and Mitigation',
  'Insulation',
  'Drywall/Plaster',
  'Painting',
  'Flooring',
  'Finish Carpentry/Trim',
  'Doors',
  'Windows',
  'Cabinetry',
  'Countertops',
  'Appliances',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'Exterior',
  'Mirrors and Shower Doors',
  'General Conditions',
  'Other'
];

/**
 * Remove duplicate line items based on description
 * @param {Array} lineItems - Array of line items
 * @returns {Array} - Unique line items
 */
export function removeDuplicates(lineItems) {
  const seen = new Map();

  lineItems.forEach(item => {
    const key = `${item.description.trim().toLowerCase()}_${item.category}`;
    if (!seen.has(key)) {
      seen.set(key, item);
    } else {
      // If we've seen this item, combine quantities/amounts
      const existing = seen.get(key);
      existing.quantity = (parseFloat(existing.quantity) || 0) + (parseFloat(item.quantity) || 0);
      existing.rcv = (parseFloat(existing.rcv) || 0) + (parseFloat(item.rcv) || 0);
    }
  });

  return Array.from(seen.values());
}

/**
 * Sort categories with priority categories first
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
    const category = item.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  // Convert to sorted array
  const sortedCategories = sortCategories(Object.keys(grouped));
  const sortedGrouped = {};

  sortedCategories.forEach(cat => {
    sortedGrouped[cat] = grouped[cat];
  });

  return sortedGrouped;
}
