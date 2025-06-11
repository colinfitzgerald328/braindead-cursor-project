export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-card border border-dashed border-gray-200 dark:border-gray-700">
      {/* Illustration */}
      <div className="w-24 h-24 mb-4 text-gray-300 dark:text-gray-600">
        <svg 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8h10" />
          <path d="M7 12h6" />
          <path d="M7 16h2" />
        </svg>
      </div>
      
      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">No tasks yet</h3>
      
      <p className="text-center text-gray-500 dark:text-gray-400 max-w-xs">
        Add your first task above and start collaborating in real-time with your team
      </p>
      
      <div className="mt-6 flex items-center justify-center">
        <svg className="w-5 h-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-medium text-gray-500">Add your first task</span>
      </div>

      {/* Animation dots */}
      <div className="flex space-x-1 mt-6">
        {[0, 1, 2].map(i => (
          <div 
            key={i} 
            className="w-2 h-2 rounded-full bg-primary-light"
            style={{
              animation: `pulse-soft 1.5s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>
    </div>
  );
} 