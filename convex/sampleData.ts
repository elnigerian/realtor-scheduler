import { mutation } from "./_generated/server";

export const seedRealtors = mutation({
    handler: async (ctx) => {
        await ctx.db.insert("users", {
            name: "Sarah Johnson",
            email: "sarah@example.com",
            phone: "(555) 123-4567",
        }).then(async (userId) => {
            await ctx.db.insert("realtors", {
                userId,
                workingHours: { start: "09:00", end: "17:00" },
                workingDays: [1, 2, 3, 4, 5], // Mon-Fri
                timezone: "America/New_York",
            })
        });

        await ctx.db.insert("users", {
            name: "Mike Chen",
            email: "mike@example.com",
            phone: "(555) 987-6543",
        }).then(async (userId) => {
            await ctx.db.insert("realtors", {
                userId,
                workingHours: { start: "10:00", end: "18:00" },
                workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
                timezone: "America/New_York",
            })
        });
    },
});
