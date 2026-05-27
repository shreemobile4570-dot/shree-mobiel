import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import wishlist from "../images/wishlist.svg";
import user from "../images/user.svg";
import cart from "../images/cart.svg";
import { useDispatch, useSelector } from "react-redux";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { getAProduct } from "../features/products/productSlilce";
import { getuserProductWishlist, getUserCart } from "../features/user/userSlice";
import { getAuthConfig } from "../utils/axiosConfig";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/product", label: "Shop" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/accessories", label: "Accessories" },
  { to: "/spare-parts", label: "Spare Parts" },
  { to: "/covers", label: "Covers" },
  { to: "/compatibility", label: "Compatibility" },
  { to: "/contact", label: "Contact" },
  { to: "/my-orders", label: "My Orders" },
];

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartState = useSelector((state) => state?.auth?.cartProducts);
  const wishlistState = useSelector((state) => state?.auth?.wishlist?.wishlist);
  const authState = useSelector((state) => state?.auth);
  const productState = useSelector((state) => state?.product?.product);
  const [total, setTotal] = useState(0);
  const [productOpt, setProductOpt] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paginate] = useState(true);
  const headerBarRef = useRef(null);

  useEffect(() => {
    const setNavbarHeight = () => {
      if (!headerBarRef.current) return;

      const height = Math.ceil(headerBarRef.current.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--navbar-height", `${height}px`);
    };

    setNavbarHeight();
    window.addEventListener("resize", setNavbarHeight);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(setNavbarHeight)
        : null;

    if (resizeObserver && headerBarRef.current) {
      resizeObserver.observe(headerBarRef.current);
    }

    return () => {
      window.removeEventListener("resize", setNavbarHeight);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (authState?.user) {
      if (!cartState) dispatch(getUserCart(getAuthConfig()));
      if (!wishlistState) dispatch(getuserProductWishlist());
    } else {
      setTotal(0);
    }
  }, [authState?.user, cartState, dispatch, wishlistState]);

  useEffect(() => {
    const sum = (cartState || []).reduce(
      (amount, item) => amount + Number(item.quantity || 0) * Number(item.price || 0),
      0
    );
    setTotal(sum);
  }, [cartState]);

  useEffect(() => {
    const options = (productState || []).map((item, index) => ({
      id: index,
      prod: item?._id,
      name: item?.title,
    }));
    setProductOpt(options);
  }, [productState]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleProductSearch = (selected) => {
    const productId = selected?.[0]?.prod;
    if (!productId) return;

    navigate(`/product/${productId}`);
    dispatch(getAProduct(productId));
    closeMobileMenu();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const searchBox = (id) => (
    <div className="site-search">
      <BsSearch className="site-search-icon" />
      <Typeahead
        id={id}
        onChange={handleProductSearch}
        onPaginate={() => {}}
        options={productOpt}
        paginate={paginate}
        labelKey="name"
        placeholder="Search products"
        className="site-search-typeahead"
      />
    </div>
  );

  return (
    <header className="site-header">
      <div className="site-header-inner" ref={headerBarRef}>
        <Link className="site-brand" to="/" onClick={closeMobileMenu}>
          <span className="site-brand-mark">श्री</span>
          <span>Shree Mobiles</span>
        </Link>

        <nav className="site-nav-desktop" aria-label="Primary navigation">
          {navLinks.slice(0, 7).map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-search-desktop">{searchBox("desktop-product-search")}</div>
        <div className="site-search-mobile-inline">
          {searchBox("mobile-inline-product-search")}
        </div>

        <div className="site-actions">
          <Link className="site-icon-link" to="/wishlist" aria-label="Wishlist">
            <img src={wishlist} alt="" />
            {wishlistState?.length > 0 && <span>{wishlistState.length}</span>}
          </Link>

          {authState?.user ? (
            <div className="site-account">
              <Link className="site-icon-link" to="/my-profile" aria-label="Account">
                <img src={user} alt="" />
              </Link>
              <div className="site-account-menu">
                <Link to="/my-profile">My Profile</Link>
                <Link to="/my-orders">My Orders</Link>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link className="site-icon-link" to="/login" aria-label="Login">
              <img src={user} alt="" />
            </Link>
          )}

          <Link className="site-icon-link site-cart-link" to="/cart" aria-label="Cart">
            <img src={cart} alt="" />
            {cartState?.length > 0 && <span>{cartState.length}</span>}
          </Link>

          <button
            className="site-menu-button"
            type="button"
            aria-controls="site-mobile-panel"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div
        id="site-mobile-panel"
        className={`site-mobile-panel ${mobileMenuOpen ? "open" : ""}`}
      >
        <div className="site-search-mobile">{searchBox("mobile-product-search")}</div>
        <nav className="site-nav-mobile" aria-label="Mobile navigation">
          {navLinks.map((item) => (
            <Link key={item.to} to={item.to} onClick={closeMobileMenu}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-mobile-total">Cart total: Rs. {total || 0}</div>
      </div>
    </header>
  );
};

export default Header;
