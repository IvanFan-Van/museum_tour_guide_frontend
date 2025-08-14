import type { Dispatch, SetStateAction } from "react";
import CameraIcon from "../assets/CameraIcon.svg";

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
        <div className="size-[8vh] rounded-full focus:outline-none transition-all duration-200 flex items-center hover:opacity-50">
            <input
                className="hidden"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                id="cameraInput"
            />
            <button
                onClick={() => document.getElementById("cameraInput")?.click()}
            >
                <img src={CameraIcon} className="size-[64px]" />
            </button>
        </div>
    );
}
