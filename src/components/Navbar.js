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
            <div className="flex justify-end flex-1 px-2">
                <p>bhanu.pratap</p>
                <div className="flex items-stretch">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} className="btn btn-ghost rounded-btn">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="p-2 text-gray-600 shadow menu dropdown-content bg-base-100 rounded-box w-52"
                        >
                            <li>
                                <button className="text-gray-600 bg-transparent border-none btn hover:text-gray-200">
                                    Login
                                </button>
                            </li>
                            <li>
                                <button className="text-gray-600 bg-transparent border-none btn hover:text-gray-200">
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default navbar;
