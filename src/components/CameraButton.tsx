import { FaCamera } from "react-icons/fa";

const CameraButton = () => {
    return (
        <div className="rounded-full focus:outline-none transition-all duration-200 flex items-center hover:opacity-50">
            <input
                className="hidden"
                type="file"
                accept="image/*"
                capture="environment"
                id="camera-input"
            />
            <label htmlFor="camera-input" className="cursor-pointer">
                <FaCamera />
            </label>
        </div>
    );
};

export default CameraButton;
