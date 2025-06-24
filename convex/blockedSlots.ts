import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

export const getByRealtorAndDateRange = query({
    args: {
        realtorId: v.id("realtors"),
        startDate: v.string(),
        endDate: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("blockedSlots")
            .withIndex("by_realtor_date")
            .filter((q) =>
                q.and(
                    q.eq(q.field("realtorId"), args.realtorId),
                    q.gte(q.field("date"), args.startDate),
                    q.lte(q.field("date"), args.endDate)
                )
            )
            .collect();
    },
});

export const create = mutation({
    args: {
        realtorId: v.id("realtors"),
        date: v.string(),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        reason: v.optional(v.string()),
        isRecurring: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("blockedSlots", args);
    },
});
