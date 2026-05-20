// import React, { useEffect, useMemo, useState } from "react";
// import BreadCrumb from "../components/BreadCrumb";
// import Meta from "../components/Meta";
// import watch from "../images/watch.jpg";
// import { AiFillDelete } from "react-icons/ai";
// import { Link } from "react-router-dom";
// import Container from "../components/Container";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   deleteCartProduct,
//   getUserCart,
//   updateCartProduct,
// } from "../features/user/userSlice";

// const Cart = () => {
//   const getTokenFromLocalStorage = localStorage.getItem("customer")
//     ? JSON.parse(localStorage.getItem("customer"))
//     : null;
//   const customerToken = getTokenFromLocalStorage?.token || "";

//   const config2 = useMemo(() => ({
//     headers: {
//       Authorization: `Bearer ${customerToken}`,
//       Accept: "application/json",
//     },
//   }), [customerToken]);

//   const dispatch = useDispatch();

//   const [productupdateDetail, setProductupdateDetail] = useState(null);
//   const [totalAmount, setTotalAmount] = useState(null);
//   const userCartState = useSelector((state) => state.auth.cartProducts);

//   useEffect(() => {
//     dispatch(getUserCart(config2));
//   }, [config2, dispatch]);

//   useEffect(() => {
//     if (productupdateDetail !== null) {
//       dispatch(
//         updateCartProduct({
//           cartItemId: productupdateDetail?.cartItemId,
//           quantity: productupdateDetail?.quantity,
//         })
//       ).then(() => {
//         dispatch(getUserCart(config2));
//       });
//     }
//   }, [config2, productupdateDetail, dispatch]);

//   const deleteACartProduct = async (id) => {
//     await dispatch(deleteCartProduct({ id: id, config2: config2 }));
//       dispatch(getUserCart(config2));
//   };

//   useEffect(() => {
//     let sum = 0;
//     for (let index = 0; index < userCartState?.length; index++) {
//       sum =
//         sum +
//         Number(userCartState[index].quantity) * userCartState[index].price;
//     }
//     setTotalAmount(sum);
//   }, [userCartState]);

//   return (
//     <>
//       <Meta title={"Cart"} />
//       <BreadCrumb title="Cart" />
//       <Container class1="cart-wrapper home-wrapper-2 py-5">
//         <div className="row">
//           <div className="col-12">
//             <div className="cart-header py-3 d-flex justify-content-between align-items-center">
//               <h4 className="cart-col-1">Product</h4>
//               <h4 className="cart-col-2">Price</h4>
//               <h4 className="cart-col-3">Quantity</h4>
//               <h4 className="cart-col-4">Total</h4>
//             </div>
//             {userCartState &&
//               userCartState?.map((item, index) => {
//                 return (
//                   <div
//                     key={index}
//                     className="cart-data py-3 mb-2 d-flex justify-content-between align-items-center"
//                   >
//                     <div className="cart-col-1 gap-15 d-flex align-items-center">
//                       <div className="w-25">
//                         <img
//                           src={item?.productId.images[0].url}
//                           className="img-fluid"
//                           alt="product image"
//                         />
//                       </div>
//                       <div className="w-75">
//                         <p>{item?.productId.title}</p>

//                         <p className="d-flex gap-3">
//                           Color:
//                           <ul className="colors ps-0">
//                             <li
//                               style={{ backgroundColor: item?.color.title }}
//                             ></li>
//                           </ul>
//                         </p>
//                       </div>
//                     </div>
//                     <div className="cart-col-2">
//                       <h5 className="price">Rs. {item?.price}</h5>
//                     </div>
//                     <div className="cart-col-3 d-flex align-items-center gap-15">
//                       <div>
//                         <input
//                           className="form-control"
//                           type="number"
//                           name={"quantity" + item?._id}
//                           min={1}
//                           max={10}
//                           id={"card" + item?._id}
//                           value={item?.quantity}
//                           onChange={(e) => {
//                             setProductupdateDetail({
//                               cartItemId: item?._id,
//                               quantity: e.target.value,
//                             });
//                           }}
//                         />
//                       </div>
//                       <div>
//                         <AiFillDelete
//                           onClick={() => {
//                             deleteACartProduct(item?._id);
//                           }}
//                           className="text-danger "
//                         />
//                       </div>
//                     </div>
//                     <div className="cart-col-4">
//                       <h5 className="price">
//                         Rs. {item?.quantity * item?.price}
//                       </h5>
//                     </div>
//                   </div>
//                 );
//               })}
//           </div>
//           <div className="col-12 py-2 mt-4">
//             <div className="d-flex justify-content-between align-items-baseline">
//               <Link to="/product" className="button">
//                 Continue To Shopping
//               </Link>
//               {(totalAmount !== null || totalAmount !== 0) && (
//                 <div className="d-flex flex-column align-items-end">
//                   <h4>
//                     SubTotal: Rs.{" "}
//                     {!userCartState?.length ? 0 : totalAmount ? totalAmount : 0}
//                   </h4>
//                   <p>Taxes and shipping calculated at checkout</p>
//                   <Link to="/checkout" className="button">
//                     Checkout
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </Container>
//     </>
//   );
// };

// export default Cart;



import React, { useEffect, useState } from "react";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import watch from "../images/accessories.jpg";
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

const Cart = () => {
  const [config2] = useState(() => getAuthConfig());

  const dispatch = useDispatch();

  const [productupdateDetail, setProductupdateDetail] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const userCartState = useSelector((state) => state.auth.cartProducts);

  // Fetch cart
  useEffect(() => {
    dispatch(getUserCart(config2));
  }, [config2, dispatch]);

  // Update quantity after the user pauses typing/clicking.
  useEffect(() => {
    if (productupdateDetail !== null) {
      const timer = setTimeout(() => {
        dispatch(
          updateCartProduct({
            cartItemId: productupdateDetail?.cartItemId,
            quantity: productupdateDetail?.quantity,
          })
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [productupdateDetail, dispatch]);

  // Delete item
  const deleteACartProduct = async (id) => {
    await dispatch(deleteCartProduct({ id: id, config2: config2 }));
  };

  // Calculate total
  useEffect(() => {
    let sum = 0;
    userCartState?.forEach((item) => {
      if (item?.productId) {
        sum += Number(item.quantity) * item.price;
      }
    });
    setTotalAmount(sum);
  }, [userCartState]);

  return (
    <>
      <Meta title={"Cart"} />
      <BreadCrumb title="Cart" />

      <Container class1="cart-wrapper home-wrapper-2 py-5">
        <div className="row">
          <div className="col-12">
            {/* Header */}
            <div className="cart-header py-3 d-flex justify-content-between align-items-center">
              <h4 className="cart-col-1">Product</h4>
              <h4 className="cart-col-2">Price</h4>
              <h4 className="cart-col-3">Quantity</h4>
              <h4 className="cart-col-4">Total</h4>
            </div>

            {/* Cart Items */}
            {userCartState &&
              userCartState.map((item, index) => {
                // 🔥 Skip invalid products
                if (!item?.productId) return null;

                return (
                  <div
                    key={index}
                    className="cart-data py-3 mb-2 d-flex justify-content-between align-items-center"
                  >
                    {/* Product Info */}
                    <div className="cart-col-1 gap-15 d-flex align-items-center">
                      <div className="w-25">
                        <img
                          src={
                            item?.productId?.images?.[0]?.url || watch
                          }
                          className="img-fluid"
                          alt="product"
                        />
                      </div>

                      <div className="w-75">
                        <p>
                          {item?.productId?.title ||
                            "Product not available"}
                        </p>

                        <p className="d-flex gap-3">
                          Color:
                          <ul className="colors ps-0">
                            <li
                              style={{
                                backgroundColor:
                                  item?.color?.title || "#000",
                              }}
                            ></li>
                          </ul>
                        </p>
                        {item?.size?.title && (
                          <p className="d-flex gap-3">
                            Size:
                            <span>{item.size.title}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="cart-col-2">
                      <h5 className="price">Rs. {item?.price}</h5>
                    </div>

                    {/* Quantity */}
                    <div className="cart-col-3 d-flex align-items-center gap-15">
                      <div>
                        <input
                          className="form-control"
                          type="number"
                          min={1}
                          max={10}
                          value={item?.quantity}
                          onChange={(e) => {
                            setProductupdateDetail({
                              cartItemId: item?._id,
                              quantity: e.target.value,
                            });
                          }}
                        />
                      </div>

                      <div>
                        <AiFillDelete
                          onClick={() => deleteACartProduct(item?._id)}
                          className="text-danger"
                        />
                      </div>
                    </div>

                    {/* Total */}
                    <div className="cart-col-4">
                      <h5 className="price">
                        Rs. {item?.quantity * item?.price}
                      </h5>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Footer */}
          <div className="col-12 py-2 mt-4">
            <div className="d-flex justify-content-between align-items-baseline">
              <Link to="/product" className="button">
                Continue To Shopping
              </Link>

              {/* ✅ Fixed condition */}
              {(totalAmount !== null && totalAmount !== 0) && (
                <div className="d-flex flex-column align-items-end">
                  <h4>
                    SubTotal: Rs.{" "}
                    {!userCartState?.length ? 0 : totalAmount}
                  </h4>
                  <p>Taxes and shipping calculated at checkout</p>
                  <Link to="/checkout" className="button">
                    Checkout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Cart;
