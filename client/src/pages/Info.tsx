import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Bell } from "lucide-react";
import type { Giveaway, Announcement } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

function formatTimeRemaining(endsAt: number): string {
  const now = Date.now();
  const diff = endsAt - now;
  if (diff <= 0) return "Ended";
  
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function Info() {
  const [savedUsername, setSavedUsername] = useState("");
  const [enteringGiveawayId, setEnteringGiveawayId] = useState<string | null>(null);
  const [tempUsername, setTempUsername] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("discord_username") || "";
    setSavedUsername(saved);
  }, []);

  const { data: giveaways = [] } = useQuery<Giveaway[]>({
    queryKey: ["/api/giveaways"],
    queryFn: async () => {
      const res = await fetch("/api/giveaways");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    queryFn: async () => {
      const res = await fetch("/api/announcements");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const joinMutation = useMutation({
    mutationFn: async (giveawayId: string) => {
      const username = tempUsername || savedUsername;
      if (!username) throw new Error("Username required");
      const res = await fetch(`/api/giveaways/${giveawayId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new Error("Failed to join");
      localStorage.setItem("discord_username", username);
      setSavedUsername(username);
      return res.json();
    },
    onSuccess: () => {
      setEnteringGiveawayId(null);
      setTempUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/giveaways"] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async (giveawayId: string) => {
      const res = await fetch(`/api/giveaways/${giveawayId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: savedUsername }),
      });
      if (!res.ok) throw new Error("Failed to leave");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/giveaways"] });
    },
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12">
          <span className="text-gaming-red">Information</span>
        </h1>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Active Giveaways</h2>
            </div>
            <div className="grid gap-4">
              {giveaways.length === 0 ? (
                <Card className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border text-muted-foreground text-center">
                  No active giveaways at the moment
                </Card>
              ) : (
                giveaways.map((ga) => (
                  <Card key={ga.id} className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">{ga.price}</h3>
                        <p className="text-sm text-muted-foreground">{ga.participants.length} participants</p>
                      </div>
                      <Badge className={ga.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                        {ga.status === "active" ? "Active" : "Ended"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{ga.description}</p>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-primary font-medium">{ga.price}</span>
                      <span className="text-primary font-medium">{formatTimeRemaining(ga.endsAt)}</span>
                    </div>
                    {ga.status === "ended" && ga.winners.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border mb-4">
                        <div className="space-y-1">
                          {ga.winners.map((winner, i) => (
                            <p key={i} className="text-sm font-medium">Giveaway Winner: {winner}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {enteringGiveawayId === ga.id && ga.status === "active" ? (
                      <div className="space-y-3 pt-4 border-t border-border">
                        <div>
                          <label className="text-sm font-medium">Discord Username</label>
                          <Input
                            placeholder="Enter your Discord username"
                            value={tempUsername}
                            onChange={(e) => setTempUsername(e.target.value)}
                            data-testid="input-discord-username-info"
                          />
                        </div>
                        <Button
                          onClick={() => joinMutation.mutate(ga.id)}
                          disabled={!tempUsername || joinMutation.isPending}
                          className="w-full"
                          data-testid="button-confirm-join-info"
                        >
                          {joinMutation.isPending ? "Joining..." : "Join"}
                        </Button>
                        <Button
                          onClick={() => {
                            setEnteringGiveawayId(null);
                            setTempUsername("");
                          }}
                          variant="secondary"
                          className="w-full"
                          data-testid="button-cancel-join-info"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          if (ga.status === "active" && ga.participants.includes(savedUsername)) {
                            leaveMutation.mutate(ga.id);
                          } else if (ga.status === "active") {
                            setEnteringGiveawayId(ga.id);
                          }
                        }}
                        variant={ga.status === "ended" ? "secondary" : ga.participants.includes(savedUsername) ? "destructive" : "default"}
                        className="w-full"
                        disabled={ga.status === "ended" || joinMutation.isPending || leaveMutation.isPending}
                        data-testid={`button-enter-giveaway-info-${ga.id}`}
                      >
                        {ga.status === "ended" ? "Ended" : ga.participants.includes(savedUsername) ? "Leave" : "Enter"}
                      </Button>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Announcements</h2>
            </div>
            <div className="grid gap-4">
              {announcements.length === 0 ? (
                <Card className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border text-muted-foreground text-center">
                  No announcements at the moment
                </Card>
              ) : (
                announcements.map((ann) => (
                  <Card key={ann.id} className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
                    <h3 className="text-xl font-bold mb-2">{ann.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">by {ann.user}</p>
                    <p className="text-muted-foreground">{ann.description}</p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
