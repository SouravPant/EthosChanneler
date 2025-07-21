import 'dotenv/config';
import express from "express";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import the existing route logic
import { storage } from "../server/storage";
import { insertUserSchema, insertVouchSchema, insertReviewSchema, insertActivitySchema, insertConnectionSchema } from "../shared/schema";
import { z } from "zod";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// User routes
app.get("/api/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users/fid/:fid", async (req, res) => {
  try {
    const fid = parseInt(req.params.fid);
    const user = await storage.getUserByFid(fid);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user by fid:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users/username/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user by username:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid user data", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Vouch routes
app.post("/api/vouches", async (req, res) => {
  try {
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
    
    res.status(201).json(vouch);
  } catch (error) {
    console.error('Error creating vouch:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid vouch data", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;