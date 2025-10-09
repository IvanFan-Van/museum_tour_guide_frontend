import type { FileMetadata } from "@/App";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import { toast } from "sonner";

/**
 * 使用 React-Scanner 获取 Scan 之后的信息
 */
export default function useScan({
    onSuccess,
}: {
    onSuccess: (data: FileMetadata) => void;
}) {
    // const result = useRef<IDetectedBarcode[]>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggleOpen = () => setIsOpen((prev) => !prev);

    /**
     * 执行传入的 onSuccess 回调函数, 并关闭扫描框
     */
    const handleScan = (results: IDetectedBarcode[]) => {
        if (results.length === 0) return;

        try {
            const data: FileMetadata = JSON.parse(results[0].rawValue);
            onSuccess(data);
            close();
            toast.success(`Scanned: ${data.filename}`);
        } catch (error) {
            toast.error("Failed to parse data in QR Code");
            console.error("Failed to parse data in QR Code", error);
        }
    };

    return {
        isOpen,
        open,
        close,
        toggleOpen,
        handleScan,
    };
}
