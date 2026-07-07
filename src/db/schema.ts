import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(),
  username: text("username").notNull(),
  apeKey: text("ape_key").notNull(),
});
