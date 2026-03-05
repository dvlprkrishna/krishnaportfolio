"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Why should I hire you?",
  "Show me your projects",
  "What's your tech stack?",
  "Are you open to work?",
];

function MessageContent({ content }: { content: string }) {
  // Replace plain URLs with clickable links
  const urlRegex =
    /(https?:\/\/[^\s)]+|(?:www\.)?[a-zA-Z0-9-]+\.(?:com|in|io|dev|co)(?:\/[^\s)]*)?)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      content
        .slice(lastIndex, match.index)
        .split("\n")
        .forEach((line, idx, arr) => {
          elements.push(line);
          if (idx < arr.length - 1)
            elements.push(<br key={`bra-${match!.index}-${idx}`} />);
        });
    }
    const raw = match[0];
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    elements.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-medium underline underline-offset-2 opacity-90 hover:opacity-100"
      >
        {raw}
      </a>,
    );
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < content.length) {
    content
      .slice(lastIndex)
      .split("\n")
      .forEach((line, idx, arr) => {
        elements.push(line);
        if (idx < arr.length - 1) elements.push(<br key={`brb-end-${idx}`} />);
      });
  }

  return <span>{elements}</span>;
}

// Claude-style incognito ghost SVG — animated eyes like Claude's icon
function ClaudeGhostIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.svg
          key="close"
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.18 }}
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            d="M4 4L16 16M16 4L4 16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </motion.svg>
      ) : (
        <motion.svg
          key="ghost"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.18 }}
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
        >
          {/* Eyes that look around — matches Claude's animation */}
          <g className="group-hover:animate-[look-around_2.4s_ease-in-out_infinite]">
            <path d="M6.99951 8.66672C7.5518 8.66672 7.99951 9.11443 7.99951 9.66672C7.9993 10.2188 7.55166 10.6667 6.99951 10.6667C6.44736 10.6667 5.99973 10.2188 5.99951 9.66672C5.99951 9.11443 6.44723 8.66672 6.99951 8.66672Z" />
            <path d="M12.9995 8.66672C13.5518 8.66672 13.9995 9.11443 13.9995 9.66672C13.9993 10.2188 13.5517 10.6667 12.9995 10.6667C12.4474 10.6667 11.9997 10.2188 11.9995 9.66672C11.9995 9.11443 12.4472 8.66672 12.9995 8.66672Z" />
          </g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 2C14.326 2.00018 17.9998 5.67403 18 10V17.3123C17.9997 17.5427 17.8411 17.8079 17.6172 17.8623C17.3932 17.9165 17.1614 17.7456 17.0557 17.5408C16.7805 17.007 16.3658 16.5937 16.062 16.2878C15.7793 16.0034 15.4503 15.8338 14.9771 15.8337C14.2092 15.8339 13.4371 16.3862 12.9487 17.53C12.8701 17.7138 12.6887 17.8621 12.4888 17.8623C12.2888 17.8623 12.1076 17.7138 12.0288 17.53C11.5404 16.386 10.7674 15.8339 9.99951 15.8337C9.23161 15.8339 8.45959 16.386 7.97119 17.53C7.89253 17.7138 7.71118 17.8621 7.51123 17.8623C7.31122 17.8623 7.13006 17.7138 7.05127 17.53C6.56296 16.3862 5.78982 15.834 5.02197 15.8337C4.54861 15.8338 4.21974 16.0032 3.93701 16.2878C3.63309 16.5937 3.21952 17.0715 2.94434 17.6055C2.83865 17.8103 2.60589 17.9165 2.38184 17.8623C2.15801 17.8079 2.00033 17.6073 2 17.377V10C2.00018 5.67403 5.67403 2.00018 10 2ZM10 3C6.22631 3.00018 3.00018 6.22631 3 10V15.8633C3.0205 15.8414 3.20696 15.6049 3.22803 15.5837C3.67524 15.1336 4.251 14.8338 5.02197 14.8337C6.03838 14.8341 6.90232 15.4025 7.51025 16.2937C8.11828 15.4018 8.9824 14.8338 9.99951 14.8337C11.0163 14.8338 11.8798 15.4022 12.4878 16.2937C13.0959 15.4018 13.9601 14.8339 14.9771 14.8337C15.7481 14.8338 16.3247 15.1336 16.772 15.5837C16.772 15.5837 16.9796 15.812 17 15.8337V10C16.9998 6.22631 13.7737 3.00018 10 3Z"
          />
          <style>{`
            @keyframes look-around {
              0%, 16.6%, 100% { transform: translateX(-1.5px) translateY(0); }
              25%, 41.6% { transform: translateX(1.5px) translateY(0); }
              50%, 66.6% { transform: translateX(0) translateY(-1.5px); }
              75%, 91.6% { transform: translateX(0) translateY(0); }
            }
          `}</style>
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

// Expand icon
function ExpandIcon({ expanded }: { expanded: boolean }) {
  return expanded ? (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 9L4 4m0 0h5m-5 0v5M15 9l5-5m0 0h-5m5 0v5M9 15l-5 5m0 0h5m-5 0v-5M15 15l5 5m0 0h-5m5 0v-5"
      />
    </svg>
  ) : (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! 👋 I'm Krishna's AI assistant. Ask me anything about his experience, projects, or how to get in touch.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Unique session ID per page load — groups conversations in Supabase
  const sessionId = useRef<string>(
    Math.random().toString(36).slice(2) + Date.now().toString(36),
  );
  const usedSuggestion = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 120);
    }
  }, [messages, isOpen]);

  // Keyboard shortcut: Ctrl+Shift+I to toggle chat
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          sessionId: sessionId.current,
          messageCount: updatedMessages.filter(
            (m: { role: string }) => m.role === "user",
          ).length,
          usedSuggestion: usedSuggestion.current,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message ?? "Sorry, something went wrong. Try again?",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hmm, couldn't connect. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Responsive width: normal = 480px, expanded = 75vw (min 600px)
  const chatWidth = expanded
    ? "min(75vw, 900px)"
    : "min(480px, calc(100vw - 2rem))";
  const chatHeight = expanded
    ? "min(80vh, 800px)"
    : "min(600px, calc(100vh - 8rem))";

  return (
    <>
      {/* Floating Button — transparent, tooltip on hover, keyboard shortcut */}
      <div className="group/btn fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-1.5">
        {/* Tooltip — only visible on button hover, hidden when chat is open */}
        {!isOpen && (
          <div className="pointer-events-none flex translate-y-1 items-center gap-2 whitespace-nowrap rounded-lg bg-[#1f1e1d] px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-all duration-150 group-hover/btn:translate-y-0 group-hover/btn:opacity-100">
            Chat with Krishna&apos;s AI
            <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px] text-white">
              Ctrl+⇧+I
            </kbd>
          </div>
        )}
        <motion.button
          onClick={() => setIsOpen((prev) => !prev)}
          className="group flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-black/5"
          style={{ color: "#1f1e1d" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.93 }}
          aria-label="Chat with Krishna AI"
        >
          <ClaudeGhostIcon isOpen={isOpen} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: chatWidth,
              height: chatHeight,
            }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-4 z-[999] flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
            style={{ width: chatWidth, height: chatHeight }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-black/10 bg-gray-50 px-5 py-3">
              <div className="relative">
                <div className="flex h-9 w-9 select-none items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                  KS
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-gray-50 bg-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight text-gray-900">
                  Ask about Krishna
                </p>
                <p className="text-xs text-gray-500">
                  AI-powered · Usually instant
                </p>
              </div>
              {/* Expand toggle */}
              <button
                onClick={() => setExpanded((e) => !e)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                title={expanded ? "Collapse" : "Expand"}
              >
                <ExpandIcon expanded={expanded} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`${expanded ? "max-w-[80%]" : "max-w-[88%]"} rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gray-900  text-white  rounded-br-sm"
                        : "bg-gray-100  text-gray-800  rounded-bl-sm"
                    }`}
                  >
                    <MessageContent content={msg.content} />
                  </div>
                </motion.div>
              ))}

              {/* Suggested pills */}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        usedSuggestion.current = true;
                        sendMessage(q);
                      }}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-left text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Loading */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="block h-1.5 w-1.5 rounded-full bg-gray-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-black/10 bg-gray-50 px-5 py-3.5">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 transition-opacity hover:opacity-80 disabled:opacity-30"
                >
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Made by{" "}
                <Link href="https://www.dvlprstudio.com" target="_blank">
                  DvlprStudio
                </Link>{" "}
                · Answers are AI-generated
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
