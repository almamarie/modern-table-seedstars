import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 mb-6 p-4 text-white">
      <div className="mx-auto container">
        <h1 className="mb-4 font-bold text-xl">Table Examples</h1>
        <div className="flex gap-4">
          <Link
            to="/virtualized-modern-table"
            className={`px-4 py-2 rounded transition-colors ${
              location.pathname === "/virtualized-modern-table"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-gray-200"
            }`}
          >
            Virtualized Modern Table
          </Link>
          <Link
            to="/modern-table"
            className={`px-4 py-2 rounded transition-colors ${
              location.pathname === "/modern-table"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-gray-200"
            }`}
          >
            Modern Table
          </Link>
          <Link
            to="/refactor-table"
            className={`px-4 py-2 rounded transition-colors ${
              location.pathname === "/refactor-table"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-gray-200"
            }`}
          >
            Refactor Table
          </Link>
        </div>
      </div>
    </nav>
  );
}
