import { Monitor, Tablet } from "lucide-react";

const MobileMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="flex items-center gap-4 mb-6">
        <Tablet className="w-8 h-8 text-blue-500" />
        <Monitor className="w-8 h-8 text-blue-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Desktop or Tablet Required
      </h2>

      <p className="text-gray-600 max-w-md leading-relaxed">
        This table is optimized for larger screens. Please view on a tablet
        (768px or wider) or desktop device for the best experience.
      </p>

      <div className="mt-6 px-4 py-2 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          Current screen width is too small to display the table properly
        </p>
      </div>
    </div>
  );
};

export default MobileMessage;