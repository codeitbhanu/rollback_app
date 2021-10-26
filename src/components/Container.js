import React, { useState } from "react";
import ActionButtons from "./ActionButtons";

import fake_data from "../datajson/data";
import status_map from "../datajson/statusmap";

const defPath = "~";

function Container({ eel, params, setParams }) {
    const MODE_MANUAL = "manual";
    const MODE_INSTANT = "instant";
    const INSTANT_MODE_STATUS_ID = "-1";
    const [state, setState] = useState({
        mode: MODE_INSTANT,
        message: `Click button to choose a random file from the user's system`,
        path: defPath,
        data: fake_data,
    });

    const modeInstant = () => {
        setState({ ...state, mode: MODE_INSTANT });
    };

    const modeManual = () => {
        setState({ ...state, mode: MODE_MANUAL });
    };

    // const pickFile = () => {
    //     eel.pick_file(defPath)((response) => {
    //         console.log(`message: ${response}`);
    //         setState({ ...state, response });
    //     });
    // };

    const handleBoxInput = (event) => {
        const pcb_sn = event.target.value.trim();
        // alert(`___${pcb_sn}___`);
        eel.rollback(
            pcb_sn,
            state.mode,
            INSTANT_MODE_STATUS_ID,
            params.session.server.id_user
        )((response) => {
            console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
            let data = response.data.metadata;
            let status = response.status;
            if (status.startsWith("SUCCESS")) {
                // TODO: add small alerts
                alert(`SUCCESS ${response.message} data: ${data.select_count}`);
                // alert(`ROLLBACK SUCCESS: ${message}`);
            } else {
                // TODO: handle when status change is not allowed as per rule matrix
                alert(`FAILURE ${response.message} data: ${data.select_count}`);
                // alert(`ROLLBACK ERROR: ${message}`);
            }

            console.log(data);
            // TODO: Status out of data
        });
        event.target.value = "";
    };

    const handleManualRollback = (event) => {
        alert(event.target.value);
    };

    // console.log(status_map);
    // console.log(fake_data);

    return (
        <div className="absolute flex flex-col w-full mt-4 border-2 border-red-600 h-1/2">
            <div className="flex border-2 border-green-400 border-dashed">
                <div className="flex ml-8 border-2 border-blue-700 border-double form-control">
                    <div className="bg-white">
                        <nav className="flex flex-col sm:flex-row">
                            <button
                                className={`flex-1 block px-6 py-4 text-3xl font-bold  border-b-2 border-blue-500 hover:text-blue-500 focus:outline-none ${
                                    state.mode === MODE_INSTANT
                                        ? "text-blue-600 underline"
                                        : "text-gray-500"
                                }`}
                                onClick={modeInstant}
                            >
                                Instant
                            </button>
                            <button
                                className={`flex-1 block px-6 py-4 text-3xl font-bold  border-b-2 border-blue-500 hover:text-blue-500 focus:outline-none ${
                                    state.mode === MODE_MANUAL
                                        ? "text-blue-600 underline"
                                        : "text-gray-500"
                                }`}
                                onClick={modeManual}
                            >
                                Manual
                            </button>
                        </nav>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Enter PCB_Num / STB_Num
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter PCB_Num / STB_Num"
                            className="input input-primary input-bordered"
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleBoxInput(e)
                            }
                        />
                    </div>
                    {state.mode === MODE_MANUAL && (
                        <div>
                            <div className="flex flex-col mt-8 border-2 border-red-600">
                                <label className="text-black label">
                                    <span className="text-black label-text">
                                        Select Target Status
                                    </span>
                                </label>
                                <select className="flex min-w-full select select-bordered select-primary">
                                    {status_map.map((status) => (
                                        <option
                                            disabled={status.id_status === -1}
                                            selected={status.id_status === -1}
                                            key={status.id_status}
                                            id={status.id_status}
                                        >
                                            {status.status_desc}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col h-48 mt-8">
                                <button
                                    className="h-32 text-3xl btn btn-accent btn-active"
                                    onClick={handleManualRollback}
                                >
                                    Rollback `{/** state.path */}`
                                </button>

                                <p>{state.message}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bottom-0 flex flex-1 px-8 border-2 border-red-500 pt-9 h-tableheight">
                    <div className="flex flex-1 overflow-y-scroll">
                        <table className="flex table w-full table-compact">
                            <thead className="">
                                <tr className="bg-gray-400">
                                    <th></th>
                                    <th>Serial</th>
                                    <th>Product</th>
                                    <th>Current Status</th>
                                    <th>Target Status</th>
                                    <th>User</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="overflow-y-scroll">
                                {fake_data.map((data, index) => (
                                    <tr key={index}>
                                        <th>{index + 1}</th>
                                        <td>{data.serial}</td>
                                        <td>{data.product}</td>
                                        <td>{data.curr_status}</td>
                                        <td>{data.target_status}</td>
                                        <td>{data.user}</td>
                                        <td>
                                            <ActionButtons warn={true} />
                                        </td>
                                    </tr>
                                ))}

                                {/*<tr>
                                    <th>20</th>
                                    <td>Lorelei Blackstone</td>
                                    <td>Data Coordiator</td>
                                    <td>Witting, Kutch and Greenfelder</td>
                                    <td>Kazakhstan</td>
                                    <td>6/3/2020</td>
                                    <td>Red</td>
                                </tr> */}
                            </tbody>
                            {/* <tfoot>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Job</th>
                                    <th>company</th>
                                    <th>location</th>
                                    <th>Last Login</th>
                                    <th>Favorite Color</th>
                                </tr>
                            </tfoot> */}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Container;
