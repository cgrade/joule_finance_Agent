import { useState, useRef, useEffect } from "react";

function ChatInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize the textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    onSendMessage(message);
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="border-t border-neutral-200 bg-white p-4 md:p-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about Joule Finance..."
          rows="1"
          disabled={isLoading}
          className="flex-1 resize-none border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-200 text-white disabled:text-neutral-500 rounded-lg w-12 h-12 flex items-center justify-center transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
