import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TicketIcon,
  ClaimIcon,
  CloseIcon,
  SendIcon,
  MessageIcon,
  BellIcon,
  CheckIcon,
  TeamIcon,
} from "./Icons";
import {
  fetchTickets,
  updateTicket,
  fetchMessages,
  sendMessage,
  generateNotificationSound,
  setUpdateStatus,
  getCountdownToFriday,
  formatCountdown,
} from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Ticket, Message, Gang } from "@shared/schema";

function TicketList({
  tickets,
  onSelectTicket,
  selectedTicketId,
}: {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  selectedTicketId: string | null;
}) {
  return (
    <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-foreground">Tickets</h2>
        <Badge variant="secondary" className="bg-primary/20 text-primary">
          {tickets.filter((t) => t.status !== "closed").length} Open
        </Badge>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tickets yet</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)}
              className={`w-full p-3 rounded-lg text-left transition-all hover-elevate ${
                selectedTicketId === ticket.id
                  ? "bg-primary/20 border border-primary/30"
                  : "bg-secondary/50"
              }`}
              data-testid={`staff-ticket-${ticket.ticketNumber}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant="secondary"
                  className={
                    ticket.status === "open"
                      ? "bg-green-500/20 text-green-400"
                      : ticket.status === "claimed"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-400"
                  }
                >
                  {ticket.status === "open"
                    ? "New"
                    : ticket.status === "claimed"
                    ? "Claimed"
                    : "Closed"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="font-medium text-foreground text-sm">
                Ticket-{ticket.ticketNumber}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-1">
                {ticket.subject}
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  );
}

function TicketView({
  ticket,
  onClose,
  onUpdate,
}: {
  ticket: Ticket;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/tickets", ticket.id, "messages"],
    queryFn: () => fetchMessages(ticket.id),
    refetchInterval: 2000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(ticket.id, content, "staff"),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticket.id, "messages"] });
    },
  });

  const claimMutation = useMutation({
    mutationFn: () => updateTicket(ticket.id, { status: "claimed", claimedBy: "Staff" }),
    onSuccess: () => {
      onUpdate();
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
    <Card className="flex flex-col h-full bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Ticket-{ticket.ticketNumber}
          </Badge>
          <div>
            <div className="font-medium text-foreground">{ticket.subject}</div>
            <div className="text-xs text-muted-foreground">
              Created {new Date(ticket.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {ticket.status === "open" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="gap-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
              data-testid="button-claim-ticket"
            >
              <ClaimIcon className="w-4 h-4" />
              Claim
            </Button>
          )}
          {ticket.status === "claimed" && (
            <Badge
              variant="secondary"
              className="bg-yellow-500/20 text-yellow-400 flex items-center gap-1"
            >
              <CheckIcon className="w-3 h-3" />
              Claimed by {ticket.claimedBy}
            </Badge>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => closeMutation.mutate()}
            disabled={closeMutation.isPending}
            className="gap-1"
            data-testid="button-close-staff-ticket"
          >
            <CloseIcon className="w-4 h-4" />
            Close
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <div className="bg-secondary/50 rounded-lg p-3 text-sm">
          <span className="font-medium text-foreground">User's Initial Message:</span>
          <p className="text-muted-foreground mt-1">{ticket.message}</p>
        </div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "staff" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === "staff"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {msg.sender === "staff" ? "Staff" : "User"}
              </div>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {ticket.status !== "closed" && (
        <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 bg-background border-border"
            data-testid="input-staff-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sendMutation.isPending}
            data-testid="button-staff-send"
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      )}
    </Card>
  );
}

export function StaffPanel() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [staffTab, setStaffTab] = useState<"tickets" | "gangs" | "giveaways" | "announcements" | "shop" | "users" | "notes">("tickets");
  const [searchUserId, setSearchUserId] = useState("");
  const [editingUserId, setEditingUserId] = useState<string>("");
  const [createGangName, setCreateGangName] = useState("");
  const [createGangOwner, setCreateGangOwner] = useState("");
  const [createGangOwnerName, setCreateGangOwnerName] = useState("");
  const [createGangPassword, setCreateGangPassword] = useState("");
  const [createGangColor, setCreateGangColor] = useState("#FF1E1E");
  const [selectedGang, setSelectedGang] = useState<Gang | null>(null);
  const [progressValue, setProgressValue] = useState(89);
  const [countdown, setCountdown] = useState(formatCountdown(getCountdownToFriday()));
  
  // Giveaway states
  const [giveawayPrice, setGiveawayPrice] = useState("");
  const [giveawayDuration, setGiveawayDuration] = useState("1h");
  const [giveawayWinners, setGiveawayWinners] = useState("1");
  const [giveawayDesc, setGiveawayDesc] = useState("");
  
  // Announcement states
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementUser, setAnnouncementUser] = useState("");
  const [announcementDesc, setAnnouncementDesc] = useState("");
  
  // Shop states
  const [shopName, setShopName] = useState("");
  const [shopLink, setShopLink] = useState("");
  const [shopPrice, setShopPrice] = useState("");
  const [shopCategory, setShopCategory] = useState<"Turfs" | "Spawners" | "Cosmetics">("Turfs");
  const [aiEnabled, setAiEnabled] = useState(true);
  
  // Notes states
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  
  const prevTicketCountRef = useRef(0);

  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
    queryFn: fetchTickets,
    refetchInterval: 2000,
  });

  const { data: gangs = [] } = useQuery<Gang[]>({
    queryKey: ["/api/gangs"],
    queryFn: async () => {
      const res = await fetch("/api/gangs");
      return res.json();
    },
    refetchInterval: 2000,
  });

  const { data: giveaways = [] } = useQuery({
    queryKey: ["/api/giveaways"],
    queryFn: async () => {
      const res = await fetch("/api/giveaways");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: async () => {
      const res = await fetch("/api/announcements");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: shopProducts = [] } = useQuery({
    queryKey: ["/api/shop-products"],
    queryFn: async () => {
      const res = await fetch("/api/shop-products");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      return res.json();
    },
    refetchInterval: 500,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["/api/notes"],
    queryFn: async () => {
      const res = await fetch("/api/notes");
      return res.json();
    },
    refetchInterval: 3000,
  });

  const blockUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}/block`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to block");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/users"] });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}/unblock`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to unblock");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/users"] });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle,
          description: noteDesc,
          createdBy: "Staff",
        }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    onSuccess: () => {
      setNoteTitle("");
      setNoteDesc("");
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(getCountdownToFriday()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const createGangMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/gangs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createGangName,
          owner: createGangOwner,
          ownerName: createGangOwnerName,
          password: createGangPassword,
          color: createGangColor,
        }),
      });
      if (!res.ok) throw new Error("Failed to create gang");
      return res.json();
    },
    onSuccess: () => {
      setCreateGangName("");
      setCreateGangOwner("");
      setCreateGangOwnerName("");
      setCreateGangPassword("");
      queryClient.invalidateQueries({ queryKey: ["/api/gangs"] });
    },
  });

  const deleteGangMutation = useMutation({
    mutationFn: async (gangId: string) => {
      const res = await fetch(`/api/gangs/${gangId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete gang");
    },
    onSuccess: () => {
      setSelectedGang(null);
      queryClient.invalidateQueries({ queryKey: ["/api/gangs"] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!selectedGang) return;
      const res = await fetch(`/api/gangs/${selectedGang.id}/members/${memberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove member");
      return res.json();
    },
    onSuccess: (data) => {
      setSelectedGang(data);
      queryClient.invalidateQueries({ queryKey: ["/api/gangs"] });
    },
  });

  const createGiveawayMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/giveaways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: giveawayPrice,
          duration: giveawayDuration,
          description: giveawayDesc,
          winnersCount: parseInt(giveawayWinners),
        }),
      });
      if (!res.ok) throw new Error("Failed to create giveaway");
      return res.json();
    },
    onSuccess: () => {
      setGiveawayPrice("");
      setGiveawayDuration("1h");
      setGiveawayWinners("1");
      setGiveawayDesc("");
      queryClient.invalidateQueries({ queryKey: ["/api/giveaways"] });
    },
  });

  const deleteGiveawayMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/giveaways/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/giveaways"] });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announcementTitle,
          user: announcementUser,
          description: announcementDesc,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      setAnnouncementTitle("");
      setAnnouncementUser("");
      setAnnouncementDesc("");
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
  });

  const createShopProductMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/shop-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: shopName,
          link: shopLink,
          price: shopPrice,
          category: shopCategory,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      setShopName("");
      setShopLink("");
      setShopPrice("");
      setShopCategory("Turfs");
      queryClient.invalidateQueries({ queryKey: ["/api/shop-products"] });
    },
  });

  const deleteShopProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shop-products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-products"] });
    },
  });

  const sortedTickets = [...tickets].sort((a, b) => {
    if (a.status === "open" && b.status !== "open") return -1;
    if (b.status === "open" && a.status !== "open") return 1;
    if (a.status === "claimed" && b.status === "closed") return -1;
    if (b.status === "claimed" && a.status === "closed") return 1;
    return b.createdAt - a.createdAt;
  });

  useEffect(() => {
    if (notificationEnabled && tickets.length > prevTicketCountRef.current) {
      const newTickets = tickets.filter(
        (t) => t.status === "open" && t.createdAt > Date.now() - 5000
      );
      if (newTickets.length > 0 && prevTicketCountRef.current > 0) {
        generateNotificationSound();
      }
    }
    prevTicketCountRef.current = tickets.length;
  }, [tickets, notificationEnabled]);

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets, selectedTicket]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-gaming-red" style={{ textShadow: "0 0 30px rgba(200, 30, 30, 0.5)" }}>
                Staff
              </span>{" "}
              <span className="text-foreground">Panel</span>
            </h1>
            <p className="text-muted-foreground mt-1">Manage everything</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={staffTab === "tickets" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStaffTab("tickets")}
              data-testid="button-staff-tickets-tab"
            >
              <TicketIcon className="w-4 h-4 mr-1" />
              Tickets
            </Button>
            <Button
              variant={staffTab === "gangs" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStaffTab("gangs")}
              data-testid="button-staff-gangs-tab"
            >
              <TeamIcon className="w-4 h-4 mr-1" />
              Gangs
            </Button>
            <Button
              variant={staffTab === "giveaways" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStaffTab("giveaways")}
              data-testid="button-staff-giveaways-tab"
            >
              Giveaways
            </Button>
            <Button
              variant={staffTab === "announcements" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStaffTab("announcements")}
              data-testid="button-staff-announcements-tab"
            >
              Announcements
            </Button>
            <Button
              variant={staffTab === "shop" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStaffTab("shop")}
              data-testid="button-staff-shop-tab"
            >
              Shop
            </Button>
            <Button
              variant={staffTab === "users" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStaffTab("users")}
              data-testid="button-staff-users-tab"
            >
              User Management
            </Button>
            <Button
              variant={staffTab === "notes" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStaffTab("notes")}
              data-testid="button-staff-notes-tab"
            >
              Notes
            </Button>
            <Button
              variant={aiEnabled ? "default" : "secondary"}
              size="sm"
              onClick={() => setAiEnabled(!aiEnabled)}
              className="gap-2"
              data-testid="button-toggle-ai"
            >
              <span className="text-xs">AI {aiEnabled ? "ON" : "OFF"}</span>
            </Button>
            <Button
              variant={notificationEnabled ? "default" : "secondary"}
              size="sm"
              onClick={() => setNotificationEnabled(!notificationEnabled)}
              className="gap-2"
              data-testid="button-toggle-notifications"
            >
              <BellIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {staffTab === "tickets" && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="md:col-span-1">
            <TicketList
              tickets={sortedTickets}
              onSelectTicket={setSelectedTicket}
              selectedTicketId={selectedTicket?.id || null}
            />
          </div>
          <div className="md:col-span-2 min-h-[600px]">
            {selectedTicket ? (
              <TicketView
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onUpdate={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
                }}
              />
            ) : (
              <Card className="h-full flex items-center justify-center bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
                <div className="text-center text-muted-foreground">
                  <MessageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Select a ticket to view</p>
                  <p className="text-sm mt-1">Click on a ticket from the list to start responding</p>
                </div>
              </Card>
            )}
          </div>
        </div>
        )}

        {staffTab === "gangs" && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="md:col-span-1 space-y-6">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Create Gang</h3>
              <div className="space-y-3">
                <Input placeholder="Gang Name" value={createGangName} onChange={(e) => setCreateGangName(e.target.value)} data-testid="input-gang-name" />
                <Input placeholder="Owner ID" value={createGangOwner} onChange={(e) => setCreateGangOwner(e.target.value)} data-testid="input-gang-owner" />
                <Input placeholder="Owner Name" value={createGangOwnerName} onChange={(e) => setCreateGangOwnerName(e.target.value)} data-testid="input-gang-owner-name" />
                <Input placeholder="Gang Password" type="password" value={createGangPassword} onChange={(e) => setCreateGangPassword(e.target.value)} data-testid="input-gang-password" />
                <div className="flex gap-2 items-center">
                  <Input type="color" value={createGangColor} onChange={(e) => setCreateGangColor(e.target.value)} className="w-12 h-10" data-testid="input-gang-color" />
                  <span className="text-sm text-muted-foreground">Gang Color</span>
                </div>
                <Button onClick={() => createGangMutation.mutate()} disabled={createGangMutation.isPending || !createGangName} className="w-full" data-testid="button-create-gang">
                  Create Gang
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Update Progress</h3>
              <div className="space-y-3">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressValue}%` }} />
                </div>
                <Input type="number" min="0" max="100" value={progressValue} onChange={(e) => setProgressValue(Math.min(100, parseInt(e.target.value) || 0))} data-testid="input-progress" />
                <Button onClick={() => setUpdateStatus(progressValue)} className="w-full" data-testid="button-update-progress">
                  Set Progress to {progressValue}%
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-2">Countdown to Launch</h3>
              <div className="text-2xl font-bold text-primary">{countdown}</div>
              <p className="text-xs text-muted-foreground mt-2">Friday 8PM Global</p>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">All Gangs</h3>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {gangs.length} Active
                </Badge>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {gangs.length === 0 ? (
                  <p className="text-muted-foreground">No gangs created</p>
                ) : (
                  gangs.map((gang) => (
                    <div key={gang.id} className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: gang.color }} />
                          <button onClick={() => setSelectedGang(gang)} className="font-medium hover:text-primary" data-testid={`button-select-gang-${gang.id}`}>
                            {gang.name}
                          </button>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteGangMutation.mutate(gang.id)} data-testid={`button-delete-gang-${gang.id}`}>
                          Delete
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">Owner: {gang.ownerName}</div>
                      <div className="text-xs text-muted-foreground">Members: {gang.members.length}</div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {selectedGang && (
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedGang.name}</h3>
                  <p className="text-xs text-muted-foreground">Owner: {selectedGang.ownerName}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteGangMutation.mutate(selectedGang.id)} data-testid={`button-delete-selected-gang`}>
                  Delete Gang
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-secondary/50 p-3 rounded">
                  <div className="text-xs text-muted-foreground">Members</div>
                  <div className="text-xl font-bold text-primary">{selectedGang.members.length}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded">
                  <div className="text-xs text-muted-foreground">Online</div>
                  <div className="text-xl font-bold text-primary">{selectedGang.members.filter(m => m.isOnline).length}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded">
                  <div className="text-xs text-muted-foreground">Ranks</div>
                  <div className="text-xl font-bold text-primary">{selectedGang.ranks.length}</div>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="font-bold mb-3">Members</h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {selectedGang.members.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No members</p>
                  ) : (
                    selectedGang.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded">
                        <div>
                          <div className="text-sm font-medium">{member.username}</div>
                          <div className="text-xs text-muted-foreground">{member.rank} • {member.isOnline ? "Online" : "Offline"}</div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeMemberMutation.mutate(member.id)} data-testid={`button-remove-member-${member.id}`}>
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
            )}
          </div>
        </div>
        )}

        {staffTab === "giveaways" && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="md:col-span-1">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Create Giveaway</h3>
              <div className="space-y-3">
                <Input placeholder="Prize (e.g. 1000 Robux, $100, etc)" value={giveawayPrice} onChange={(e) => setGiveawayPrice(e.target.value)} data-testid="input-giveaway-price" />
                <select value={giveawayDuration} onChange={(e) => setGiveawayDuration(e.target.value)} className="w-full px-3 py-2 rounded-md bg-secondary border border-input" data-testid="select-giveaway-duration">
                  <option value="1m">1 Minute</option>
                  <option value="1h">1 Hour</option>
                  <option value="1d">1 Day</option>
                  <option value="1w">1 Week</option>
                  <option value="1mo">1 Month</option>
                </select>
                <Input type="number" placeholder="Number of Winners" value={giveawayWinners} onChange={(e) => setGiveawayWinners(e.target.value)} data-testid="input-giveaway-winners" />
                <textarea placeholder="Description" value={giveawayDesc} onChange={(e) => setGiveawayDesc(e.target.value)} className="w-full px-3 py-2 rounded-md bg-secondary border border-input text-foreground" data-testid="textarea-giveaway-desc" />
                <Button onClick={() => createGiveawayMutation.mutate()} disabled={createGiveawayMutation.isPending || !giveawayPrice} className="w-full" data-testid="button-create-giveaway">
                  Create Giveaway
                </Button>
              </div>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Active Giveaways</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {giveaways.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No giveaways</p>
                ) : (
                  giveaways.map((ga: any) => (
                    <div key={ga.id} className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{ga.price} • {ga.winnersCount} winners</div>
                        <div className="text-xs text-muted-foreground">{ga.description}</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteGiveawayMutation.mutate(ga.id)} data-testid={`button-delete-giveaway-${ga.id}`}>
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
        )}

        {staffTab === "announcements" && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="md:col-span-1">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Create Announcement</h3>
              <div className="space-y-3">
                <Input placeholder="Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} data-testid="input-announcement-title" />
                <Input placeholder="Your Name" value={announcementUser} onChange={(e) => setAnnouncementUser(e.target.value)} data-testid="input-announcement-user" />
                <textarea placeholder="Description" value={announcementDesc} onChange={(e) => setAnnouncementDesc(e.target.value)} className="w-full px-3 py-2 rounded-md bg-secondary border border-input text-foreground" data-testid="textarea-announcement-desc" />
                <Button onClick={() => createAnnouncementMutation.mutate()} disabled={createAnnouncementMutation.isPending || !announcementTitle} className="w-full" data-testid="button-create-announcement">
                  Create
                </Button>
              </div>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Announcements</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {announcements.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No announcements</p>
                ) : (
                  announcements.map((ann: any) => (
                    <div key={ann.id} className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-medium">{ann.title}</div>
                          <div className="text-xs text-muted-foreground">by {ann.user}</div>
                          <div className="text-sm text-muted-foreground mt-1">{ann.description}</div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteAnnouncementMutation.mutate(ann.id)} data-testid={`button-delete-announcement-${ann.id}`}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
        )}

        {staffTab === "shop" && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="md:col-span-1">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Create Product</h3>
              <div className="space-y-3">
                <Input placeholder="Product Name" value={shopName} onChange={(e) => setShopName(e.target.value)} data-testid="input-shop-name" />
                <Input placeholder="Product Link" value={shopLink} onChange={(e) => setShopLink(e.target.value)} data-testid="input-shop-link" />
                <Input placeholder="Price (e.g. 500 Robux, $50, etc)" value={shopPrice} onChange={(e) => setShopPrice(e.target.value)} data-testid="input-shop-price" />
                <select value={shopCategory} onChange={(e) => setShopCategory(e.target.value as any)} className="w-full px-3 py-2 rounded-md bg-secondary border border-input" data-testid="select-shop-category">
                  <option value="Turfs">Turfs</option>
                  <option value="Spawners">Spawners</option>
                  <option value="Cosmetics">Cosmetics</option>
                </select>
                <Button onClick={() => createShopProductMutation.mutate()} disabled={createShopProductMutation.isPending || !shopName} className="w-full" data-testid="button-create-shop-product">
                  Create
                </Button>
              </div>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Products</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {shopProducts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No products</p>
                ) : (
                  shopProducts.map((prod: any) => (
                    <div key={prod.id} className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{prod.name}</div>
                        <div className="text-xs text-muted-foreground">{prod.price} • {prod.category}</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteShopProductMutation.mutate(prod.id)} data-testid={`button-delete-product-${prod.id}`}>
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
        )}

        {staffTab === "users" && (
        <div className="grid md:grid-cols-1 gap-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <Card className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
            <div className="mb-6">
              <h3 className="font-bold mb-4 text-lg">User Management - All Registered IDs</h3>
              <Input 
                placeholder="Search User ID..." 
                value={searchUserId} 
                onChange={(e) => setSearchUserId(e.target.value)}
                data-testid="input-search-user-id"
              />
              <Badge className="mt-2 bg-primary/20">Total Users: {users.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {!users || users.length === 0 ? (
                <p className="text-muted-foreground text-sm">No users registered</p>
              ) : (
                users
                  .filter((u: any) => !searchUserId || u.userId.includes(searchUserId))
                  .map((user: any) => (
                    <div key={user.id} className="p-4 bg-secondary/50 rounded-lg flex justify-between items-center gap-4 border-l-4 border-primary">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-primary">ID: {user.userId}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Status: {user.isBlocked ? "🔒 BLOCKED" : "✅ ACTIVE"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Registered: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-col">
                        {user.isBlocked ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => unblockUserMutation.mutate(user.id)}
                            disabled={unblockUserMutation.isPending}
                            data-testid={`button-unblock-user-${user.userId}`}
                          >
                            Unblock
                          </Button>
                        ) : (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => blockUserMutation.mutate(user.id)}
                            disabled={blockUserMutation.isPending}
                            data-testid={`button-block-user-${user.userId}`}
                          >
                            Block
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
        )}

        {staffTab === "notes" && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="md:col-span-1">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Add Note</h3>
              <div className="space-y-3">
                <Input 
                  placeholder="Note Title" 
                  value={noteTitle} 
                  onChange={(e) => setNoteTitle(e.target.value)}
                  data-testid="input-note-title"
                />
                <textarea 
                  placeholder="Note Description" 
                  value={noteDesc} 
                  onChange={(e) => setNoteDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-secondary border border-input text-foreground"
                  rows={4}
                  data-testid="textarea-note-desc"
                />
                <Button 
                  onClick={() => createNoteMutation.mutate()} 
                  disabled={createNoteMutation.isPending || !noteTitle || !noteDesc}
                  className="w-full"
                  data-testid="button-create-note"
                >
                  Add Note
                </Button>
              </div>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
              <h3 className="font-bold mb-4">Staff Notes</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {!notes || notes.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No notes yet</p>
                ) : (
                  notes.map((note: any) => (
                    <div key={note.id} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1">
                          <div className="font-bold">{note.title}</div>
                          <div className="text-xs text-muted-foreground">by {note.createdBy}</div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(`${note.title}\n\n${note.description}`)}
                          data-testid={`button-copy-note-${note.id}`}
                        >
                          Copy
                        </Button>
                      </div>
                      <div className="text-sm text-foreground mt-2 mb-3 p-2 bg-background rounded border border-border">
                        {note.description}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        disabled={deleteNoteMutation.isPending}
                        data-testid={`button-delete-note-${note.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
