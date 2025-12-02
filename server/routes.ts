
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTicketSchema, insertMessageSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { DISCORD_CONFIG } from "./config";
import { isStaffUser } from "./staffUserIds";
import {
  sendGangCreatedWebhook,
  sendTicketCreatedWebhook,
  sendUserLoginWebhook,
  sendUserBlockedWebhook,
} from "./webhooks";

async function exchangeDiscordCode(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.CLIENT_ID,
    client_secret: DISCORD_CONFIG.CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
  });

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return await response.json();
}

async function getDiscordUser(accessToken: string) {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await response.json();
}

async function getGuildMember(accessToken: string, userId: string) {
  try {
    const response = await fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_CONFIG.GUILD_ID}/member`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTicketSchema, insertMessageSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/discord/auth", async (req, res) => {
    try {
      const { code, redirectUri } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Authorization code is required" });
      }

      // Exchange code for access token
      const tokenData = await exchangeDiscordCode(code, redirectUri);
      
      if (tokenData.error) {
        return res.status(400).json({ error: `Discord OAuth error: ${tokenData.error_description || tokenData.error}` });
      }

      const accessToken = tokenData.access_token;

      // Get user info
      const user = await getDiscordUser(accessToken);
      
      if (!user.id) {
        return res.status(400).json({ error: "Failed to get Discord user information" });
      }

      // Use Discord username (with discriminator if available, or global_name/username)
      const username = user.discriminator && user.discriminator !== '0' 
        ? `${user.username}#${user.discriminator}`
        : (user.global_name || user.username);

      // Check if user is in the guild
      const member = await getGuildMember(accessToken, user.id);
      
      if (!member) {
        return res.status(403).json({ 
          error: "You must be a member of the South Central Discord server to access this site. Join at: discord.gg/south-central" 
        });
      }

      // Check if user is in staff UserIDs list
      const hasStaffAccess = isStaffUser(user.id);

      // Send webhook notification for user login
      await sendUserLoginWebhook({
        username,
        userId: user.id,
        isStaff: hasStaffAccess,
      });

      res.json({
        username,
        token: accessToken,
        isStaff: hasStaffAccess,
        userId: user.id,
        discordId: user.id,
      });
    } catch (error) {
      console.error("Discord auth error:", error);
      res.status(500).json({ error: "Failed to authenticate with Discord" });
    }
  });
  
  // Endpoint to verify current staff status
  app.post("/api/verify-staff", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const isStaff = isStaffUser(userId);
      res.json({ isStaff });
    } catch (error) {
      console.error("Staff verification error:", error);
      res.status(500).json({ error: "Failed to verify staff status" });
    }
  });

  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const parsed = insertTicketSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const ticket = await storage.createTicket(parsed.data);
      
      // Auto-send supporter message when ticket is created
      await storage.createMessage({
        ticketId: ticket.id,
        content: "A supporter is coming to you in a short amount of time!",
        sender: "staff",
      });
      
      await storage.createNotification({
        title: `New Ticket: ${ticket.subject}`,
        description: ticket.message.substring(0, 100),
        type: "ticket_new",
        read: false,
      });

      // Send webhook notification for new ticket
      await sendTicketCreatedWebhook({
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        message: ticket.message,
        userId: ticket.userId,
      });
      
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.updateTicket(req.params.id, req.body);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const success = await storage.deleteTicket(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ticket" });
    }
  });

  app.get("/api/tickets/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/tickets/:id/messages", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      const parsed = insertMessageSchema.safeParse({
        ...req.body,
        ticketId: req.params.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const message = await storage.createMessage(parsed.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.post("/api/auth/admin", (req, res) => {
    const { password } = req.body;
    if (password === "abdzgoat0") {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid password" });
    }
  });

  app.get("/api/gangs", async (req, res) => {
    try {
      const gangs = await storage.getGangs();
      res.json(gangs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gangs" });
    }
  });

  app.get("/api/gangs/:id", async (req, res) => {
    try {
      const gang = await storage.getGang(req.params.id);
      if (!gang) return res.status(404).json({ error: "Gang not found" });
      res.json(gang);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gang" });
    }
  });

  app.post("/api/gangs", async (req, res) => {
    try {
      const { name, owner, ownerName, password, color } = req.body;
      if (!name || !owner || !ownerName || !password || !color) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const gang = await storage.createGang({ name, owner, ownerName, password, color });
      await storage.createNotification({
        title: `New Gang Created: ${name}`,
        description: `Gang created by ${ownerName}. Owner: ${owner}`,
        type: "gang_new",
        read: false,
      });

      // Send webhook notification for new gang
      await sendGangCreatedWebhook({
        name,
        owner,
        ownerName,
        color,
      });

      res.status(201).json(gang);
    } catch (error) {
      res.status(500).json({ error: "Failed to create gang" });
    }
  });

  app.patch("/api/gangs/:id", async (req, res) => {
    try {
      const gang = await storage.updateGang(req.params.id, req.body);
      if (!gang) return res.status(404).json({ error: "Gang not found" });
      res.json(gang);
    } catch (error) {
      res.status(500).json({ error: "Failed to update gang" });
    }
  });

  app.delete("/api/gangs/:id", async (req, res) => {
    try {
      const success = await storage.deleteGang(req.params.id);
      if (!success) return res.status(404).json({ error: "Gang not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete gang" });
    }
  });

  app.post("/api/gangs/:id/join", async (req, res) => {
    try {
      const { username, password } = req.body;
      const targetGang = await storage.getGang(req.params.id);
      if (!targetGang) return res.status(404).json({ error: "Gang not found" });
      if (targetGang.password !== password) return res.status(401).json({ error: "Invalid password" });
      
      const allGangs = await storage.getGangs();
      
      for (const gang of allGangs) {
        const existingMember = gang.members.find(m => m.username === username);
        if (existingMember && gang.id !== req.params.id) {
          await storage.removeGangMember(gang.id, existingMember.id);
        }
      }
      
      const alreadyMember = targetGang.members.find(m => m.username === username);
      if (alreadyMember) {
        return res.status(400).json({ error: "Already a member of this gang" });
      }
      
      const member = {
        id: randomUUID(),
        username,
        gangId: req.params.id,
        rank: "Member",
        joinedAt: Date.now(),
        isOnline: true,
      };
      const updated = await storage.addGangMember(req.params.id, member);
      res.status(201).json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to join gang" });
    }
  });

  app.delete("/api/gangs/:gangId/members/:memberId", async (req, res) => {
    try {
      const updated = await storage.removeGangMember(req.params.gangId, req.params.memberId);
      if (!updated) return res.status(404).json({ error: "Gang not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  app.get("/api/giveaways", async (req, res) => {
    try {
      let giveaways = await storage.getGiveaways();
      for (const giveaway of giveaways) {
        if (giveaway.status === "active" && Date.now() > giveaway.endsAt) {
          await storage.endGiveaway(giveaway.id);
        }
      }
      giveaways = await storage.getGiveaways();
      res.json(giveaways);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch giveaways" });
    }
  });

  app.post("/api/giveaways", async (req, res) => {
    try {
      const giveaway = await storage.createGiveaway(req.body);
      await storage.createNotification({
        title: `New Giveaway: ${giveaway.price}`,
        description: giveaway.description || "A new giveaway has been created!",
        type: "giveaway_new",
        read: false,
      });
      res.status(201).json(giveaway);
    } catch (error) {
      res.status(500).json({ error: "Failed to create giveaway" });
    }
  });

  app.delete("/api/giveaways/:id", async (req, res) => {
    try {
      await storage.deleteGiveaway(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete giveaway" });
    }
  });

  app.post("/api/giveaways/:id/join", async (req, res) => {
    try {
      const { username } = req.body;
      const giveaway = await storage.joinGiveaway(req.params.id, username);
      res.json(giveaway);
    } catch (error) {
      res.status(500).json({ error: "Failed to join giveaway" });
    }
  });

  app.post("/api/giveaways/:id/leave", async (req, res) => {
    try {
      const { username } = req.body;
      const giveaway = await storage.leaveGiveaway(req.params.id, username);
      res.json(giveaway);
    } catch (error) {
      res.status(500).json({ error: "Failed to leave giveaway" });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.post("/api/announcements", async (req, res) => {
    try {
      const { title, user, description } = req.body;
      if (!title || !user || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const announcement = await storage.createAnnouncement({ title, user, description });
      await storage.createNotification({
        title: `New Announcement: ${title}`,
        description: `${description.substring(0, 100)}...`,
        type: "announcement_new",
        read: false,
      });
      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ error: "Failed to create announcement" });
    }
  });

  app.delete("/api/announcements/:id", async (req, res) => {
    try {
      await storage.deleteAnnouncement(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });

  app.get("/api/shop-products", async (req, res) => {
    try {
      const products = await storage.getShopProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/shop-products", async (req, res) => {
    try {
      const product = await storage.createShopProduct(req.body);
      await storage.createNotification({
        title: `New Shop Product: ${product.name}`,
        description: `${product.category} - ${product.price}`,
        type: "shop_product_new",
        read: false,
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/shop-products/:id", async (req, res) => {
    try {
      const product = await storage.updateShopProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/shop-products/:id", async (req, res) => {
    try {
      await storage.deleteShopProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:userId", async (req, res) => {
    try {
      const user = await storage.getUserByUserId(req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "User ID required" });
      const existing = await storage.getUserByUserId(userId);
      if (existing) return res.json(existing);
      const user = await storage.createUser({ userId, isBlocked: false });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/users/:id/block", async (req, res) => {
    try {
      const user = await storage.blockUser(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Send webhook notification for blocked user
      await sendUserBlockedWebhook({
        userId: user.userId,
        blockedBy: 'Staff',
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  app.post("/api/users/:id/unblock", async (req, res) => {
    try {
      const user = await storage.unblockUser(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to unblock user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.updateUser(req.params.id, { userId });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/tickets/:id/ai-response", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });
      const aiMessage = `Thank you for contacting us! We've received your ticket: "${ticket.subject}". Our team will review your message and respond shortly. We appreciate your patience!`;
      const message = await storage.createMessage({
        ticketId: req.params.id,
        content: aiMessage,
        sender: "staff",
      });
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const { title, description, createdBy } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "Title and description required" });
      }
      const note = await storage.createNote({ title, description, createdBy });
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const success = await storage.deleteNote(req.params.id);
      if (!success) return res.status(404).json({ error: "Note not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  app.post("/api/reset", async (req, res) => {
    try {
      // Reset all data
      await storage.clear();
      res.json({ success: true, message: "All data cleared" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset data" });
    }
  });

  return httpServer;
}
