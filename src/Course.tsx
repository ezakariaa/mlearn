import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './styles/styles.css';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';

interface CourseDetails {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: string;
  professor: string;
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
      <div className="container mt-3 pt-3">
        <h2 className="mb-4 text-primary">{course.title}</h2>
        <div className="course-details">
          <p><strong>Description:</strong> {course.description}</p>
          <p><strong>Category:</strong> {course.category}</p>
          <p>
            <FaClock className="me-2 text-success" />
            <strong>Duration:</strong> {course.duration} hours
          </p>
          <p>
            <FaMapMarkerAlt className="me-2 text-danger" />
            <strong>Location:</strong> {course.location}
          </p>
          <p><strong>Professor:</strong> {course.professor}</p>
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
