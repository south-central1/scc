import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TicketIcon, SendIcon } from "./Icons";
import { createTicket, fetchMessages, sendMessage } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Ticket, Message } from "@shared/schema";

interface BlockedScreenProps {
  userId: string;
}

export function BlockedScreen({ userId }: BlockedScreenProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { data: tickets = [] } = useQuery({
    queryKey: ["/api/tickets"],
    refetchInterval: 500,
  });

  useEffect(() => {
    const userTicket = tickets.find((t: Ticket) => t.userId === userId);
    setTicket(userTicket || null);
  }, [tickets, userId]);

  const { data: messages = [] } = useQuery({
    queryKey: ticket ? ["/api/tickets", ticket.id, "messages"] : null,
    enabled: !!ticket,
    refetchInterval: 500,
    queryFn: async () => {
      if (!ticket) return [];
      const res = await fetch(`/api/tickets/${ticket.id}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: { subject: string; message: string }) =>
      createTicket(data),
    onSuccess: (newTicket) => {
      setTicket(newTicket);
      setSubject("");
      setMessage("");
    },
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      sendMessage(ticket!.id, { content: text }),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["/api/messages", ticket!.id],
      });
    },
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    createMutation.mutate({ subject, message, userId });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !ticket) return;
    sendMutation.mutate(message);
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950/20 via-background to-red-950/10 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-md w-full">
          <Card className="p-12 bg-gradient-to-br from-card via-card to-red-950/5 border-red-500/30 shadow-2xl border-2 animate-pulse">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/50 relative">
                <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-spin" style={{ animationDuration: "3s" }} />
                <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 0 1 5.11 6.524a6 6 0 0 1 8.367 8.366zM9 3a6 6 0 100 12A6 6 0 009 3z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-red-500 tracking-tight drop-shadow-lg">
                  ACCESS DENIED
                </h1>
                <p className="text-xl text-foreground font-semibold">
                  You have been blocked from this site
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  If you believe this was a mistake, please create a support ticket below.
                </p>
              </div>

              <div className="pt-4 border-t border-red-500/20">
                <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/30">
                  Status: Blocked
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="mt-8 p-8 bg-gradient-to-br from-card via-card to-background border-card-border shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-md bg-blue-500/20 text-blue-500">
                <TicketIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Create Support Ticket</h2>
                <p className="text-xs text-muted-foreground">Contact staff for assistance</p>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Subject
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Why are you blocked?"
                  className="bg-background border-border focus:border-blue-500 transition-colors"
                  data-testid="input-blocked-ticket-subject"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your situation..."
                  rows={4}
                  className="bg-background border-border focus:border-blue-500 resize-none transition-colors"
                  data-testid="input-blocked-ticket-message"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2 font-semibold"
                disabled={createMutation.isPending || !subject.trim() || !message.trim()}
                data-testid="button-create-blocked-ticket"
              >
                Create Ticket
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950/20 via-background to-red-950/10 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/30 mb-4">
            Blocked Status - Tickets Only
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Support Ticket</h1>
          <p className="text-muted-foreground">
            Only your support ticket is visible while blocked
          </p>
        </div>

        <Card className="p-8 bg-gradient-to-br from-card via-card to-background border-card-border shadow-lg mb-6 animate-pop-in">
          <div className="space-y-6">
            <div className="flex items-start justify-between pb-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {ticket.subject}
                </h2>
                <div className="flex gap-3 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${
                      ticket.status === "open"
                        ? "bg-blue-500/20 text-blue-500 border-blue-500/30"
                        : ticket.status === "closed"
                          ? "bg-gray-500/20 text-gray-500 border-gray-500/30"
                          : "bg-green-500/20 text-green-500 border-green-500/30"
                    }`}
                    data-testid={`badge-status-${ticket.status}`}
                  >
                    {ticket.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Ticket #{ticket.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(messages as Message[]).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 animate-slide-up ${
                    msg.senderRole === "user" ? "flex-row-reverse" : ""
                  }`}
                  data-testid={`message-${msg.id}`}
                >
                  <div
                    className={`flex-1 max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      msg.senderRole === "user"
                        ? "bg-blue-600/20 text-foreground ml-auto"
                        : "bg-gray-700/20 text-foreground"
                    }`}
                  >
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {msg.senderRole === "user" ? "You" : "Staff"}
                    </p>
                    <p className="text-sm leading-relaxed break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {ticket.status === "open" && (
              <form onSubmit={handleSendMessage} className="pt-6 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    rows={2}
                    className="bg-background border-border focus:border-blue-500 resize-none transition-colors"
                    data-testid="input-blocked-message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 h-full"
                    disabled={sendMutation.isPending || !message.trim()}
                    data-testid="button-send-blocked-message"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {ticket.status === "closed" && (
              <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  This ticket has been closed. Contact staff to reopen it.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
