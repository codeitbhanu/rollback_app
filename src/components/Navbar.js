import React from "react";
import logo from "../logo.svg";

function Navbar({ eel, params, setParams }) {
    console.log("params" + JSON.stringify(params));
    const connect_db = (path) => {
        if (eel) {
            if (params.session.server.status === false) {
                eel.connect_db((path = ""))((response) => {
                    console.log(`[PY]: ${JSON.stringify(message)}`);
                    let data = response.data;
                    let message = response.message;
                    if (message.startsWith("SUCCESS")) {
                        setParams({
                            ...params,
                            session: {
                                ...params.session,
                                server: {
                                    ...params.session.server,
                                    status: true,
                                },
                            },
                        });
                    }
                });
            } else {
                // alert("Server is already connected");
                eel.disconnect_db()((response) => {
                    console.log(`[PY]: ${JSON.stringify(response)}`);
                    let data = response.data;
                    let message = response.message;
                    if (message.startsWith("SUCCESS")) {
                        setParams({
                            ...params,
                            session: {
                                ...params.session,
                                server: {
                                    ...params.session.server,
                                    status: false,
                                },
                            },
                        });
                    }
                });
            }
            return;
        } else {
            alert("Unable to get instance of `Eel`");
        }
        setParams({
            ...params,
            session: {
                ...params.session,
                server: {
                    ...params.session.server,
                    status: false,
                },
            },
        });
    };

    // const server_status = false;
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
            <div className="flex justify-end flex-1 px-2 ">
                <div className="flex flex-col w-auto shadow stats ">
                    <div className="flex align-middle bg-gray-200 rounded-full h-18">
                        <div className="flex stat-figure text-primary">
                            {/* <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                viewBox="0 0 20 20"
                                fill="#0f0"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg> */}
                        </div>
                        {/* <div className="stat-title">Total Likes</div> */}
                        <div>
                            <input
                                type="checkbox"
                                checked={params.session.server.status}
                                className="toggle toggle-accent cursor"
                                onChange={() => connect_db()}
                            />
                        </div>
                        <div className="text-xl stat-value text">SERVER: </div>

                        {params.session.server.status ? (
                            <div className="text-xl stat-value text-success">
                                OK
                            </div>
                        ) : (
                            <div className="text-xl font-bold text-red-600">
                                NOT-OK
                            </div>
                        )}
                        {/* <div className="stat-desc">
                            21% more than last month
                        </div> */}
                    </div>

                    {/* <p className="">{`server: ${params.session.server.status}`}</p>
                    <input
                        type="checkbox"
                        checked={params.session.server.status}
                        className="toggle toggle-primary cursor"
                        onChange={() => connect_db()}
                    /> */}
                </div>
                <div className="divider divider-vertical"></div>
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

export default Navbar;
