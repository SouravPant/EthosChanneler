import {
  type User,
  type InsertUser,
  type Vouch,
  type InsertVouch,
  type Review,
  type InsertReview,
  type Activity,
  type InsertActivity,
  type Connection,
  type InsertConnection,
} from "@shared/schema";
import { db, schema } from "./db";

// Extract table references from schema
const { users, vouches, reviews, activities, connections } = schema;
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFid(fid: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getSuggestedUsers(userId: number, limit: number): Promise<User[]>;

  // Vouch operations
  createVouch(vouch: InsertVouch): Promise<Vouch>;
  getVouchesByUser(userId: number): Promise<Vouch[]>;
  getVouchesForUser(userId: number): Promise<Vouch[]>;
  getVouchBetweenUsers(voucherId: number, voucheeId: number): Promise<Vouch | undefined>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getReviewsForUser(userId: number): Promise<Review[]>;

  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByUser(userId: number, limit: number): Promise<Activity[]>;

  // Connection operations
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnectionsByUser(userId: number): Promise<Connection[]>;
  areUsersConnected(userId: number, connectedUserId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private vouches: Map<number, Vouch> = new Map();
  private reviews: Map<number, Review> = new Map();
  private activities: Map<number, Activity> = new Map();
  private connections: Map<number, Connection> = new Map();
  private currentUserId = 1;
  private currentVouchId = 1;
  private currentReviewId = 1;
  private currentActivityId = 1;
  private currentConnectionId = 1;

  constructor() {
    // Initialize with a sample user
    this.initializeData();
  }

  private initializeData() {
    const sampleUser: User = {
      id: 1,
      fid: 12345,
      username: "johndoe",
      displayName: "John Doe",
      pfpUrl: null,
      bio: "Building the future of Web3 trust",
      ethosAddress: "0x1234567890123456789012345678901234567890",
      credibilityScore: 847,
      vouchesReceived: 23,
      vouchesGiven: 12,
      reviewsGiven: 156,
      networkSize: 89,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(1, sampleUser);
    this.currentUserId = 2;

    // Add some sample activities
    const sampleActivities: Activity[] = [
      {
        id: 1,
        userId: 1,
        actorId: null,
        type: "vouch_received",
        description: "@alice vouched for you",
        scoreChange: 12,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId: 1,
        actorId: null,
        type: "review_given",
        description: "You reviewed @bob",
        scoreChange: 3,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        id: 3,
        userId: 1,
        actorId: null,
        type: "network_joined",
        description: "@charlie joined your network",
        scoreChange: 5,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    sampleActivities.forEach((activity) => {
      this.activities.set(activity.id, activity);
    });
    this.currentActivityId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFid(fid: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.fid === fid);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      pfpUrl: insertUser.pfpUrl || null,
      bio: insertUser.bio || null,
      ethosAddress: insertUser.ethosAddress || null,
      credibilityScore: 0,
      vouchesReceived: 0,
      vouchesGiven: 0,
      reviewsGiven: 0,
      networkSize: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getSuggestedUsers(userId: number, limit: number): Promise<User[]> {
    const allUsers = Array.from(this.users.values())
      .filter((user) => user.id !== userId)
      .sort((a, b) => b.credibilityScore - a.credibilityScore)
      .slice(0, limit);
    
    return allUsers;
  }

  async createVouch(insertVouch: InsertVouch): Promise<Vouch> {
    const vouch: Vouch = {
      id: this.currentVouchId++,
      ...insertVouch,
      reason: insertVouch.reason || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.vouches.set(vouch.id, vouch);
    return vouch;
  }

  async getVouchesByUser(userId: number): Promise<Vouch[]> {
    return Array.from(this.vouches.values())
      .filter((vouch) => vouch.voucherId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getVouchesForUser(userId: number): Promise<Vouch[]> {
    return Array.from(this.vouches.values())
      .filter((vouch) => vouch.voucheeId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getVouchBetweenUsers(voucherId: number, voucheeId: number): Promise<Vouch | undefined> {
    return Array.from(this.vouches.values())
      .find((vouch) => vouch.voucherId === voucherId && vouch.voucheeId === voucheeId && vouch.isActive);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const review: Review = {
      id: this.currentReviewId++,
      ...insertReview,
      comment: insertReview.comment || null,
      createdAt: new Date(),
    };
    this.reviews.set(review.id, review);
    return review;
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((review) => review.reviewerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReviewsForUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((review) => review.revieweeId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activity: Activity = {
      id: this.currentActivityId++,
      ...insertActivity,
      actorId: insertActivity.actorId || null,
      scoreChange: insertActivity.scoreChange || 0,
      createdAt: new Date(),
    };
    this.activities.set(activity.id, activity);
    return activity;
  }

  async getActivitiesByUser(userId: number, limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const connection: Connection = {
      id: this.currentConnectionId++,
      ...insertConnection,
      createdAt: new Date(),
    };
    this.connections.set(connection.id, connection);
    return connection;
  }

  async getConnectionsByUser(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values())
      .filter((connection) => connection.userId === userId || connection.connectedUserId === userId);
  }

  async areUsersConnected(userId: number, connectedUserId: number): Promise<boolean> {
    return Array.from(this.connections.values())
      .some((connection) => 
        (connection.userId === userId && connection.connectedUserId === connectedUserId) ||
        (connection.userId === connectedUserId && connection.connectedUserId === userId)
      );
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFid(fid: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.fid, fid));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getSuggestedUsers(userId: number, limit: number): Promise<User[]> {
    const suggestedUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.credibilityScore))
      .limit(limit + 1);
    
    return suggestedUsers.filter((user: User) => user.id !== userId).slice(0, limit);
  }

  async createVouch(insertVouch: InsertVouch): Promise<Vouch> {
    const [vouch] = await db
      .insert(vouches)
      .values(insertVouch)
      .returning();
    return vouch;
  }

  async getVouchesByUser(userId: number): Promise<Vouch[]> {
    return await db
      .select()
      .from(vouches)
      .where(eq(vouches.voucherId, userId))
      .orderBy(desc(vouches.createdAt));
  }

  async getVouchesForUser(userId: number): Promise<Vouch[]> {
    return await db
      .select()
      .from(vouches)
      .where(eq(vouches.voucheeId, userId))
      .orderBy(desc(vouches.createdAt));
  }

  async getVouchBetweenUsers(voucherId: number, voucheeId: number): Promise<Vouch | undefined> {
    const [vouch] = await db
      .select()
      .from(vouches)
      .where(and(
        eq(vouches.voucherId, voucherId),
        eq(vouches.voucheeId, voucheeId),
        eq(vouches.isActive, true)
      ));
    return vouch || undefined;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewerId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsForUser(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getActivitiesByUser(userId: number, limit: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const [connection] = await db
      .insert(connections)
      .values(insertConnection)
      .returning();
    return connection;
  }

  async getConnectionsByUser(userId: number): Promise<Connection[]> {
    return await db
      .select()
      .from(connections)
      .where(eq(connections.userId, userId));
  }

  async areUsersConnected(userId: number, connectedUserId: number): Promise<boolean> {
    const [connection] = await db
      .select()
      .from(connections)
      .where(and(
        eq(connections.userId, userId),
        eq(connections.connectedUserId, connectedUserId)
      ));
    return !!connection;
  }
}

export const storage = new DatabaseStorage();
