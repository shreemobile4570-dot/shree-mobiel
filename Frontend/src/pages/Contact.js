import React from "react";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import { AiOutlineHome, AiOutlineMail } from "react-icons/ai";
import { BiPhoneCall, BiInfoCircle, BiSend } from "react-icons/bi";
import Container from "../components/Container";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { createQuery } from "../features/contact/contactSlice";

const STORE_EMAIL = "shreemobile4570@gmail.com";

let contactSchema = yup.object({
  name: yup.string().required("Name is Required"),
  email: yup
    .string()
    .required("Email is Required")
    .email("Email Should be valid"),
  mobile: yup
    .string()
    .required("Mobile No is Required")
    .matches(/^[0-9+\-\s()]{8,16}$/, "Mobile No Should be valid"),
  comment: yup.string().required("Message is Required"),
});

const Contact = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state?.contact?.isLoading);

  const buildMailLink = ({ name, email, mobile, comment }) => {
    const subject = encodeURIComponent(`Website enquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\n\nMessage:\n${comment}`
    );

    return `mailto:${STORE_EMAIL}?subject=${subject}&body=${body}`;
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      comment: "",
    },
    validationSchema: contactSchema,
    onSubmit: (values) => {
      dispatch(createQuery(values));
      window.location.href = buildMailLink(values);
    },
  });

  return (
    <>
      <Meta title={"Contact Us"} />
      <BreadCrumb title="Contact Us" />
      <Container class1="contact-wrapper py-5 home-wrapper-2 premium-contact-page">
        <div className="contact-page-shell">
          <div className="contact-page-heading">
            <span>Shree Mobile</span>
            <h1>Contact Us</h1>
            <p>
              Need help with an order, product availability, or store visit? Send us
              a message and our team will get back to you as soon as possible.
            </p>
          </div>

          <div className="contact-map-panel">
            <iframe
              title="Shree Mobile store location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d397.5179772137891!2d74.56160820815539!3d16.85444378445714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc119f6a8db2ca7%3A0x5e3cdcc9b2c6764b!2sSHREE%20MOBILE%20ACCESSORIES!5e0!3m2!1sen!2sin!4v1779886763903!5m2!1sen!2sin"
              className="contact-map"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="contact-inner-wrapper">
            <div className="contact-form-panel">
              <span className="contact-kicker">Write to us</span>
              <h3 className="contact-title">Send a Message</h3>
              <p className="contact-panel-copy">
                Share your details below. Your message will also open in your
                email app addressed to {STORE_EMAIL}.
              </p>
              <form
                onSubmit={formik.handleSubmit}
                className="contact-form d-flex flex-column gap-15"
              >
                <div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your name"
                    name="name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                  />
                  <div className="error">
                    {formik.touched.name && formik.errors.name}
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email address"
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                  <div className="error">
                    {formik.touched.email && formik.errors.email}
                  </div>
                </div>

                <div>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Mobile Number"
                    name="mobile"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.mobile}
                  />
                  <div className="error">
                    {formik.touched.mobile && formik.errors.mobile}
                  </div>
                </div>

                <div>
                  <textarea
                    className="w-100 form-control"
                    rows="4"
                    placeholder="How can we help?"
                    name="comment"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.comment}
                  ></textarea>
                  <div className="error">
                    {formik.touched.comment && formik.errors.comment}
                  </div>
                </div>

                <div>
                  <button
                    className="button border-0 contact-submit"
                    type="submit"
                    disabled={isLoading}
                  >
                    <BiSend />
                    {isLoading ? "Sending..." : "Send Mail"}
                  </button>
                </div>
              </form>
            </div>

            <div className="contact-info-panel">
              <span className="contact-kicker">Visit or reach us</span>
              <h3 className="contact-title">Store Details</h3>
              <p className="contact-panel-copy">
                We are available all week for product questions, order support,
                and wholesale enquiries.
              </p>
              <ul className="ps-0">
                <li className="contact-detail-card">
                  <span className="contact-detail-icon">
                    <AiOutlineHome />
                  </span>
                  <div>
                    <span>Address</span>
                    <address>
                      Hno : Shop No 4, Main Road, near Stand, Sangli, <br />
                        Gaon Bhag, Sangli Miraj Kupwad, Maharashtra 416416
                    </address>
                  </div>
                </li>
                <li className="contact-detail-card">
                  <span className="contact-detail-icon">
                    <BiPhoneCall />
                  </span>
                  <div>
                    <span>Phone</span>
                    <a href="tel:+919860291048">+91 9860291048</a>
                  </div>
                </li>
                <li className="contact-detail-card">
                  <span className="contact-detail-icon">
                    <AiOutlineMail />
                  </span>
                  <div>
                    <span>Email</span>
                    <a href={`mailto:${STORE_EMAIL}`}>{STORE_EMAIL}</a>
                  </div>
                </li>
                <li className="contact-detail-card">
                  <span className="contact-detail-icon">
                    <BiInfoCircle />
                  </span>
                  <div>
                    <span>Store Hours</span>
                    <p>Monday - Sunday, 10 AM - 8 PM</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Contact;
