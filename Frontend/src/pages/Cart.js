import React, { useEffect, useMemo, useState } from "react";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import fallbackImage from "../images/accessories.jpg";
import { AiFillDelete } from "react-icons/ai";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCartProduct,
  getUserCart,
  updateCartProduct,
} from "../features/user/userSlice";
import { getAuthConfig } from "../utils/axiosConfig";

const formatPrice = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const Cart = () => {
  const [config2] = useState(() => getAuthConfig());
  const [productupdateDetail, setProductupdateDetail] = useState(null);
  const [cartQuantities, setCartQuantities] = useState({});

  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const validCartItems = useMemo(
    () => (authState.cartProducts || []).filter((item) => item?.productId),
    [authState.cartProducts]
  );

  const totalAmount = useMemo(
    () =>
      validCartItems.reduce(
        (sum, item) =>
          sum +
          Number(cartQuantities[item._id] ?? item.quantity ?? 0) *
            Number(item.price || 0),
        0
      ),
    [validCartItems, cartQuantities]
  );

  useEffect(() => {
    dispatch(getUserCart(config2));
  }, [config2, dispatch]);

  useEffect(() => {
    setCartQuantities((current) => {
      const next = {};
      validCartItems.forEach((item) => {
        next[item._id] = current[item._id] ?? item.quantity;
      });
      return next;
    });
  }, [validCartItems]);

  useEffect(() => {
    if (!productupdateDetail) return undefined;

    const timer = setTimeout(() => {
      dispatch(updateCartProduct(productupdateDetail));
    }, 500);

    return () => clearTimeout(timer);
  }, [productupdateDetail, dispatch]);

  const handleQuantityChange = (cartItemId, quantity) => {
    const nextQuantity = Math.max(1, Math.min(10, Number(quantity) || 1));
    setCartQuantities((current) => ({ ...current, [cartItemId]: nextQuantity }));
    setProductupdateDetail({ cartItemId, quantity: nextQuantity });
  };

  const deleteACartProduct = async (id) => {
    await dispatch(deleteCartProduct({ id, config2 }));
  };

  return (
    <>
      <Meta title="Cart" />
      <BreadCrumb title="Cart" />

      <Container class1="cart-wrapper cart-list-wrapper py-5">
        <div className="cart-list-shell">
          <div className="cart-list-heading">
            <div>
              <p>Shopping Cart</p>
              <h1>{validCartItems.length} item{validCartItems.length === 1 ? "" : "s"}</h1>
            </div>
            <Link to="/product">Continue shopping</Link>
          </div>

          {validCartItems.length === 0 ? (
            <div className="cart-empty-state">
              <h2>Your cart is empty</h2>
              <p>Add products to your cart and they will appear here.</p>
              <Link to="/product" className="cart-primary-link">
                Shop products
              </Link>
            </div>
          ) : (
            <>
              <ul className="cart-item-list">
                {validCartItems.map((item) => {
                  const product = item.productId;
                  const itemQuantity = cartQuantities[item._id] ?? item.quantity;
                  const itemTotal = Number(itemQuantity || 0) * Number(item.price || 0);
                  const colorTitle = item?.color?.title;
                  const sizeTitle = item?.size?.title;

                  return (
                    <li className="cart-list-item" key={item._id}>
                      <img
                        src={product?.images?.[0]?.url || fallbackImage}
                        alt={product?.title || "Product"}
                        className="cart-list-image"
                        loading="lazy"
                      />

                      <div className="cart-list-info">
                        <h3>{product?.title || "Product not available"}</h3>
                        <dl>
                          {colorTitle && (
                            <div>
                              <dt>Color:</dt>
                              <dd>
                                <span
                                  className="cart-color-dot"
                                  style={{ backgroundColor: colorTitle }}
                                />
                                {colorTitle}
                              </dd>
                            </div>
                          )}
                          {sizeTitle && (
                            <div>
                              <dt>Size:</dt>
                              <dd>{sizeTitle}</dd>
                            </div>
                          )}
                          <div>
                            <dt>Price:</dt>
                            <dd>{formatPrice(item.price)}</dd>
                          </div>
                          <div>
                            <dt>Total:</dt>
                            <dd>{formatPrice(itemTotal)}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="cart-list-actions">
                        <label htmlFor={`cart-qty-${item._id}`} className="visually-hidden">
                          Quantity
                        </label>
                        <input
                          id={`cart-qty-${item._id}`}
                          type="number"
                          min={1}
                          max={10}
                          value={itemQuantity}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                          className="cart-list-qty"
                        />
                        <button
                          type="button"
                          className="cart-remove-button"
                          onClick={() => deleteACartProduct(item._id)}
                          aria-label={`Remove ${product?.title || "item"}`}
                          disabled={
                            authState.isLoading &&
                            authState.loadingAction === "delete-cart-product"
                          }
                        >
                          <AiFillDelete />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="cart-summary-panel">
                <dl>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(totalAmount)}</dd>
                  </div>
                  <div>
                    <dt>Shipping</dt>
                    <dd>Calculated at checkout</dd>
                  </div>
                  <div className="cart-summary-total">
                    <dt>Total</dt>
                    <dd>{formatPrice(totalAmount)}</dd>
                  </div>
                </dl>

                <div className="cart-summary-actions">
                  <Link to="/product" className="cart-secondary-link">
                    View products
                  </Link>
                  <Link to="/checkout" className="cart-primary-link">
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </Container>
    </>
  );
};

export default Cart;
