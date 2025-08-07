import type { Dispatch, SetStateAction } from "react"
import ChatHistoryAlt from "../assets/ChatHistoryAlt.svg"
import ChatHistory from "../assets/ChatHistory.svg"

export default function ChatHistoryButton({
    isOpen,
    setIsOpen
}: {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    return (
        <button
        className="flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-500 size-[8vh]"
        onClick={() => setIsOpen((state : boolean) => (!state))}
    >
        <img src={isOpen ? ChatHistory : ChatHistoryAlt} className="size-[60%]"/>
    </button>
    )
}