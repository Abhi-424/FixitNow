import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4 pt-16">
      <div className="max-w-4xl w-full text-center">
        {/* 404 Image */}
        <div className="mb-8">
          <img
            src="https://syhzhuelbxgnhopnwjgc.supabase.co/storage/v1/object/public/media/blog/404_page_cover.jpg"
            alt="404 - Page Not Found"
            className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl"
          />
        </div>

        {/* Message */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500">
            Don't worry, let's get you back on track!
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl"
          >
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-lg shadow-md hover:bg-blue-50 transition transform hover:scale-105"
          >
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>Need assistance? <Link to="/contact" className="text-blue-600 hover:underline font-medium">Contact Us</Link></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
