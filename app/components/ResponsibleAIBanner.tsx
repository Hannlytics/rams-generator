 export function ResponsibleAIBanner() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-bold text-purple-800">AI-Assisted, Human-Verified</h3>
          <p className="text-xs text-purple-700 mt-1">
            Our AI helps draft RAMS content, but every document requires review by a qualified professional. 
            We prioritize safety over speed, compliance over convenience.
          </p>
        </div>
      </div>
    </div>
  );
}
