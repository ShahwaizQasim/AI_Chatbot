import axios from "axios";
import ChatInput from "./components/ChatInput";
import { PrivateVariables } from "./config/config";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  text: string;
  isUser: boolean;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const HandleSendFunction = async (message: string) => {
    try {
      setIsLoading(true);

      // 1. Add user message immediately
      setMessages((prev) => [...prev, { text: message, isUser: true }]);

      const payload = { prompt: message };
      const res = await axios.post(
        `${PrivateVariables.BACKEND_URL}/api/chat/ai`,
        payload
      );

      const aiResponseData = res.data.response;

      // 2. Add AI response right after the user message
      setMessages((prev) => [...prev, { text: aiResponseData, isUser: false }]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiles = (files: File[]) => {
    console.log("Attached files:", files);
  };
  const startVoice = () => {
    console.log("Voice input started");
  };
  const openMenu = () => {
    console.log("Plus button clicked");
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        {/* Messages */}
        <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.isUser
                      ? "bg-teal-600 text-white"
                      : "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                >
                  {msg.isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-3 dark:bg-zinc-800">
                  <span className="text-sm text-zinc-500">
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <ChatInput
          onSend={(message) => HandleSendFunction(message)}
          onAttach={(files) => handleFiles(files)}
          onVoice={() => startVoice()}
          onPlus={() => openMenu()}
          disabled={isLoading}
        />
      </div>
    </>
  );
}

export default App;