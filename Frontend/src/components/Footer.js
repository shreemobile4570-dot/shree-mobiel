import React from "react";
import { Link } from "react-router-dom";
import { BsInstagram } from "react-icons/bs";

const Footer = () => {
  return (
    <>
      {/* Newsletter Section */}
      {/* <footer className="premium-newsletter">
        <div className="container-xxl">
          <div className="row align-items-center">
            <div className="col-5">
              <div className="newsletter-content">
                <div className="newsletter-icon">
                  <img src={newsletter} alt="newsletter" />
                </div>
                <div className="newsletter-text">
                  <h2>Join Our Newsletter</h2>
                  <p>Subscribe to receive updates, exclusive offers, and style tips</p>
                </div>
              </div>
            </div>
            <div className="col-7">
              <form className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </footer> */}

      {/* Main Footer */}
      <footer className="premium-footer">
        <div className="container-xxl">
          <div className="row">
            {/* Brand Column */}
            <div className="col-lg-3 col-md-6 col-12">
              <div className="footer-brand-col">
                <Link to="/" className="footer-brand">
                  <span className="brand-name">Shree Mobile</span>
                  <span className="brand-sub">wholesale</span>
                </Link>
                <p className="brand-desc">
                  Wholesale mobile spare parts and accessories for shops, repair centers, and resellers.
                </p>
                <div className="social-links">
                  <a
                    href="https://www.instagram.com/"
                    className="social-link"
                    aria-label="Instagram"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <BsInstagram />
                  </a>
               
                  
                  
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-3 col-6">
              <div className="footer-links-col">
                <h4>Shop</h4>
                <ul className="footer-links">
                  <li><Link to="/new-arrivals">New Arrivals</Link></li>
                  <li><Link to="/product">Best Sellers</Link></li>
                  <li><Link to="/accessories">Accessories</Link></li>
                  <li><Link to="/spare-parts">Spare Parts</Link></li>
                  <li><Link to="/covers">Covers</Link></li>
                </ul>
              </div>
            </div>

            {/* Information */}
            <div className="col-lg-2 col-md-3 col-6">
              <div className="footer-links-col">
                <h4>Information</h4>
                <ul className="footer-links">
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                  <li><Link to="/blogs">Blog</Link></li>
                  <li><Link to="/faq">FAQ</Link></li>
                  <li><Link to="/career">Careers</Link></li>
                </ul>
              </div>
            </div>

            {/* Customer Service */}
            <div className="col-lg-2 col-md-3 col-6">
              <div className="footer-links-col">
                <h4>Service</h4>
                <ul className="footer-links">
                  <li><Link to="/shipping-policy">Shipping Info</Link></li>
                  <li><Link to="/return-policy">Returns</Link></li>
                  <li><Link to="/my-orders">Track Order</Link></li>
                  <li><Link to="/size-guide">Size Guide</Link></li>
                  <li><Link to="/care">Product Care</Link></li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-lg-3 col-md-3 col-12">
              <div className="footer-contact-col">
                <h4>Contact Us</h4>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-icon">◈</span>
                    <div>
                      <p className="contact-label">Address</p>
                      <p className="contact-value">
                        Daiict College, Reliance Cross Rd,<br />
                        Gandhinagar, Gujarat 382007
                      </p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">◈</span>
                    <div>
                      <p className="contact-label">Phone</p>
                      <a href="tel:+91 8788790703" className="contact-value">
                        +91 8788790703
                      </a>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">◈</span>
                    <div>
                      <p className="contact-label">Email</p>
                      <a href="mailto:rivaacollctn@gmail.com" className="contact-value">
                        rivaacollctn@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Bar */}
      <footer className="premium-footer-bottom">
        <div className="container-xxl">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="copyright">
                © {new Date().getFullYear()} Shree Mobile. All rights reserved.
              </p>
            </div>
            <div className="col-md-6">
              <div className="payment-methods">
                <span>We Accept</span>
                <div className="payment-icons">
                  <span className="payment-icon">Visa</span>
                  <span className="payment-icon">Master</span>
                  <span className="payment-icon">UPI</span>
                  <span className="payment-icon">Pay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
