import { Link } from "react-router-dom";

const PageNotFound: React.FC = () => {
  return (
    <div className="flex flex-column align-items-center justify-content-center mt-8">
      <div className="text-3xl font-bold text-white mb-2 mt-4">
        404 - Page Not Found
      </div>
      <p className="text-lg text-gray-300 mb-3">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default PageNotFound;
