require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../src/config/db");

const seedUsers = async () => {
  try {
    const adminPassword = await bcrypt.hash("Admin123!", 10);
    const staffPassword = await bcrypt.hash("Staff123!", 10);

    await pool.query(
      `
      INSERT INTO users (full_name, email, password, role)
      VALUES
        ($1, $2, $3, $4),
        ($5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
      `,
      [
        "Admin User",
        "admin@eventhub.com",
        adminPassword,
        "admin",

        "Staff User",
        "staff@eventhub.com",
        staffPassword,
        "staff",
      ]
    );

    console.log("✅ Users seeded successfully");

    await pool.end();
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seedUsers();