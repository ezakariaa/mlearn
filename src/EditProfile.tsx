import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import Navbar from './components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface EditProfileForm {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  profile_picture: string | File;
  presentation: string;
  interests: string[];
  date_of_birth: string;
  role: string;
}

const interestOptions = [
  'Technology',
  'Sports',
  'Music',
  'Travel',
  'Education',
  'Gaming',
  'Cooking',
  'Reading',
];

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState<EditProfileForm>({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    profile_picture: '',
    presentation: '',
    interests: [],
    date_of_birth: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const userEmail = localStorage.getItem('email');
      try {
        const response = await axios.get(`http://localhost:5000/api/users/profile?email=${userEmail}`);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
          city: response.data.city || '',
          country: response.data.country || '',
          profile_picture: response.data.profile_picture || '',
          presentation: response.data.presentation || '',
          interests: response.data.interests ? response.data.interests.split(',') : [],
          date_of_birth: response.data.date_of_birth || '',
          role: response.data.role || '',
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        profile_picture: files[0],
      }));
    }
  };

  const handleInterestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({
      ...prev,
      interests: selectedOptions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'interests') {
        formDataToSend.append(key, (value as string[]).join(','));
      } else if (key === 'profile_picture' && typeof value === 'string') {
        // Skip adding the profile picture if it's a string (already exists on server)
      } else {
        formDataToSend.append(key, value as string | Blob);
      }
    });

    try {
      const response = await axios.put('http://localhost:5000/api/users/update', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message || 'Profile updated successfully!');
      navigate('/student-profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-5">Loading profile...</p>;
  }

  return (
    <>
      <div className="container mt-5">
        <h1 className="text-center text-primary mb-4">Edit Profile</h1>
        <form className="shadow-lg p-4 bg-white rounded" onSubmit={handleSubmit}>
          <div className="row align-items-start">
            <div className="col-md-3 text-center">
              <h5 className="text-primary text-start">Profile Picture</h5>
              {typeof formData.profile_picture === 'string' && formData.profile_picture && (
                <img
                  src={`http://localhost:5000${formData.profile_picture}`}
                  alt="Profile"
                  className="rounded-circle mb-2 border border-primary"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              )}
              <label className="btn btn-primary btn-sm mt-2" style={{ fontSize: '14px' }}>
                Choose File
                <input
                  type="file"
                  id="profile_picture"
                  name="profile_picture"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div className="col-md-9">
              <h5 className="text-primary">Personal Information</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="date_of_birth" className="form-label">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="role"
                    name="role"
                    value={formData.role}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="mb-3">
            <label htmlFor="presentation" className="form-label text-primary">
              Presentation
            </label>
            <textarea
              className="form-control"
              id="presentation"
              name="presentation"
              rows={4}
              value={formData.presentation}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="interests" className="form-label text-primary">
              Interests
            </label>
            <select
              multiple
              className="form-select"
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleInterestChange}
            >
              {interestOptions.map((interest) => (
                <option key={interest} value={interest}>
                  {interest}
                </option>
              ))}
            </select>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="city" className="form-label text-primary">
                City
              </label>
              <input
                type="text"
                className="form-control"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="country" className="form-label text-primary">
                Country
              </label>
              <input
                type="text"
                className="form-control"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        <footer className="footer bg-dark text-white py-2 mt-3 text-center rounded" style={{ fontSize: '12px' }}>
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </footer>
      </div>
    </>
  );
};

export default EditProfile;
