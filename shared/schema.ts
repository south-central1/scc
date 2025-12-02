import { z } from "zod";

export const ticketSchema = z.object({
  id: z.string(),
  ticketNumber: z.string(),
  subject: z.string().min(1),
  message: z.string().min(1),
  userId: z.string(),
  status: z.enum(["open", "claimed", "closed"]),
  claimedBy: z.string().optional(),
  createdAt: z.number(),
});

export const messageSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  content: z.string().min(1),
  sender: z.enum(["user", "staff"]),
  timestamp: z.number(),
});

export const insertTicketSchema = ticketSchema.omit({ id: true, ticketNumber: true, status: true, createdAt: true });
export const insertMessageSchema = messageSchema.omit({ id: true, timestamp: true });

export type Ticket = z.infer<typeof ticketSchema>;
export type Message = z.infer<typeof messageSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  category: "owner" | "coowner" | "highrank" | "developer";
  isHeadDeveloper?: boolean;
}

export interface UpdateStatus {
  percentage: number;
}

export const users = {
  id: "",
  username: "",
  password: "",
};

export type User = typeof users;
export type InsertUser = Omit<User, "id">;

export interface GangRank {
  id: string;
  name: string;
  gangId: string;
}

export interface GangMember {
  id: string;
  username: string;
  gangId: string;
  rank: string;
  joinedAt: number;
  isOnline: boolean;
}

export interface Gang {
  id: string;
  name: string;
  owner: string;
  ownerName: string;
  password: string;
  color: string;
  members: GangMember[];
  ranks: GangRank[];
  createdAt: number;
}

export interface InsertGang {
  name: string;
  owner: string;
  ownerName: string;
  password: string;
  color: string;
}

export interface JoinGangRequest {
  gangId: string;
  username: string;
  password: string;
}

export type SelectGang = Gang;

export interface Giveaway {
  id: string;
  price: number;
  duration: string;
  description: string;
  createdAt: number;
  endsAt: number;
  winnersCount: number;
  winners: string[];
  participants: string[];
  status: "active" | "ended";
}

export interface InsertGiveaway {
  price: number;
  duration: string;
  description: string;
  winnersCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  user: string;
  description: string;
  createdAt: number;
}

export interface InsertAnnouncement {
  title: string;
  user: string;
  description: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  link: string;
  price: number;
  category: "Turfs" | "Spawners" | "Cosmetics";
  createdAt: number;
}

export interface InsertShopProduct {
  name: string;
  link: string;
  price: number;
  category: "Turfs" | "Spawners" | "Cosmetics";
}

export interface Notification {
  id: string;
  type: "giveaway_win" | "giveaway_new" | "announcement" | "update";
  title: string;
  description: string;
  createdAt: number;
  read: boolean;
}

export interface InsertNotification {
  type: "giveaway_win" | "giveaway_new" | "announcement" | "update";
  title: string;
  description: string;
}

export interface User {
  id: string;
  userId: string; // 4-digit user ID
  isBlocked: boolean;
  createdAt: number;
}

export interface InsertUser {
  userId: string;
  isBlocked: boolean;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  createdBy: string;
}

export interface InsertNote {
  title: string;
  description: string;
  createdBy: string;
}
