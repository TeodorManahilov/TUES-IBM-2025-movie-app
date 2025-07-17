import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, History, Clock, Lock, Edit, LogOut, Star, Calendar } from 'lucide-react';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [showReviewHistory, setShowReviewHistory] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && isOpen) {
      if (showReviewHistory) {
        fetchUserReviews();
      }
    }
  }, [user, isOpen, showReviewHistory]);

  const fetchUserReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/review/of-user', {
        method: 'GET',
        headers: {
        Authorization: 'Basic ' + btoa('test:test'),
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const reviews = await response.json();
        const transformedReviews = reviews.map(review => ({
          id: review.id,
          movieTitle: review.media.title,
          comment: review.contents,
          date: review.date,
          mediaType: review.media.type || 'movie'
        }));
        setUserReviews(transformedReviews);
      } else {
        console.error('Failed to fetch user reviews');
        setUserReviews([
          { id: 1, movieTitle: "The Dark Knight", comment: "Amazing movie!", date: "2024-01-15" },
          { id: 2, movieTitle: "Inception", comment: "Mind-bending!", date: "2024-01-10" }
        ]);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      setUserReviews([]);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteReview = async (title) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch('http://localhost:8081/review/delete', {
        method: 'DELETE',
              headers: {
        Authorization: 'Basic ' + btoa('test:test'),
      },
        body: title,
        credentials: 'include'
      });

      if (response.ok) {
        setUserReviews(prev => prev.filter(review => review.movieTitle !== title));
      } else {
        const error = await response.text();
        alert(error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Server error. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      alert('Please enter a new password');
      return;
    }
    try {
      const response = await fetch('http://localhost:8081/user/pass', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: newPassword,
        credentials: 'include'
      });

      if (response.ok) {
        setNewPassword('');
        setShowChangePassword(false);
      } else {
        const error = await response.text();
        alert(error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Server error. Please try again.');
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      alert('Please enter a new username');
      return;
    }
    try {
      const response = await fetch('http://localhost:8081/user/name', {
        method: 'PATCH',
              headers: {
        Authorization: 'Basic ' + btoa('test:test'),
      },
        body: newUsername,
        credentials: 'include'
      });

      if (response.ok) {
        alert('Username changed successfully! Please log in again.');
        setNewUsername('');
        setShowChangeUsername(false);
        onLogout();
      } else {
        const error = await response.text();
        alert(error || 'Failed to change username');
      }
    } catch (error) {
      console.error('Error changing username:', error);
      alert('Server error. Please try again.');
    }
  };

  const handleLogoutClick = async () => {
    setIsOpen(false);
    
    try {
      const response = await fetch("http://localhost:8081/user/logout", {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa("test:test"),
        },
        credentials: "include",
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
      }

      if (response.ok) {
        onLogout(); 
        window.location.href = "/";
      } else {
        throw new Error(data.message || `Logout failed (status ${response.status})`);
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Server error");
      onLogout();
      window.location.href = "/";
    }
  };

  const toggleReviewHistory = () => {
    setShowReviewHistory(!showReviewHistory);
    if (!showReviewHistory) {
      fetchUserReviews();
    }
  };

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="user-dropdown-trigger">
        <User size={20} />
        <span>{user.username}</span>
        <ChevronDown size={16} className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="user-info">
            <div className="user-avatar"><User size={20} /></div>
            <div className="user-details">
              <p className="username">{user.username}</p>
              <p className="email">{user.email}</p>
            </div>
          </div>

          <div className="dropdown-items">
            <button onClick={toggleReviewHistory} className="dropdown-item">
              <History size={16} /><span>Review History</span>
            </button>
            {showReviewHistory && (
              <div className="dropdown-submenu">
                <h4>Your Reviews</h4>
                {loading ? (
                  <p className="loading">Loading...</p>
                ) : userReviews.length > 0 ? (
                  <div className="reviews-list">
                    {userReviews.map(review => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div>
                            <h1 className="review-title">{review.movieTitle} - {review.comment}</h1>
                          </div>
                          <button 
                            onClick={() => handleDeleteReview(review.movieTitle)}
                            className="delete-btn"
                            title="Delete review"
                          >
                            ×
                          </button>
                        </div>
                        <div className="review-date">
                          <Calendar size={12} />
                          {review.date}
                        </div>
                        
                      </div>
                    ))}
                  </div>
                ) : <p className="no-data">No reviews yet</p>}
              </div>
            )}

            <button onClick={() => setShowChangePassword(!showChangePassword)} className="dropdown-item">
              <Lock size={16} /><span>Change Password</span>
            </button>
            {showChangePassword && (
              <div className="dropdown-submenu">
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="change-input" 
                />
                <div className="change-buttons">
                  <button onClick={handleChangePassword} className="btn-primary">Update</button>
                  <button onClick={() => { setShowChangePassword(false); setNewPassword(''); }} className="btn-secondary">Cancel</button>
                </div>
              </div>
            )}

            <button onClick={() => setShowChangeUsername(!showChangeUsername)} className="dropdown-item">
              <Edit size={16} /><span>Change Username</span>
            </button>
            {showChangeUsername && (
              <div className="dropdown-submenu">
                <input 
                  type="text" 
                  placeholder="New Username" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)} 
                  className="change-input" 
                />
                <div className="change-buttons">
                  <button onClick={handleChangeUsername} className="btn-primary">Update</button>
                  <button onClick={() => { setShowChangeUsername(false); setNewUsername(''); }} className="btn-secondary">Cancel</button>
                </div>
              </div>
            )}

            <div className="dropdown-divider"></div>
            <button onClick={handleLogoutClick} className="dropdown-item logout-item">
              <LogOut size={16} /><span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;