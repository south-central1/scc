
import { WEBHOOKS, ROLE_MENTIONS } from './config';

export async function sendGangCreatedWebhook(gangData: {
  name: string;
  owner: string;
  ownerName: string;
  color: string;
}) {
  try {
    await fetch(WEBHOOKS.GANG_CREATED, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '🏴 New Gang Created',
          color: parseInt(gangData.color.replace('#', ''), 16),
          fields: [
            { name: 'Gang Name', value: gangData.name, inline: true },
            { name: 'Owner', value: gangData.ownerName, inline: true },
            { name: 'Owner ID', value: gangData.owner, inline: true },
            { name: 'Color', value: gangData.color, inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch (error) {
    console.error('Failed to send gang created webhook:', error);
  }
}

export async function sendTicketCreatedWebhook(ticketData: {
  ticketNumber: string;
  subject: string;
  message: string;
  userId: string;
}) {
  try {
    await fetch(WEBHOOKS.TICKET_CREATED, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: ROLE_MENTIONS.STAFF,
        embeds: [{
          title: '🎫 New Support Ticket',
          color: 0xFF6B6B,
          fields: [
            { name: 'Ticket Number', value: `#${ticketData.ticketNumber}`, inline: true },
            { name: 'Created By', value: ticketData.userId, inline: true },
            { name: 'Subject', value: ticketData.subject, inline: false },
            { name: 'Message', value: ticketData.message.substring(0, 1000), inline: false },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch (error) {
    console.error('Failed to send ticket created webhook:', error);
  }
}

export async function sendUserLoginWebhook(userData: {
  username: string;
  userId: string;
  isStaff: boolean;
}) {
  try {
    await fetch(WEBHOOKS.USER_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '✅ User Logged In',
          color: 0x5865F2,
          fields: [
            { name: 'Username', value: userData.username, inline: true },
            { name: 'User ID', value: userData.userId, inline: true },
            { name: 'Staff Access', value: userData.isStaff ? 'Yes' : 'No', inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch (error) {
    console.error('Failed to send user login webhook:', error);
  }
}

export async function sendUserBlockedWebhook(userData: {
  userId: string;
  blockedBy: string;
}) {
  try {
    await fetch(WEBHOOKS.USER_BLOCKED, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: ROLE_MENTIONS.STAFF,
        embeds: [{
          title: '🔒 User Blocked',
          color: 0xFF0000,
          fields: [
            { name: 'User ID', value: userData.userId, inline: true },
            { name: 'Blocked By', value: userData.blockedBy, inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch (error) {
    console.error('Failed to send user blocked webhook:', error);
  }
}
