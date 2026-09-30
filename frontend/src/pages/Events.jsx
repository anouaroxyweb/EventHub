import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Events() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const url = status
        ? `/events?status=${status}`
        : "/events";

      const response = await api.get(url);

      setEvents(response.data.events);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [status]);

  const getStatusClass = (status) => {
    switch (status) {
      case "published":
        return "status published";

      case "draft":
        return "status draft";

      case "cancelled":
        return "status cancelled";

      default:
        return "status";
    }
  };

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
            className="nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="nav-item active"
            onClick={() => navigate("/events")}
          >
            <span>◫</span>
            Events
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/participants")}
          >
            <span>♙</span>
            Participants
          </button>

          <button className="nav-item">
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
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>Events</h1>

            <p>
              Manage your events and registrations
            </p>
          </div>

          <button
            className="create-event-btn"
            onClick={() => navigate("/events/create")}
          >
            + Create Event
          </button>

        </header>

        {/* FILTERS */}

        <div className="events-toolbar">

          <div className="filter-group">

            <label>Status</label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Events</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>

          </div>

          <div className="events-count">
            {events.length} event
            {events.length !== 1 ? "s" : ""}
          </div>

        </div>

        {/* CONTENT */}

        {loading ? (

          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>

        ) : error ? (

          <div className="error-screen">
            <h2>Something went wrong</h2>
            <p>{error}</p>
          </div>

        ) : (

          <div className="events-grid">

            {events.length === 0 ? (

              <div className="empty-events">
                <div>◫</div>
                <h2>No events found</h2>
                <p>
                  Create an event to get started.
                </p>
              </div>

            ) : (

              events.map((event) => (

                <div
                  className="event-card"
                  key={event.id}
                >

                  <div className="event-card-top">

                    <div className="large-event-icon">
                      {event.title.charAt(0)}
                    </div>

                    <span
                      className={getStatusClass(
                        event.status
                      )}
                    >
                      {event.status}
                    </span>

                  </div>

                  <h2>{event.title}</h2>

                  <p className="event-description">
                    {event.description ||
                      "No description available"}
                  </p>

                  <div className="event-info">

                    <div>
                      <span>📍</span>
                      {event.location}
                    </div>

                    <div>
                      <span>📅</span>
                      {new Date(
                        event.event_date
                      ).toLocaleDateString()}
                    </div>

                    <div>
                      <span>👥</span>
                      {event.max_participants} participants
                    </div>

                  </div>

                  <div className="event-card-footer">

                    <span>
                      Created by{" "}
                      <strong>
                        {event.creator_name}
                      </strong>
                    </span>

                    <button
                      onClick={() =>
                        navigate(
                          `/events/${event.id}`
                        )
                      }
                    >
                      View →
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default Events;