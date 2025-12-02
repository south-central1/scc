import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamIcon, RocketIcon, HeadsetIcon } from "@/components/Icons";
import logoImage from "@assets/SCtext_1764515624143.png";
import gameImage from "@assets/logo.jpg";
import { getCountdownToFriday, formatCountdown } from "@/lib/api";

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [countdown, setCountdown] = useState(formatCountdown(getCountdownToFriday()));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(getCountdownToFriday()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gaming-red/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gaming-red/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="mb-8">
              <img
                src={logoImage}
                alt="South Central"
                className="h-24 sm:h-32 md:h-40 w-auto mx-auto object-contain drop-shadow-2xl"
                style={{
                  filter: "drop-shadow(0 0 30px rgba(200, 30, 30, 0.4))",
                }}
                data-testid="hero-logo"
              />
            </div>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
              The ultimate <span className="text-primary font-semibold">Roblox Hood</span> experience.
              Build your empire, make money, and dominate the streets.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="gap-2 bg-gaming-red hover:bg-gaming-darkRed shadow-glow-red"
                onClick={() => onNavigate("team")}
                data-testid="button-meet-team"
              >
                <TeamIcon className="w-5 h-5" />
                Meet The Team
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => onNavigate("progress")}
                data-testid="button-check-update"
              >
                <RocketIcon className="w-5 h-5" />
                Check Update
              </Button>
            </div>
          </div>

          <Card
            className="relative overflow-hidden rounded-2xl border-card-border shadow-3d animate-pop-in mx-auto max-w-4xl"
            style={{ animationDelay: "0.3s" }}
            data-testid="game-preview-card"
          >
            <div className="relative aspect-video">
              <img
                src={gameImage}
                alt="South Central Gameplay"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-400">Coming Soon</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {countdown}
                </h2>
                <p className="text-muted-foreground">
                  Friday 8PM - Get ready for the ultimate hood experience
                </p>
              </div>
            </div>
          </Card>

          <div
            className="grid sm:grid-cols-3 gap-6 mt-16 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            {[
              {
                icon: <TeamIcon className="w-8 h-8" />,
                title: "Meet The Team",
                description: "Get to know the creators and developers behind South Central",
                action: () => onNavigate("team"),
                testId: "card-team",
              },
              {
                icon: <RocketIcon className="w-8 h-8" />,
                title: "Next Update",
                description: "Check out the progress on our upcoming features and content",
                action: () => onNavigate("progress"),
                testId: "card-update",
              },
              {
                icon: <HeadsetIcon className="w-8 h-8" />,
                title: "Get Support",
                description: "Need help? Join our Discord or create a support ticket",
                action: () => onNavigate("discord"),
                testId: "card-support",
              },
            ].map((item, index) => (
              <Card
                key={item.title}
                className="group p-6 bg-gradient-to-br from-card to-background border-card-border shadow-3d hover:shadow-3d-hover transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={item.action}
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                data-testid={item.testId}
              >
                <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <img
            src={logoImage}
            alt="South Central"
            className="h-8 w-auto mx-auto mb-4 opacity-50"
          />
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} South Central. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            A Roblox Hood Game Experience
          </p>
        </div>
      </footer>
    </div>
  );
}
