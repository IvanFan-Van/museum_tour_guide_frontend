import type { Dispatch, SetStateAction } from "react";
import { IoIosChatboxes } from "react-icons/io";

export default function ChatHistoryButton({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
    return (
        <IoIosChatboxes onClick={() => setIsOpen((state: boolean) => !state)} />
    );
}
