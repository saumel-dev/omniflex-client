import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
// 1. Import the JWT plugin from Better-Auth
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("omniflex");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user", // Default registration role is standard user [cite: 122]
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
      },
    },
  },
  // 2. Add the session block matching your mentor's exact structure
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 60 * 24 * 60, // Sets token/cookie expiration
    },
  },
  // 3. Register the jwt plugin at the root level
  plugins: [jwt()],
});