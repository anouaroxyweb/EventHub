import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [selectedParticipant, setSelectedParticipant] =
    useState("");

  const [registering, setRegistering] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registerError, setRegisterError] = useState("");

  // =========================
  // FETCH DATA
  // =========================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        eventResponse,
        registrationsResponse,
        participantsResponse,
      ] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/registrations?eventId=${id}`),
        api.get("/participants"),
      ]);

      setEvent(eventResponse.data.event);

      setRegistrations(
        registrationsResponse.data.registrations
      );

      setParticipants(
        participantsResponse.data.participants
      );

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load event"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // =========================
  // UPDATE EVENT STATUS
  // =========================

  const updateStatus = async (status) => {
    try {
      await api.patch(`/events/${id}/status`, {
        status,
      });

      await fetchData();

    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update event"
      );
    }
  };

  // =========================
  // REGISTER PARTICIPANT
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedParticipant) {
      setRegisterError(
        "Please select a participant"
      );
      return;
    }

    try {
      setRegistering(true);
      setRegisterError("");

      await api.post("/registrations", {
        eventId: id,
        participantId: selectedParticipant,
      });

      setSelectedParticipant("");

      await fetchData();

    } catch (error) {
      setRegisterError(
        error.response?.data?.message ||
          "Failed to create registration"
      );
    } finally {
      setRegistering(false);
    }
  };

  // =========================
  // UPDATE REGISTRATION STATUS
  // =========================

  const updateRegistrationStatus = async (
    registrationId,
    status
  ) => {
    try {
      await api.patch(
        `/registrations/${registrationId}/status`,
        {
          status,
        }
      );

      await fetchData();

    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update registration"
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading event...</p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="error-screen">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  // =========================
  // MAIN
  // =========================

  return (
    <div className="dashboard-layout">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            E
          </div>

          <span>EventHub</span>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="nav-item active"
            onClick={() =>
              navigate("/events")
            }
          >
            <span>◫</span>
            Events
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/participants")
            }
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
              <strong>
                {user?.full_name}
              </strong>

              <small>
                {user?.role}
              </small>
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

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">

        {/* HEADER */}

        <header className="topbar">

          <div>

            <button
              className="back-btn"
              onClick={() =>
                navigate("/events")
              }
            >
              ← Back to Events
            </button>

            <h1>
              {event.title}
            </h1>

            <p>
              {event.description}
            </p>

          </div>

          <span
            className={`status ${event.status}`}
          >
            {event.status}
          </span>

        </header>

        {/* =========================
            EVENT INFORMATION
        ========================= */}

        <div className="details-grid">

          <div className="content-card event-details-card">

            <div className="card-header">

              <div>

                <h2>
                  Event Information
                </h2>

                <p>
                  Details about this event
                </p>

              </div>

            </div>

            <div className="details-content">

              <div className="detail-item">

                <span>📍</span>

                <div>

                  <small>
                    Location
                  </small>

                  <strong>
                    {event.location}
                  </strong>

                </div>

              </div>

              <div className="detail-item">

                <span>📅</span>

                <div>

                  <small>
                    Date
                  </small>

                  <strong>
                    {new Date(
                      event.event_date
                    ).toLocaleString()}
                  </strong>

                </div>

              </div>

              <div className="detail-item">

                <span>👥</span>

                <div>

                  <small>
                    Maximum Participants
                  </small>

                  <strong>
                    {event.max_participants}
                  </strong>

                </div>

              </div>

              <div className="detail-item">

                <span>👤</span>

                <div>

                  <small>
                    Created By
                  </small>

                  <strong>
                    {event.creator_name}
                  </strong>

                </div>

              </div>

            </div>

            {/* EVENT ACTIONS */}

            <div className="event-actions">

              {event.status === "draft" && (

                <button
                  className="action-primary"
                  onClick={() =>
                    updateStatus(
                      "published"
                    )
                  }
                >
                  Publish Event
                </button>

              )}

              {event.status !== "cancelled" && (

                <button
                  className="action-danger"
                  onClick={() =>
                    updateStatus(
                      "cancelled"
                    )
                  }
                >
                  Cancel Event
                </button>

              )}

            </div>

          </div>

          {/* =========================
              REGISTRATION SUMMARY
          ========================= */}

          <div className="content-card">

            <div className="card-header">

              <div>

                <h2>
                  Registrations
                </h2>

                <p>
                  {registrations.length} registered
                </p>

              </div>

            </div>

            <div className="registration-summary">

              <div className="big-number">
                {registrations.length}
              </div>

              <span>
                / {event.max_participants} capacity
              </span>

            </div>

          </div>

        </div>

        {/* =========================
            ADD REGISTRATION
        ========================= */}

        <div className="content-card registration-form-card">

          <div className="card-header">

            <div>

              <h2>
                Add Registration
              </h2>

              <p>
                Register a participant for this event
              </p>

            </div>

          </div>

          {event.status !== "published" ? (

            <div className="registration-warning">
              This event must be published before
              participants can register.
            </div>

          ) : (

            <form
              className="registration-form"
              onSubmit={handleRegister}
            >

              <div className="registration-select">

                <label>
                  Participant
                </label>

                <select
                  value={selectedParticipant}
                  onChange={(e) =>
                    setSelectedParticipant(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select a participant
                  </option>

                  {participants.map(
                    (participant) => (

                      <option
                        key={participant.id}
                        value={participant.id}
                      >
                        {participant.full_name} —{" "}
                        {participant.email}
                      </option>

                    )
                  )}

                </select>

              </div>

              <button
                type="submit"
                className="action-primary"
                disabled={registering}
              >
                {registering
                  ? "Registering..."
                  : "Register Participant"}
              </button>

            </form>

          )}

          {registerError && (

            <div className="form-error">
              {registerError}
            </div>

          )}

        </div>

        {/* =========================
            REGISTRATIONS TABLE
        ========================= */}

        <div className="content-card registrations-card">

          <div className="card-header">

            <div>

              <h2>
                Event Registrations
              </h2>

              <p>
                Participants registered for this event
              </p>

            </div>

          </div>

          {registrations.length === 0 ? (

            <div className="empty-state">

              <div>♙</div>

              <h3>
                No registrations
              </h3>

              <p>
                No participants registered yet.
              </p>

            </div>

          ) : (

            <div className="table-wrapper">

              <table className="events-table">

                <thead>

                  <tr>

                    <th>
                      PARTICIPANT
                    </th>

                    <th>
                      EMAIL
                    </th>

                    <th>
                      PHONE
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {registrations.map(
                    (registration) => (

                      <tr
                        key={
                          registration.id
                        }
                      >

                        <td>

                          <div className="event-name">

                            <div className="event-avatar">

                              {registration
                                .participant_name
                                ?.charAt(0)}

                            </div>

                            <strong>
                              {
                                registration.participant_name
                              }
                            </strong>

                          </div>

                        </td>

                        <td>
                          {
                            registration.participant_email
                          }
                        </td>

                        <td>
                          {
                            registration.participant_phone ||
                            "-"
                          }
                        </td>

                        <td>

                          <span
                            className={`status ${registration.status}`}
                          >
                            {
                              registration.status
                            }
                          </span>

                        </td>

                        <td>

                          <select
                            value={
                              registration.status
                            }
                            onChange={(e) =>
                              updateRegistrationStatus(
                                registration.id,
                                e.target.value
                              )
                            }
                          >

                            <option value="pending">
                              Pending
                            </option>

                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>

                          </select>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default EventDetails;