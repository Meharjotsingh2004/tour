


import React, { useState, useContext, useEffect } from "react";
import "./booking.css";
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";

const Booking = ({ tour, avgRating }) => {
  const { price, reviews, title } = tour;
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const [booking, setBooking] = useState({
    userId: user && user._id,
    userEmail: user && user.email,
    tourName: title,
    fullName: "",
    phone: "",
    guestSize: 1,
    bookAt: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    let updatedValue = value;

    if (id === 'phone') {
     
      updatedValue = value.slice(0, 10);
    }

    setBooking((prev) => ({ ...prev, [id]: updatedValue }));
  };

  useEffect(() => {
    
    const { fullName, phone, bookAt, guestSize } = booking;
    const isValid = fullName.trim() !== "" && 
                    phone.trim() !== "" && 
                    bookAt !== "" && 
                    guestSize > 0 &&
                    phone.length === 10;
    setIsFormValid(isValid);
  }, [booking]);

  const serviceFee = 10;
  const totalAmount = Number(price) * Number(booking.guestSize) + Number(serviceFee);

  useEffect(() => {
    const loadRazorpay = async () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    };
    loadRazorpay();
  }, []);

  const handleClick = async (e) => {
    e.preventDefault();

    if (!user || user === undefined || user === null) {
      return alert('Please sign in');
    }

    if (!isFormValid) {
      return alert('Please fill all the required fields correctly');
    }

    try {
      
      const orderRes = await fetch(`${BASE_URL}/booking/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), 
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const options = {
        key: 'rzp_test_jnFll4vBKCwPho',
        amount: orderData.order.amount, 
        currency: orderData.order.currency,
        name: 'Your Company Name',
        description: `Booking for ${booking.tourName}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            
            const verifyRes = await fetch(`${BASE_URL}/booking/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...booking,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              alert('Booking successful!');
              navigate("/thank-you");
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            alert(`Payment failed: ${error.message}`);
          }
        },
        prefill: {
          name: booking.fullName,
          email: booking.userEmail,
          contact: booking.phone,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="booking">
      <div className="booking_top d-flex align-items-center justify-content-between">
        <h3>
          ${price} <span>/per person</span>
        </h3>
        <span className="tour_rating d-flex align-items-center">
          <i className="ri-star-fill"></i>
          {avgRating === 0 ? null : avgRating} ({reviews?.length})
        </span>
      </div>

      <div className="booking_form">
        <h5>Information</h5>
        <Form className="booking_info-form" onSubmit={handleClick}>
          <FormGroup>
            <input
              type="text"
              placeholder="Full name"
              id="fullName"
              required
              onChange={handleChange}
              value={booking.fullName}
            />
          </FormGroup>
          <FormGroup>
            <input
              type="tel"
              placeholder="Phone"
              id="phone"
              required
              onChange={handleChange}
              value={booking.phone}
              maxLength={10}
            />
          </FormGroup>
          <FormGroup className="d-flex align-items-center gap-3">
            <input
              type="date"
              placeholder=""
              id="bookAt"
              required
              onChange={handleChange}
              value={booking.bookAt}
            />
            <input
              type="number"
              placeholder="Guest"
              id="guestSize"
              required
              onChange={handleChange}
              value={booking.guestSize}
              min={1}
            />
          </FormGroup>
        </Form>
      </div>

      <div className="booking_bottom">
        <ListGroup>
          <ListGroupItem className="border-0 px-0">
            <h5 className="d-flex align-items-center gap-1">
              ${price} <i className="ri-close-line"></i> 1 person
            </h5>
            <span>${price}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0">
            <h5>Service charge</h5>
            <span>${serviceFee}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0 total">
            <h5>Total</h5>
            <span>${totalAmount}</span>
          </ListGroupItem>
        </ListGroup>
        <Button 
          className="btn primary_btn w-100 mt-4 book_btn" 
          onClick={handleClick}
          disabled={!isFormValid}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default Booking;

