import { Scanner } from "@yudiel/react-qr-scanner";
import type { Dispatch, SetStateAction } from "react";
import BackArrow from "../assets/BackArrow.svg";

export default function ScannerPage({
  setScannerMode,
  setQrValue,
}: {
  setScannerMode: Dispatch<SetStateAction<boolean>>;
  setQrValue: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex relative h-full w-full">
      <button
        onClick={() => setScannerMode(false)}
        className="flex opacity-80 absolute m-4 z-20 items-center justify-center rounded-full transition-all duration-200 bg-[#252733] hover:bg-gray-500 size-16"
      >
        <img src={BackArrow} className="size-10" />
      </button>
      <div
        className={`fixed inset-0 z-10 size-[30vh] m-auto aspect-square border-2 border-dashed border-red-600 rounded-lg`}
      >
        <div className="absolute size-[15%] border-4 border-solid border-t-red-400 border-l-red-400 border-b-transparent border-r-transparent rounded-tl-lg top-0 left-0" />
        <div className="absolute size-[15%] border-4 border-solid border-t-red-400 border-r-red-400 border-b-transparent border-l-transparent rounded-tr-lg top-0 right-0" />
        <div className="absolute size-[15%] border-4 border-solid border-b-red-400 border-l-red-400 border-t-transparent border-r-transparent bottom-0 left-0" />
        <div className="absolute size-[15%] border-4 border-solid border-b-red-400 border-r-red-400 border-t-transparent border-l-transparent bottom-0 right-0" />
      </div>
      <Scanner
        styles={{
          container: { position: "absolute", height: "100vh", width: "100vw" },
        }}
        onScan={(value: any) => setQrValue(value[0].rawValue)}
        components={{ finder: false }}
        scanDelay={100}
      />
    </div>
  );
}
