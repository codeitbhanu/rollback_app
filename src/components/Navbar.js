import React from "react";
import logo from "../logo.svg";

function navbar() {
    return (
        <div className="flex content-center p-4 mb-2 shadow-lg navbar bg-neutral text-neutral-content">
            <div className="flex-none">
                <button className="btn btn-square btn-ghost">
                    <img src={logo} className="w-full h-full" alt="logo" />
                </button>
            </div>
            <div className="flex-1 px-2 mx-2">
                <span className="text-4xl font-bold">Rollback Kiosk</span>
            </div>
        </div>
    );
}

export default navbar;
