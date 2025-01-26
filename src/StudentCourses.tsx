import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import Navbar from './components/Navbar'; // Navbar intégrée
import axios from 'axios';
import { FaBook, FaTrash, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: string;
  course_image?: string; // Chemin de l'image du cours
}

const StudentCourses: React.FC = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [subscribedCourseDetails, setSubscribedCourseDetails] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [subscribedPage, setSubscribedPage] = useState(1);
  const [subscribedCourses, setSubscribedCourses] = useState<number[]>([]);

  const coursesPerPage = 6;
  const subscribedPerPage = 6;

  const studentId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get<Course[]>('http://localhost:5000/api/courses');
        setAvailableCourses(response.data || []);
        setFilteredCourses(response.data || []);
        const uniqueCategories = Array.from(new Set(response.data.map((course) => course.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setMessage('Failed to fetch courses.');
      }
    };

    const fetchSubscribedCourses = async () => {
      try {
        const response = await axios.get<Course[]>(
          `http://localhost:5000/api/student/${studentId}/subscribed-courses`
        );
        setSubscribedCourseDetails(response.data || []);
        setSubscribedCourses(response.data.map((course) => course.id));
        const uniqueSubscribedCategories = Array.from(
          new Set(response.data.map((course) => course.category))
        );
        setSubscribedCategories(uniqueSubscribedCategories);
      } catch (error) {
        console.error('Error fetching subscribed courses:', error);
      }
    };

    fetchCourses();
    if (studentId) {
      fetchSubscribedCourses();
    }
  }, [studentId]);

  const handleSubscribe = async (courseId: number) => {
    try {
      await axios.post('http://localhost:5000/api/course_students', {
        course_id: courseId,
        student_id: studentId,
      });
      setSubscribedCourses((prev) => [...prev, courseId]);
      const courseDetails = availableCourses.find((course) => course.id === courseId);
      if (courseDetails) {
        setSubscribedCourseDetails((prev) => [...prev, courseDetails]);
      }
    } catch (error) {
      console.error('Error subscribing to course:', error);
      alert('Failed to subscribe. Please try again.');
    }
  };

  const handleDeleteSubscription = async (courseId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to unsubscribe from this course?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/course_students/${studentId}/${courseId}`);
      setSubscribedCourses((prev) => prev.filter((id) => id !== courseId));
      setSubscribedCourseDetails((prev) => prev.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Failed to unsubscribe. Please try again.');
    }
  };

  const handleFilterChange = (category: string) => {
    setCurrentPage(1);
    if (category === '') {
      setFilteredCourses(availableCourses);
    } else {
      setFilteredCourses(availableCourses.filter((course) => course.category === category));
    }
  };

  const handleSubscribedFilterChange = (category: string) => {
    setSubscribedPage(1);
    if (category === '') {
      setSubscribedCourseDetails(subscribedCourseDetails);
    } else {
      setSubscribedCourseDetails(
        subscribedCourseDetails.filter((course) => course.category === category)
      );
    }
  };

  const truncateDescription = (description: string, wordLimit: number): string => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const indexOfLastSubscribed = subscribedPage * subscribedPerPage;
  const indexOfFirstSubscribed = indexOfLastSubscribed - subscribedPerPage;
  const currentSubscribedCourses = subscribedCourseDetails.slice(
    indexOfFirstSubscribed,
    indexOfLastSubscribed
  );

  const subscribedTotalPages = Math.ceil(subscribedCourseDetails.length / subscribedPerPage);

  const handleSubscribedNextPage = () => {
    if (subscribedPage < subscribedTotalPages) {
      setSubscribedPage(subscribedPage + 1);
    }
  };

  const handleSubscribedPrevPage = () => {
    if (subscribedPage > 1) {
      setSubscribedPage(subscribedPage - 1);
    }
  };

  return (
    <div className="student-courses-page d-flex flex-column min-vh-100">
      <div className="container mt-3 pt-5">
        {/* Browse Available Courses */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="custom-title">Browse Available Courses</h2>
          <div className="filter-container d-flex align-items-center">
            <label className="me-1">Sort by:</label>
            <select
              className="form-select"
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        {message && <p className="text-danger text-left">{message}</p>}
        <div className="courses-container">
          {currentCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-header d-flex align-items-start">
                <img
                  src={
                    course.course_image
                      ? `http://localhost:5000${course.course_image}`
                      : 'https://via.placeholder.com/100'
                  }
                  alt="Course"
                  style={{
                    width: '100px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '5px',
                    marginRight: '15px',
                  }}
                />
                <div>
                  <h5
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    {course.title}
                  </h5>
                  <span className="category-badge">{course.category.toUpperCase()}</span>
                </div>
              </div>
              <p className="course-description">
                {truncateDescription(course.description, 20)}
              </p>
              <div className="course-info">
                <span>
                  <FaClock className="me-1 text-success" />
                  Duration: {course.duration} hours
                </span>
                <span>
                  <FaMapMarkerAlt className="me-1 text-danger" />
                  Location: {course.location}
                </span>
              </div>
              <div className="d-flex justify-content-end mt-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleSubscribe(course.id)}
                  disabled={subscribedCourses.includes(course.id)}
                >
                  <FaBook className="me-2" />
                  {subscribedCourses.includes(course.id) ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="pagination-container d-flex justify-content-between align-items-center mt-4">
            <button
              className="btn btn-outline-primary"
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline-primary"
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        )}

        {/* Courses you have subscribed to */}
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="custom-title">Courses you have subscribed to:</h2>
            <div className="filter-container d-flex align-items-center">
              <label className="me-2">Sort by:</label>
              <select
                className="form-select"
                onChange={(e) => handleSubscribedFilterChange(e.target.value)}
              >
                <option value="">All</option>
                {subscribedCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="courses-container">
            {currentSubscribedCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header d-flex align-items-start">
                  <img
                    src={
                      course.course_image
                        ? `http://localhost:5000${course.course_image}`
                        : 'https://via.placeholder.com/100'
                    }
                    alt="Course"
                    style={{
                      width: '100px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '5px',
                      marginRight: '15px',
                    }}
                  />
                  <div>
                    <h5
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      {course.title}
                    </h5>
                    <span className="category-badge">{course.category.toUpperCase()}</span>
                  </div>
                </div>
                <p className="course-description">
                  {truncateDescription(course.description, 20)}
                </p>
                <div className="course-info">
                  <span>
                    <FaClock className="me-1 text-success" />
                    Duration: {course.duration} hours
                  </span>
                  <span>
                    <FaMapMarkerAlt className="me-1 text-danger" />
                    Location: {course.location}
                  </span>
                </div>
                <div className="d-flex justify-content-end mt-2">
                  <button
                    className="btn btn-small btn-outline-danger"
                    onClick={() => handleDeleteSubscription(course.id)}
                  >
                    <FaTrash className="me-2" />
                    Unsubscribe
                  </button>
                </div>
              </div>
            ))}
          </div>
          {subscribedTotalPages > 1 && (
            <div className="pagination-container d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-primary"
                disabled={subscribedPage === 1}
                onClick={handleSubscribedPrevPage}
              >
                Previous
              </button>
              <span>
                Page {subscribedPage} of {subscribedTotalPages}
              </span>
              <button
                className="btn btn-outline-primary"
                disabled={subscribedPage === subscribedTotalPages}
                onClick={handleSubscribedNextPage}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <footer className="footer bg-dark text-white mt-auto">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentCourses;
