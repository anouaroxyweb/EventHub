import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setDashboard(response.data.dashboard);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">E</div>
          <span>EventHub</span>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() => navigate("/dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/events")}
          >
            <span>◫</span>
            Events
          </button>

          {user?.role === "admin" && (
  <button
    className="nav-item"
    onClick={() => navigate("/participants")}
  >
    <span>♙</span>
    Participants
  </button>
)}

          <button
  className="nav-item"
  onClick={() => navigate("/events")}
>
  <span>✓</span>
  Registrations
</button>

        </nav>

        <div className="sidebar-bottom">

          <div className="user-mini">
            <div className="avatar">
              {user?.full_name?.charAt(0)}
            </div>

            <div>
              <strong>{user?.full_name}</strong>
              <small>{user?.role}</small>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">

          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back, {user?.full_name}
            </p>
          </div>

          <div className="topbar-user">
            <div className="avatar">
              {user?.full_name?.charAt(0)}
            </div>

            <div>
              <strong>{user?.full_name}</strong>
              <span>{user?.role}</span>
            </div>
          </div>

        </header>

        {/* STAT CARDS */}
        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon purple">
              ◫
            </div>

            <div>
              <span>Total Events</span>
              <h2>{dashboard.totalEvents}</h2>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>Published Events</span>
              <h2>{dashboard.publishedEvents}</h2>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange">
              +
            </div>

            <div>
              <span>Today's Registrations</span>
              <h2>{dashboard.todayRegistrations}</h2>
            </div>

          </div>

        </section>

        {/* TOP EVENTS */}
        <section className="content-card">

          <div className="card-header">

            <div>
              <h2>Top Events</h2>
              <p>
                Events with the highest number of registrations
              </p>
            </div>

            <button
              className="view-all"
              onClick={() => navigate("/events")}
            >
              View all →
            </button>

          </div>

          {dashboard.topFullEvents.length === 0 ? (

            <div className="empty-state">
              <div>◫</div>
              <h3>No events found</h3>
              <p>Create your first event to get started.</p>
            </div>

          ) : (

            <div className="table-wrapper">

              <table className="events-table">

                <thead>
                  <tr>
                    <th>EVENT</th>
                    <th>CAPACITY</th>
                    <th>REGISTRATIONS</th>
                    <th>PROGRESS</th>
                  </tr>
                </thead>

                <tbody>

                  {dashboard.topFullEvents.map((event) => {

                    const percentage = Math.min(
                      Math.round(
                        (event.registrations_count /
                          event.max_participants) *
                          100
                      ),
                      100
                    );

                    return (
                      <tr key={event.id}>

                        <td>
                          <div className="event-name">
                            <div className="event-avatar">
                              {event.title.charAt(0)}
                            </div>

                            <div>
                              <strong>
                                {event.title}
                              </strong>

                              <small>
                                EventHub Event
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          {event.max_participants}
                        </td>

                        <td>
                          <strong>
                            {event.registrations_count}
                          </strong>
                        </td>

                        <td>

                          <div className="progress-container">

                            <div className="progress-bar">
                              <div
                                className="progress-value"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              ></div>
                            </div>

                            <span>
                              {percentage}%
                            </span>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;