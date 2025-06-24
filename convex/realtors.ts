import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import _ from 'lodash'

export const list = query({
    handler: async (ctx) => {
        const realtors = await ctx.db.query("realtors").collect();
        return await Promise.all(_.map(realtors, async (realtor) => ({
            realtor,
            user: (await ctx.db.get(realtor.userId)),
        })));
    },
});

export const getById = query({
    args: { id: v.id("realtors") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
            .then(async (realtor) => {
                if (!realtor) return null;
                const user = await  ctx.db.query('users')
                .filter((q) => q.eq(q.field('_id'), realtor.userId)).unique();
                return {
                    realtor,
                    user
                }
        });
    },
});

export const create = mutation({
    args: {
        userId: v.optional(v.id("users")),
        name: v.string(),
        email: v.string(),
        phone: v.string(),
        workingHours: v.object({
            start: v.string(),
            end: v.string(),
        }),
        workingDays: v.array(v.number()),
        timezone: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            phone: args.phone,
        });
        if(!userId) return null;
        return await ctx.db.insert("realtors", {
            userId: userId,
            workingHours: args.workingHours,
            workingDays: args.workingDays,
            timezone: args.timezone,
        });
    },
});
