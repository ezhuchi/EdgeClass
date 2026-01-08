const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-2 border-[--border-color] rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-[--accent-color] rounded-full animate-spin"></div>
      </div>
      <p className="text-[--text-secondary] text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
