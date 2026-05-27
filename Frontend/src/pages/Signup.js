import React from "react";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/user/userSlice";

let signUpSchema = yup.object({
  firstname: yup.string().required("First Name is Required"),
  lastname: yup.string().required("Last Name is Required"),
  email: yup
    .string()
    .required("Email is Required")
    .email("Email Should be valid"),
  mobile: yup
    .string()
    .required("Mobile No is Required")
    .matches(/^[0-9]{10}$/, "Enter a valid 10 digit mobile number"),
  password: yup
    .string()
    .required("Password is Required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm Password is Required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const FloatingField = ({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
}) => (
  <div className="signup-floating-field">
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder=" "
      autoComplete={autoComplete}
    />
    <label htmlFor={id}>{label}</label>
    <div className="error">{error}</div>
  </div>
);

const Signup = () => {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signUpSchema,
    onSubmit: (values) => {
      const { confirmPassword, ...registerData } = values;
      dispatch(registerUser(registerData));
    },
  });

  // useEffect(() => {
  //   if (authState.createdUser !== null && authState.isError === false) {
  //     navigate("/login");
  //   }
  // }, [authState]);

  return (
    <>
      <Meta title={"Sign Up"} />
      <BreadCrumb title="Sign Up" />
      <Container class1="signup-clean-wrapper py-5">
        <div className="signup-clean-card">
          <div className="login-clean-head">
            <span className="login-clean-mark">श्री</span>
            <div>
              <p>New Customer</p>
              <h1>Create Account</h1>
            </div>
          </div>

          <form className="signup-floating-form" onSubmit={formik.handleSubmit}>
            <div className="signup-field-grid">
              <FloatingField
                id="signup-firstname"
                name="firstname"
                label="First name"
                value={formik.values.firstname}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstname && formik.errors.firstname}
                autoComplete="given-name"
              />
              <FloatingField
                id="signup-lastname"
                name="lastname"
                label="Last name"
                value={formik.values.lastname}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastname && formik.errors.lastname}
                autoComplete="family-name"
              />
            </div>

            <FloatingField
              id="signup-email"
              name="email"
              type="email"
              label="Email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
              autoComplete="email"
            />

            <FloatingField
              id="signup-mobile"
              name="mobile"
              type="tel"
              label="Mobile number"
              value={formik.values.mobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.mobile && formik.errors.mobile}
              autoComplete="tel"
            />

            <FloatingField
              id="signup-password"
              name="password"
              type="password"
              label="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && formik.errors.password}
              autoComplete="new-password"
            />

            <FloatingField
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              label="Confirm password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && formik.errors.confirmPassword}
              autoComplete="new-password"
            />

            <button
              className="signup-submit"
              type="submit"
              disabled={authState.isLoading && authState.loadingAction === "register"}
            >
              {authState.isLoading && authState.loadingAction === "register"
                ? "Creating..."
                : "Create Account"}
            </button>

            <p className="login-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </Container>
    </>
  );
};

export default Signup;
