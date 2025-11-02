import { useState, Fragment } from 'react';

const API_URL = 'https://web-production-e5f81.up.railway.app';

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/parse-estimate`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      console.log('Response status:', response.status);
      console.log('Response data:', data);
      console.log('Has line_items?', data.line_items);
      console.log('Line items length:', data.line_items?.length);

      if (response.ok && data.success) {
        console.log('Setting results!');
        setResults(data);
      } else {
        setError(data.error || data.details || 'Failed to parse estimate');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Failed to connect to server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Group line items by category
  const groupItemsByCategory = (lineItems) => {
    const grouped = {};
    lineItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  const calculateCategoryTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.rcv || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <img 
              src="/badge.png" 
              alt="NFIP Billing Academy" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-[#3B5BA5]">NFIP BILLING</span> <span className="text-gray-400">ACADEMY</span>
              </h1>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Compliance · Clarity · Consistency
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">NFIP RAP Builder</h2>
          <p className="text-gray-600">Upload contractor estimates to build NFIP-compliant RAP documentation</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div
            className={`border-3 border-dashed rounded-lg p-12 text-center transition-all ${
              file ? 'border-[#4CAF93] bg-[#4CAF93]/5' : 'border-gray-300 hover:border-[#3B5BA5] hover:bg-[#3B5BA5]/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  file ? 'bg-[#4CAF93] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    {file ? file.name : 'Drop Initial IA Estimate PDF here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
              </div>
            </label>
          </div>

          {file && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#3B5BA5] hover:bg-[#3B5BA5]/90 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Build RAP'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results Table */}
        {results && results.line_items && results.line_items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#3B5BA5] px-6 py-4">
              <h3 className="text-xl font-bold text-white">RAP Documentation - Ready for Submission</h3>
              <p className="text-white/80 text-sm mt-1">
                Claim: {results.header?.claim_number} | Insured: {results.header?.insured_name}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Line Item
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Unit Cost
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      RCV
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(groupItemsByCategory(results.line_items)).map(([category, items]) => (
                    <Fragment key={category}>
                      {/* Category Header */}
                      <tr className="bg-gray-100">
                        <td colSpan="4" className="px-6 py-3">
                          <span className="font-bold text-[#3B5BA5] text-sm uppercase tracking-wide">
                            {category}
                          </span>
                        </td>
                      </tr>
                      
                      {/* Line Items */}
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 text-right">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 text-right">
                            {formatCurrency(item.unit_price || 0)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                            {formatCurrency(item.rcv || 0)}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Category Total */}
                      <tr className="bg-[#4CAF93]/10 border-t-2 border-[#4CAF93]">
                        <td colSpan="3" className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
                          {category} Total:
                        </td>
                        <td className="px-6 py-3 text-sm font-bold text-[#3B5BA5] text-right">
                          {formatCurrency(calculateCategoryTotal(items))}
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                  
                  {/* Grand Total */}
                  <tr className="bg-[#3B5BA5] text-white">
                    <td colSpan="3" className="px-6 py-4 text-base font-bold text-right">
                      GRAND TOTAL (RCV):
                    </td>
                    <td className="px-6 py-4 text-lg font-bold text-right">
                      {formatCurrency(results.totals?.rcv || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© 2024 NFIP Billing Academy, LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}