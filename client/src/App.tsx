import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { TeamSection } from "@/components/TeamSection";
import { UpdateProgress } from "@/components/UpdateProgress";
import { SupportSection } from "@/components/SupportSection";
import { StaffPanel } from "@/components/StaffPanel";
import { BlockedScreen } from "@/components/BlockedScreen";
import { Home } from "@/pages/Home";
import { Gangs } from "@/pages/Gangs";
import { Giveaways } from "@/pages/Giveaways";
import { Info } from "@/pages/Info";
import { Shop } from "@/pages/Shop";
import { Inbox } from "@/pages/Inbox";
import { isStaffAuthenticated } from "@/lib/api";
import type { User } from "@shared/schema";

function generateUserId(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Discord OAuth Configuration
const CLIENT_ID = '1444715289072635934';
// Using window.location.origin ensures it always matches your current Replit URL
const REDIRECT_URI = window.location.origin + '/';
const SCOPES = 'identify guilds.join guilds.members.read';
const DISCORD_AUTH_URL = `https://discord.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
const USER_STORAGE_KEY = 'discordUser';
const DISCORD_TOKEN_KEY = 'discordToken';
const STAFF_STATUS_KEY = 'isStaff';

import { DiscordLogin } from "@/components/DiscordLogin";

function AppContent() {
  const [activeTab, setActiveTab] = useState("home");
  const [staffAuth, setStaffAuth] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [discordUser, setDiscordUser] = useState<string | null>(null);

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    refetchInterval: 500,
    enabled: !!discordUser, // Only fetch when Discord authenticated
  });

  const currentUser = users.find((u: User) => u.userId === userId);
  const isBlocked = currentUser?.isBlocked ?? false;

  useEffect(() => {
    // Check for existing Discord authentication in localStorage
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedToken = localStorage.getItem(DISCORD_TOKEN_KEY);
    const storedStaffStatus = localStorage.getItem(STAFF_STATUS_KEY);
    const storedDiscordId = localStorage.getItem('discordId');

    if (storedUser && storedToken) {
      // User already authenticated - restore session
      setDiscordUser(storedUser);
      setStaffAuth(storedStaffStatus === 'true');
      setUserId(storedUser); // Set userId immediately on restore

      // Verify staff status with server
      if (storedDiscordId) {
        fetch('/api/verify-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: storedDiscordId })
        })
          .then(res => res.json())
          .then(data => {
            if (data.isStaff !== (storedStaffStatus === 'true')) {
              // Staff status changed - update localStorage and state
              localStorage.setItem(STAFF_STATUS_KEY, String(data.isStaff));
              setStaffAuth(data.isStaff);
              
              // If staff access was removed, redirect to home
              if (!data.isStaff && staffAuth) {
                setActiveTab('home');
              }
            }
          })
          .catch(err => console.error('Failed to verify staff status:', err));
      }
    }
  }, []);

  // Periodic staff status check (every 30 seconds)
  useEffect(() => {
    if (!discordUser) return;

    const storedDiscordId = localStorage.getItem('discordId');
    if (!storedDiscordId) return;

    const checkStaffStatus = () => {
      fetch('/api/verify-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: storedDiscordId })
      })
        .then(res => res.json())
        .then(data => {
          const currentStaffStatus = localStorage.getItem(STAFF_STATUS_KEY) === 'true';
          
          if (data.isStaff !== currentStaffStatus) {
            // Staff status changed - update localStorage and state
            localStorage.setItem(STAFF_STATUS_KEY, String(data.isStaff));
            setStaffAuth(data.isStaff);
            
            // If staff access was removed, redirect to home
            if (!data.isStaff && activeTab === 'staff') {
              setActiveTab('home');
            }
          }
        })
        .catch(err => console.error('Failed to verify staff status:', err));
    };

    // Check immediately and then every 30 seconds
    checkStaffStatus();
    const interval = setInterval(checkStaffStatus, 30000);

    return () => clearInterval(interval);
  }, [discordUser, activeTab]);

  useEffect(() => {
    if (discordUser) {
      // Use Discord username as userId - this ensures all tickets and data are tied to Discord username
      setUserId(discordUser);
      
      // Register user immediately with Discord username
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: discordUser, isBlocked: false }),
      }).catch(err => console.error("Failed to register user", err));
    }
  }, [discordUser]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDiscordLogout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(DISCORD_TOKEN_KEY);
    localStorage.removeItem(STAFF_STATUS_KEY);
    setDiscordUser(null);
    setUserId("");
    setStaffAuth(false);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home onNavigate={handleTabChange} />;
      case "team":
        return <TeamSection />;
      case "progress":
        return <UpdateProgress />;
      case "gangs":
        return <Gangs />;
      case "giveaways":
        return <Giveaways />;
      case "info":
        return <Info />;
      case "shop":
        return <Shop />;
      case "inbox":
        return <Inbox />;
      case "discord":
        return <SupportSection mode="discord" onModeChange={() => setActiveTab("ticket")} userId={discordUser || userId} isStaff={staffAuth} />;
      case "ticket":
        return <SupportSection mode="ticket" onModeChange={() => setActiveTab("discord")} userId={discordUser || userId} isStaff={staffAuth} />;
      case "my-gang":
        return <Gangs />;
      case "staff":
        return staffAuth ? <StaffPanel /> : <Home onNavigate={handleTabChange} />;
      default:
        return <Home onNavigate={handleTabChange} />;
    }
  };

  // Show Discord login if not authenticated
  if (!discordUser) {
    return <DiscordLogin />;
  }

  if (isBlocked && userId) {
    return (
      <BlockedScreen userId={userId} />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {discordUser && (
        <div className="text-xs text-muted-foreground text-center py-1 bg-secondary/50">
          Logged in as: <span className="font-semibold text-primary">{discordUser}</span> {staffAuth && <span className="text-green-500 font-semibold">• Staff Access</span>}
        </div>
      )}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isStaffAuthenticated={staffAuth}
        userId={userId}
        onLogout={handleDiscordLogout}
        discordUsername={discordUser || undefined}
      />
      <main>{renderContent()}</main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
