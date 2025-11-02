import { useState } from 'react';
import { groupByCategory, sortCategories } from '../utils/categoryMapping';

export default function ContractorPricing({ lineItems, onComplete, onBack }) {
  const groupedItems = groupByCategory(lineItems);
  const categories = sortCategories(Object.keys(groupedItems));

  // Initialize pricing state with IA estimate totals
  const initialPricing = {};
  categories.forEach(category => {
    const categoryTotal = groupedItems[category].reduce((sum, item) => sum + (item.rcv || 0), 0);
    initialPricing[category] = {
      iaEstimate: categoryTotal,
      contractorPrice: ''
    };
  });

  const [pricing, setPricing] = useState(initialPricing);

  const handlePriceChange = (category, value) => {
    setPricing(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        contractorPrice: value
      }
    }));
  };

  const calculateAdjustment = (category) => {
    const iaPrice = pricing[category].iaEstimate || 0;
    const contractorPrice = parseFloat(pricing[category].contractorPrice) || 0;
    return contractorPrice - iaPrice;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleContinue = () => {
    // Validate that at least one price is entered
    const hasAnyPrice = Object.values(pricing).some(p => p.contractorPrice !== '');
    if (!hasAnyPrice) {
      alert('Please enter at least one contractor price to continue.');
      return;
    }

    onComplete(pricing);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-[#3B5BA5] px-6 py-4">
        <h3 className="text-xl font-bold text-white">Step 2: Enter Contractor Pricing</h3>
        <p className="text-white/80 text-sm mt-1">
          Enter the contractor's pricing for each category
        </p>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trade Category
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  IA Estimate
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contractor Price
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Adjustment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => {
                const adjustment = calculateAdjustment(category);
                const hasPrice = pricing[category].contractorPrice !== '';

                return (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({groupedItems[category].length} items)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {formatCurrency(pricing[category].iaEstimate)}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pricing[category].contractorPrice}
                        onChange={(e) => handlePriceChange(category, e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#3B5BA5] focus:border-transparent"
                      />
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold text-right ${
                      !hasPrice ? 'text-gray-400' : adjustment > 0 ? 'text-red-600' : adjustment < 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {hasPrice ? (
                        <>
                          {adjustment > 0 ? '+' : ''}{formatCurrency(adjustment)}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-[#3B5BA5] text-white font-semibold rounded-lg hover:bg-[#3B5BA5]/90 hover:shadow-lg transition-all"
          >
            Continue to Details →
          </button>
        </div>
      </div>
    </div>
  );
}
