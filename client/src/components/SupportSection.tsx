import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DiscordIcon, TicketIcon, SendIcon, MessageIcon, CloseIcon } from "./Icons";
import { fetchTickets, createTicket, updateTicket, fetchMessages, sendMessage } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Ticket, Message } from "@shared/schema";

interface SupportSectionProps {
  mode: "discord" | "ticket";
  onModeChange: (mode: "discord" | "ticket") => void;
  userId?: string;
  isStaff?: boolean;
}

function DiscordSupport() {
  return (
    <Card
      className="p-8 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d animate-pop-in"
      data-testid="discord-support-card"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/30 mb-6 animate-float">
          <DiscordIcon className="w-10 h-10 text-[#5865F2]" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Discord Support</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Join our Discord server for live support, community updates, and direct communication with our team.
        </p>
        <Button
          size="lg"
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white gap-2"
          onClick={() => window.open("https://discord.gg/nAJvFx6rSe", "_blank")}
          data-testid="button-join-discord"
        >
          <DiscordIcon className="w-5 h-5" />
          Join Discord Server
        </Button>
      </div>
    </Card>
  );
}

function TicketForm({ onTicketCreated, userId }: { onTicketCreated: (ticket: Ticket) => void; userId?: string }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const createTicketMutation = useMutation({
    mutationFn: (data: { subject: string; message: string; userId: string }) => createTicket(data),
    onSuccess: (ticket) => {
      onTicketCreated(ticket);
      setSubject("");
      setMessage("");
    },
    onError: (error) => {
      console.error("Failed to create ticket:", error);
    },
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    if (!userId) {
      console.error("No userId available");
      return;
    }
    createTicketMutation.mutate({
      subject,
      message,
      userId: userId,
    });
  };

  return (
    <Card
      className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d animate-pop-in"
      data-testid="ticket-form-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-md bg-primary/20 text-primary">
          <TicketIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Create a Ticket</h2>
          <p className="text-sm text-muted-foreground">Get personalized help from our staff</p>
        </div>
      </div>

      <form onSubmit={handleCreateTicket} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of your issue"
            className="bg-background border-border focus:border-primary"
            data-testid="input-ticket-subject"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue in detail..."
            rows={4}
            className="bg-background border-border focus:border-primary resize-none"
            data-testid="input-ticket-message"
          />
        </div>
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={createTicketMutation.isPending || !subject.trim() || !message.trim()}
          data-testid="button-create-ticket"
        >
          {createTicketMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <SendIcon className="w-4 h-4" />
              Create Ticket
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

function TicketChat({
  ticket,
  onClose,
}: {
  ticket: Ticket;
  onClose: () => void;
}) {
  const [newMessage, setNewMessage] = useState("");

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/tickets", ticket.id, "messages"],
    queryFn: () => fetchMessages(ticket.id),
    refetchInterval: 2000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(ticket.id, content, "user"),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticket.id, "messages"] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => updateTicket(ticket.id, { status: "closed" }),
    onSuccess: () => {
      onClose();
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage);
  };

  return (
    <Card
      className="flex flex-col h-[500px] bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d animate-pop-in"
      data-testid={`ticket-chat-${ticket.ticketNumber}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Ticket-{ticket.ticketNumber}
          </Badge>
          <span className="font-medium text-foreground truncate max-w-[200px]">{ticket.subject}</span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => closeMutation.mutate()}
          disabled={closeMutation.isPending}
          className="gap-1"
          data-testid="button-close-ticket"
        >
          <CloseIcon className="w-4 h-4" />
          Close
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-secondary/50 rounded-lg p-3 text-sm">
          <span className="font-medium text-foreground">Initial Message:</span>
          <p className="text-muted-foreground mt-1">{ticket.message}</p>
        </div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <MessageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Waiting for staff response...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-background border-border"
          data-testid="input-chat-message"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newMessage.trim() || sendMutation.isPending}
          data-testid="button-send-message"
        >
          <SendIcon className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}

function MyTickets({ onSelectTicket, userId, isStaff }: { onSelectTicket: (ticket: Ticket) => void; userId?: string; isStaff?: boolean }) {
  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
    queryFn: fetchTickets,
    refetchInterval: 2000,
  });

  const openTickets = tickets.filter((t) => t.status !== "closed" && (isStaff || t.userId === userId));

  if (openTickets.length === 0) return null;

  return (
    <Card
      className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d mt-6 animate-fade-in-up"
      data-testid="my-tickets-card"
    >
      <h3 className="font-bold text-lg text-foreground mb-4">Your Open Tickets</h3>
      <div className="space-y-3">
        {openTickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover-elevate transition-all text-left"
            data-testid={`ticket-item-${ticket.ticketNumber}`}
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className={
                  ticket.status === "claimed"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
                }
              >
                {ticket.status === "claimed" ? "In Progress" : "Open"}
              </Badge>
              <div>
                <div className="font-medium text-foreground">Ticket-{ticket.ticketNumber}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {ticket.subject}
                </div>
              </div>
            </div>
            <MessageIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </Card>
  );
}

export function SupportSection({ mode, onModeChange, userId, isStaff }: SupportSectionProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleTicketCreated = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleLogout = () => {
    // Implement logout logic here, e.g., clear authentication tokens and redirect
    console.log("Logging out...");
    // For example, if using NextAuth.js:
    // signOut();
    // Or if using a simple token:
    // localStorage.removeItem('auth_token');
    // window.location.href = '/login';
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gaming-red" style={{ textShadow: "0 0 30px rgba(200, 30, 30, 0.5)" }}>
              Get
            </span>{" "}
            <span className="text-foreground">Support</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Need help? We're here for you. Choose your preferred support method below.
          </p>
        </div>

        {mode === "discord" ? (
          <DiscordSupport />
        ) : selectedTicket ? (
          <TicketChat ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        ) : (
          <>
            <TicketForm onTicketCreated={handleTicketCreated} userId={userId} />
            {isStaff && <MyTickets onSelectTicket={setSelectedTicket} userId={userId} isStaff={isStaff} />}
          </>
        )}

        {mode === "discord" && (
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <p className="text-muted-foreground">
              Prefer direct support?{" "}
              <button
                onClick={() => {
                  onModeChange("ticket");
                  setSelectedTicket(null);
                }}
                className="text-primary hover:underline font-medium"
                data-testid="link-create-ticket"
              >
                Create a ticket instead
              </button>
            </p>
          </div>
        )}

        <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <CloseIcon className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}