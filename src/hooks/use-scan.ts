import type { FileMetadata } from "@/stores/conversation-store";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import { toast } from "sonner";

/**
 * 从 QR code raw value 中解析 doc_id.
 * 支持 URL 格式: https://example.com?doc_id=xxx
 */
function parseDocId(rawValue: string): string | null {
    try {
        const url = new URL(rawValue);
        return url.searchParams.get("doc_id");
    } catch {
        return null;
    }
}

/**
 * 使用 React-Scanner 获取 Scan 之后的信息
 */
export default function useScan({
    onSuccess,
}: {
    onSuccess: (data: FileMetadata) => void;
}) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggleOpen = () => setIsOpen((prev) => !prev);

    /**
     * 执行传入的 onSuccess 回调函数, 并关闭扫描框
     */
    const handleScan = (results: IDetectedBarcode[]) => {
        if (results.length === 0) return;

        const rawValue = results[0].rawValue;
        const docId = parseDocId(rawValue);

        if (!docId) {
            toast.error("QR code does not contain a valid doc_id");
            console.error("QR code missing doc_id:", rawValue);
            return;
        }

        onSuccess({ docId });
        close();
        toast.success("Document scanned successfully");
    };

    return {
        isOpen,
        open,
        close,
        toggleOpen,
        handleScan,
    };
}
