import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faSmile,
  faPaperPlane,
  faThumbsUp,
  faComment,
  faShare,
  faHeart
} from "@fortawesome/free-solid-svg-icons";
import { Button, Card, Form, Image, Spinner, Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import Layout from "../../components/layout/Layout";
import api from "../../api/axios";
import "./Home.css";
import { getCurrentUser } from "../../utils/auth";

const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [file, setFile] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
    const user = getCurrentUser();
  // Cek auth dan ambil data user
  useEffect(() => {

    if (!user) {
      navigate("/");
      return;
    }
    setCurrentUser(user);
    fetchPosts();
  }, [navigate]);

  // Ambil daftar postingan
 const fetchPosts = async () => {
   setIsLoading(true);
   try {
     const response = await api.get("/postingan/posting");
     const sortedPosts = response.data.data.sort((a, b) => {
       return new Date(b.createdAt) - new Date(a.createdAt);
     });
     setPosts(sortedPosts);
   } catch (error) {
     Swal.fire({
       icon: "error",
       title: "Gagal memuat postingan",
       text: error.message,
     });
   } finally {
     setIsLoading(false);
   }
 };

  // Handle buat postingan baru
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !file) return;

    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('user_id', currentUser.id);
    if (file) {
      formData.append('media_url', file);
      formData.append('media_type', mediaType);
    }

    try {
      const response = await api.post("/postingan/posting/create", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setPosts([response.data.data, ...posts]);
      setNewPost("");
      setFile(null);
      setMediaPreview(null);
      Swal.fire('Berhasil!', 'Postingan Anda telah dipublikasikan', 'success');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memposting',
        text: error.response?.data?.message || error.message
      });
    }
  };

  // Handle upload media
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const fileType = selectedFile.type.split('/')[0];
    setMediaType(fileType === 'video' ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  // Handle like/unlike
  const handleLike = async (postId) => {
    if (!currentUser) return;
    try {
      if (likedPosts.includes(postId)) {
        await api.delete(`/like/${postId}`, {
          data: { user_id: currentUser.id, postingan_id: postId }
        });
        setLikedPosts(likedPosts.filter(id => id !== postId));
      } else {
        await api.post("/like", {
          user_id: currentUser.id,
          postingan_id: postId
        });
        setLikedPosts([...likedPosts, postId]);
      }

      // Update UI
      setPosts(posts.map(post => ({
        ...post,
        likes: post.id === postId 
          ? likedPosts.includes(postId) ? post.likes - 1 : post.likes + 1 
          : post.likes
      })));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || error.message
      });
    }
  };

  return (
    <Layout>
      <div className="home-container">
        {/* Kolom Utama */}
        <div className="main-content">
          {/* Form Buat Postingan */}
          <Card className="mb-4 post-form-card">
            <Card.Body>
              <Form onSubmit={handlePostSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Apa yang ingin Anda bagikan?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="post-input"
                  />
                </Form.Group>
                
                {mediaPreview && (
                  <div className="media-preview mb-3">
                    {mediaType === 'image' ? (
                      <Image src={mediaPreview} fluid rounded style={{ width: '100%', height: 'auto' }} />
                    ) : (
                      <video controls style={{ maxWidth: '100%', maxHeight: '300px' }}>
                        <source src={mediaPreview} type="video/mp4" />
                      </video>
                    )}
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setMediaPreview(null);
                        setFile(null);
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center">
                  <div className="post-actions">
                    <label htmlFor="media-upload" className="btn btn-link text-secondary">
                      <FontAwesomeIcon icon={faImage} />
                      <input
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        hidden
                      />
                    </label>
                    <Button variant="link" className="text-secondary">
                      <FontAwesomeIcon icon={faSmile} />
                    </Button>
                  </div>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={!newPost.trim() && !file}
                    style={{ backgroundColor: "#112ba6", borderColor: "#112ba6" }}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="me-1" />
                    Posting
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Feed Postingan */}
          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Memuat postingan...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostItem 
                key={post.id} 
                post={post} 
                onLike={handleLike}
                isLiked={likedPosts.includes(post.id)}
                onMediaClick={() => {
                  setMediaPreview(post.media_url);
                  setShowMediaModal(true);
                }}
              />
            ))
          ) : (
            <Card className="text-center p-4">
              <Card.Text>Tidak ada postingan yang ditemukan</Card.Text>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="home-sidebar">
          <Card className="mb-">
            <Card.Header className="fw-bold">Saran alumni</Card.Header>
            <Card.Body>
              <p className="text-muted">Fitur ini akan segera hadir</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal Preview Media */}
      <Modal 
        show={showMediaModal} 
        onHide={() => setShowMediaModal(false)}
        size="lg"
        centered
      >
        <Modal.Body className="p-0">
          {mediaPreview && (
            mediaType === 'image' ? (
              <Image src={mediaPreview} fluid />
            ) : (
              <video controls autoPlay style={{ width: '100%' }}>
                <source src={mediaPreview} type="video/mp4" />
              </video>
            )
          )}
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

// Komponen Post Item
const PostItem = ({ post, onLike, isLiked, onMediaClick }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex align-items-start mb-3">
          <Image 
            src={post.foto} 
            roundedCircle 
            width={40} 
            height={40} 
            className="me-3"
          />
          <div>
            <h6 className="mb-0">{post.name }</h6>
            <small className="text-muted">
              {new Date(post.createdAt).toLocaleString()}
            </small>
          </div>
        </div>
        
        <Card.Text>{post.content}</Card.Text>
        
        {post.media_url && (
          <div className="post-media-container mb-3">
            {post.media_type === 'image' ? (
              <Image 
                src={post.media_url} 
                fluid 
                rounded 
                onClick={onMediaClick}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <video 
                controls 
                style={{ maxWidth: '100%', maxHeight: '400px' }}
                onClick={onMediaClick}
              >
                <source src={post.media_url} type="video/mp4" />
              </video>
            )}
          </div>
        )}
        
        <div className="d-flex justify-content-between">
          <Button 
            variant="link" 
            size="sm" 
            className={`text-secondary ${isLiked ? 'text-danger' : ''}`}
            onClick={() => onLike(post.id)}
          >
            <FontAwesomeIcon 
              icon={faHeart} 
              className="me-1" 
            />
            Suka
          </Button>
          <Button variant="link" size="sm" className="text-secondary">
            <FontAwesomeIcon icon={faComment} className="me-1" />
            {post.comments || 0} Komentar
          </Button>
          <Button variant="link" size="sm" className="text-secondary">
            <FontAwesomeIcon icon={faShare} className="me-1" />
            Bagikan
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};



export default Home;