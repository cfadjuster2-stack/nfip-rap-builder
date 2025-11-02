import { useState } from 'react';
import CategoryReview from './components/CategoryReview';
import ContractorPricing from './components/ContractorPricing';
import ContractorDetails from './components/ContractorDetails';
import { removeDuplicates } from './utils/categoryMapping';

const API_URL = 'https://web-production-e5f81.up.railway.app';

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Multi-step workflow state
  const [currentStep, setCurrentStep] = useState(0); // 0=upload, 1=review, 2=pricing, 3=details
  const [headerInfo, setHeaderInfo] = useState(null);
  const [processedLineItems, setProcessedLineItems] = useState(null);
  const [contractorPricing, setContractorPricing] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      // Reset workflow when new file selected
      setCurrentStep(0);
      setHeaderInfo(null);
      setProcessedLineItems(null);
      setContractorPricing(null);
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
      // Reset workflow
      setCurrentStep(0);
      setHeaderInfo(null);
      setProcessedLineItems(null);
      setContractorPricing(null);
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/parse-estimate`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Process line items: remove duplicates
        const uniqueItems = removeDuplicates(data.line_items || []);

        setHeaderInfo(data.header || {});
        setProcessedLineItems(uniqueItems);
        setCurrentStep(1); // Move to category review step
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

  const handleCategoryReviewComplete = (updatedLineItems) => {
    setProcessedLineItems(updatedLineItems);
    setCurrentStep(2); // Move to pricing step
  };

  const handlePricingComplete = (pricing) => {
    setContractorPricing(pricing);
    setCurrentStep(3); // Move to details step
  };

  const handleStartOver = () => {
    setFile(null);
    setCurrentStep(0);
    setHeaderInfo(null);
    setProcessedLineItems(null);
    setContractorPricing(null);
    setError(null);
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
          <p className="text-gray-600">Upload IA estimates to build NFIP-compliant RAP documentation</p>

          {/* Progress Indicator */}
          {currentStep > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 1 ? 'bg-[#4CAF93] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium text-gray-700">Review</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 2 ? 'bg-[#4CAF93] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium text-gray-700">Pricing</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 3 ? 'bg-[#4CAF93] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium text-gray-700">Export</span>
              </div>
              <div className="ml-auto">
                <button
                  onClick={handleStartOver}
                  className="text-sm text-gray-600 hover:text-[#3B5BA5] font-medium"
                >
                  Start Over
                </button>
              </div>
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

        {/* Step 0: Upload Section */}
        {currentStep === 0 && (
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
                    'Parse Estimate'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Category Review */}
        {currentStep === 1 && processedLineItems && (
          <CategoryReview
            lineItems={processedLineItems}
            onComplete={handleCategoryReviewComplete}
          />
        )}

        {/* Step 2: Contractor Pricing */}
        {currentStep === 2 && processedLineItems && (
          <ContractorPricing
            lineItems={processedLineItems}
            onComplete={handlePricingComplete}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* Step 3: Contractor Details & Export */}
        {currentStep === 3 && processedLineItems && contractorPricing && (
          <ContractorDetails
            lineItems={processedLineItems}
            pricing={contractorPricing}
            headerInfo={headerInfo}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© 2025 NFIP Billing Academy, LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
