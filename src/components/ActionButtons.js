import React from "react";

function ActionButtons({
    actionList = [],
    index,
    rowNum,
    param,
    data,
    warn,
    message,
}) {
    const CONST_SUCCESS = "SUCCESS";
    const CONST_FAILURE = "FAILURE";
    const CONST_UNKNOWN = "UNKNOWN";

    const DEFAULT_PARAMETER = "Choose a parameter";
    const ACTION_BUTTON_EDIT = "edit";
    const ACTION_BUTTON_SAVE = "save";
    const ACTION_BUTTON_CANCEL = "cancel";
    const ACTION_BUTTON_DELETE = "delete";

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
            {actionList.map((action, index) => {
                let retObj = "";
                switch (action.action) {
                    case ACTION_BUTTON_EDIT:
                        retObj = (
                            <button
                                key={"actionBtn" + index}
                                className="hover:bg-gray-300"
                                onClick={() => action.cb(index, rowNum, param, data)}
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
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                </span>
                            </button>
                        );
                        break;
                    case ACTION_BUTTON_SAVE:
                        retObj = (
                            <button
                                key={"actionBtn" + index}
                                className="hover:bg-gray-300"
                                onClick={() => action.cb(index, rowNum, param, data)}
                            >
                                <div className="mr-2 badge badge-primary">Save</div>
                            </button>
                        );
                        break;
                    case ACTION_BUTTON_CANCEL:
                            retObj = (
                                <button
                                    key={"actionBtn" + index}
                                    className="justify-center hover:bg-gray-300"
                                    onClick={() => action.cb(index, rowNum, param, data)}
                                >
                                    <div className="mr-2 badge badge-accent">Cancel</div>
                                </button>
                            );
                            break;
                    default:
                        retObj = (
                            <button
                            key={"actionBtn" + index}
                                className="hover:bg-gray-300"
                                onClick={() => action.cb(index, rowNum, param, data)}
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
                        );
                }
                return retObj;
            })}

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
