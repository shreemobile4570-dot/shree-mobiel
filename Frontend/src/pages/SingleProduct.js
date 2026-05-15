import React, { useEffect, useMemo, useState } from "react";
import ReactStars from "react-rating-stars-component";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import ProductCard from "../components/ProductCard";
import Color from "../components/Color";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import {
  addRating,
  getAProduct,
  getAllProducts,
} from "../features/products/productSlilce";
import { toast } from "react-toastify";
import { addProdToCart, getuserProductWishlist, getUserCart } from "../features/user/userSlice";
import { getStoredCustomer } from "../utils/axiosConfig";
import LoadingOverlay from "../components/LoadingOverlay";

const SingleProduct = () => {
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const getProductId = location.pathname.split("/")[2];
  const dispatch = useDispatch();
  const productState = useSelector((state) => state?.product?.singleproduct);
  const productsState = useSelector((state) => state?.product?.product);
  const cartState = useSelector((state) => state?.auth?.cartProducts);
  const authLoading = useSelector((state) => state?.auth?.isLoading);
  const productLoading = useSelector((state) => state?.product?.isLoading);
  const isLoggedIn = Boolean(getStoredCustomer()?.token);
  const productImages = useMemo(() => productState?.images || [], [productState?.images]);
  const reviewCount = productState?.ratings?.length || 0;
  const averageRating = reviewCount
    ? productState.ratings.reduce(
        (sum, item) => sum + Number(item?.star || 0),
        0
      ) / reviewCount
    : Number(productState?.totalrating || 0);
  const fallbackImage =
    "https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=900";
  const [selectedImage, setSelectedImage] = useState(fallbackImage);
  const isCurrentProductLoaded = productState?._id === getProductId;

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "object") return value?._id || "";
    return String(value);
  };

  useEffect(() => {
    dispatch(getAProduct(getProductId));
    const timer = setTimeout(() => {
      dispatch(
        getAllProducts({
          tag: "popular",
          limit: 8,
          fields: "title,brand,price,images,tags",
        })
      );
    }, 250);

    if (isLoggedIn) {
      dispatch(getUserCart());
      dispatch(getuserProductWishlist());
    }

    return () => clearTimeout(timer);
  }, [dispatch, getProductId, isLoggedIn]);

  useEffect(() => {
    setSelectedImage(productState?.images?.[0]?.url || fallbackImage);
    setColor(null);
    setSize(null);
  }, [productState, fallbackImage]);

  useEffect(() => {
    if (!color) return;

    const matchingImage = productImages.find(
      (image) => normalizeId(image?.color) === color
    );

    if (matchingImage?.url) {
      setSelectedImage(matchingImage.url);
    }
  }, [color, productImages]);

  useEffect(() => {
    setAlreadyAdded(false);
    for (let index = 0; index < cartState?.length; index++) {
      if (getProductId === cartState[index]?.productId?._id) {
        setAlreadyAdded(true);
      }
    }
  }, [cartState, getProductId]);

  const uploadCart = async () => {
    if (color === null) {
      toast.error("Please choose Color");
    } else if (productState?.size?.length && size === null) {
      toast.error("Please choose Size");
    } else {
      await dispatch(
        addProdToCart({
          productId: productState?._id,
          quantity,
          color,
          size,
          price: productState?.price,
        })
      );
      navigate("/cart");
    }
  };
  const orderedProduct = true;
  const copyToClipboard = (text) => {
    var textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
  };

  const [popularProduct, setPopularProduct] = useState([]);

  useEffect(() => {
    let data = [];
    for (let index = 0; index < productsState?.length; index++) {
      const element = productsState[index];
      const productTags = Array.isArray(element.tags)
        ? element.tags
        : [element.tags];
      if (productTags.includes("popular")) {
        data.push(element);
      }
    }
    setPopularProduct(data);
  }, [productsState]);

  const [star, setStar] = useState(null);
  const [comment, setComment] = useState(null);
  const [isFilled, setIsFilled] = useState(false);

  const handleToggle = () => {
    setIsFilled(!isFilled);
  };

  const addRatingToProduct = async () => {
    if (star === null) {
      toast.error("Please add star rating");
      return false;
    } else if (!comment?.trim()) {
      toast.error("Please Write Review About the Product");
      return false;
    } else {
      try {
        await dispatch(
          addRating({ star, comment, prodId: getProductId })
        ).unwrap();
        dispatch(getAProduct(getProductId));
        setStar(null);
        setComment("");
      } catch (error) {
        toast.error("Unable to submit review. Please login and try again.");
      }
    }
    return false;
  };

  return (
    <>
      <LoadingOverlay
        active={!isCurrentProductLoaded && productLoading}
        message="Loading product..."
      />
      <Meta title={"Product Name"} />
      {isCurrentProductLoaded && <BreadCrumb title={productState?.title} />}
      {isCurrentProductLoaded && <Container class1="main-product-wrapper py-5 home-wrapper-2">
        <div className="product-view-grid">
          <div className="product-gallery-panel">
            <div className="main-product-image">
              <div className="main-product-image-frame">
                <img src={selectedImage} alt={productState?.title || "Product"} />
              </div>
            </div>
            <div className="other-product-images">
              {(productImages.length ? productImages : [{ url: fallbackImage }]).map((item, index) => {
                return (
                  <button
                    key={index}
                    className={`product-thumb ${selectedImage === item?.url ? "active" : ""}`}
                    type="button"
                    onClick={() => setSelectedImage(item?.url || fallbackImage)}
                  >
                    <img src={item?.url || fallbackImage} alt={`${productState?.title || "Product"} ${index + 1}`} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="product-info-panel">
            <div className="main-product-details">
              <div className="border-bottom">
                <h3 className="title">{productState?.title}</h3>
              </div>
              <div className="border-bottom py-3">
                <p className="price"> Rs. {productState?.price}/-</p>
                <div className="d-flex align-items-center gap-10">
                  <ReactStars
                    count={5}
                    size={24}
                    value={averageRating}
                    edit={false}
                    activeColor="#ffd700"
                  />
                  <p className="mb-0 t-review">
                    ( {reviewCount} Reviews )
                  </p>
                </div>
                <a className="review-btn" href="#review">
                  Write a Review
                </a>
              </div>
              <div className=" py-3">
                <div className="d-flex gap-10 align-items-center my-2">
                  <h3 className="product-heading">Type :</h3>
                  <p className="product-data">{productState?.category}</p>
                </div>
                <div className="d-flex gap-10 align-items-center my-2">
                  <h3 className="product-heading">Brand :</h3>
                  <p className="product-data">{productState?.brand}</p>
                </div>
                <div className="d-flex gap-10 align-items-center my-2">
                  <h3 className="product-heading">Category :</h3>
                  <p className="product-data">{productState?.category}</p>
                </div>
                <div className="d-flex gap-10 align-items-center my-2">
                  <h3 className="product-heading">Tags :</h3>
                  <p className="product-data">
                    {(Array.isArray(productState?.tags)
                      ? productState?.tags
                      : [productState?.tags]
                    )
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <div className="d-flex gap-10 align-items-center my-2">
                  <h3 className="product-heading">Availablity :</h3>
                  <p className="product-data">In Stock</p>
                </div>
                {/* <div className="d-flex gap-10 flex-column mt-2 mb-3">
                  <h3 className="product-heading">Size :</h3>
                  <div className="d-flex flex-wrap gap-15">
                    <span className="badge border border-1 bg-white text-dark border-secondary">
                      S
                    </span>
                    <span className="badge border border-1 bg-white text-dark border-secondary">
                      M
                    </span>
                    <span className="badge border border-1 bg-white text-dark border-secondary">
                      XL
                    </span>
                    <span className="badge border border-1 bg-white text-dark border-secondary">
                      XXL
                    </span>
                  </div>
                </div> */}
                {alreadyAdded === false && (
                  <div className="d-flex gap-10 flex-column mt-2 mb-3">
                    <h3 className="product-heading">Color :</h3>
                    <Color
                      setColor={setColor}
                      colorData={productState?.color}
                      selectedColor={color}
                    />
                  </div>
                )}
                {alreadyAdded === false && productState?.size?.length > 0 && (
                  <div className="d-flex gap-10 flex-column mt-2 mb-3">
                    <h3 className="product-heading">Size :</h3>
                    <div className="d-flex flex-wrap gap-15">
                      {productState?.size?.map((item) => (
                        <button
                          key={item?._id}
                          type="button"
                          className={`badge border border-1 ${
                            size === item?._id
                              ? "bg-dark text-white border-dark"
                              : "bg-white text-dark border-secondary"
                          }`}
                          onClick={() => setSize(item?._id)}
                        >
                          {item?.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-flex align-items-center gap-15 flex-row mt-2 mb-3">
                  <h3 className="product-heading">Quantity :</h3>
                  {alreadyAdded === false && (
                    <div>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        className="form-control"
                        onChange={(e) => setQuantity(e.target.value)}
                        value={quantity}
                      />
                    </div>
                  )}
                  <div
                    className={
                      alreadyAdded
                        ? "ms-0"
                        : "ms-5 d-flex align-items-center gap-30"
                    }
                  >
                    <button
                      className="button border-0"
                      // data-bs-toggle="modal"
                      // data-bs-target="#staticBackdrop"
                      type="button"
                      disabled={authLoading}
                      onClick={() => {
                        alreadyAdded ? navigate("/cart") : uploadCart();
                      }}
                    >
                      {authLoading ? "Adding..." : alreadyAdded ? "Go to Cart" : "Add to Cart "}
                    </button>
                    {/* <button className="button signup">Buy It Now</button> */}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-15">
                  {/* <div>
                    <a href="">
                      <TbGitCompare className="fs-5 me-2" /> Add to Compare
                    </a>
                  </div> */}
                  <div>
                    {isFilled ? (
                      <AiFillHeart
                        className="fs-5 me-2"
                        onClick={handleToggle}
                      />
                    ) : (
                      <AiOutlineHeart
                        className="fs-5 me-2"
                        onClick={handleToggle}
                      />
                    )}
                  </div>
                </div>
                <div className="d-flex gap-10 flex-column  my-3">
                  <h3 className="product-heading">Shipping & Returns :</h3>
                  <p className="product-data">
                    Free shipping and returns available on all orders! <br /> We
                    ship all India domestic orders within
                    <b> 5-10 business days!</b>
                  </p>
                </div>
                <div className="d-flex gap-10 align-items-center my-3">
                  <h3 className="product-heading">Product Link:</h3>
                  <button
                    type="button"
                    className="copy-link-btn"
                    onClick={() => {
                      copyToClipboard(window.location.href);
                    }}
                  >
                    Copy Product Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>}
      {isCurrentProductLoaded && <Container class1="description-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <h4>Description</h4>
            <div className="product-description-card">
              <p
                dangerouslySetInnerHTML={{ __html: productState?.description }}
              ></p>
            </div>
          </div>
        </div>
      </Container>}
      {isCurrentProductLoaded && <Container class1="reviews-wrapper home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <h3 id="review">Reviews</h3>
            <div className="review-inner-wrapper">
              <div className="review-head d-flex justify-content-between align-items-end">
                <div>
                  <h4 className="mb-2">Customer Reviews</h4>
                  <div className="d-flex align-items-center gap-10">
                    <ReactStars
                      count={5}
                      size={24}
                      value={averageRating}
                      edit={false}
                      activeColor="#ffd700"
                    />
                    <p className="mb-0">
                      Based on {reviewCount} Reviews
                    </p>
                  </div>
                </div>
                {orderedProduct && (
                  <div>
                    <a className="text-dark text-decoration-underline" href="#review">
                      Write a Review
                    </a>
                  </div>
                )}
              </div>
              <div className="review-form py-4">
                <h4>Write a Review</h4>

                <div>
                  <ReactStars
                    count={5}
                    size={24}
                    value={0}
                    edit={true}
                    activeColor="#ffd700"
                    onChange={(e) => {
                      setStar(e);
                    }}
                  />
                </div>
                <div>
                  <textarea
                    name=""
                    id=""
                    className="w-100 form-control"
                    cols="30"
                    rows="4"
                    placeholder="Comments"
                    value={comment || ""}
                    onChange={(e) => {
                      setComment(e.target.value);
                    }}
                  ></textarea>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button
                    onClick={addRatingToProduct}
                    className="button border-0"
                    type="button"
                    disabled={productLoading}
                  >
                    {productLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
              <div className="reviews mt-4">
                {productState &&
                  productState.ratings?.map((item, index) => {
                    return (
                      <div className="review" key={item?._id || index}>
                        <div className="d-flex gap-10 align-items-center">
                          <h6 className="mb-0">user</h6>
                          <ReactStars
                            count={5}
                            size={24}
                            value={item?.star}
                            edit={false}
                            activeColor="#ffd700"
                          />
                        </div>
                        <p className="mt-3">{item?.comment}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </Container>}
      <Container class1="popular-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <h3 className="section-heading">Our Popular Products</h3>
          </div>
        </div>
        <div className="row">
          <ProductCard data={popularProduct} />
        </div>
      </Container>

      {/* <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered ">
          <div className="modal-content">
            <div className="modal-header py-0 border-0">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body py-0">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 w-50">
                  <img src={watch} className="img-fluid" alt="product imgae" />
                </div>
                <div className="d-flex flex-column flex-grow-1 w-50">
                  <h6 className="mb-3">Apple Watch</h6>
                  <p className="mb-1">Quantity: asgfd</p>
                  <p className="mb-1">Color: asgfd</p>
                  <p className="mb-1">Size: asgfd</p>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 py-0 justify-content-center gap-30">
              <button type="button" className="button" data-bs-dismiss="modal">
                View My Cart
              </button>
              <button type="button" className="button signup">
                Checkout
              </button>
            </div>
            <div className="d-flex justify-content-center py-3">
              <Link
                className="text-dark"
                to="/product"
                onClick={() => {
                  closeModal();
                }}
              >
                Continue To Shopping
              </Link>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default SingleProduct;
