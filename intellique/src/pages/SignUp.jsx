import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Notification from "../components/Notification";

const SignUp = () => {
  const navigate = useNavigate()  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  // --- Validation Logic (Frontend Only for Form Structure) ---
  const getFieldError = (name, value) => {
    let error = "";
    if (name === "username") {
      if (!value.trim()) error = "Username is required.";
      else if (value.length < 3)
        error = "Username must be at least 3 characters.";
    }
    if (name === "email") {
      if (!value.trim()) error = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(value))
        error = "Enter a valid email address.";
    }
    if (name === "password") {
      if (!value) error = "Password is required.";
      else if (value.length < 6)
        error = "Password must be at least 6 characters.";
    }
    if (name === "repeatPassword") {
      if (!value) error = "Please confirm your password.";
      else if (value !== formData.password)
        error = "Passwords do not match.";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
  };

  // --- Handle Form Submit and API Communication ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Local validation first
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const err = getFieldError(field, formData[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);

    // If any local errors exist, stop
    const hasLocalError = Object.values(newErrors).some((msg) => msg);
    if (hasLocalError) {
      setNotification({
        message: "Please correct the highlighted fields.",
        type: "error",
      });
      return;
    }

    // Prepare API request
    try {
      setLoading(true);
      setNotification({ message: "", type: "" });

      // Simulated API call (replace with your real endpoint)
      const response = await fakeSignUpAPI(formData);

      if (response.success) {
        setNotification({
          message: "Signup successful! Redirecting...",
          type: "success",
        });
        console.log("formData :", formData)
        setTimeout(() => {
            navigate("/signin"); // redirect to Sign In page
        }, 2000);
        // setTimeout(() => {
        //   setFormData({
        //     username: "",
        //     email: "",
        //     password: "",
        //     repeatPassword: "",
        //   });
        //   setErrors({});
        // }, 2000);
      } else {
        // Backend returned an error object with a type
        // if (response.error.type === "email") {
        //   setErrors((prev) => ({
        //     ...prev,
        //     email: response.error.message,
        //   }));
        // } else {
          setNotification({
            message: response.error.message || "Signup failed.",
            type: "error",
          });
        // }
      }
    } catch (err) {
      setNotification({
        message: "Server error. Please try again later.",
        type: "error",
      });
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  // --- Simulated Backend API Function ---
  const fakeSignUpAPI = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Demo: pretend "intellique@gmail.com" already exists
        if (data.email.toLowerCase() === "intellique@gmail.com") {
          resolve({
            success: false,
            error: {
              type: "email",
              message: "This email is already registered.",
            },
          });
        } else {
          resolve({ success: true });
        }
      }, 1000);
    });
  };

  // --- UI ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white text-gray-900 relative">
      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      {/* Header */}
      <header className="w-full bg-black text-white text-center py-4 rounded-b-2xl">
        <h1 className="text-2xl font-bold">Intellique.</h1>
      </header>

      {/* Sign Up Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-green-400 dark:bg-green-600 p-6 rounded-2xl shadow-md w-11/12 max-w-md mt-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center">
          Sign Up
        </h2>

        <div className="flex flex-col gap-4">
          <InputField
            type="text"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />
          <InputField
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <InputField
            type="password"
            placeholder="Repeat password"
            name="repeatPassword"
            value={formData.repeatPassword}
            onChange={handleChange}
            error={errors.repeatPassword}
          />
        </div>

        <p className="text-sm mt-4 text-black">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="underline text-black hover:text-white transition"
          >
            Sign in
          </Link>
        </p>

        <div className="mt-6">
          <Button text={loading ? "Creating account..." : "Finish"} />
        </div>
      </form>

      <Footer />
    </div>
  );
};

export default SignUp;
