import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import Container from "../components/Container";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/user/userSlice";

let loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is Required")
    .email("Email Should be valid"),

  password: yup.string().required("Password is Required"),
});

const Login = () => {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      dispatch(loginUser(values));

      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
    },
  });
  useEffect(() => {
    if (authState.user !== null && authState.isError === false) {
      window.location.href = "/";
    }
  }, [authState]);

  return (
    <>
      <Meta title={"Login"} />
      <BreadCrumb title="Login" />

      <Container class1="login-wrapper login-clean-wrapper py-5">
        <div className="login-clean-card">
          <div className="login-clean-head">
            <span className="login-clean-mark">श्री</span>
            <div>
              <p>Shree Mobiles</p>
              <h1>Login</h1>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="login-clean-form">
            <div className="login-field">
              <label htmlFor="login-email">Your email</label>
              <input
                type="email"
                id="login-email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="name@example.com"
                autoComplete="email"
              />
              <div className="error">{formik.touched.email && formik.errors.email}</div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Your password</label>
              <input
                type="password"
                id="login-password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <div className="error">
                {formik.touched.password && formik.errors.password}
              </div>
            </div>

            <div className="login-options">
              <label htmlFor="remember-login">
                <input id="remember-login" type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={authState.isLoading && authState.loadingAction === "login"}
            >
              {authState.isLoading && authState.loadingAction === "login"
                ? "Logging in..."
                : "Login"}
            </button>

            <p className="login-switch">
              New to Shree Mobiles? <Link to="/signup">Create account</Link>
            </p>
          </form>
        </div>
      </Container>
    </>
  );
};

export default Login;
