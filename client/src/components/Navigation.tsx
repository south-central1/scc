import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, TeamIcon, RocketIcon, HeadsetIcon, ShieldIcon, MenuIcon, CloseIcon } from "./Icons";
import logoImage from "@assets/SCtext_1764515624143.png";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isStaffAuthenticated: boolean;
  userId?: string;
  onLogout?: () => void;
  discordUsername?: string;
}

interface DropdownItem {
  id: string;
  label: string;
  icon: JSX.Element;
  description: string;
}

const menuItems: { [key: string]: DropdownItem[] } = {
  main: [
    { id: "team", label: "The Team", icon: <TeamIcon className="w-5 h-5" />, description: "Meet our amazing team" },
    { id: "gangs", label: "Gangs", icon: <ShieldIcon className="w-5 h-5" />, description: "View and join gangs" },
  ],
  update: [
    { id: "progress", label: "Update Progress", icon: <RocketIcon className="w-5 h-5" />, description: "Check development status" },
  ],
  support: [
    { id: "discord", label: "Discord Support", icon: <HeadsetIcon className="w-5 h-5" />, description: "Join our Discord server" },
    { id: "ticket", label: "Create Ticket", icon: <TeamIcon className="w-5 h-5" />, description: "Get personalized help" },
  ],
};

function DropdownMenu({
  label,
  items,
  isOpen,
  onToggle,
  onItemClick,
}: {
  label: string;
  items: DropdownItem[];
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: (id: string) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors rounded-md hover-elevate"
        data-testid={`dropdown-${label.toLowerCase().replace(" ", "-")}`}
      >
        {label}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-card-border rounded-lg shadow-3d overflow-hidden animate-pop-in z-50">
          <div className="p-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className="w-full flex items-start gap-3 p-3 rounded-md hover-elevate transition-all text-left group"
                data-testid={`menu-item-${item.id}`}
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {item.icon}
                </div>
                <div>
                  <div className="font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navigation({ activeTab, onTabChange, isStaffAuthenticated, userId, onLogout, discordUsername }: NavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userGang, setUserGang] = useState<string | null>(null);

  useEffect(() => {
    const gang = localStorage.getItem("user_gang");
    setUserGang(gang);
  }, []);

  const handleItemClick = (id: string) => {
    onTabChange(id);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img
              src={logoImage}
              alt="South Central"
              className="h-10 w-auto object-contain"
              data-testid="logo-image"
            />
          </div>

          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange("home")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-2 ${
                activeTab === "home"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/90 hover:text-foreground hover-elevate"
              }`}
              data-testid="nav-main"
            >
              Main
              {userId && <span className="text-xs text-primary font-bold">ID: {userId}</span>}
            </button>
            <button
              onClick={() => onTabChange("gangs")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                activeTab === "gangs"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/90 hover:text-foreground hover-elevate"
              }`}
              data-testid="nav-gangs"
            >
              Gangs
            </button>
            <button
              onClick={() => onTabChange("info")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                activeTab === "info"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/90 hover:text-foreground hover-elevate"
              }`}
              data-testid="nav-info"
            >
              Info
            </button>
            <button
              onClick={() => onTabChange("shop")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                activeTab === "shop"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/90 hover:text-foreground hover-elevate"
              }`}
              data-testid="nav-shop"
            >
              Shop
            </button>
            <DropdownMenu
              label="Next Update"
              items={menuItems.update}
              isOpen={openDropdown === "update"}
              onToggle={() => setOpenDropdown(openDropdown === "update" ? null : "update")}
              onItemClick={handleItemClick}
            />
            <DropdownMenu
              label="Support"
              items={menuItems.support}
              isOpen={openDropdown === "support"}
              onToggle={() => setOpenDropdown(openDropdown === "support" ? null : "support")}
              onItemClick={handleItemClick}
            />
            <button
              onClick={() => onTabChange("inbox")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                activeTab === "inbox"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/90 hover:text-foreground hover-elevate"
              }`}
              data-testid="nav-inbox"
            >
              Inbox
            </button>
            {userGang && (
              <button
                onClick={() => onTabChange("my-gang")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  activeTab === "my-gang"
                    ? "text-primary bg-primary/10"
                    : "text-foreground/90 hover:text-foreground hover-elevate"
                }`}
                data-testid="nav-my-gang"
              >
                <TeamIcon className="w-4 h-4" />
                My Gang
              </button>
            )}
            {isStaffAuthenticated && (
              <button
                onClick={() => onTabChange("staff")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  activeTab === "staff"
                    ? "text-primary bg-primary/10"
                    : "text-foreground/90 hover:text-foreground hover-elevate"
                }`}
                data-testid="nav-staff"
              >
                <ShieldIcon className="w-4 h-4" />
                Staff
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {discordUsername && (
              <>
                <span className="hidden md:block text-sm text-muted-foreground">
                  {discordUsername}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="hidden md:flex"
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover-elevate"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {discordUsername && (
              <div className="pb-3 border-b border-border mb-3">
                <div className="text-sm text-muted-foreground mb-2">Logged in as: {discordUsername}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="w-full"
                  data-testid="button-mobile-logout"
                >
                  Logout
                </Button>
              </div>
            )}
            <button
              onClick={() => {
                onTabChange("home");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-md hover-elevate ${
                activeTab === "home" ? "bg-primary/10 text-primary" : ""
              }`}
              data-testid="mobile-menu-item-main"
            >
              <span className="font-medium">Main</span>
            </button>
            <button
              onClick={() => {
                onTabChange("gangs");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-md hover-elevate ${
                activeTab === "gangs" ? "bg-primary/10 text-primary" : ""
              }`}
              data-testid="mobile-menu-item-gangs"
            >
              <span className="font-medium">Gangs</span>
            </button>
            <button
              onClick={() => {
                onTabChange("info");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-md hover-elevate ${
                activeTab === "info" ? "bg-primary/10 text-primary" : ""
              }`}
              data-testid="mobile-menu-item-info"
            >
              <span className="font-medium">Info</span>
            </button>
            <button
              onClick={() => {
                onTabChange("shop");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-md hover-elevate ${
                activeTab === "shop" ? "bg-primary/10 text-primary" : ""
              }`}
              data-testid="mobile-menu-item-shop"
            >
              <span className="font-medium">Shop</span>
            </button>
            <button
              onClick={() => {
                onTabChange("inbox");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-md hover-elevate ${
                activeTab === "inbox" ? "bg-primary/10 text-primary" : ""
              }`}
              data-testid="mobile-menu-item-inbox"
            >
              <span className="font-medium">Inbox</span>
            </button>
            {Object.entries(menuItems).map(([key, items]) => {
              if (key === "main") return null;
              return (
                <div key={key} className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                    {key === "update" ? "Next Update" : "Support"}
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover-elevate"
                      data-testid={`mobile-menu-item-${item.id}`}
                    >
                      <div className="p-2 rounded-md bg-primary/10 text-primary">{item.icon}</div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              );
            })}

          </div>
        </div>
      )}
    </nav>
  );
}