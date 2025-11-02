import { useState } from 'react';
import { TRADE_CATEGORIES } from '../utils/categoryMapping';

export default function CategoryReview({ lineItems, onComplete }) {
  const [items, setItems] = useState(lineItems);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const handleCategoryChange = (itemIndex, newCategory) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].category = newCategory;
    setItems(updatedItems);
  };

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const groupedItems = items.reduce((acc, item, index) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...item, originalIndex: index });
    return acc;
  }, {});

  const handleContinue = () => {
    onComplete(items);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-[#3B5BA5] px-6 py-4">
        <h3 className="text-xl font-bold text-white">Step 1: Review & Correct Categories</h3>
        <p className="text-white/80 text-sm mt-1">
          Verify line items are in the correct trade categories. Click to expand/collapse.
        </p>
      </div>

      <div className="p-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full bg-gray-100 px-4 py-3 flex items-center justify-between hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#3B5BA5] text-sm uppercase tracking-wide">
                  {category}
                </span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {categoryItems.length} items
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  expandedCategories.has(category) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Category Items - Expanded */}
            {expandedCategories.has(category) && (
              <div className="divide-y divide-gray-200">
                {categoryItems.map((item) => (
                  <div key={item.originalIndex} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.quantity} {item.unit} × ${item.unit_price?.toFixed(2) || '0.00'} = ${item.rcv?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="w-64">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Move to category:
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => handleCategoryChange(item.originalIndex, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5BA5] focus:border-transparent"
                        >
                          {TRADE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-[#3B5BA5] text-white font-semibold rounded-lg hover:bg-[#3B5BA5]/90 hover:shadow-lg transition-all"
          >
            Continue to Pricing →
          </button>
        </div>
      </div>
    </div>
  );
}
