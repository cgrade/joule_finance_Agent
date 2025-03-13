import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import LoadingIndicator from "./components/LoadingIndicator";
import Footer from "./components/Footer";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm the Joule Finance assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message to chat with timestamp
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
        timestamp: new Date(),
      },
    ]);

    // Show loading state
    setIsLoading(true);

    try {
      // Prepare the request payload
      const payload = { message };
      if (sessionId) {
        payload.sessionId = sessionId;
      }

      console.log("Sending request to API:", payload);

      // Send request to the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Raw API response:", response);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Parse the response
      const data = await response.json();
      console.log("Parsed API response:", data);

      // Store the session ID for continuing the conversation
      setSessionId(data.sessionId);

      // Add assistant response to chat with timestamp
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto shadow-xl bg-white sm:h-[calc(100vh-2rem)] sm:my-4 sm:rounded-xl overflow-hidden">
      <Header />

      <div
        ref={chatHistoryRef}
        className="flex-1 overflow-y-auto p-3 space-y-6 md:p-6"
      >
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}
        {isLoading && <LoadingIndicator />}
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />

      <Footer />
    </div>
  );
}

export default App;
