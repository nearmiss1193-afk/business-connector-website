import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { properties } from "./schema-properties";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  // Add more for auth
});

export const savedProperties = mysqlTable("saved_properties", {
  userId: int("user_id").references(() => users.id),
  propertyId: int("property_id").references(() => properties.id),
});