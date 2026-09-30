const pool = require("../config/db");

const getDashboard = async (req, res) => {
  try {
    // Total events
    const totalEventsResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM events
    `);

    // Published events
    const publishedEventsResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM events
      WHERE status = 'published'
    `);

    // Today's registrations
    const todayRegistrationsResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM registrations
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // Top 5 full events
    const topFullEventsResult = await pool.query(`
      SELECT
        e.id,
        e.title,
        e.max_participants,
        COUNT(r.id)::int AS registrations_count
      FROM events e
      LEFT JOIN registrations r
        ON e.id = r.event_id
        AND r.status IN ('pending', 'confirmed')
      GROUP BY
        e.id,
        e.title,
        e.max_participants
      ORDER BY
        registrations_count DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      dashboard: {
        totalEvents: totalEventsResult.rows[0].total,
        publishedEvents: publishedEventsResult.rows[0].total,
        todayRegistrations: todayRegistrationsResult.rows[0].total,
        topFullEvents: topFullEventsResult.rows,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getDashboard,
};