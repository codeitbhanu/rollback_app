import React from "react";

function ActionButtons({ index, rowNum, serial, warn, removeItem, message }) {
    return (
        <div className="flex">
            {/* <button className="hover:bg-gray-300">
                <span className="text-green-500 fill-current">
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                </span>
            </button> */}
            <button
                className="hover:bg-gray-300"
                onClick={() => removeItem(index, rowNum, serial)}
            >
                <span className="text-red-500 fill-current">
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </span>
            </button>
            {warn ? (
                <div data-tip={message} className="ml-2 tooltip tooltip-left">
                    <button className="hover:bg-gray-300" disabled={!warn}>
                        <span
                            className={
                                warn
                                    ? `fill-current text-yellow-400`
                                    : `fill-current hover:text-gray-200`
                            }
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={
                                    warn ? `animate-ping w-6 h-6` : `w-6 h-6`
                                }
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </span>
                    </button>
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
}

export default ActionButtons;
