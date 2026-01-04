import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-green-400 flex flex-col items-center py-6 mt-12 rounded-t-2xl">
      <h1 className="text-xl font-bold mb-3">Intellique.</h1>
      <div className="flex gap-6 text-sm">
        <Link to="/privacy" className="hover:text-white transition">Privacy policy</Link>
        <Link to="/terms" className="hover:text-white transition">Terms of service</Link>
        <Link to="/contact" className="hover:text-white transition">Contact</Link>
      </div>
      <p className="text-gray-500 text-xs mt-4">© {new Date().getFullYear()} Intellique. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
