const Logo = ({ src }: { src: string }) => {
    return (
        <div className="w-auto">
            <img src={src} className="w-full" />
        </div>
    );
};

export default Logo;
