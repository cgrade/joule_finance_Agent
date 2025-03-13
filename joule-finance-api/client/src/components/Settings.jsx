import { useState, useEffect } from "react";
import { FiSettings, FiUpload, FiX, FiCheck } from "react-icons/fi";

function Settings({ onClose }) {
  const [logo, setLogo] = useState(() => {
    return localStorage.getItem("joule_logo") || "";
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target.result;
        setLogo(logoData);
        localStorage.setItem("joule_logo", logoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target.result;
        setLogo(logoData);
        localStorage.setItem("joule_logo", logoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogo = () => {
    setLogo("");
    localStorage.removeItem("joule_logo");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-neutral-800">
            Chat Settings
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6">
          <h3 className="font-medium mb-3">Logo</h3>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 ${
              isDragging
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {logo ? (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 mb-4 overflow-hidden">
                  <img
                    src={logo}
                    alt="Joule Finance Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={resetLogo}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove Logo
                </button>
              </div>
            ) : (
              <div className="py-4">
                <FiUpload className="mx-auto h-12 w-12 text-neutral-400" />
                <p className="mt-2 text-sm text-neutral-600">
                  Drag and drop your logo here, or
                </p>
                <label className="mt-2 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 cursor-pointer">
                  <span>Select Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="mt-6 text-xs text-neutral-500">
            <p>
              Recommended logo size: 256x256 pixels. PNG or JPG format
              recommended.
            </p>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
          >
            <FiCheck className="mr-2" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
