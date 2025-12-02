import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";
import type { Giveaway } from "@shared/schema";
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

export function Giveaways() {
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);
  const [discordUsername, setDiscordUsername] = useState("");
  const [enteringGiveawayId, setEnteringGiveawayId] = useState<string | null>(null);
  const [savedUsername, setSavedUsername] = useState("");

  // Get saved username from localStorage on mount
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
    refetchInterval: 2000,
  });

  const joinMutation = useMutation({
    mutationFn: async (giveawayId: string) => {
      const username = discordUsername || savedUsername;
      if (!username) throw new Error("Username required");
      const res = await fetch(`/api/giveaways/${giveawayId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new Error("Failed to join");
      localStorage.setItem("discord_username", username);
      return res.json();
    },
    onSuccess: () => {
      setDiscordUsername("");
      setEnteringGiveawayId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/giveaways"] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async (giveawayId: string) => {
      const username = savedUsername;
      if (!username) throw new Error("Username required");
      const res = await fetch(`/api/giveaways/${giveawayId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gaming-red">Giveaways</span>
          </h1>
          <p className="text-muted-foreground text-lg">Join active giveaways and win amazing prizes</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d h-full">
              <h2 className="font-bold text-lg mb-4">Active Giveaways</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {giveaways.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No active giveaways</p>
                ) : (
                  giveaways.map((ga) => (
                    <div key={ga.id} className="space-y-2">
                      <button
                        onClick={() => setSelectedGiveaway(ga)}
                        className={`w-full p-3 rounded-lg text-left transition-all hover-elevate ${
                          selectedGiveaway?.id === ga.id ? "bg-primary/20 border border-primary/30" : "bg-secondary/50"
                        }`}
                        data-testid={`button-giveaway-${ga.id}`}
                      >
                        <div className="font-medium text-foreground">{ga.price}</div>
                        <div className="text-xs text-muted-foreground">{ga.participants.length} joined</div>
                        <div className="text-xs text-primary font-medium">{formatTimeRemaining(ga.endsAt)}</div>
                      </button>
                      <Button
                        onClick={() => {
                          if (ga.status === "active" && ga.participants.includes(savedUsername)) {
                            leaveMutation.mutate(ga.id);
                          } else if (ga.status === "active") {
                            setEnteringGiveawayId(ga.id);
                          }
                        }}
                        variant={ga.status === "ended" ? "secondary" : ga.participants.includes(savedUsername) ? "destructive" : "default"}
                        size="sm"
                        className="w-full"
                        disabled={ga.status === "ended" || leaveMutation.isPending || joinMutation.isPending}
                        data-testid={`button-enter-giveaway-${ga.id}`}
                      >
                        {ga.status === "ended" ? "Ended" : ga.participants.includes(savedUsername) ? "Leave" : "Enter"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="md:col-span-2">
            {selectedGiveaway ? (
              <Card className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">{selectedGiveaway.price}</h2>
                    <p className="text-muted-foreground">Prize</p>
                  </div>
                  <Badge className={selectedGiveaway.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                    {selectedGiveaway.status === "active" ? "Active" : "Ended"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Participants</div>
                    <div className="text-2xl font-bold text-primary">{selectedGiveaway.participants.length}</div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Winners</div>
                    <div className="text-2xl font-bold text-primary">{selectedGiveaway.winnersCount}</div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Ends In</div>
                    <div className="text-lg font-bold text-primary">{formatTimeRemaining(selectedGiveaway.endsAt)}</div>
                  </div>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <h3 className="font-bold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedGiveaway.description}</p>
                </div>

                {selectedGiveaway.status === "ended" && selectedGiveaway.winners.length > 0 && (
                  <div className="border-t border-border pt-6 mb-6">
                    <h3 className="font-bold mb-2">Giveaway Winners</h3>
                    <div className="space-y-2">
                      {selectedGiveaway.winners.map((winner, i) => (
                        <div key={i} className="text-sm font-medium">Giveaway Winner: {winner}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-6 space-y-3">
                  {enteringGiveawayId === selectedGiveaway.id && selectedGiveaway.status === "active" ? (
                    <>
                      <h3 className="font-bold">Enter Discord Username</h3>
                      <Input
                        placeholder="Your Discord Username"
                        value={discordUsername}
                        onChange={(e) => setDiscordUsername(e.target.value)}
                        data-testid="input-discord-username"
                      />
                      <Button
                        onClick={() => {
                          if (discordUsername) {
                            localStorage.setItem("discord_username", discordUsername);
                            setSavedUsername(discordUsername);
                            joinMutation.mutate(selectedGiveaway.id);
                          }
                        }}
                        disabled={!discordUsername || joinMutation.isPending}
                        className="w-full"
                        data-testid="button-join-giveaway"
                      >
                        {joinMutation.isPending ? "Joining..." : "Enter"}
                      </Button>
                      <Button
                        onClick={() => {
                          setEnteringGiveawayId(null);
                          setDiscordUsername("");
                        }}
                        variant="secondary"
                        className="w-full"
                        data-testid="button-cancel-enter"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : null}
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
                <p className="text-muted-foreground">Select a giveaway to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
