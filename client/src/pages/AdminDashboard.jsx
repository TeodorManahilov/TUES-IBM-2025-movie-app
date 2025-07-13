import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({
    title: '',
    genre: '',
    type: 'movie',
    cast: '',
    poster: '',
    year: '',
    duration: '',
    rating: '',
    description: '',
    director: ''
  });
  const [editIndex, setEditIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8081/media/all', {
      credentials: 'include',
      headers: {
        Authorization: 'Basic ' + btoa('test:test'),
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load media');
        return res.json();
      })
      .then(data => setMovies(data))
      .catch(err => alert(err.message));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    });
  };

  const resetForm = () => {
    setForm({
      title: '',
      genre: '',
      type: 'movie',
      cast: '',
      poster: '',
      year: '',
      duration: '',
      rating: '',
      description: '',
      director: ''
    });
    setEditIndex(null);
  };

  const handleAddOrUpdate = () => {
    if (!['movie', 'show'].includes(form.type)) {
      alert('Type must be either "movie" or "show".');
      return;
    }

    const payload = {
      ...form,
      cast: form.cast.split(',').map(c => c.trim()),
      averageRating: Number(form.rating),
      ratingsCount: 1
    };

    const url = editIndex !== null
      ? `http://localhost:8081/media/edit/${form.type}`
      : `http://localhost:8081/media/create/${form.type}`;

    fetch(url, {
      method: editIndex !== null ? "PATCH" : "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("test:test")
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Server error (${res.status})`);
        }

        alert(editIndex !== null ? "Updated successfully." : "Created successfully.");

        if (editIndex !== null) {
          const updated = [...movies];
          updated[editIndex] = { ...payload };
          setMovies(updated);
        } else {
          setMovies([...movies, { ...payload, id: Date.now() }]);
        }
        resetForm();
      })
      .catch(err => {
        console.error(err);
        alert(err.message);
      });
  };

  const handleEdit = (index) => {
    const movie = movies[index];
    setForm({
      title: movie.title || '',
      genre: movie.genre || '',
      type: movie.type || 'movie',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : '',
      poster: movie.poster || '',
      year: movie.year || '',
      duration: movie.duration || '',
      rating: movie.averageRating || '',
      description: movie.description || '',
      director: movie.director || ''
    });
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const title = movies[index].title;

    fetch("http://localhost:8081/media/delete", {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Basic " + btoa("test:test")
      },
      credentials: "include",
      body: JSON.stringify(title)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Delete failed (${res.status})`);
        }
        const updated = [...movies];
        updated.splice(index, 1);
        setMovies(updated);
        resetForm();
        alert("Deleted successfully.");
      })
      .catch((err) => {
        console.error(err);
        alert(err.message);
      });
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div className="form">
        <input name="title" placeholder="Title" value={form.title} onChange={handleInputChange} />
        <input name="genre" placeholder="Genre" value={form.genre} onChange={handleInputChange} />
        <input name="year" type="number" min="0" placeholder="Year" value={form.year} onChange={handleInputChange} />
        <input name="duration" type="number" min="0" placeholder="Duration (minutes)" value={form.duration} onChange={handleInputChange} />
        <input name="rating" type="number" min="0" max="5" step="0.1" placeholder="Rating (0 to 5)" value={form.rating} onChange={handleInputChange} />
        <select name="type" value={form.type} onChange={handleInputChange}>
          <option value="movie">Movie</option>
          <option value="show">Show</option>
        </select>
        <input name="cast" placeholder="Cast (comma-separated)" value={form.cast} onChange={handleInputChange} />
        <input name="director" placeholder="Director" value={form.director} onChange={handleInputChange} />
        <input name="poster" placeholder="Poster URL" value={form.poster} onChange={handleInputChange} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleInputChange} />

        <button onClick={handleAddOrUpdate}>
          {editIndex !== null ? 'Update Media' : 'Add Media'}
        </button>
      </div>

      <div className="movie-list">
        <h3>Media List</h3>
        {movies.length === 0 ? (
          <p>No media available.</p>
        ) : (
          <ul>
            {movies.map((movie, index) => (
              <li key={movie.id || index}>
                <img src={movie.poster} alt={movie.title} style={{ width: '120px' }} />
                <div className="movie-info">
                  <h4>{movie.title} ({movie.year})</h4>
                  <p><strong>Genre:</strong> {movie.genre}</p>
                  <p><strong>Type:</strong> {movie.type}</p>
                  <p><strong>Rating:</strong> {movie.averageRating}</p>
                  <p><strong>Cast:</strong> {(movie.cast || []).join(', ')}</p>
                  <p><strong>Director:</strong> {movie.director}</p>
                  <div className="actions">
                    <button onClick={() => handleEdit(index)}>Edit</button>
                    <button onClick={() => handleDelete(index)} className="delete">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
