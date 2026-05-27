import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import wishlist from "../images/wishlist.svg";
import user from "../images/user.svg";
import cart from "../images/cart.svg";
import menu from "../images/menu.svg";
import shreeLogo from "../images/shreelogo.jpeg";
import { useDispatch, useSelector } from "react-redux";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { getAProduct } from "../features/products/productSlilce";
import { getuserProductWishlist, getUserCart } from "../features/user/userSlice";
import { getAuthConfig } from "../utils/axiosConfig";

const Header = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state?.auth?.cartProducts);
  const wishlistState = useSelector((state) => state?.auth?.wishlist?.wishlist);
  const authState = useSelector((state) => state?.auth);
  const [total, setTotal] = useState(null);
  const [paginate] = useState(true);
  const productState = useSelector((state) => state?.product?.product);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authState?.user) {
      if (!cartState) dispatch(getUserCart(getAuthConfig()));
      if (!wishlistState) dispatch(getuserProductWishlist());
    } else {
      setTotal(0);
    }
    
    // Scroll listener for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [authState?.user, cartState, dispatch, wishlistState]);

  const [productOpt, setProductOpt] = useState([]);
  useEffect(() => {
    let sum = 0;
    for (let index = 0; index < cartState?.length; index++) {
      sum = sum + Number(cartState[index].quantity) * cartState[index].price;
    }
    setTotal(sum);
  }, [cartState]);

  useEffect(() => {
    let data = [];
    for (let index = 0; index < productState?.length; index++) {
      const element = productState[index];
      data.push({ id: index, prod: element?._id, name: element?.title });
    }
    setProductOpt(data);
  }, [productState]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Info Bar */}
      <div className={`premium-header ${isScrolled ? "scrolled" : ""}`}>
        {/* <div className="header-top-bar">
          <div className="container-xxl">
            <div className="row align-items-center">
              <div className="col-6">
                <p className="top-bar-text">
                  <span className="highlight">Free Shipping</span> on orders above ₹999
                </p>
              </div>
              <div className="col-6">
                <div className="top-bar-right">
                  <p className="top-bar-text">
                    Need Help? 
                    <a className="contact-link" href="tel:+91 8788790703">
                      +91 8788790703
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Main Header */}
        <header className="header-main">
          <div className="container-xxl">
            <div className="header-main-row">
              {/* Logo */}
              <div className="header-brand-col">
                <Link className="brand-logo" to="/" onClick={closeMobileMenu}>
                  <img className="brand-logo-img" src={shreeLogo} alt="Shree Mobiles logo" />
                  <span className="logo-text">Shree Mobiles</span>
                </Link>
              </div>

              {/* Search Bar */}
              <div className="header-search-col">
                <div className="premium-search">
                  <Typeahead
                    id="pagination-example"
                    onPaginate={() => {}}
                    onChange={(selected) => {
                      navigate(`/product/${selected[0]?.prod}`);
                      dispatch(getAProduct(selected[0]?.prod));
                    }}
                    options={productOpt}
                    paginate={paginate}
                    labelKey={"name"}
                    placeholder="Search for Products..."
                    className="search-input"
                  />
                  <button className="search-btn">
                    <BsSearch className="fs-6" />
                  </button>
                </div>
              </div>

              {/* Action Icons */}
              <div className="header-actions-col">
                <div className="header-actions">
                  <button
                    className="mobile-header-menu-button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-expanded={mobileMenuOpen}
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    type="button"
                  >
                    <img src={menu} alt="" />
                  </button>

                  {/* <Link to="/compare-product" className="action-item">
                    <div className="icon-wrapper">
                      <img src={compare} alt="compare" />
                    </div>
                    <div className="action-label">
                      <span className="action-title">Compare</span>
                      <span className="action-sub">Products</span>
                    </div>
                  </Link> */}
                  
                  <Link to="/wishlist" className="action-item">
                    <div className="icon-wrapper">
                      <img src={wishlist} alt="wishlist" />
                      {wishlistState?.length > 0 && (
                        <span className="badge-count">{wishlistState.length}</span>
                      )}
                    </div>
                    <div className="action-label">
                      <span className="action-title">Wishlist</span>
                      <span className="action-sub">Items</span>
                    </div>
                  </Link>
                  
                  {authState?.user !== null ? (
                    <div className="user-dropdown">
                      <Link to="/my-profile" className="action-item">
                        <div className="icon-wrapper user-icon">
                          <img src={user} alt="user" />
                        </div>
                        <div className="action-label">
                          <span className="action-title">Welcome, {authState?.user?.firstname}</span>
                          <span className="action-sub">Account</span>
                        </div>
                      </Link>
                      <div className="dropdown-menu">
                        <Link to="/my-profile" className="dropdown-item">
                          My Profile
                        </Link>
                        <Link to="/my-orders" className="dropdown-item">
                          My Orders
                        </Link>
                        <button onClick={handleLogout} className="dropdown-item logout-item">
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link to="/login" className="action-item">
                      <div className="icon-wrapper user-icon">
                        <img src={user} alt="user" />
                      </div>
                      <div className="action-label">
                        <span className="action-title">Sign In</span>
                        <span className="action-sub">Account</span>
                      </div>
                    </Link>
                  )}
                  
                  <Link to="/cart" className="action-item cart-item">
                    <div className="icon-wrapper">
                      <img src={cart} alt="cart" />
                      {cartState?.length > 0 && (
                        <span className="badge-count">{cartState?.length}</span>
                      )}
                    </div>
                    <div className="action-label">
                      <span className="action-title">₹{total || 0}</span>
                      <span className="action-sub">Cart</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Bar */}
        <nav className="header-nav">
          <div className="container-xxl">
            <div className="nav-content">
              <button 
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                <img src={menu} alt="menu" />
              </button>
              
              <ul className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
                <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
                <li><Link to="/product" onClick={closeMobileMenu}>Shop</Link></li>
                <li><Link to="/new-arrivals" onClick={closeMobileMenu}>New Arrivals</Link></li>
                <li><Link to="/accessories" onClick={closeMobileMenu}>Accessories</Link></li>
                <li><Link to="/spare-parts" onClick={closeMobileMenu}>Spare Parts</Link></li>
                <li><Link to="/covers" onClick={closeMobileMenu}>Covers</Link></li>
                <li><Link to="/compatibility" onClick={closeMobileMenu}>Compatibility</Link></li>
                <li><Link to="/contact" onClick={closeMobileMenu}>Contact</Link></li>
                <li><Link to="/my-orders" onClick={closeMobileMenu}>My Orders</Link></li>
              </ul>

              
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
