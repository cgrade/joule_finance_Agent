import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatMessage({ role, content, timestamp = new Date() }) {
  // Format the timestamp
  const formattedTime = format(
    timestamp instanceof Date ? timestamp : new Date(timestamp),
    "h:mm a"
  );

  return (
    <div
      className={`flex gap-3 items-start animate-fade-in ${
        role === "user" ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          role === "user" ? "bg-neutral-100" : "bg-primary-100"
        }`}
      >
        <span
          className={role === "user" ? "text-neutral-600" : "text-primary-600"}
        >
          {role === "user" ? "U" : "J"}
        </span>
      </div>

      <div
        className={`message-bubble ${role} ${
          role === "user" ? "ml-auto" : "mr-auto"
        } relative`}
      >
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        <div
          className={`text-xs text-neutral-400 mt-1 ${
            role === "user" ? "text-right" : "text-left"
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
