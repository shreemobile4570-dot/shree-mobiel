import React, { useEffect } from "react";
import Container from "../components/Container";
import BreadCrumb from "../components/BreadCrumb";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../features/user/userSlice";

const orderSteps = ["Ordered", "Processed", "Shipped", "Out for Delivery", "Delivered"];

const Orders = () => {
  const dispatch = useDispatch();
  const orderState = useSelector(
    (state) => state?.auth?.getorderedProduct?.orders
  );

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const getStepIndex = (status) => {
    const index = orderSteps.findIndex(
      (step) => step.toLowerCase() === String(status || "").toLowerCase()
    );
    return index >= 0 ? index : 0;
  };

  return (
    <>
      <BreadCrumb title="My Orders" />
      <Container class1="orders-wrapper home-wrapper-2 py-4">
        <div className="orders-page-head">
          <div>
            <span>Account</span>
            <h2>My Orders</h2>
          </div>
          <p>{orderState?.length || 0} order{orderState?.length === 1 ? "" : "s"}</p>
        </div>

        {!orderState?.length && (
          <div className="orders-empty">No orders found.</div>
        )}

        <div className="orders-list">
          {orderState?.map((order) => {
            const activeStep = getStepIndex(order?.orderStatus);
            const progressPercent =
              orderSteps.length > 1
                ? (activeStep / (orderSteps.length - 1)) * 100
                : 0;

            return (
              <article className="order-card" key={order?._id}>
                <div className="order-card-top">
                  <div>
                    <span className="order-label">Order ID</span>
                    <h3>{order?._id}</h3>
                    <p>
                      {order?.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <div className="order-status-pill">{order?.orderStatus || "Ordered"}</div>
                </div>

                <div className="order-summary-grid">
                  <div>
                    <span>Total</span>
                    <strong>Rs. {order?.totalPrice || 0}</strong>
                  </div>
                  <div>
                    <span>Payable</span>
                    <strong>Rs. {order?.totalPriceAfterDiscount || order?.totalPrice || 0}</strong>
                  </div>
                  <div>
                    <span>Payment</span>
                    <strong>{order?.paymentMethod || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Items</span>
                    <strong>{order?.orderItems?.length || 0}</strong>
                  </div>
                </div>

                <div className="order-progress" aria-label={`Order status ${order?.orderStatus}`}>
                  <div className="order-progress-track">
                    <div
                      className="order-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="order-steps">
                    {orderSteps.map((step, index) => (
                      <div
                        key={step}
                        className={`order-step ${index <= activeStep ? "complete" : ""}`}
                      >
                        <span>{index + 1}</span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-items">
                  {order?.orderItems?.map((item, index) => (
                    <div className="order-item" key={`${order?._id}-${index}`}>
                      <div className="order-item-image">
                        <img
                          src={item?.product?.images?.[0]?.url || "images/watch.jpg"}
                          alt={item?.product?.title || "Product"}
                        />
                      </div>
                      <div className="order-item-copy">
                        <h4>{item?.product?.title || "Product unavailable"}</h4>
                        <div className="order-item-meta">
                          <span>Qty: {item?.quantity}</span>
                          <span>Rs. {item?.price}</span>
                          {item?.isAvailable === false && (
                            <span className="order-unavailable">
                              Not available: {item?.availabilityNote || "Currently not available"}
                            </span>
                          )}
                          <span>Size: {item?.size?.title || "-"}</span>
                          <span className="order-color">
                            Color:
                            <i style={{ backgroundColor: item?.color?.title || "#ddd" }}></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </>
  );
};

export default Orders;
