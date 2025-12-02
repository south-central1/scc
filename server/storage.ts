import { randomUUID } from "crypto";
import type { Ticket, Message, InsertTicket, InsertMessage, Gang, InsertGang, GangMember, GangRank, Giveaway, InsertGiveaway, Announcement, InsertAnnouncement, ShopProduct, InsertShopProduct, Notification, InsertNotification, User, InsertUser, Note, InsertNote } from "@shared/schema";

export interface IStorage {
  getTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
  
  getMessages(ticketId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  getGangs(): Promise<Gang[]>;
  getGang(id: string): Promise<Gang | undefined>;
  createGang(gang: InsertGang): Promise<Gang>;
  updateGang(id: string, updates: Partial<Gang>): Promise<Gang | undefined>;
  deleteGang(id: string): Promise<boolean>;
  addGangMember(gangId: string, member: GangMember): Promise<Gang | undefined>;
  removeGangMember(gangId: string, memberId: string): Promise<Gang | undefined>;

  getGiveaways(): Promise<Giveaway[]>;
  getGiveaway(id: string): Promise<Giveaway | undefined>;
  createGiveaway(giveaway: InsertGiveaway): Promise<Giveaway>;
  deleteGiveaway(id: string): Promise<boolean>;
  joinGiveaway(id: string, username: string): Promise<Giveaway | undefined>;
  leaveGiveaway(id: string, username: string): Promise<Giveaway | undefined>;
  endGiveaway(id: string): Promise<Giveaway | undefined>;

  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<boolean>;

  getShopProducts(): Promise<ShopProduct[]>;
  createShopProduct(product: InsertShopProduct): Promise<ShopProduct>;
  updateShopProduct(id: string, updates: Partial<ShopProduct>): Promise<ShopProduct | undefined>;
  deleteShopProduct(id: string): Promise<boolean>;

  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification | undefined>;

  getUsers(): Promise<User[]>;
  getUserByUserId(userId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  blockUser(id: string): Promise<User | undefined>;
  unblockUser(id: string): Promise<User | undefined>;

  getNotes(): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: string): Promise<boolean>;

  getAiEnabled(): Promise<boolean>;
  setAiEnabled(enabled: boolean): Promise<void>;
  generateResponse(userMessage: string): Promise<string>;

  clear(): Promise<void>;
}

export class MemStorage implements IStorage {
  private tickets: Map<string, Ticket>;
  private messages: Map<string, Message>;
  private gangs: Map<string, Gang>;
  private giveaways: Map<string, Giveaway>;
  private announcements: Map<string, Announcement>;
  private shopProducts: Map<string, ShopProduct>;
  private notifications: Map<string, Notification>;
  private users: Map<string, User>;
  private notes: Map<string, Note>;
  private aiEnabled: boolean = true;

  constructor() {
    this.tickets = new Map();
    this.messages = new Map();
    this.gangs = new Map();
    this.giveaways = new Map();
    this.announcements = new Map();
    this.shopProducts = new Map();
    this.notifications = new Map();
    this.users = new Map();
    this.notes = new Map();
  }

  private generateAIResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Check for common questions and generate responses
    if (message.includes("help") || message.includes("how")) {
      return "Thanks for reaching out! We're here to help. Could you provide more details about what you need assistance with? Our team reviews all tickets and will get back to you shortly.";
    }
    if (message.includes("bug") || message.includes("error") || message.includes("crash")) {
      return "Sorry to hear you're experiencing issues! Please describe: 1) What were you doing when it happened? 2) What error did you see? 3) What device/platform? This helps us fix it faster. Our team will investigate.";
    }
    if (message.includes("price") || message.includes("cost") || message.includes("robux")) {
      return "Thanks for your interest! For pricing and product details, check our Shop section or wait for a staff member to respond with more info. We appreciate your support!";
    }
    if (message.includes("account") || message.includes("login") || message.includes("password")) {
      return "Account security is important. For account issues, a staff member will review this shortly. Please don't share sensitive info here. We're on it!";
    }
    if (message.includes("ban") || message.includes("suspended") || message.includes("kicked")) {
      return "We understand this is frustrating. A staff member will review your case and get back to you with details about your account status. Thanks for your patience.";
    }
    if (message.includes("suggest") || message.includes("idea") || message.includes("feature")) {
      return "Love your enthusiasm! Feature suggestions are valuable. A staff member will check this out. We're always looking to improve the game!";
    }
    if (message.includes("join") || message.includes("gang") || message.includes("team")) {
      return "Interested in joining? Check out our Gangs section to find one that fits you! A staff member is here if you have more questions. Good luck!";
    }
    if (message.includes("event") || message.includes("giveaway") || message.includes("contest")) {
      return "Awesome! Check the Home section for active giveaways and events. A staff member can give you more details if needed. Don't miss out!";
    }
    if (message.includes("thanks") || message.includes("thank you")) {
      return "You're welcome! We appreciate your support and feedback. Let us know if there's anything else we can help with!";
    }
    
    // Default response for anything else
    return "Thanks for your message! We've received your ticket and a staff member will review it shortly. We appreciate your patience and will get back to you as soon as possible!";
  }

  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticketNumber = `${Math.floor(10000 + Math.random() * 90000)}`;
    const ticket: Ticket = {
      ...insertTicket,
      id,
      ticketNumber,
      status: "open",
      createdAt: Date.now(),
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    const updated = { ...ticket, ...updates };
    this.tickets.set(id, updated);
    return updated;
  }

  async deleteTicket(id: string): Promise<boolean> {
    return this.tickets.delete(id);
  }

  async getMessages(ticketId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.ticketId === ticketId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: Date.now(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getGangs(): Promise<Gang[]> {
    return Array.from(this.gangs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getGang(id: string): Promise<Gang | undefined> {
    return this.gangs.get(id);
  }

  async createGang(insertGang: InsertGang): Promise<Gang> {
    const id = randomUUID();
    const gang: Gang = {
      ...insertGang,
      id,
      members: [],
      ranks: [
        { id: randomUUID(), name: "Member", gangId: id },
        { id: randomUUID(), name: "Officer", gangId: id },
      ],
      createdAt: Date.now(),
    };
    this.gangs.set(id, gang);
    return gang;
  }

  async updateGang(id: string, updates: Partial<Gang>): Promise<Gang | undefined> {
    const gang = this.gangs.get(id);
    if (!gang) return undefined;
    const updated = { ...gang, ...updates };
    this.gangs.set(id, updated);
    return updated;
  }

  async deleteGang(id: string): Promise<boolean> {
    return this.gangs.delete(id);
  }

  async addGangMember(gangId: string, member: GangMember): Promise<Gang | undefined> {
    const gang = this.gangs.get(gangId);
    if (!gang) return undefined;
    gang.members.push(member);
    this.gangs.set(gangId, gang);
    return gang;
  }

  async removeGangMember(gangId: string, memberId: string): Promise<Gang | undefined> {
    const gang = this.gangs.get(gangId);
    if (!gang) return undefined;
    gang.members = gang.members.filter(m => m.id !== memberId);
    this.gangs.set(gangId, gang);
    return gang;
  }

  async getGiveaways(): Promise<Giveaway[]> {
    return Array.from(this.giveaways.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getGiveaway(id: string): Promise<Giveaway | undefined> {
    return this.giveaways.get(id);
  }

  async createGiveaway(insert: InsertGiveaway): Promise<Giveaway> {
    const id = randomUUID();
    const durationMs = this.parseDuration(insert.duration);
    const giveaway: Giveaway = {
      ...insert,
      id,
      createdAt: Date.now(),
      endsAt: Date.now() + durationMs,
      winners: [],
      participants: [],
      status: "active",
    };
    this.giveaways.set(id, giveaway);
    return giveaway;
  }

  async deleteGiveaway(id: string): Promise<boolean> {
    return this.giveaways.delete(id);
  }

  async joinGiveaway(id: string, username: string): Promise<Giveaway | undefined> {
    const giveaway = this.giveaways.get(id);
    if (!giveaway) return undefined;
    if (!giveaway.participants.includes(username)) {
      giveaway.participants.push(username);
    }
    this.giveaways.set(id, giveaway);
    return giveaway;
  }

  async leaveGiveaway(id: string, username: string): Promise<Giveaway | undefined> {
    const giveaway = this.giveaways.get(id);
    if (!giveaway) return undefined;
    giveaway.participants = giveaway.participants.filter((p) => p !== username);
    this.giveaways.set(id, giveaway);
    return giveaway;
  }

  async endGiveaway(id: string): Promise<Giveaway | undefined> {
    const giveaway = this.giveaways.get(id);
    if (!giveaway) return undefined;
    giveaway.status = "ended";
    const winnersCount = Math.min(giveaway.winnersCount, giveaway.participants.length);
    const winners: string[] = [];
    for (let i = 0; i < winnersCount; i++) {
      const randomIndex = Math.floor(Math.random() * giveaway.participants.length);
      winners.push(giveaway.participants[randomIndex]);
    }
    giveaway.winners = winners;
    this.giveaways.set(id, giveaway);
    return giveaway;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async createAnnouncement(insert: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const announcement: Announcement = {
      ...insert,
      id,
      createdAt: Date.now(),
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.announcements.delete(id);
  }

  async getShopProducts(): Promise<ShopProduct[]> {
    return Array.from(this.shopProducts.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async createShopProduct(insert: InsertShopProduct): Promise<ShopProduct> {
    const id = randomUUID();
    const product: ShopProduct = {
      ...insert,
      id,
      createdAt: Date.now(),
    };
    this.shopProducts.set(id, product);
    return product;
  }

  async updateShopProduct(id: string, updates: Partial<ShopProduct>): Promise<ShopProduct | undefined> {
    const product = this.shopProducts.get(id);
    if (!product) return undefined;
    const updated = { ...product, ...updates };
    this.shopProducts.set(id, updated);
    return updated;
  }

  async deleteShopProduct(id: string): Promise<boolean> {
    return this.shopProducts.delete(id);
  }

  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async createNotification(insert: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insert,
      id,
      createdAt: Date.now(),
      read: false,
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const notif = this.notifications.get(id);
    if (!notif) return undefined;
    notif.read = true;
    this.notifications.set(id, notif);
    return notif;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getUserByUserId(userId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.userId === userId);
  }

  async createUser(insert: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insert,
      id,
      createdAt: Date.now(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async blockUser(id: string): Promise<User | undefined> {
    return this.updateUser(id, { isBlocked: true });
  }

  async unblockUser(id: string): Promise<User | undefined> {
    return this.updateUser(id, { isBlocked: false });
  }

  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async createNote(insert: InsertNote): Promise<Note> {
    const id = randomUUID();
    const note: Note = {
      ...insert,
      id,
      createdAt: Date.now(),
    };
    this.notes.set(id, note);
    return note;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }

  async getAiEnabled(): Promise<boolean> {
    return this.aiEnabled;
  }

  async setAiEnabled(enabled: boolean): Promise<void> {
    this.aiEnabled = enabled;
  }

  async generateResponse(userMessage: string): Promise<string> {
    return this.generateAIResponse(userMessage);
  }

  async clear(): Promise<void> {
    this.tickets.clear();
    this.messages.clear();
    this.gangs.clear();
    this.giveaways.clear();
    this.announcements.clear();
    this.shopProducts.clear();
    this.notifications.clear();
    this.users.clear();
    this.notes.clear();
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([mhdw])$/);
    if (!match) return 60000;
    const value = parseInt(match[1]);
    const unit = match[2];
    const units: { [key: string]: number } = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
    };
    return value * (units[unit] || 60000);
  }
}

export const storage = new MemStorage();
