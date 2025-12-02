import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import type { Notification } from "@shared/schema";

const notificationIcons: { [key: string]: string } = {
  giveaway_win: "🏆",
  giveaway_new: "🎁",
  announcement_new: "📢",
  gang_new: "👥",
  ticket_new: "🎫",
  shop_product_new: "🛍️",
  update: "📢",
};

export function Inbox() {
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      return res.json();
    },
    refetchInterval: 5000,
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gaming-red">Inbox</span>
          </h1>
          <p className="text-muted-foreground text-lg">Your notifications and updates</p>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="p-12 bg-gradient-to-br from-card via-card to-background border-card-border text-center">
              <p className="text-muted-foreground">No notifications yet</p>
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d transition-all ${
                  notif.read ? "" : "border-primary/50"
                }`}
                data-testid={`notification-${notif.id}`}
              >
                <div className="flex items-start justify-between gap-4 w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{notificationIcons[notif.type]}</span>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{notif.title}</h3>
                        {!notif.read && (
                          <Badge className="bg-primary/20 text-primary ml-2">New</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3 ml-11">{notif.description}</p>
                    <p className="text-xs text-muted-foreground ml-11">
                      {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
