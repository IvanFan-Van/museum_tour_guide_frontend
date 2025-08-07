import SettingsIcon from "../assets/Settings.svg";


export default function SettingsButton () {


    return (
        <button className="flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-500 size-[8vh]">
            <img src={SettingsIcon} className="size-[60%]"/>
        </button>
    )
}