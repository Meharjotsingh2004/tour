import React from "react";
import { Container, Row, Col } from "reactstrap";
import "../styles/about.css";

const About = () => {
    return (
        <section className="about-section">
            <Container>
                <Row>
                    <Col lg="12">
                        <div className="about-content">
                            <h2>About Us</h2>
                            <p>
                                Welcome to our travel agency! We are dedicated to providing
                                unforgettable travel experiences for our clients. Whether you
                                are looking for a relaxing beach vacation, an adventurous
                                mountain trek, or a cultural city tour, we have something for
                                everyone.
                            </p>
                            <p>
                                Our mission is to make your travel dreams come true by offering
                                personalized tour packages, exceptional customer service, and
                                unique travel experiences. We believe that travel is not just
                                about visiting new places, but also about creating lasting
                                memories and connecting with different cultures.
                            </p>
                            <p>
                                Our team of experienced travel experts works tirelessly to
                                curate the best tours and travel packages for you. We partner
                                with trusted local guides and service providers to ensure that
                                you have an authentic and safe travel experience. From the
                                moment you contact us to the moment you return home, we are here
                                to assist you every step of the way.
                            </p>
                            <p>
                                Thank you for choosing our travel agency. We look forward to
                                helping you explore the world and create unforgettable memories.
                            </p>
                            <h3>Why Choose Us?</h3>
                            <ul>
                                <li>Customized tour packages tailored to your preferences</li>
                                <li>Experienced and knowledgeable travel guides</li>
                                <li>Exceptional customer service and support</li>
                                <li>Competitive pricing and value for money</li>
                                <li>Commitment to sustainable and responsible tourism</li>
                            </ul>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default About;
