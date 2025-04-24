// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEdit,
  faSave,
  faTrash,
  faTimes,
  faEnvelope,
  faBriefcase,
  faGraduationCap,
  faMapMarkerAlt,
  faPlus,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../api/axios";
import Layout from "../../components/layout/Layout";
import "./Profile.css";
import { getCurrentUser } from "../../utils/auth";

const Profile = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [isLoading, setIsLoading] = useState({
    profile: true,
    posts: true,
    saving: false,
    deleting: false,
  });
  const [error, setError] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  // Di dalam komponen Profile
  const [isNewProfile, setIsNewProfile] = useState(false);

  // Di dalam useEffect saat fetch data
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, profile: true }));

        // Cek apakah profil sudah ada
        const profileRes = await api.get(`/profil/${user.id}`);
        
        if (profileRes.data?.data) {
          // Profil sudah ada - mode update
          setProfile(profileRes.data.data);
          setEditData(profileRes.data.data);
          setIsNewProfile(false);
          setError(null);

          // Ambil postingan jika profil sudah ada
          const postsRes = await api.get(`/postingan/posting/${user.id}`);
          setPosts(postsRes.data.data);
        } else {
          // Profil belum ada - mode create
          const emptyProfile = {
            nama: user.name || "",
            activitas: "",
            angkatan: "",
            tempat_tinggal: "",
            tempat_kerja: "",
            bio: "",
            foto: "",
          };
          setProfile(emptyProfile);
          setEditData(emptyProfile);
          setIsNewProfile(true);
          setIsEditing(true);
          setError("Silakan lengkapi profil Anda terlebih dahulu");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // Handle 404 error untuk profil tidak ditemukan
          const emptyProfile = {
            nama: user.name || "",
            activitas: "",
            angkatan: "",
            tempat_tinggal: "",
            tempat_kerja: "",
            bio: "",
            foto: "",
          };
          setProfile(emptyProfile);
          setEditData(emptyProfile);
          setIsNewProfile(true);
          setIsEditing(true);
          setError("Silakan lengkapi profil Anda terlebih dahulu");
        } else {
          setError("Gagal memuat data profil");
        }
      } finally {
        setIsLoading((prev) => ({ ...prev, profile: false }));
      }
    };

    fetchData();
  }, [user?.id, user?.name]);

  // Fungsi handleProfileUpdate yang terpisah untuk create dan update
  const handleProfileUpdate = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading((prev) => ({ ...prev, saving: true }));
      setError(null);

      const formData = new FormData();
      formData.append("nama", editData.nama);
      formData.append("activitas", editData.activitas);
      formData.append("angkatan", editData.angkatan);
      formData.append("tempat_tinggal", editData.tempat_tinggal || "");
      formData.append("tempat_kerja", editData.tempat_kerja || "");
      formData.append("bio", editData.bio || "");
      formData.append("user_id", user.id);

      if (editData.foto instanceof File) {
        formData.append("foto", editData.foto);
      }

      let response;

      if (isNewProfile) {
        // CREATE new profile
        response = await api.post("/profil", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // UPDATE existing profile
        response = await api.put(`/profil/${user.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const updatedProfile = response.data;
      setProfile(updatedProfile);
      setEditData(updatedProfile);
      setIsEditing(false);
      setIsNewProfile(false);
      setImagePreview(null);

      // Jika ini create pertama kali, ambil postingan
      if (isNewProfile) {
        const postsRes = await api.get(`/postingan/posting/${user.id}`);
        setPosts(postsRes.data.data);
      }
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, saving: false }));
    }
  };
  // Handle image upload preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEditData((prev) => ({ ...prev, foto: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate profile form
  const validateForm = () => {
    const errors = {};
    if (!editData.nama) errors.nama = "Nama wajib diisi";
    if (!editData.activitas) errors.activitas = "aktivitas wajib diisi";
    if (!editData.angkatan) errors.angkatan = "Angkatan wajib diisi";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update

  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setFormErrors({
        title: !newPost.title.trim() ? "Judul wajib diisi" : "",
        content: !newPost.content.trim() ? "Konten wajib diisi" : "",
      });
      return;
    }

    try {
      setIsLoading((prev) => ({ ...prev, saving: true }));
      setError(null);

      const response = await api.post("/postingan/posting/create", {
        ...newPost,
        user_id: user.id,
      });

      setPosts([response.data, ...posts]);
      setNewPost({ title: "", content: "" });
      setShowPostForm(false);
      setFormErrors({});
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat postingan");
      console.error("Post creation error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
      return;
    }

    try {
      setIsLoading((prev) => ({ ...prev, deleting: true }));
      await api.delete(`/postingan/posting/delete/${postId}`);
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus postingan");
      console.error("Post deletion error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, deleting: false }));
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    if (
      tab === "posts" &&
      (!profile?.nama || !profile?.activitas || !profile?.angkatan)
    ) {
      setError("Lengkapi profil terlebih dahulu untuk mengakses postingan");
      setIsEditing(true);
      return;
    }
    setActiveTab(tab);
    setError(null);
  };

  if (isLoading.profile) {
    return (
      <Layout>
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Memuat data profil...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-container">
        {/* Error Message */}
        {error && (
          <div
            className={`alert ${isEditing ? "alert-warning" : "alert-error"}`}
          >
            <div className="alert-message">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{error}</span>
            </div>
            {isEditing ? (
              <small>Harap lengkapi semua field wajib</small>
            ) : (
              <button
                className="alert-button"
                onClick={() => setIsEditing(true)}
              >
                Lengkapi Sekarang
              </button>
            )}
          </div>
        )}

        {/* Profile Header */}
        <div className="profile-header">
          <div className="avatar-container">
            <img
              src={imagePreview || profile?.foto}
              className="profile-avatar"

              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-avatar.jpg";
              }}
            />
            {isEditing && (
              <div className="photo-upload-container">
                <label htmlFor="photo-upload" className="photo-upload-label">
                  <FontAwesomeIcon icon={faEdit} />{" "}
                  {profile?.foto ? "Ubah Foto" : "Tambah Foto"}
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="photo-upload-input"
                  onChange={handleImageChange}
                />
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{profile?.nama || "Nama Pengguna"}</h1>
            <p className="profile-meta">
              {profile?.activitas && profile?.angkatan ? (
                <>
                  <span>
                    <FontAwesomeIcon icon={faGraduationCap} /> {profile.activitas}{" "}
                    Angkatan {profile.angkatan}
                  </span>
                  {profile.tempat_tinggal && (
                    <span>
                      <FontAwesomeIcon icon={faMapMarkerAlt} />{" "}
                      {profile.tempat_tinggal}
                    </span>
                  )}
                </>
              ) : (
                <span>Profil belum lengkap</span>
              )}
            </p>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="profile-tabs">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => handleTabChange("profile")}
          >
            <FontAwesomeIcon icon={faUser} /> Profil
          </button>
          <button
            className={activeTab === "posts" ? "active" : ""}
            onClick={() => handleTabChange("posts")}
            disabled={!profile?.nama || !profile?.activitas || !profile?.angkatan}
          >
            <FontAwesomeIcon icon={faBriefcase} /> Postingan Saya
          </button>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {activeTab === "profile" ? (
            <div className="profile-details">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>
                      Nama Lengkap <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={editData.nama || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, nama: e.target.value })
                      }
                      className={formErrors.nama ? "error" : ""}
                    />
                    {formErrors.nama && (
                      <span className="error-message">{formErrors.nama}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      activitas <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={editData.activitas || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, activitas: e.target.value })
                      }
                      className={formErrors.activitas ? "error" : ""}
                    />
                    {formErrors.activitas && (
                      <span className="error-message">
                        {formErrors.activitas}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Angkatan <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={editData.angkatan || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, angkatan: e.target.value })
                      }
                      className={formErrors.angkatan ? "error" : ""}
                    />
                    {formErrors.angkatan && (
                      <span className="error-message">
                        {formErrors.angkatan}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Tempat Tinggal</label>
                    <input
                      type="text"
                      value={editData.tempat_tinggal || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          tempat_tinggal: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Tempat Kerja</label>
                    <input
                      type="text"
                      value={editData.tempat_kerja || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          tempat_kerja: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={editData.bio || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, bio: e.target.value })
                      }
                      rows="4"
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="save-btn"
                      onClick={handleProfileUpdate}
                      disabled={isLoading.saving}
                    >
                      {isLoading.saving ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faSave} />
                      )}
                      Simpan Profil
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setIsEditing(false);
                        setEditData(profile);
                        setImagePreview(null);
                        setFormErrors({});
                      }}
                      disabled={isLoading.saving}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="detail-section">
                    <h3>
                      <FontAwesomeIcon icon={faUser} /> Informasi Pribadi
                    </h3>
                    <div className="detail-item">
                      <span className="label">Nama Lengkap</span>
                      <span className="value">{profile?.nama}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">aktivitas</span>
                      <span className="value">{profile?.activitas}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Angkatan</span>
                      <span className="value">{profile?.angkatan}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>
                      <FontAwesomeIcon icon={faBriefcase} /> Pekerjaan
                    </h3>
                    <div className="detail-item">
                      <span className="label">Tempat Kerja</span>
                      <span className="value">
                        {profile?.tempat_kerja || "-"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Lokasi</span>
                      <span className="value">
                        {profile?.tempat_tinggal || "-"}
                      </span>
                    </div>
                  </div>

                  {profile?.bio && (
                    <div className="detail-section">
                      <h3>
                        <FontAwesomeIcon icon={faEnvelope} /> Tentang Saya
                      </h3>
                      <p className="bio-content">{profile.bio}</p>
                    </div>
                  )}

                  <button
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Edit Profil
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="posts-container">
              <button
                className="add-post-btn"
                onClick={() => setShowPostForm(true)}
                disabled={isLoading.saving}
              >
                <FontAwesomeIcon icon={faPlus} /> Buat Postingan Baru
              </button>

              {showPostForm && (
                <div className="post-form">
                  <h3>Buat Postingan Baru</h3>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Judul*"
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost({ ...newPost, title: e.target.value })
                      }
                      disabled={isLoading.saving}
                      className={formErrors.title ? "error" : ""}
                    />
                    {formErrors.title && (
                      <span className="error-message">{formErrors.title}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <textarea
                      placeholder="Konten*"
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost({ ...newPost, content: e.target.value })
                      }
                      rows="4"
                      disabled={isLoading.saving}
                      className={formErrors.content ? "error" : ""}
                    />
                    {formErrors.content && (
                      <span className="error-message">
                        {formErrors.content}
                      </span>
                    )}
                  </div>
                  <div className="form-actions">
                    <button
                      onClick={handleCreatePost}
                      disabled={
                        isLoading.saving ||
                        !newPost.title.trim() ||
                        !newPost.content.trim()
                      }
                    >
                      {isLoading.saving ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        "Simpan"
                      )}
                    </button>
                    <button
                      className="cancel"
                      onClick={() => {
                        setShowPostForm(false);
                        setNewPost({ title: "", content: "" });
                        setFormErrors({});
                      }}
                      disabled={isLoading.saving}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {!isLoading.posts ? (
                <div className="loading-posts">
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <p>Memuat postingan...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="posts-list">
                  {posts.map((post) => (
                    <div key={post.id} className="post-item">
                      <div className="post-header">
                        <h3>{post.title}</h3>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeletePost(post.id)}
                          disabled={isLoading.deleting}
                        >
                          {isLoading.deleting ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            <FontAwesomeIcon icon={faTrash} />
                          )}
                        </button>
                      </div>
                      <p className="post-content">{post.content}</p>
                      <div className="post-meta">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-posts">Belum ada postingan</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;