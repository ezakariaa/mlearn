import React, { useEffect, useState } from 'react';
import './styles/styles.css';
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
    <div className="container mt-4" style={{ fontSize: '14px' }}>
      <h1 className="text-center text-primary mb-4" style={{ fontSize: '20px' }}>
        Edit Profile
      </h1>
      <form
        className="shadow p-4 bg-white rounded"
        onSubmit={handleSubmit}
        style={{ maxWidth: '1000px', margin: '0 auto' }}
      >
        <div className="row">
          {/* Section: Profile Picture */}
          <div className="col-md-3 text-center">
            <h5 className="text-primary" style={{ fontSize: '14px' }}>Profile Picture</h5>
            {typeof formData.profile_picture === 'string' && formData.profile_picture && (
              <img
                src={`http://localhost:5000${formData.profile_picture}`}
                alt="Current Profile"
                className="rounded-circle mb-3"
                style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid #007bff' }}
              />
            )}
            <label htmlFor="profile_picture" className="btn btn-primary btn-sm mt-2">
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

          {/* Section: Personal Information */}
          <div className="col-md-9">
            <h5 className="text-primary" style={{ fontSize: '14px' }}>Personal Information</h5>
            <div className="row">
              <div className="col-md-6 mb-2">
                <label htmlFor="name" className="form-label" style={{ fontSize: '12px' }}>
                  Full Name:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ fontSize: '12px' }}
                />
              </div>
              <div className="col-md-6 mb-2">
                <label htmlFor="email" className="form-label" style={{ fontSize: '12px' }}>
                  Email (read-only):
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  style={{ fontSize: '12px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Presentation */}
        <div className="mb-3 mt-3">
          <h5 className="text-primary" style={{ fontSize: '14px' }}>Presentation</h5>
          <textarea
            className="form-control"
            id="presentation"
            name="presentation"
            rows={3}
            value={formData.presentation}
            onChange={handleInputChange}
            style={{ fontSize: '12px' }}
          />
        </div>

        {/* Section: Interests */}
        <div className="mb-3">
          <h5 className="text-primary" style={{ fontSize: '14px' }}>Interests</h5>
          <select
            multiple
            className="form-control"
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleInterestChange}
            style={{ fontSize: '12px' }}
          >
            {interestOptions.map((interest) => (
              <option key={interest} value={interest}>
                {interest}
              </option>
            ))}
          </select>
        </div>

        {/* Section: Address */}
        <div className="mb-3">
          <h5 className="text-primary" style={{ fontSize: '14px' }}>Address</h5>
          <div className="row">
            <div className="col-md-6 mb-2">
              <label htmlFor="city" className="form-label" style={{ fontSize: '12px' }}>
                City:
              </label>
              <input
                type="text"
                className="form-control"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                style={{ fontSize: '12px' }}
              />
            </div>
            <div className="col-md-6 mb-2">
              <label htmlFor="country" className="form-label" style={{ fontSize: '12px' }}>
                Country:
              </label>
              <input
                type="text"
                className="form-control"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                style={{ fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting} style={{ fontSize: '14px' }}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Footer Section */}
      <footer className="footer bg-dark text-white py-2 mt-3 text-center rounded" style={{ fontSize: '12px' }}>
        <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
      </footer>
    </div>
  );
};

export default EditProfile;
