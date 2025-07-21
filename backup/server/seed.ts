import { db } from "./db";
import { users, activities } from "@shared/schema";

async function seedDatabase() {
  try {
    // Create a sample user
    const [user] = await db
      .insert(users)
      .values({
        fid: 12345,
        username: "johndoe",
        displayName: "John Doe",
        bio: "Building the future of Web3 trust",
        ethosAddress: "0x1234567890123456789012345678901234567890",
      })
      .returning();

    console.log("Created user:", user);

    // Create sample activities
    const sampleActivities = [
      {
        userId: user.id,
        actorId: null,
        type: "vouch_received",
        description: "@alice vouched for you",
        scoreChange: 12,
      },
      {
        userId: user.id,
        actorId: null,
        type: "review_given",
        description: "You reviewed @bob",
        scoreChange: 3,
      },
      {
        userId: user.id,
        actorId: null,
        type: "network_joined",
        description: "@charlie joined your network",
        scoreChange: 5,
      },
    ];

    await db.insert(activities).values(sampleActivities);
    console.log("Created sample activities");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();