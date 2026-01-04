

const FeaturesSection = () => {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="bg-green-400 dark:bg-green-700 text-white p-6 rounded-2xl max-w-lg">
        <h2 className="text-2xl font-bold mb-3">What you'll get.</h2>
        <ul className="text-left space-y-2">
          <li>✔ Tailored courses to improve your understanding of each concept.</li>
          <li>✔ A fun and interactive user experience.</li>
          <li>✔ Insight and analysis on your performance and improvements.</li>
        </ul>
      </div>
    </section>
  );
};

export default FeaturesSection;
