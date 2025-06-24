import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.optional(v.string()),
        email: v.string(),
        phone: v.optional(v.string()),
        image: v.optional(v.string()),
        tokenIdentifier: v.optional(v.string()),
        isOnline: v.optional(v.boolean()),
    }).index("by_email", ["email"])
        .index("by_tokenIdentifier", ["tokenIdentifier"]),

    conversations: defineTable({
        participants: v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.string()),
        admin: v.optional(v.id("users")),
    }),

    messages: defineTable({
        conversation: v.id("conversations"),
        sender: v.string(), // should be string so that it doesn't throw errors in openai part ("ChatGPT")
        content: v.string(),
        messageType: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    }).index("by_conversation", ["conversation"]),

    realtors: defineTable({
        userId: v.id("users"),
        workingHours: v.object({
            start: v.string(), // "09:00"
            end: v.string(),   // "17:00"
        }),
        workingDays: v.array(v.number()), // [1,2,3,4,5] for Mon-Fri
        timezone: v.string(),
    }).index("by_userId", ["userId"]),

    blockedSlots: defineTable({
        realtorId: v.id("realtors"),
        date: v.string(), // "2024-12-25"
        startTime: v.optional(v.string()), // "14:00" - if undefined, blocks entire day
        endTime: v.optional(v.string()),   // "15:00"
        reason: v.optional(v.string()),
        isRecurring: v.optional(v.boolean()),
    }).index("by_realtor_date", ["realtorId", "date"]),

    tours: defineTable({
        realtorId: v.id("realtors"),
        clientName: v.string(),
        clientEmail: v.string(),
        clientPhone: v.string(),
        date: v.string(),
        startTime: v.string(),
        endTime: v.string(),
        status: v.union(v.literal("scheduled"), v.literal("confirmed"), v.literal("cancelled")),
        notes: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_realtor_date", ["realtorId", "date"])
        .index("by_client_email", ["clientEmail"]),
});
