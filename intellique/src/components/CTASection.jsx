import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="flex flex-col items-center justify-center py-10">
      <Link
        to="/signup"
        className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-500 hover:text-black transition-all duration-300"
      >
        Get Started
      </Link>
    </section>
  );
};

export default CTASection;
