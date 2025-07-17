import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fid: integer("fid").notNull().unique(), // Farcaster ID
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  pfpUrl: text("pfp_url"),
  bio: text("bio"),
  ethosAddress: text("ethos_address"),
  credibilityScore: integer("credibility_score").default(0),
  vouchesReceived: integer("vouches_received").default(0),
  vouchesGiven: integer("vouches_given").default(0),
  reviewsGiven: integer("reviews_given").default(0),
  networkSize: integer("network_size").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vouches = pgTable("vouches", {
  id: serial("id").primaryKey(),
  voucherId: integer("voucher_id").notNull().references(() => users.id),
  voucheeId: integer("vouchee_id").notNull().references(() => users.id),
  stakeAmount: decimal("stake_amount", { precision: 18, scale: 8 }).notNull(),
  reason: text("reason"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  revieweeId: integer("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1 = down, 2 = neutral, 3 = up
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  actorId: integer("actor_id").references(() => users.id),
  type: text("type").notNull(), // 'vouch_received', 'vouch_given', 'review_given', 'network_joined'
  description: text("description").notNull(),
  scoreChange: integer("score_change").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  connectedUserId: integer("connected_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  fid: true,
  username: true,
  displayName: true,
  pfpUrl: true,
  bio: true,
  ethosAddress: true,
});

export const insertVouchSchema = createInsertSchema(vouches).pick({
  voucherId: true,
  voucheeId: true,
  stakeAmount: true,
  reason: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  reviewerId: true,
  revieweeId: true,
  rating: true,
  comment: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  actorId: true,
  type: true,
  description: true,
  scoreChange: true,
});

export const insertConnectionSchema = createInsertSchema(connections).pick({
  userId: true,
  connectedUserId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vouch = typeof vouches.$inferSelect;
export type InsertVouch = z.infer<typeof insertVouchSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
