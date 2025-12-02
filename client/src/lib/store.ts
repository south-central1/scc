import type { Ticket, Message } from "@shared/schema";

const TICKETS_KEY = "southcentral_tickets";
const MESSAGES_KEY = "southcentral_messages";
const STAFF_AUTH_KEY = "southcentral_staff_auth";
const UPDATE_STATUS_KEY = "southcentral_update_status";

export function getTickets(): Ticket[] {
  const stored = localStorage.getItem(TICKETS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveTickets(tickets: Ticket[]): void {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export function getMessages(): Message[] {
  const stored = localStorage.getItem(MESSAGES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveMessages(messages: Message[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function createTicket(subject: string, message: string): Ticket {
  const tickets = getTickets();
  const ticketNumber = `${Math.floor(10000 + Math.random() * 90000)}`;
  const newTicket: Ticket = {
    id: crypto.randomUUID(),
    ticketNumber,
    subject,
    message,
    status: "open",
    createdAt: Date.now(),
  };
  tickets.push(newTicket);
  saveTickets(tickets);
  return newTicket;
}

export function claimTicket(ticketId: string, staffName: string): void {
  const tickets = getTickets();
  const ticket = tickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.status = "claimed";
    ticket.claimedBy = staffName;
    saveTickets(tickets);
  }
}

export function closeTicket(ticketId: string): void {
  const tickets = getTickets();
  const ticket = tickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.status = "closed";
    saveTickets(tickets);
  }
}

export function addMessage(
  ticketId: string,
  content: string,
  sender: "user" | "staff"
): Message {
  const messages = getMessages();
  const newMessage: Message = {
    id: crypto.randomUUID(),
    ticketId,
    content,
    sender,
    timestamp: Date.now(),
  };
  messages.push(newMessage);
  saveMessages(messages);
  return newMessage;
}

export function getTicketMessages(ticketId: string): Message[] {
  return getMessages().filter((m) => m.ticketId === ticketId);
}

export function isStaffAuthenticated(): boolean {
  return localStorage.getItem(STAFF_AUTH_KEY) === "true";
}

export function authenticateStaff(password: string): boolean {
  if (password === "abdzgoat0") {
    localStorage.setItem(STAFF_AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logoutStaff(): void {
  localStorage.removeItem(STAFF_AUTH_KEY);
}

export function getUpdateStatus(): number {
  const stored = localStorage.getItem(UPDATE_STATUS_KEY);
  return stored ? parseInt(stored, 10) : 50;
}

export function setUpdateStatus(percentage: number): void {
  localStorage.setItem(UPDATE_STATUS_KEY, percentage.toString());
}

export function generateNotificationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log("Audio not supported");
  }
}
