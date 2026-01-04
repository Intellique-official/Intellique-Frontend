import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 bg-black text-white rounded-b-2xl">
      <h1 className="text-2xl font-bold text-green-400">Intellique.</h1>
      <div className="flex items-center gap-4">
        <Link
          to="/signin"
          className="hover:text-green-400 transition-colors duration-200"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="bg-green-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors duration-200"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
