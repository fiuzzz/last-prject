// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faNewspaper,
  faUser,
  faImage,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import "./Dashboard.css";
import LayoutAdmin from "../../components/layout/LayoutAdmin";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalPosts: 0,
    adminCount: 0,
  });

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, postsRes, profilesRes] = await Promise.all([
          axios.get("https://probwe.rikpetik.site/api/v1/user/user/"),
          axios.get("https://probwe.rikpetik.site/api/v1/postingan/posting"),
          axios.get("https://probwe.rikpetik.site/api/v1/profil"),
        ]);

        setUsers(usersRes.data.data);
        setPosts(postsRes.data.data);
        setProfiles(profilesRes.data.data);

        // Calculate stats
        const today = new Date().toISOString().split("T")[0];
        const newUsers = usersRes.data.data.filter(
          (user) => user.createdAt.split("T")[0] === today
        ).length;

        setStats({
          totalUsers: usersRes.data.data.length,
          newUsers,
          totalPosts: postsRes.data.data.length,
          adminCount: usersRes.data.data.filter((user) => user.role === "admin")
            .length,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine user data with profile
  const getUserWithProfile = (userId) => {
    const user = users.find((u) => u.id === userId);
    const profile = profiles.find((p) => p.user_id === userId);
    return { ...user, profile };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memuat data...</p>
      </div>
    );
  }

    return (
      <>
        <LayoutAdmin>
          <div className="dashboard-container">
            <h2 className="dashboard-title">Dashboard Admin</h2>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ backgroundColor: "#e6f0ff" }}
                >
                  <FontAwesomeIcon icon={faUsers} color="#112ba6" size="lg" />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Pengguna</p>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ backgroundColor: "#e6f0ff" }}
                >
                  <FontAwesomeIcon icon={faUser} color="#112ba6" size="lg" />
                </div>
                <div className="stat-info">
                  <h3>{stats.adminCount}</h3>
                  <p>Admin</p>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ backgroundColor: "#e6f0ff" }}
                >
                  <FontAwesomeIcon
                    icon={faNewspaper}
                    color="#112ba6"
                    size="lg"
                  />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalPosts}</h3>
                  <p>Total Postingan</p>
                </div>
              </div>
            </div>

            {/* Recent Users Section */}
            <div className="section-container">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faUsers} className="title-icon" />
                Daftar Pengguna Terbaru
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Cabang</th>
                      <th>Bergabung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            {user.username || user.email.split("@")[0]}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.branch || "-"}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Posts Section */}
            <div className="section-container">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faNewspaper} className="title-icon" />
                Postingan Terbaru
              </h3>
              <div className="posts-grid">
                {posts.slice(0, 4).map((post) => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      {post.profil ? (
                        <div className="post-author">
                          <img
                            src={
                              post.profil.foto ||
                              "https://via.placeholder.com/40"
                            }
                            alt={post.profil.nama}
                            className="author-avatar"
                          />
                          <span>{post.profil.nama}</span>
                        </div>
                      ) : (
                        <div className="post-author">
                          <div className="author-avatar empty-avatar">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                          <span>Unknown User</span>
                        </div>
                      )}
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="post-content">
                      <p>{post.content}</p>
                      {post.media_url && (
                        <div className="post-media">
                          {post.media_type === "image" ? (
                            <img src={post.media_url} alt="Post media" />
                          ) : (
                            <video controls>
                              <source src={post.media_url} type="video/mp4" />
                            </video>
                          )}
                          <div className="media-type">
                            <FontAwesomeIcon
                              icon={
                                post.media_type === "image" ? faImage : faVideo
                              }
                              color="#112ba6"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LayoutAdmin>
      </>
    );
};

export default Dashboard;
