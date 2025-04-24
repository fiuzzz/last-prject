import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faBullhorn,
  faCheckCircle,
  faSpinner,
  faUserTie,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import "./Aktivitas.css";
import { getCurrentUser } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

const Aktivitas = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // State untuk pemilihan ketua
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState(false);
  const [userVoteStatus, setUserVoteStatus] = useState(false);
  const [userVoteData, setUserVoteData] = useState(null);

  // State untuk event
  const [events, setEvents] = useState([]);
  const [eventLoading, setEventLoading] = useState(true);

  // Warna tema
  const themeColor = "#112ba6";
  const secondaryColor = "#f5f7ff";

  // Fungsi untuk mengecek status voting user
  const checkUserVoteStatus = async () => {
    try {
      const response = await axios.get(
        "https://probwe.rikpetik.site/api/v1/voting/hasil"
      );

      const userVote = response.data.data.find(
        (vote) => vote.user_id === user.id
      );
      if (userVote) {
        setUserVoteStatus(true);
        setSelectedCandidate(userVote.kandidat_id);
        setHasVoted(true);
        setUserVoteData(userVote);
      }
    } catch (err) {
      console.error("Gagal memeriksa status voting:", err);
    }
  };

  // Ambil data dari API
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Cek status voting user terlebih dahulu
        await checkUserVoteStatus();

        // Ambil data kandidat
        const kanditatResponse = await axios.get(
          "https://probwe.rikpetik.site/api/v1/kandidat"
        );
        setCandidates(kanditatResponse.data.data);
        setIsLoading(false);

        // Ambil data event
        const eventResponse = await axios.get(
          "https://probwe.rikpetik.site/api/v1/event"
        );
        setEvents(eventResponse.data.data);
        setEventLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setIsLoading(false);
        setEventLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle voting
  const handleVote = async (candidateId) => {
    if (hasVoted || userVoteStatus) return;

    try {
      setVoteLoading(true);
      const response = await axios.post(
        "https://probwe.rikpetik.site/api/v1/voting",
        {
          user_id: user.id,
          kandidat_id: candidateId,
        }
      );

      setSelectedCandidate(candidateId);
      setHasVoted(true);
      setUserVoteStatus(true);
      setUserVoteData(response.data.data);

      // Optimistic UI update
      setCandidates(
        candidates.map((c) =>
          c.id === candidateId ? { ...c, votes: (c.votes || 0) + 1 } : c
        )
      );
    } catch (err) {
      console.error("Voting error:", err);
    } finally {
      setVoteLoading(false);
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <Layout>
      <div className="aktivitas-container">
        <h1 className="page-title">
          <FontAwesomeIcon icon={faBullhorn} /> Aktivitas Alumni
        </h1>

        {/* Card Pemilihan Ketua */}
        <div className="feature-card voting-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faUserTie} className="card-icon" />
            <h2>Pemilihan Ketua Alumni</h2>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <FontAwesomeIcon icon={faSpinner} spin />
              <p>Memuat data kandidat...</p>
            </div>
          ) : (
            <>
              <p className="card-description">
                Pilih kandidat ketua alumni untuk periode 2023-2026. Masa voting
                hingga 30 November 2023.
              </p>

              {/* Tampilan setelah voting */}
              {hasVoted || userVoteStatus ? (
                <div className="after-vote-view">
                  <h3>Anda telah memilih:</h3>

                  {candidates
                    .filter((c) => c.id === selectedCandidate)
                    .map((candidate) => (
                      <div key={candidate.id} className="selected-candidate">
                        <div className="candidate-avatar">
                          {candidate.foto ? (
                            <img src={candidate.foto} alt={candidate.nama} />
                          ) : (
                            <div className="avatar-placeholder">
                              <FontAwesomeIcon icon={faUserTie} />
                            </div>
                          )}
                        </div>

                        <div className="candidate-details">
                          <h3>{candidate.nama}</h3>
                          <div className="vision-misi">
                            <h4>Visi & Misi:</h4>
                            <p>{candidate.visi_misi}</p>
                          </div>
                        </div>

                        <div className="vote-badge">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          <span>Pilihan Anda</span>
                        </div>
                      </div>
                    ))}

                  <div className="vote-confirmation">
                    <p>Terima kasih telah berpartisipasi dalam pemilihan!</p>
                    {userVoteData?.created_at && (
                      <div className="vote-time">
                        Waktu voting:{" "}
                        {new Date(userVoteData.created_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Tampilan sebelum voting */
                <div className="candidates-list">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="candidate-card"
                      onClick={() => handleVote(candidate.id)}
                    >
                      <div className="candidate-avatar">
                        {candidate.foto ? (
                          <img src={candidate.foto} alt={candidate.nama} />
                        ) : (
                          <div className="avatar-placeholder">
                            <FontAwesomeIcon icon={faUserTie} />
                          </div>
                        )}
                      </div>

                      <div className="candidate-info">
                        <h3>{candidate.nama}</h3>
                        <div className="vision-misi">
                          <p>{candidate.visi_misi}</p>
                        </div>
                      </div>

                      {voteLoading && selectedCandidate === candidate.id && (
                        <div className="vote-loading">
                          <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Card Event Alumni */}
        <div className="feature-card events-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faUsers} className="card-icon" />
            <h2>Kegiatan Alumni</h2>
          </div>

          {eventLoading ? (
            <div className="loading-state">
              <FontAwesomeIcon icon={faSpinner} spin />
              <p>Memuat data kegiatan...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-date">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{formatDate(event.date)}</span>
                    <span className="event-time">{event.time}</span>
                  </div>

                  <div className="event-details">
                    <h3>{event.title}</h3>
                    <p className="event-location">
                      <span>📍</span> {event.location}
                    </p>
                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Tidak ada kegiatan yang akan datang</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Aktivitas;
