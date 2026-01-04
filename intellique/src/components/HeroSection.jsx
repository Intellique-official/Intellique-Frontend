import heroImg from "../assets/illustrations/hero-illustration.png";

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-12">
      <img
        src={heroImg}
        alt="Learning illustration"
        className="w-64 md:w-80 mb-6"
      />
      <div className="bg-green-400 dark:bg-green-700 text-white p-6 rounded-2xl max-w-lg">
        <h2 className="text-2xl font-bold mb-3">Beat the system</h2>
        <p className="leading-relaxed">
          With Intellique, a platform that provides and guides you with
          materials and resources in very intuitive, fun, and easy-to-understand
          ways. Improve your academic presence by Signing up today.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
