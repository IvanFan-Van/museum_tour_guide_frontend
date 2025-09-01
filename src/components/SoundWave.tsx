export default function SoundWave() {
    return (
        <div className="flex items-center justify-center space-x-1.5 h-[7vh]">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full animate-wave" />
            <span
                className="w-1.5 h-8 bg-blue-500 rounded-full animate-wave"
                style={{ animationDelay: "0.2s" }}
            />
            <span
                className="w-1.5 h-6 bg-blue-500 rounded-full animate-wave"
                style={{ animationDelay: "0.4s" }}
            />
            <span
                className="w-1.5 h-8 bg-blue-500 rounded-full animate-wave"
                style={{ animationDelay: "0.6s" }}
            />
            <span
                className="w-1.5 h-4 bg-blue-500 rounded-full animate-wave"
                style={{ animationDelay: "0.8s" }}
            />
        </div>
    );
}
