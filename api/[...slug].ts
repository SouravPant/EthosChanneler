import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";
import { insertUserSchema, insertVouchSchema, insertReviewSchema, insertActivitySchema, insertConnectionSchema } from "../shared/schema";
import { z } from "zod";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { slug } = req.query;
    const path = Array.isArray(slug) ? slug.join('/') : slug || '';
    const method = req.method;

    // Health check
    if (path === 'health') {
      return res.json({ status: "ok", timestamp: new Date().toISOString() });
    }

    // User routes
    if (path.startsWith('users/')) {
      const userPath = path.replace('users/', '');
      
      if (method === 'GET') {
        // Get user by ID
        if (/^\d+$/.test(userPath)) {
          const id = parseInt(userPath);
          const user = await storage.getUser(id);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          return res.json(user);
        }
        
        // Get user by FID
        if (userPath.startsWith('fid/')) {
          const fid = parseInt(userPath.replace('fid/', ''));
          const user = await storage.getUserByFid(fid);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          return res.json(user);
        }
        
        // Get user by username
        if (userPath.startsWith('username/')) {
          const username = userPath.replace('username/', '');
          const user = await storage.getUserByUsername(username);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          return res.json(user);
        }
      }
      
      if (method === 'POST' && userPath === '') {
        const userData = insertUserSchema.parse(req.body);
        const user = await storage.createUser(userData);
        return res.status(201).json(user);
      }
    }

    // Vouch routes
    if (path === 'vouches' && method === 'POST') {
      const vouchData = insertVouchSchema.parse(req.body);
      
      // Check if vouch already exists
      const existingVouch = await storage.getVouchBetweenUsers(vouchData.voucherId, vouchData.voucheeId);
      if (existingVouch) {
        return res.status(400).json({ message: "Vouch already exists between these users" });
      }
      
      const vouch = await storage.createVouch(vouchData);
      
      // Update user stats
      const voucher = await storage.getUser(vouchData.voucherId);
      const vouchee = await storage.getUser(vouchData.voucheeId);
      
      if (voucher && vouchee) {
        await storage.updateUser(vouchData.voucherId, { 
          vouchesGiven: voucher.vouchesGiven + 1 
        });
        await storage.updateUser(vouchData.voucheeId, { 
          vouchesReceived: vouchee.vouchesReceived + 1,
          credibilityScore: vouchee.credibilityScore + 12
        });
        
        // Create activity
        await storage.createActivity({
          userId: vouchData.voucheeId,
          actorId: vouchData.voucherId,
          type: "vouch_received",
          description: `User ${voucher.username} vouched for you`,
          scoreChange: 12,
        });
      }
      
      return res.status(201).json(vouch);
    }

    // Default 404
    return res.status(404).json({ message: "API endpoint not found" });

  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}