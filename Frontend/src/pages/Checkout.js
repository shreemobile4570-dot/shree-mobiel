import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { toast } from "react-toastify";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { base_url, getAuthConfig, getStoredCustomer } from "../utils/axiosConfig";
import {
  createAnOrder,
  deleteUserCart,
  getUserCart,
  resetState,
} from "../features/user/userSlice";
import LoadingOverlay from "../components/LoadingOverlay";

let shippingSchema = yup.object({
  firstname: yup.string().required("First Name is Required"),
  lastname: yup.string().required("Last Name is Required"),
  address: yup.string().required("Address Details are Required"),
  state: yup.string().required("State is Required"),
  city: yup.string().required("City is Required"),
  country: yup.string().required("Country is Required"),
  pincode: yup.number("Pincode No is Required").required().positive().integer(),
});

const Checkout = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state?.auth?.cartProducts);
  const authState = useSelector((state) => state?.auth);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartProductState, setCartProductState] = useState([]);
  const navigate = useNavigate();
  const shippingCost = totalAmount ? 100 : 0;
  const payableAmount = totalAmount + shippingCost;

  const storedCustomer = getStoredCustomer();
  const config2 = useMemo(() => getAuthConfig(), []);

  useEffect(() => {
    let sum = 0;
    for (let index = 0; index < cartState?.length; index++) {
      sum = sum + Number(cartState[index].quantity) * cartState[index].price;
    }
    setTotalAmount(sum);
  }, [cartState]);

  useEffect(() => {
    dispatch(getUserCart(config2));
  }, [dispatch, config2]);

  useEffect(() => {
    if (
      authState?.orderedProduct?.order !== null &&
      authState?.orderedProduct?.success === true
    ) {
      navigate("/my-orders");
    }
  }, [authState, navigate]);

  useEffect(() => {
    let items = [];
    for (let index = 0; index < cartState?.length; index++) {
      items.push({
        product: cartState[index].productId._id,
        quantity: cartState[index].quantity,
        color: cartState[index].color?._id || null,
        size: cartState[index].size?._id,
        price: cartState[index].price,
      });
    }
    setCartProductState(items);
  }, [cartState]);

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      address: "",
      state: "",
      city: "",
      country: "",
      pincode: "",
      other: "",
    },
    validationSchema: shippingSchema,
    onSubmit: (values) => {
      localStorage.setItem("address", JSON.stringify(values));
      if (paymentMethod === "cod") {
        handleCODOrder(values);
      } else {
        handleRazorpayPayment(values);
      }
    },
  });

  const buildOrderItems = () => {
    let orderItems = [];
    for (let index = 0; index < cartState?.length; index++) {
      orderItems.push({
        product: cartState[index].productId._id,
        quantity: cartState[index].quantity,
        color: cartState[index].color?._id || null,
        size: cartState[index].size?._id,
        price: cartState[index].price,
      });
    }
    return orderItems;
  };

  const handleCODOrder = async (shippingData) => {
    setIsProcessing(true);
    const orderItems = buildOrderItems();

    if (orderItems.length === 0) {
      toast.error("Your cart is empty!");
      setIsProcessing(false);
      return;
    }

    try {
      await dispatch(
        createAnOrder({
          totalPrice: totalAmount,
          totalPriceAfterDiscount: totalAmount,
          orderItems,
          paymentInfo: {
            razorpayOrderId: "COD",
            razorpayPaymentId: "COD",
          },
          paymentMethod: "cod",
          paymentStatus: "pending",
          shippingInfo: shippingData,
        })
      ).unwrap();

      await dispatch(deleteUserCart(config2));
      localStorage.removeItem("address");
      dispatch(resetState());
      setIsProcessing(false);
      navigate("/my-orders");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async (shippingData) => {
    setIsProcessing(true);
    let orderItems = [...cartProductState];

    if (orderItems.length === 0) {
      orderItems = buildOrderItems();
    }

    if (orderItems.length === 0) {
      toast.error("Your cart is empty!");
      setIsProcessing(false);
      return;
    }

    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        alert("Razorpay SDK failed to load");
        setIsProcessing(false);
        return;
      }

      const result = await axios.post(
        `${base_url}user/order/create-razorpay-order`,
        { amount: payableAmount },
        getAuthConfig()
      );

      if (!result) {
        alert("Something went wrong in checkout handler");
        setIsProcessing(false);
        return;
      }

      const { amount, id: order_id, currency } = result.data.order;

      const options = {
        key: "rzp_test_Sk3RL8gKpEuL38",
        amount,
        currency,
        name: "Shree Mobile",
        description: "Order payment",
        order_id,
        handler: async function (response) {
          const data = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          };

          const verifyResult = await axios.post(
            `${base_url}user/order/paymentVerification`,
            data,
            getAuthConfig()
          );

          await dispatch(
            createAnOrder({
              totalPrice: totalAmount,
              totalPriceAfterDiscount: totalAmount,
              orderItems,
              paymentInfo: verifyResult.data,
              paymentMethod: "razorpay",
              paymentStatus: "paid",
              shippingInfo: shippingData,
            })
          ).unwrap();

          await dispatch(deleteUserCart(config2));
          localStorage.removeItem("address");
          dispatch(resetState());
          setIsProcessing(false);
          navigate("/my-orders");
        },
        prefill: {
          name: `${shippingData.firstname} ${shippingData.lastname}`,
          email: storedCustomer?.email || "",
          contact: storedCustomer?.mobile || "",
        },
        theme: {
          color: "#1a1a1a",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  return (
    <>
      <LoadingOverlay active={isProcessing} message="Processing order..." />
      <Container class1="checkout-wrapper checkout-premium py-5 home-wrapper-2">
        <div className="checkout-shell">
          <header className="checkout-hero">
            <div>
              <span className="checkout-kicker">Secure checkout</span>
              <h1>Complete your order</h1>
              <p>Confirm your delivery details and choose how you would like to pay.</p>
            </div>
            <div className="checkout-steps" aria-label="Checkout progress">
              <span className="complete">Cart</span>
              <span className="active">Details</span>
              <span>Payment</span>
            </div>
          </header>

          <div className="checkout-grid">
            <aside className="checkout-summary-panel">
              <div className="summary-card">
                <div className="summary-head">
                  <div>
                    <span className="checkout-kicker">Your bag</span>
                    <h2>Order summary</h2>
                  </div>
                  <span className="summary-count">
                    {cartState?.length || 0} item{cartState?.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="summary-items">
                  {cartState?.map((item, index) => (
                    <div key={index} className="summary-item">
                      <div className="summary-image-wrap">
                        <img
                          src={item?.productId?.images?.[0]?.url}
                          alt={item?.productId?.title || "Product"}
                        />
                        <span>{item?.quantity}</span>
                      </div>
                      <div className="summary-copy">
                        <h3>{item?.productId?.title}</h3>
                        <p>
                          {item?.color?.title}
                          {item?.size?.title ? ` / ${item.size.title}` : ""}
                        </p>
                      </div>
                      <strong>Rs. {item?.price * item?.quantity}</strong>
                    </div>
                  ))}
                </div>

                <div className="summary-totals">
                  <div>
                    <span>Subtotal</span>
                    <strong>Rs. {totalAmount || 0}</strong>
                  </div>
                  <div>
                    <span>Shipping</span>
                    <strong>{shippingCost ? `Rs. ${shippingCost}` : "Rs. 0"}</strong>
                  </div>
                  <div className="summary-grand-total">
                    <span>Total</span>
                    <strong>Rs. {payableAmount}</strong>
                  </div>
                </div>
              </div>
            </aside>

            <section className="checkout-form-panel">
              <form onSubmit={formik.handleSubmit} className="checkout-form">
                <div className="checkout-card">
                  <div className="checkout-card-head">
                    <span className="checkout-section-number">01</span>
                    <div>
                      <h2>Delivery details</h2>
                      <p>Use an address where someone can receive your order.</p>
                    </div>
                  </div>

                  <div className="checkout-fields">
                    <div className="checkout-field full">
                      <label htmlFor="country">Country</label>
                      <select
                        id="country"
                        name="country"
                        value={formik.values.country}
                        onChange={formik.handleChange("country")}
                        onBlur={formik.handleBlur("country")}
                      >
                        <option value="">Select country</option>
                        <option value="India">India</option>
                      </select>
                      <div className="error">{formik.touched.country && formik.errors.country}</div>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="firstname">First name</label>
                      <input
                        id="firstname"
                        type="text"
                        name="firstname"
                        value={formik.values.firstname}
                        onChange={formik.handleChange("firstname")}
                        onBlur={formik.handleBlur("firstname")}
                      />
                      <div className="error">{formik.touched.firstname && formik.errors.firstname}</div>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="lastname">Last name</label>
                      <input
                        id="lastname"
                        type="text"
                        name="lastname"
                        value={formik.values.lastname}
                        onChange={formik.handleChange("lastname")}
                        onBlur={formik.handleBlur("lastname")}
                      />
                      <div className="error">{formik.touched.lastname && formik.errors.lastname}</div>
                    </div>

                    <div className="checkout-field full">
                      <label htmlFor="address">Address</label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        value={formik.values.address}
                        onChange={formik.handleChange("address")}
                        onBlur={formik.handleBlur("address")}
                      />
                      <div className="error">{formik.touched.address && formik.errors.address}</div>
                    </div>

                    <div className="checkout-field full">
                      <label htmlFor="other">Apartment, suite, landmark</label>
                      <input
                        id="other"
                        type="text"
                        name="other"
                        value={formik.values.other}
                        onChange={formik.handleChange("other")}
                        onBlur={formik.handleBlur("other")}
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        value={formik.values.city}
                        onChange={formik.handleChange("city")}
                        onBlur={formik.handleBlur("city")}
                      />
                      <div className="error">{formik.touched.city && formik.errors.city}</div>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="state">State</label>
                      <select
                        id="state"
                        name="state"
                        value={formik.values.state}
                        onChange={formik.handleChange("state")}
                        onBlur={formik.handleBlur("state")}
                      >
                        <option value="">Select state</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Gujarat">Gujarat</option>
                      </select>
                      <div className="error">{formik.touched.state && formik.errors.state}</div>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="pincode">Pincode</label>
                      <input
                        id="pincode"
                        type="text"
                        name="pincode"
                        value={formik.values.pincode}
                        onChange={formik.handleChange("pincode")}
                        onBlur={formik.handleBlur("pincode")}
                      />
                      <div className="error">{formik.touched.pincode && formik.errors.pincode}</div>
                    </div>
                  </div>
                </div>

                <div className="checkout-card">
                  <div className="checkout-card-head">
                    <span className="checkout-section-number">02</span>
                    <div>
                      <h2>Payment method</h2>
                      <p>Select the option that works best for you.</p>
                    </div>
                  </div>

                  <div className="payment-choice-grid">
                    <label className={`payment-choice ${paymentMethod === "cod" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="payment-mark"></span>
                      <span>
                        <strong>Cash on Delivery</strong>
                        <small>Pay in cash when your parcel arrives.</small>
                      </span>
                    </label>

                    <label className={`payment-choice ${paymentMethod === "razorpay" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === "razorpay"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="payment-mark"></span>
                      <span>
                        <strong>Razorpay</strong>
                        <small>Pay securely with UPI, card, or wallet.</small>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="checkout-actions">
                  <Link to="/cart" className="return-link">
                    <BiArrowBack />
                    Return to cart
                  </Link>
                  <button className="checkout-submit" type="submit" disabled={isProcessing}>
                    {isProcessing
                      ? "Processing..."
                      : paymentMethod === "cod"
                      ? "Place order"
                      : "Pay securely"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Checkout;
