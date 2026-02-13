import { ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";
import { useConversation } from "@/hooks/use-conversation";

const suggestions = [
    {
        title: "How did Chinese Ming and Qing dynasty ceramics travel across the globe and inspire artistic innovations in Europe and Asia?",
    },
    {
        title: "What makes blue-and-white porcelain a symbol of cultural exchange between China and the West?",
    },
    {
        title: "In what ways did European collectors transform Chinese porcelain into luxurious objects of wonder, and how did this reflect global trade?",
    },
    {
        title: "How did the influence of Chinese enamelled and celadon wares extend to regions like Korea, Thailand, and the Middle East?",
    },
];

function WelcomeHeader({ title, subtitle }: {
    title: string;
    subtitle: string;
}) {
    return (
        <div className="text-center mb-12">
            <h1 className="font-bold text-6xl mb-4">
                <span className="bg-gradient-to-r from-pink-500 via-red-500 to-red-600 bg-clip-text text-transparent">
                    {title}
                </span>
            </h1>
            <p className="text-muted-foreground text-xl">
                {subtitle}
            </p>
        </div>
    )
}

function SuggestionCard({
    handleClick,
    content,
}: {
    handleClick: () => void;
    content: string;
}) {
    return (
        <Button
            variant="outline"
            onClick={handleClick}
            className="group h-auto border-gray-200 p-6 text-left hover:bg-gray-50"
        >
            <div className="flex items-start justify-between w-full">
                <div className="flex-1 pr-4">
                    <p className="text-wrap text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                        {/* {suggestion.title} */}
                        {content}
                    </p>
                </div>
                <ArrowUpRight className="text-muted-foreground group-hover:text-primary" />
            </div>
        </Button>
    )
}

export default function WelcomeScreen() {
    const { createConversation } = useConversation();

    return (
        <div className="mx-auto max-w-4xl p-8 flex flex-col items-center justify-center flex-1">
            <WelcomeHeader
                title="Welcome To UMAG"
                subtitle="May I be of assistance today?"
            />

            <div className="flex-1">
                <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                    {suggestions.map((suggestion, index) => (
                        <SuggestionCard
                            key={index}
                            handleClick={() => createConversation(suggestion.title)}
                            content={suggestion.title}
                        />
                    ))}
                    <div className="col-span-full flex justify-center">
                        <SuggestionCard
                            key={suggestions.length}
                            handleClick={() => createConversation()}
                            content="Have your own question? Tap to ask!"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
