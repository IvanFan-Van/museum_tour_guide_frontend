import {
    ArrowUpIcon,
    AudioLines,
    Camera,
    FileText,
    Pause,
    Play,
    Scan,
} from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from "./ui/input-group";
import { Separator } from "@radix-ui/react-separator";
import { Spinner } from "./ui/spinner";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import useScan from "@/hooks/use-scan";
import { useConversation } from "@/context/conversation_context";

export default function InputArea() {
    const {
        query,
        attachedFiles,
        isPlaying,
        isLoading,
        toggleAudioPlay,
        handleSubmit,
        handleInputChange,
        processScannedFile,
    } = useConversation();

    const { isOpen, toggleOpen, close, handleScan } = useScan({
        onSuccess: processScannedFile,
    });

    return (
        <div className="sticky bottom-4">
            {/* 展示文件小图标 */}
            {attachedFiles && (
                <div className="mb-2">
                    {attachedFiles.map((metadata) => {
                        return (
                            <Card
                                className="inline-block py-2 px-2"
                                key={metadata.docId}
                            >
                                <CardContent className="flex items-center text-xs gap-2 p-0 text-muted-foreground truncate">
                                    <FileText className="w-4 h-4" />
                                    <p>
                                        {metadata.filename} (page:{" "}
                                        {metadata.pageIndex})
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
            <InputGroup className="bg-background dark:bg-background">
                <InputGroupTextarea
                    placeholder="Ask, Search or Chat..."
                    onChange={handleInputChange}
                    value={query}
                />
                <InputGroupAddon align="block-end">
                    {/* 拍照按钮 */}
                    <InputGroupButton
                        variant="outline"
                        className="rounded-full"
                        size="icon-sm"
                    >
                        <Camera />
                    </InputGroupButton>

                    {/* 扫描模态框 */}
                    <Dialog open={isOpen} onOpenChange={toggleOpen}>
                        <DialogTrigger asChild>
                            <InputGroupButton
                                variant="outline"
                                className="rounded-full"
                                size="icon-sm"
                            >
                                <Scan />
                            </InputGroupButton>
                        </DialogTrigger>
                        <DialogContent className="max-w-md p-0 overflow-hidden">
                            {" "}
                            {/* shadcn Dialog 内容样式 */}
                            <DialogHeader className="p-4 border-b">
                                <DialogTitle>Scan QR Code</DialogTitle>
                            </DialogHeader>
                            <div className="relative p-4 bg-black flex justify-center items-center">
                                <Scanner
                                    onScan={handleScan}
                                    // classNames="w-full h-auto max-h-96" // 限制高度，响应式
                                    styles={{
                                        container: {
                                            background: "transparent",
                                        }, // 透明背景，适应 dark/light 模式
                                        video: { objectFit: "cover" }, // 视频覆盖样式
                                    }}
                                />
                                <p className="absolute bottom-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                                    Scan the aligned QR code
                                </p>
                            </div>
                            <div className="p-4 border-t flex justify-end">
                                <Button variant="outline" onClick={close}>
                                    Return
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Separator orientation="vertical" className="!h-4" />
                    {/* 发送按钮 */}
                    <InputGroupButton
                        variant="default"
                        className="rounded-full ml-auto"
                        size="icon-sm"
                        onClick={() => handleSubmit()}
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner /> : <ArrowUpIcon />}
                    </InputGroupButton>

                    {/* 播放按钮 */}
                    <InputGroupButton
                        variant="default"
                        className="rounded-full"
                        size="icon-sm"
                        onClick={toggleAudioPlay}
                    >
                        {isPlaying ? <Pause /> : <AudioLines />}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </div>
    );
}
