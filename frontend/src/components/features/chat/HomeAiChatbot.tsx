"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FaLocationDot, FaPaperPlane, FaRobot, FaUser } from "react-icons/fa6";
import type { ApiResponse, ChatbotData, ChatbotTourSuggestion } from "@/types/client-api";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  suggestions: ChatbotTourSuggestion[];
};

const formatPrice = (value: number): string => `${Math.max(0, value).toLocaleString("vi-VN")}đ`;

const initialAssistantMessage: ChatMessage = {
  id: "initial-assistant",
  role: "assistant",
  text: "Xin chao! Ban hay mo ta nhu cau du lich, minh se goi y tour phu hop.",
  suggestions: [],
};

export function HomeAiChatbot() {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);

  const canSubmit = useMemo(() => input.trim().length > 0 && !submitting, [input, submitting]);

  const handleSubmit = async () => {
    const message = input.trim();
    if (!message || submitting) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message,
      suggestions: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, limit: 3 }),
      });

      const payload = (await response.json()) as ApiResponse<ChatbotData>;
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message || "Khong the lay goi y tu chatbot.");
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: payload.data.aiJson?.reply || "Minh da tim duoc mot vai lua chon cho ban.",
        suggestions: payload.data.suggestions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (_error) {
      const fallbackMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        text: "He thong AI tam thoi ban. Ban thu mo ta ngan gon hon hoac thu lai sau nhe.",
        suggestions: [],
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 mt-12">
      <div className="rounded-3xl border border-surface-container-high/60 bg-surface-container-lowest shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25)] overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-container-high/50 flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
            <FaRobot />
          </span>
          <div>
            <h3 className="text-lg font-bold">AI Tour Chatbot</h3>
            <p className="text-sm text-on-surface-variant">Nhap yeu cau de nhan goi y tour dang JSON + card tour co the click.</p>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[540px] overflow-y-auto bg-surface-container-low">
          {messages.map((item) => (
            <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-3xl rounded-2xl px-4 py-3 ${item.role === "user" ? "bg-primary text-white" : "bg-white text-on-surface"}`}>
                <div className="flex items-center gap-2 text-xs font-semibold mb-2 opacity-80">
                  {item.role === "user" ? <FaUser /> : <FaRobot />}
                  <span>{item.role === "user" ? "Ban" : "AI"}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{item.text}</p>

                {item.suggestions.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {item.suggestions.map((tour) => {
                      const finalPrice = tour.priceNew > 0 ? tour.priceNew : tour.price;
                      return (
                        <Link
                          key={`${item.id}-${tour.slug}`}
                          href={`/tour/${tour.slug}`}
                          className="block rounded-xl border border-surface-container-high/70 bg-surface-container-lowest hover:border-primary/70 transition-colors overflow-hidden"
                        >
                          <div className="flex items-stretch">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={tour.avatar || "/client/images/avatar-2.jpg"} alt={tour.name} className="w-28 h-28 object-cover flex-shrink-0" />
                            <div className="p-3 min-w-0">
                              <h4 className="font-bold text-sm line-clamp-1">{tour.name}</h4>
                              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{tour.reason}</p>
                              <div className="flex items-center justify-between gap-2 mt-2">
                                <span className="text-xs font-semibold text-primary">{formatPrice(finalPrice)}</span>
                                <span className="text-[11px] text-on-surface-variant inline-flex items-center gap-1">
                                  <FaLocationDot className="text-[10px]" />
                                  {tour.locationNames[0] || "Viet Nam"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-surface-container-high/50 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Vi du: toi muon tour bien 3 ngay 2 dem duoi 5 trieu..."
              maxLength={1000}
              className="flex-1 h-11 rounded-xl border border-surface-container-high px-4 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="h-11 px-4 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
            >
              <FaPaperPlane />
              {submitting ? "Dang gui..." : "Gui"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
