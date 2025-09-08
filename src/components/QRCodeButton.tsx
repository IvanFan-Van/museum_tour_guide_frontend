import type { Dispatch, SetStateAction } from "react";
import { FaQrcode } from "react-icons/fa";

const QRCodeButton = ({
    isLoading,
    setScannerMode,
}: {
    isLoading: boolean;
    setScannerMode: Dispatch<SetStateAction<boolean>>;
}) => {
    return (
        <div>
            <button disabled={isLoading} onClick={() => setScannerMode(true)}>
                <FaQrcode />
            </button>
        </div>
    );
};

export default QRCodeButton;
