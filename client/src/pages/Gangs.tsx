import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TeamIcon, CheckIcon } from "@/components/Icons";
import type { Gang } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export function Gangs() {
  const [selectedGang, setSelectedGang] = useState<Gang | null>(null);
  const [joinUsername, setJoinUsername] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [userGang, setUserGang] = useState<string | null>(null);
  const [userGangName, setUserGangName] = useState<string | null>(null);

  useEffect(() => {
    const gang = localStorage.getItem("user_gang");
    const gangName = localStorage.getItem("user_gang_name");
    setUserGang(gang);
    setUserGangName(gangName);
  }, []);

  const { data: gangs = [] } = useQuery<Gang[]>({
    queryKey: ["/api/gangs"],
    queryFn: async () => {
      const res = await fetch("/api/gangs");
      return res.json();
    },
    refetchInterval: 2000,
  });

  const joinMutation = useMutation({
    mutationFn: async (gangId: string) => {
      const res = await fetch(`/api/gangs/${gangId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: joinUsername, password: joinPassword }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to join gang");
      }
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("user_gang", data.id);
      localStorage.setItem("user_gang_name", data.name);
      setUserGang(data.id);
      setUserGangName(data.name);
      setJoinUsername("");
      setJoinPassword("");
      queryClient.invalidateQueries({ queryKey: ["/api/gangs"] });
    },
  });

  const leaveGangMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGang || !joinUsername) return;
      const member = selectedGang.members.find(m => m.username === joinUsername);
      if (!member) throw new Error("Not a member");
      const res = await fetch(`/api/gangs/${selectedGang.id}/members/${member.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to leave gang");
      return res.json();
    },
    onSuccess: () => {
      localStorage.removeItem("user_gang");
      localStorage.removeItem("user_gang_name");
      setUserGang(null);
      setUserGangName(null);
      setJoinUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/gangs"] });
    },
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6 animate-float">
            <TeamIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gaming-red" style={{ textShadow: "0 0 30px rgba(200, 30, 30, 0.5)" }}>
              Gangs
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">Join a gang or view gang information</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-foreground">Gangs</h2>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {gangs.length} Active
                </Badge>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {gangs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No gangs created yet</p>
                  </div>
                ) : (
                  gangs.map((gang) => {
                    const isMember = userGang === gang.id;
                    return (
                      <button
                        key={gang.id}
                        onClick={() => setSelectedGang(gang)}
                        className={`w-full p-3 rounded-lg text-left transition-all hover-elevate relative ${
                          selectedGang?.id === gang.id
                            ? "bg-primary/20 border border-primary/30"
                            : "bg-secondary/50"
                        }`}
                        data-testid={`button-gang-${gang.id}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: gang.color }} />
                            <span className="font-medium text-foreground">{gang.name}</span>
                          </div>
                          {isMember && <CheckIcon className="w-4 h-4 text-green-400" />}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Owner: {gang.ownerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Members: {gang.members.length}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          <div className="md:col-span-2">
            {selectedGang ? (
              <Card className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: selectedGang.color }} />
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedGang.name}</h2>
                      <p className="text-muted-foreground">Owner: {selectedGang.ownerName}</p>
                    </div>
                  </div>
                  {userGang === selectedGang.id && (
                    <Badge className="bg-green-500/20 text-green-400">Member</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Online Now</div>
                    <div className="text-3xl font-bold text-primary">
                      {selectedGang.members.filter(m => m.isOnline).length}
                    </div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Total Members</div>
                    <div className="text-3xl font-bold text-primary">
                      {selectedGang.members.length}
                    </div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Ranks</div>
                    <div className="text-3xl font-bold text-primary">
                      {selectedGang.ranks.length}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <h3 className="font-bold mb-4">Members ({selectedGang.members.length})</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedGang.members.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No members yet</p>
                    ) : (
                      selectedGang.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-foreground">{member.username}</div>
                            <div className="text-xs text-muted-foreground">Rank: {member.rank} • Joined: {new Date(member.joinedAt).toLocaleDateString()}</div>
                          </div>
                          <Badge variant="secondary" className={member.isOnline ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                            {member.isOnline ? "Online" : "Offline"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-3">
                  {userGang === selectedGang.id ? (
                    <div className="space-y-3">
                      <h3 className="font-bold text-green-400">You are a member of this gang!</h3>
                      <Button
                        onClick={() => leaveGangMutation.mutate()}
                        disabled={leaveGangMutation.isPending}
                        variant="destructive"
                        className="w-full"
                        data-testid="button-leave-gang"
                      >
                        Leave Gang
                      </Button>
                    </div>
                  ) : userGang ? (
                    <div className="space-y-3">
                      <h3 className="font-bold text-yellow-400">You are in {userGangName}</h3>
                      <p className="text-sm text-muted-foreground">Leave your current gang first to join another</p>
                      <Button disabled className="w-full">
                        Cannot Join (Already in a Gang)
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold">Join Gang</h3>
                      <Input
                        placeholder="Your username"
                        value={joinUsername}
                        onChange={(e) => setJoinUsername(e.target.value)}
                        data-testid="input-join-username"
                      />
                      <Input
                        placeholder="Gang password"
                        type="password"
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        data-testid="input-join-password"
                      />
                      <Button
                        onClick={() => joinMutation.mutate(selectedGang.id)}
                        disabled={!joinUsername || !joinPassword || joinMutation.isPending}
                        className="w-full"
                        data-testid="button-join-gang"
                      >
                        {joinMutation.isPending ? "Joining..." : "Join Gang"}
                      </Button>
                      {joinMutation.isError && (
                        <p className="text-sm text-red-400">{(joinMutation.error as Error)?.message}</p>
                      )}
                    </>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
                <div className="text-center text-muted-foreground">
                  <TeamIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Select a gang to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
