function LoadingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center">
        <span className="text-primary-600">J</span>
      </div>
      <div className="message-bubble assistant flex items-center">
        <div className="flex space-x-1">
          <div className="loading-dot animate-pulse-dot"></div>
          <div
            className="loading-dot animate-pulse-dot"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="loading-dot animate-pulse-dot"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingIndicator;
