import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon, CrownIcon, StarIcon, CodeIcon, UserIcon } from "./Icons";
import type { TeamMember } from "@shared/schema";

const teamData: TeamMember[] = [
  {
    name: "Abdz",
    role: "Creator & Head Developer",
    description: "The visionary behind South Central. Abdz leads the development team with innovative ideas and masterful coding skills, driving the game to new heights.",
    category: "owner",
    isHeadDeveloper: true,
  },
  {
    name: "Gabs",
    role: "Creator",
    description: "Co-founder of South Central who brings creative direction and strategic vision to the game, ensuring an immersive gaming experience for all players.",
    category: "owner",
  },
  {
    name: "Mirr",
    role: "Co-Owner",
    description: "A key pillar in South Central's leadership. Mirr oversees community management and game operations, keeping everything running smoothly.",
    category: "coowner",
  },
  {
    name: "Mr. Pain",
    role: "High Rank & Developer",
    description: "A talented developer and trusted high-ranking member. Mr. Pain contributes essential features and helps maintain order within the community.",
    category: "highrank",
  },
  {
    name: "Abdz",
    role: "Head Developer",
    description: "Leading all development efforts with expertise in game mechanics and scripting.",
    category: "developer",
    isHeadDeveloper: true,
  },
  {
    name: "Gabs",
    role: "Developer",
    description: "Brings creative solutions and innovative features to the codebase.",
    category: "developer",
  },
  {
    name: "Mr. Pain",
    role: "Developer",
    description: "Focuses on gameplay systems and user experience improvements.",
    category: "developer",
  },
  {
    name: "Mirr",
    role: "Developer",
    description: "Works on backend systems and game optimization.",
    category: "developer",
  },
];

const categories = [
  { id: "owner", label: "Owners", icon: <CrownIcon className="w-5 h-5" />, color: "text-yellow-400" },
  { id: "coowner", label: "Co-Owners", icon: <StarIcon className="w-5 h-5" />, color: "text-purple-400" },
  { id: "highrank", label: "High Ranks", icon: <UserIcon className="w-5 h-5" />, color: "text-blue-400" },
  { id: "developer", label: "Developers", icon: <CodeIcon className="w-5 h-5" />, color: "text-green-400" },
];

function TeamMemberCard({ member, index }: { member: TeamMember; index: number }) {
  return (
    <Card
      className="group p-4 bg-gradient-to-br from-card to-background border-card-border shadow-3d hover:shadow-3d-hover transition-all duration-300 transform hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.1}s` }}
      data-testid={`team-member-${member.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30">
            <span className="text-2xl font-bold text-primary">{member.name[0]}</span>
          </div>
          {member.isHeadDeveloper && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <CrownIcon className="w-3 h-3 text-yellow-900" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-foreground">{member.name}</h3>
            {member.isHeadDeveloper && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Head Developer
              </Badge>
            )}
          </div>
          <p className="text-sm text-primary font-medium mt-0.5">{member.role}</p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{member.description}</p>
        </div>
      </div>
    </Card>
  );
}

function CategorySection({
  category,
  members,
  isExpanded,
  onToggle,
  index,
}: {
  category: (typeof categories)[0];
  members: TeamMember[];
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-card rounded-lg border border-card-border hover-elevate transition-all group"
        data-testid={`toggle-${category.id}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md bg-secondary ${category.color}`}>
            {category.icon}
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-lg text-foreground">{category.label}</h2>
            <p className="text-sm text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "mt-4 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {members.map((member, idx) => (
            <TeamMemberCard key={`${member.name}-${idx}`} member={member} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TeamSection() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gaming-red" style={{ textShadow: "0 0 30px rgba(200, 30, 30, 0.5)" }}>
              Meet The
            </span>{" "}
            <span className="text-foreground">Team</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The talented individuals behind South Central who work tirelessly to bring you the best Roblox Hood experience.
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((category, index) => {
            const members = teamData.filter((m) => m.category === category.id);
            if (members.length === 0) return null;
            return (
              <CategorySection
                key={category.id}
                category={category}
                members={members}
                isExpanded={expandedCategories.includes(category.id)}
                onToggle={() => toggleCategory(category.id)}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
