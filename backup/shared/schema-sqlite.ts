import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  fid: integer("fid").notNull().unique(), // Farcaster ID
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  pfpUrl: text("pfp_url"),
  bio: text("bio"),
  ethosAddress: text("ethos_address"),
  credibilityScore: integer("credibility_score").default(0).notNull(),
  vouchesReceived: integer("vouches_received").default(0).notNull(),
  vouchesGiven: integer("vouches_given").default(0).notNull(),
  reviewsGiven: integer("reviews_given").default(0).notNull(),
  networkSize: integer("network_size").default(0).notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const vouches = sqliteTable("vouches", {
  id: integer("id").primaryKey(),
  voucherId: integer("voucher_id").notNull().references(() => users.id),
  voucheeId: integer("vouchee_id").notNull().references(() => users.id),
  stakeAmount: real("stake_amount").notNull(),
  reason: text("reason"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true).notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  revieweeId: integer("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1 = down, 2 = neutral, 3 = up
  comment: text("comment"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  actorId: integer("actor_id").references(() => users.id),
  type: text("type").notNull(), // 'vouch_received', 'vouch_given', 'review_given', 'network_joined'
  description: text("description").notNull(),
  scoreChange: integer("score_change").default(0).notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const connections = sqliteTable("connections", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  connectedUserId: integer("connected_user_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
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