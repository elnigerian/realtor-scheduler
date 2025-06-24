import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByRealtorAndDate = query({
    args: {
        realtorId: v.id("realtors"),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tours")
            .withIndex("by_realtor_date")
            .filter((q) =>
                q.and(
                    q.eq(q.field("realtorId"), args.realtorId),
                    q.eq(q.field("date"), args.date),
                    q.neq(q.field("status"), "cancelled")
                )
            )
            .collect();
    },
});

export const schedule = mutation({
    args: {
        realtorId: v.id("realtors"),
        clientName: v.string(),
        clientEmail: v.string(),
        clientPhone: v.string(),
        date: v.string(),
        startTime: v.string(),
        endTime: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check for conflicts
        const existingMeetings = await ctx.db
            .query("tours")
            .withIndex("by_realtor_date")
            .filter((q) =>
                q.and(
                    q.eq(q.field("realtorId"), args.realtorId),
                    q.eq(q.field("date"), args.date),
                    q.neq(q.field("status"), "cancelled")
                )
            )
            .collect();

        const hasConflict = existingMeetings.some((meeting) => {
            return (
                (args.startTime >= meeting.startTime && args.startTime < meeting.endTime) ||
                (args.endTime > meeting.startTime && args.endTime <= meeting.endTime) ||
                (args.startTime <= meeting.startTime && args.endTime >= meeting.endTime)
            );
        });

        if (hasConflict) {
            throw new Error("Time slot conflicts with existing meeting");
        }

        return await ctx.db.insert("tours", {
            ...args,
            status: "scheduled" as const,
            createdAt: Date.now(),
        });
    },
});
