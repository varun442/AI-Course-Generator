/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./configs/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://db_owner:MjKy9IO4DHxU@ep-frosty-mode-a5gt4pcp-pooler.us-east-2.aws.neon.tech/db?sslmode=require&channel_binding=require',
    }
  };