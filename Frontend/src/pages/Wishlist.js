import React, { useEffect } from "react";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist } from "../features/products/productSlilce";
import { getuserProductWishlist } from "../features/user/userSlice";
import { Link } from "react-router-dom";
import { getRolePrice } from "../utils/price";
const Wishlist = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getuserProductWishlist());
  }, [dispatch]);

  const wishlistState = useSelector((state) => state?.auth?.wishlist?.wishlist);
  const removeFromWishlist = async (id) => {
    await dispatch(addToWishlist(id));
    dispatch(getuserProductWishlist());
  };
  return (
    <>
      <Meta title={"Wishlist"} />
      <BreadCrumb title="Wishlist" />
      <Container class1="wishlist-wrapper home-wrapper-2 py-4">
        <div className="wishlist-grid">
          {wishlistState && wishlistState.length === 0 && (
            <div className="wishlist-empty">No wishlist products yet.</div>
          )}
          {wishlistState &&
            wishlistState?.map((item, index) => {
              return (
                <div className="wishlist-card position-relative" key={index}>
                    <button
                      type="button"
                      onClick={() => {
                        removeFromWishlist(item?._id);
                      }}
                      className="wishlist-remove position-absolute"
                      aria-label={`Remove ${item?.title || "product"} from wishlist`}
                    >
                      <img src="images/cross.svg" alt="" />
                    </button>
                    <Link
                      to={`/product/${item?._id}`}
                      className="wishlist-card-link"
                    >
                      <div className="wishlist-card-image">
                      <img
                        src={
                          item?.images?.[0]?.url
                            ? item?.images[0].url
                            : "images/watch.jpg"
                        }
                        alt={item?.title || "wishlist product"}
                      />
                      </div>
                      <div className="wishlist-card-copy">
                      <h5 className="title">{item?.title}</h5>
                      <h6 className="price">Rs. {getRolePrice(item)}</h6>
                      </div>
                    </Link>
                </div>
              );
            })}
        </div>
      </Container>
    </>
  );
};

export default Wishlist;
