


import React, { useState, useEffect, useMemo , useContext } from 'react';
import { Container, Row, Col, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input, Label, FormGroup, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { BASE_URL } from "../utils/config";
import { AuthContext } from '../context/AuthContext';
import '../styles/admin.css';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

const Admin = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (!user || user.email !== 'goelmedha05@gmail.com') {
      navigate('/login');
      return;
    }
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000); 
    return () => clearInterval(interval);
  }, [user, navigate]);
  const fetchBookings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/booking`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.status === 401) {
        setError("Unauthorized. Please log in as an admin.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
        setError(null);
      } else {
        setError(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setError("Failed to fetch bookings. Please try again later.");
    }
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setModal(true);
  };

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/booking/accept/${id}`, { 
        method: 'PUT',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        setError(data.message || "Failed to accept booking");
      }
    } catch (error) {
      console.error("Failed to accept booking:", error);
      setError("Failed to accept booking. Please try again later.");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/booking/reject/${id}`, { 
        method: 'PUT',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        setError(data.message || "Failed to reject booking");
      }
    } catch (error) {
      console.error("Failed to reject booking:", error);
      setError("Failed to reject booking. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/booking/${id}`, { 
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        setError(data.message || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Failed to delete booking:", error);
      setError("Failed to delete booking. Please try again later.");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => 
      (booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       booking.tourName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || booking.status === filterStatus)
    );
  }, [bookings, searchTerm, filterStatus]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  const bookingsOverTime = {
    labels: bookings.map(booking => new Date(booking.bookAt).toLocaleDateString()),
    datasets: [{
      label: 'Bookings',
      data: bookings.map((_, index) => index + 1),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const guestSizeDistribution = {
    labels: ['1-2', '3-5', '6-10', '10+'],
    datasets: [{
      label: 'Guest Size Distribution',
      data: [
        bookings.filter(b => b.guestSize <= 2).length,
        bookings.filter(b => b.guestSize > 2 && b.guestSize <= 5).length,
        bookings.filter(b => b.guestSize > 5 && b.guestSize <= 10).length,
        bookings.filter(b => b.guestSize > 10).length,
      ],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    }]
  };

  const tourPopularity = {
    labels: [...new Set(bookings.map(b => b.tourName))],
    datasets: [{
      label: 'Tour Popularity',
      data: [...new Set(bookings.map(b => b.tourName))].map(tour => 
        bookings.filter(b => b.tourName === tour).length
      ),
      backgroundColor: 'rgba(75, 192, 192, 0.6)'
    }]
  };

  const bookingStatus = {
    labels: ['Pending', 'Accepted', 'Rejected'],
    datasets: [{
      data: [
        bookings.filter(b => b.status === 'pending').length,
        bookings.filter(b => b.status === 'accepted').length,
        bookings.filter(b => b.status === 'rejected').length,
      ],
      backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384']
    }]
  };

  const revenueByTour = {
    labels: [...new Set(bookings.map(b => b.tourName))],
    datasets: [{
      label: 'Revenue by Tour',
      data: [...new Set(bookings.map(b => b.tourName))].map(tour => 
        bookings.filter(b => b.tourName === tour).reduce((acc, curr) => acc + curr.guestSize * 100, 0) // Assuming $100 per guest
      ),
      backgroundColor: 'rgba(153, 102, 255, 0.6)'
    }]
  };

  const bookingTrend = {
    labels: [...Array(12)].map((_, i) => new Date(0, i).toLocaleString('default', { month: 'short' })),
    datasets: [{
      label: 'Booking Trend',
      data: [...Array(12)].map((_, i) => 
        bookings.filter(b => new Date(b.bookAt).getMonth() === i).length
      ),
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    }]
  };

  return (
    <Container fluid className="admin-dashboard">
      <h1 className="mt-5 mb-4">Admin Dashboard</h1>
      {error && <Alert color="danger">{error}</Alert>}
      
      {bookings.length > 0 ? (
        <>
          
          <Row>
            <Col md={6}>
              <h3>Bookings Over Time</h3>
              <Line data={bookingsOverTime} />
            </Col>
            <Col md={6}>
              <h3>Guest Size Distribution</h3>
              <Pie data={guestSizeDistribution} />
            </Col>
          </Row>
          <Row className="mt-5">
            <Col md={6}>
              <h3>Tour Popularity</h3>
              <Bar data={tourPopularity} />
            </Col>
            <Col md={6}>
              <h3>Booking Status</h3>
              <Doughnut data={bookingStatus} />
            </Col>
          </Row>
          <Row className="mt-5">
            <Col md={6}>
              <h3>Revenue by Tour</h3>
              <Bar data={revenueByTour} />
            </Col>
            <Col md={6}>
              <h3>Booking Trend</h3>
              <Line data={bookingTrend} />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <FormGroup>
                <Label for="search">Search</Label>
                <Input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search by name or tour"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="filterStatus">Filter by Status</Label>
                <Input
                  type="select"
                  name="filterStatus"
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <h2 className="mt-5 mb-4">All Bookings</h2>
          <Table responsive className="booking-table">
            <thead>
              <tr>
                <th>Tour Name</th>
                <th>Full Name</th>
                <th>Guest Size</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.tourName}</td>
                  <td>{booking.fullName}</td>
                  <td>{booking.guestSize}</td>
                  <td>{new Date(booking.bookAt).toLocaleDateString()}</td>
                  <td>{booking.status}</td>
                  <td>
                    <Button color="info" size="sm" onClick={() => handleView(booking)} className="mr-2">View</Button>
                    <Button color="success" size="sm" onClick={() => handleAccept(booking._id)} className="mr-2">Accept</Button>
                    <Button color="warning" size="sm" onClick={() => handleReject(booking._id)} className="mr-2">Reject</Button>
                    <Button color="danger" size="sm" onClick={() => handleDelete(booking._id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination className="d-flex justify-content-center">
            {[...Array(Math.ceil(filteredBookings.length / itemsPerPage))].map((_, index) => (
              <PaginationItem key={index} active={index + 1 === currentPage}>
                <PaginationLink onClick={() => paginate(index + 1)}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </Pagination>
        </>
      ) : (
        <Alert color="info">No bookings available or unable to fetch bookings.</Alert>
      )}

      <Modal isOpen={modal} toggle={() => setModal(!modal)}>
        <ModalHeader toggle={() => setModal(!modal)}>Booking Details</ModalHeader>
        <ModalBody>
          {selectedBooking && (
            <div>
              <p><strong>Tour Name:</strong> {selectedBooking.tourName}</p>
              <p><strong>Full Name:</strong> {selectedBooking.fullName}</p>
              <p><strong>Email:</strong> {selectedBooking.userEmail}</p>
              <p><strong>Phone:</strong> {selectedBooking.phone}</p>
              <p><strong>Guest Size:</strong> {selectedBooking.guestSize}</p>
              <p><strong>Booking Date:</strong> {new Date(selectedBooking.bookAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModal(!modal)}>Close</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default Admin;
