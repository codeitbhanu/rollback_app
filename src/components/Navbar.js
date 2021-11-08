import { useState } from "react";
import logo from "../logo.svg";

function Navbar({ eel, params, setParams, config_data }) {
    // console.log("params" + JSON.stringify(params.server.driver));

    const [state, setState] = useState({
        openLogin: false,
        user_desc: "",
        password: "",
    });

    const onChangeUsername = (e) => {
        console.log("user_desc: " + e.target.value);
        setState({ ...state, user_desc: e.target.value.trim() });
    };

    const onChangePassword = (e) => {
        console.log("password: " + e.target.value);
        setState({ ...state, password: e.target.value.trim() });
    };

    const validateLogin = () => {
        if (state.user_desc === "") {
            alert("Please enter user_desc");
            return false;
        }
        if (state.password === "") {
            alert("Please enter password");
            return false;
        }
        const result_list = config_data.users.filter((user) => {
            // console.log(user);
            if (
                user.user_desc === state.user_desc &&
                user.password === state.password
            ) {
                return true;
            }
            return false;
        });
        console.log("result_list" + JSON.stringify(result_list));
        if (result_list.length === 0) {
            alert("Invalid user_desc or password");
            return false;
        } else {
            setParams({
                ...params,
                session: {
                    ...params.session,
                    userdata: result_list[0],
                    active: true,
                },
            });
            setState({ ...state, openLogin: false });
            return true;
        }
    };

    const connect_db = () => {
        if (eel) {
            try {
                if (params.server.status === false) {
                    eel.connect_db(
                        // params.server.driver,
                        // params.server.host,
                        // params.server.database,
                        // params.session.userdata.user_desc,
                        // params.session.userdata.password
                        params.server.host
                    )((response) => {
                        console.log(`[PY]: ${JSON.stringify(response.data)}`);
                        console.log(
                            `[PY]: ${JSON.stringify(response.message)}`
                        );
                        console.log(`[PY]: ${JSON.stringify(response.status)}`);
                        // let data = response.data;
                        let status = response.status;
                        if (status.startsWith("SUCCESS")) {
                            setParams({
                                ...params,
                                server: {
                                    ...params.server,
                                    status: true,
                                },
                            });
                        }
                    });
                } else {
                    // alert("Server is already connected");
                    eel.disconnect_db()((response) => {
                        console.log(`[PY]: ${JSON.stringify(response)}`);
                        // let data = response.data;
                        let status = response.status;
                        if (status.startsWith("SUCCESS")) {
                            setParams({
                                ...params,
                                server: {
                                    ...params.server,
                                    status: false,
                                },
                            });
                        }
                    });
                }
            } catch (error) {
                alert(error);
            }
        } else {
            alert("Unable to get instance of `Eel`");
        }
        setParams({
            ...params,
            session: {
                ...params.session,
                server: {
                    ...params.server,
                    status: false,
                },
            },
        });
    };

    const handleLogin = () => {
        console.log("handleLogin called");
        setState({ ...state, openLogin: !state.openLogin });
    };

    const handleLogout = () => {
        console.log("handleLogout called");
        setParams({
            ...params,
            session: { ...params.session, userdata: {}, active: false },
        });
    };

    // console.log(`
    //     [JS]: ${JSON.stringify(params)}
    // `);
    // const server_status = false;
    return (
        <div className="flex content-center p-0 mb-2 shadow-lg navbar bg-neutral text-neutral-content">
            <div className="flex-none">
                <button className="btn btn-square btn-ghost">
                    <img src={logo} className="w-full h-full" alt="logo" />
                </button>
            </div>
            <div className="flex-1 px-2 mx-2">
                <span className="text-4xl font-bold">Rollback Kiosk</span>
            </div>
            <div className="flex justify-end flex-1 border-0 border-red-300">
                <div className="flex flex-col justify-between align-middle bg-gray-200 border-4 border-gray-300 rounded-full shadow max-h-12">
                    <div className="flex justify-between px-2 py-1 align-middle border-0 border-red-600">
                        <div className="flex pr-2 align-middle border-0 border-green-600 flex-start text-primary">
                            {/* <div className="stat-title">Total Likes</div> */}
                            <input
                                type="checkbox"
                                checked={params.server.status}
                                className="flex my-auto align-middle toggle toggle-accent cursor"
                                onChange={() => connect_db()}
                            />
                        </div>
                        <div
                            className={`flex text-xl border-0  ${
                                params.server.status
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {params.server.status
                                ? "SERVER OK"
                                : "SERVER NOT_OK"}
                        </div>

                        {/* <div className="flex justify-center">
                            <div
                                className={`flex-1 w-12 h-6 transition duration-200 ease-linear rounded ${
                                    params.server.status
                                        ? "bg-green-400"
                                        : "bg-gray-400"
                                }`}
                            >
                                <label
                                    className={`left-0 w-16 h-6 mb-2 transition duration-100 ease-linear transform bg-white border-0 rounded cursor-pointer ${
                                        params.server.status
                                            ? "translate-x-full border-green-400"
                                            : "translate-x-0 border-gray-400"
                                    }`}
                                />
                                <input
                                    type="checkbox"
                                    id="toggle"
                                    name="toggle"
                                    className="w-1/2 h-full appearance-none focus:outline-none"
                                    onChange={() => connect_db()}
                                />
                            </div>
                        </div> */}

                        {/* <div className="stat-desc">
                            21% more than last month
                        </div> */}
                    </div>

                    {/* <p className="">{`server: ${params.server.status}`}</p>
                    <input
                        type="checkbox"
                        checked={params.server.status}
                        className="toggle toggle-primary cursor"
                        onChange={() => connect_db()}
                    /> */}
                </div>
                <div className="divider divider-vertical"></div>
                <p>
                    {`${
                        params.session.userdata.user_desc
                            ? params.session.userdata.user_desc +
                              ` (${params.session.userdata.id_user})`
                            : "Please Login"
                    }`}
                </p>

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
                            {params.session.active === false ? (
                                <li>
                                    <button
                                        className="text-gray-600 bg-transparent border-none btn hover:text-gray-200"
                                        onClick={handleLogin}
                                    >
                                        Login
                                    </button>
                                    {state.openLogin ? (
                                        <div className="form-control">
                                            <div className="flex flex-col">
                                                <label className="py-2 input-group input-group-xs">
                                                    <span>@</span>
                                                    <input
                                                        type="text"
                                                        placeholder="username"
                                                        className="ml-2 input input-bordered input-xs"
                                                        onChange={
                                                            onChangeUsername
                                                        }
                                                    />
                                                </label>
                                                <label className="py-2 input-group input-group-xs">
                                                    <span>$</span>
                                                    <input
                                                        type="password"
                                                        placeholder="password"
                                                        className="ml-2 input input-bordered input-xs"
                                                        onChange={
                                                            onChangePassword
                                                        }
                                                    />
                                                </label>

                                                <button
                                                    className="py-2 btn btn-primary"
                                                    onClick={validateLogin}
                                                >
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
                                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                </li>
                            ) : (
                                <li>
                                    <button
                                        className="text-gray-600 bg-transparent border-none btn hover:text-gray-200"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
