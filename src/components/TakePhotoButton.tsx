import type { Dispatch, SetStateAction } from "react";
import { FaCamera } from "react-icons/fa";

export default function CameraButton({
    onClick: setInputImage,
}: {
    onClick: Dispatch<SetStateAction<string>>;
}) {
    const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setInputImage(URL.createObjectURL(event.target.files[0]));
        }
    };

    return (
        <div className="rounded-full focus:outline-none transition-all duration-200 flex items-center hover:opacity-50">
            <input
                className="hidden"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                id="camera-input"
            />
            <label htmlFor="camera-input" className="cursor-pointer">
                <FaCamera />
            </label>
        </div>
    );
}
