require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../src/config/db");

const seedData = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // =========================
    // 1. USERS
    // =========================

    const adminPassword = await bcrypt.hash("Admin123!", 10);
    const staffPassword = await bcrypt.hash("Staff123!", 10);

    const usersResult = await client.query(
      `
      INSERT INTO users
        (full_name, email, password, role)
      VALUES
        ($1, $2, $3, 'admin'),
        ($4, $5, $6, 'staff')
      ON CONFLICT (email) DO UPDATE
      SET full_name = EXCLUDED.full_name
      RETURNING id, email, role
      `,
      [
        "Admin User",
        "admin@eventhub.com",
        adminPassword,
        "Staff User",
        "staff@eventhub.com",
        staffPassword,
      ]
    );

    const adminResult = await client.query(
      `SELECT id FROM users WHERE email = 'admin@eventhub.com'`
    );

    const staffResult = await client.query(
      `SELECT id FROM users WHERE email = 'staff@eventhub.com'`
    );

    const adminId = adminResult.rows[0].id;
    const staffId = staffResult.rows[0].id;

    // =========================
    // 2. PARTICIPANTS
    // =========================

    const participants = [];

    for (let i = 1; i <= 10; i++) {
      const result = await client.query(
        `
        INSERT INTO participants
          (full_name, email, phone)
        VALUES
          ($1, $2, $3)
        ON CONFLICT (email)
        DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING id
        `,
        [
          `Participant ${i}`,
          `participant${i}@eventhub.com`,
          `060000000${i}`,
        ]
      );

      participants.push(result.rows[0].id);
    }

    // =========================
    // 3. EVENTS
    // =========================

    const eventsData = [
      {
        title: "Tech Conference Casablanca",
        description: "Modern web development conference",
        location: "Technopark Casablanca",
        date: "2026-10-15T10:00:00",
        max: 5,
        status: "published",
        creator: adminId,
      },
      {
        title: "React Workshop",
        description: "React and modern frontend development",
        location: "Casablanca",
        date: "2026-10-20T10:00:00",
        max: 20,
        status: "published",
        creator: staffId,
      },
      {
        title: "Node.js Backend Workshop",
        description: "Node.js and Express REST APIs",
        location: "Rabat",
        date: "2026-10-25T09:00:00",
        max: 30,
        status: "published",
        creator: adminId,
      },
      {
        title: "PostgreSQL Training",
        description: "Advanced PostgreSQL database training",
        location: "Rabat",
        date: "2026-11-01T10:00:00",
        max: 25,
        status: "draft",
        creator: staffId,
      },
      {
        title: "Full Stack Meetup",
        description: "Full Stack developers meetup",
        location: "Mohammedia",
        date: "2026-11-10T14:00:00",
        max: 15,
        status: "cancelled",
        creator: adminId,
      },
    ];

    const events = [];

    for (const event of eventsData) {
      const result = await client.query(
        `
        INSERT INTO events
          (
            title,
            description,
            location,
            event_date,
            max_participants,
            status,
            created_by
          )
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        `,
        [
          event.title,
          event.description,
          event.location,
          event.date,
          event.max,
          event.status,
          event.creator,
        ]
      );

      events.push({
        id: result.rows[0].id,
        status: event.status,
      });
    }

    // =========================
    // 4. REGISTRATIONS
    // =========================

    // Only published events
    const publishedEvents = events.filter(
      (event) => event.status === "published"
    );

    let registrationCount = 0;

    // Create 20 registrations
    for (let i = 0; i < 20; i++) {
      const event = publishedEvents[i % publishedEvents.length];
      const participantId = participants[i % participants.length];

      // Avoid duplicate event + participant
      const existing = await client.query(
        `
        SELECT id
        FROM registrations
        WHERE event_id = $1
        AND participant_id = $2
        `,
        [event.id, participantId]
      );

      if (existing.rows.length === 0) {
        await client.query(
          `
          INSERT INTO registrations
            (event_id, participant_id, status)
          VALUES
            ($1, $2, $3)
          `,
          [
            event.id,
            participantId,
            i % 2 === 0 ? "confirmed" : "pending",
          ]
        );

        registrationCount++;
      }
    }

    await client.query("COMMIT");

    console.log("=================================");
    console.log("✅ EventHub seed completed");
    console.log("=================================");
    console.log("Users: 2");
    console.log("Participants: 10");
    console.log("Events: 5");
    console.log(`Registrations created: ${registrationCount}`);
    console.log("=================================");

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("❌ Seed failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
};

seedData();