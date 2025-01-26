import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './styles/styles.css';
import { FaClock, FaMapMarkerAlt, FaUser, FaBook } from 'react-icons/fa';

interface CourseDetails {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: string;
  professor: string;
  course_image?: string;
}

const Course: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get<CourseDetails>(`http://localhost:5000/api/courses/${courseId}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course details:', error);
        setMessage('Failed to load course details. Please try again later.');
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (message) {
    return <p className="text-danger text-center mt-5">{message}</p>;
  }

  if (!course) {
    return <p className="text-center mt-5">Loading course details...</p>;
  }

  return (
    <div className="course-page d-flex flex-column min-vh-100">
      <div className="container mt-4">
        <h1 className="mb-4" style={{ fontFamily:'https://fonts.google.com/specimen/Sora', fontSize:'3.5rem', textAlign: 'left' }}>{course.title}</h1>
        <div className="row">
          {/* Colonne de l'image */}
          <div className="col-md-4" style={{ flexBasis: '30%' }}>
            <img
              src={course.course_image ? `http://localhost:5000${course.course_image}` : 'https://via.placeholder.com/300'}
              alt={course.title}
              className="img-fluid rounded"
              style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }}
            />
          </div>

          {/* Colonne des détails */}
          <div className="col-md-8" style={{ flexBasis: '70%' }}>
            <div className="course-details">
              <p ><strong style={{ fontFamily:'https://fonts.google.com/specimen/Sora', fontSize:'1.5rem', textAlign: 'left' }}>Description:</strong> <br></br>{course.description}</p>
              <p><strong>Category:</strong> {course.category}</p>
              <p>
                <FaClock className="me-2 text-success" />
                <strong>Duration:</strong> {course.duration} hours
              </p>
              <p>
                <FaMapMarkerAlt className="me-2 text-danger" />
                <strong>Location:</strong> {course.location}
              </p>
              <p>
                <FaUser className="me-2 text-primary" />
                <strong>Professor:</strong> {course.professor}
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer bg-dark text-white py-3 mt-auto">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default Course;
