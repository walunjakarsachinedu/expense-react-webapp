import CustomLink from "../components/common/CustomLink";

const PageNotFound: React.FC = () => {
  return (
    <div className="flex flex-column align-items-center justify-content-center mt-8">
      <div className="text-3xl font-bold text-white mb-2 mt-4">
        404 - Page Not Found
      </div>
      <p className="text-lg text-gray-300 mb-3">
        The page you are looking for does not exist.
      </p>
      <CustomLink to="/">Go to Home</CustomLink>
    </div>
  );
};

export default PageNotFound;
