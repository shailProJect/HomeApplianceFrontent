"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { userApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  /** System prompt to customise Grok's persona */
  systemPrompt?: string;
  /** Greeting shown when the chat opens */
  welcomeMessage?: string;
  /** Grok / XAI API key — pass via env or prop */
  apiKey?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 max-w-[80%]">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-primary-foreground" />
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex items-end gap-2", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-blue-100" : "bg-primary"
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-blue-600" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-primary-foreground" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[78%] flex flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          )}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── Quick replies ────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  "What services are available?",
  "How do I book a technician?",
  "Track my booking",
  "Cancel a booking",
];

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function ChatWidget({
  systemPrompt = `You are a helpful assistant for ApnaAdmi, a home appliance service booking platform. 
Help users with booking services, finding providers, tracking bookings, and answering questions about appliance repair and maintenance. 
Be concise, friendly, and professional. Always respond in the same language the user writes in.`,
  welcomeMessage = "Hi! 👋 I'm your ApnaAdmi assistant. How can I help you today?",
  apiKey = process.env.NEXT_PUBLIC_GROK_API_KEY ?? "",
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: uid(), role: "assistant", content: welcomeMessage, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  // Track unread count when closed
  useEffect(() => {
    if (!open) setUnread((n) => n + 1);
    else setUnread(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Reset unread when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Show scroll-to-bottom button
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 100);
  };

  // ── Send message ────────────────────────────────────────────────────────────

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: uid(), role: "user", content: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Build conversation history for Grok
    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
       const data = await userApi.getChatResponse(trimmed);

            setMessages((prev) => [
            ...prev,
            {
                id: uid(),
                role: "assistant",
                content: data.response,
                timestamp: new Date(),
            },
            ]);

console.log(data.providers);
    } catch (err) {
      console.error("Grok API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: "⚠️ Something went wrong. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Auto-grow textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const showQuickReplies = messages.length === 1; // only after welcome

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200",
          "flex items-center justify-center",
          open && "hidden"
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[370px] flex flex-col rounded-2xl shadow-2xl border border-border bg-card overflow-hidden",
          "transition-all duration-300 origin-bottom-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        )}
        style={{ maxHeight: "calc(100vh - 80px)", height: 560 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">ApnaAdmi Assistant</p>
            <p className="text-xs text-primary-foreground/70 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Online · Powered by Grok
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 scroll-smooth"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Quick reply chips */}
          {showQuickReplies && !loading && (
            <div className="flex flex-wrap gap-2 mt-1">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="absolute bottom-[68px] right-4 w-8 h-8 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Input area */}
        <div className="shrink-0 border-t border-border bg-card px-3 py-3">
          <div className="flex items-end gap-2 bg-muted rounded-xl px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed min-h-[24px] max-h-[120px] py-0.5 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                input.trim() && !loading
                  ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                  : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
              )}
              aria-label="Send"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}