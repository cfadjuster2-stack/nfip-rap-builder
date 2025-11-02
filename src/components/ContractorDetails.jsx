import { useState } from 'react';
import { groupByCategory, sortCategories } from '../utils/categoryMapping';

export default function ContractorDetails({ lineItems, pricing, headerInfo, onBack }) {
  const [details, setDetails] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gcLicense: ''
  });

  const [exporting, setExporting] = useState(false);

  const handleChange = (field, value) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleExportPDF = async () => {
    // Validate all fields are filled
    const missingFields = Object.entries(details)
      .filter(([key, value]) => !value.trim())
      .map(([key]) => key);

    if (missingFields.length > 0) {
      alert(`Please fill in all fields: ${missingFields.join(', ')}`);
      return;
    }

    setExporting(true);

    try {
      // Prepare data for PDF generation
      const rapData = {
        contractor: details,
        header: headerInfo,
        pricing: pricing,
        lineItems: lineItems,
        timestamp: new Date().toISOString()
      };

      // TODO: Implement PDF generation
      // For now, we'll just download as JSON
      const dataStr = JSON.stringify(rapData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RAP_${headerInfo?.claim_number || 'export'}_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      alert('RAP exported successfully! (PDF generation coming soon)');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export RAP. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Calculate totals
  const groupedItems = groupByCategory(lineItems);
  const categories = sortCategories(Object.keys(groupedItems));

  const summary = categories.map(category => {
    const iaEstimate = groupedItems[category].reduce((sum, item) => sum + (item.rcv || 0), 0);
    const contractorPrice = parseFloat(pricing[category]?.contractorPrice) || 0;
    const adjustment = contractorPrice > 0 ? contractorPrice - iaEstimate : 0;

    return {
      category,
      iaEstimate,
      contractorPrice,
      adjustment,
      hasPrice: contractorPrice > 0
    };
  }).filter(item => item.hasPrice);

  const totalIAEstimate = summary.reduce((sum, item) => sum + item.iaEstimate, 0);
  const totalContractorPrice = summary.reduce((sum, item) => sum + item.contractorPrice, 0);
  const totalAdjustment = totalContractorPrice - totalIAEstimate;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-[#3B5BA5] px-6 py-4">
        <h3 className="text-xl font-bold text-white">Step 3: Contractor Details & Export</h3>
        <p className="text-white/80 text-sm mt-1">
          Enter contractor information and export the RAP
        </p>
      </div>

      <div className="p-6">
        {/* Contractor Details Form */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Contractor Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contractor Name *
              </label>
              <input
                type="text"
                value={details.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5BA5] focus:border-transparent"
                placeholder="John Smith Construction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GC License Number *
              </label>
              <input
                type="text"
                value={details.gcLicense}
                onChange={(e) => handleChange('gcLicense', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5BA5] focus:border-transparent"
                placeholder="CG123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={details.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5BA5] focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={details.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5BA5] focus:border-transparent"
                placeholder="john@smithconstruction.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address *
              </label>
              <input
                type="text"
                value={details.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5BA5] focus:border-transparent"
                placeholder="123 Main St, City, ST 12345"
              />
            </div>
          </div>
        </div>

        {/* RAP Summary */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">RAP Summary</h4>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Claim:</span> {headerInfo?.claim_number || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Insured:</span> {headerInfo?.insured_name || 'N/A'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">IA Estimate</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Contractor Price</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.map((item) => (
                  <tr key={item.category}>
                    <td className="px-4 py-3 text-gray-900">{item.category}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.iaEstimate)}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">{formatCurrency(item.contractorPrice)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      item.adjustment > 0 ? 'text-red-600' : item.adjustment < 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {item.adjustment > 0 ? '+' : ''}{formatCurrency(item.adjustment)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#3B5BA5] text-white font-bold">
                  <td className="px-4 py-3">TOTALS</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totalIAEstimate)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totalContractorPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    {totalAdjustment > 0 ? '+' : ''}{formatCurrency(totalAdjustment)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className={`px-8 py-3 font-semibold rounded-lg transition-all ${
              exporting
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#4CAF93] text-white hover:bg-[#4CAF93]/90 hover:shadow-lg'
            }`}
          >
            {exporting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exporting...
              </span>
            ) : (
              'Export RAP PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
