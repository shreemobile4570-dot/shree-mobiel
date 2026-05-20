import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// import wishlist from "../images/wishlist.svg";
// import watch from "../images/watch.jpg";
// import watch2 from "../images/watch-1.avif";
// import addcart from "../images/add-cart.svg";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist } from "../features/products/productSlilce";
import { getuserProductWishlist } from "../features/user/userSlice";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useState } from "react";
import { getRolePrice } from "../utils/price";

const ProductCard = (props) => {
  const navigate = useNavigate();
  const { grid, data } = props;
  const dispatch = useDispatch();

  const wishlistState = useSelector((state) => state?.auth?.wishlist?.wishlist);

  const [wishlist, setWishlist] = useState(wishlistState || []);

  useEffect(() => {
    setWishlist(wishlistState || []);
  }, [wishlistState]);

  const isProductInWishlist = (productId) => {
    return wishlist?.some((item) => item._id === productId);
  };

  const addToWish = async (productId) => {
    if (isProductInWishlist(productId)) {
      await dispatch(addToWishlist(productId));

      const updatedWishlist = wishlist.filter((item) => item._id !== productId);
      setWishlist(updatedWishlist);
    } else {
      await dispatch(addToWishlist(productId));

      const product = data.find((item) => item._id === productId);
      setWishlist([...wishlist, product]);
    }
    dispatch(getuserProductWishlist());
  };

  return (
  <>
    {data?.map((item, index) => {
      const isWishlist = isProductInWishlist(item._id);
      const displayPrice = getRolePrice(item);

      return (
        <div
          key={index}
          className={grid ? `gr-${grid}` : "col-3"}
        >
          <div className="el-wrapper position-relative">

            {/* Wishlist Icon (kept from your logic) */}
            <div className="position-absolute" style={{ top: "10px", right: "10px", zIndex: 2 }}>
              <button
                className="border-0 bg-transparent"
                onClick={() => addToWish(item?._id)}
              >
                {isWishlist ? (
                  <AiFillHeart className="fs-5 text-danger" />
                ) : (
                  <AiOutlineHeart className="fs-5" />
                )}
              </button>
            </div>

            {/* TOP SECTION */}
            <div className="box-up">
              <img
                className="img"
                src={item?.images[0]?.url}
                alt="product"
                onClick={() => navigate("/product/" + item?._id)}
              />

              <div className="img-info">
                <div className="info-inner">
                  <span className="p-name">
                    {grid === 12 || grid === 6
                      ? item?.title
                      : item?.title?.substr(0, 40) + "..."}
                  </span>

                  <span className="p-company">{item?.brand}</span>
                </div>

                {/* Optional (static or dynamic sizes) */}
                <div className="a-size">
                  Available sizes :
                  <span className="size"> S , M , L , XL</span>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="box-down">
              <div className="h-bg">
                <div className="h-bg-inner"></div>
              </div>

              <button
                className="cart border-0 bg-transparent"
                onClick={() => navigate("/product/" + item?._id)}
              >
                <span className="price">₹{displayPrice}</span>

                <span className="add-to-cart">
                  <span className="txt">View Product</span>
                </span>
              </button>
            </div>

          </div>
        </div>
      );
    })}
  </>
);}

export default ProductCard;
