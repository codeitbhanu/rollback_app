import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import ActionButtons from "./ActionButtons";

// import fake_data from "../datajson/data";
import status_map from "../datajson/statusmap";
import reasons_map from "../datajson/reasonsmap";

// const defPath = "~";

function Container({ eel, params, setParams }) {
    const MODE_MANUAL = "manual";
    const MODE_INSTANT = "instant";
    const INSTANT_MODE_STATUS_ID = -1;
    const CONST_SUCCESS = "SUCCESS";
    const CONST_FAILURE = "FAILURE";

    const [state, setState] = useState({
        mode: MODE_INSTANT,
        manual_status: -1,
        reason_other: false,
        reason_desc: "",
        reason_manual: "",
        data: [], //fake_data,
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
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

    const handleBarcodeInput = (event) => {
        const pcb_sn = event.target.value.trim();
        // alert(`___${pcb_sn}___`);

        try {
            if (params.session.server.status) {
                eel.rollback(
                    pcb_sn,
                    state.mode,
                    state.mode === MODE_INSTANT
                        ? INSTANT_MODE_STATUS_ID
                        : state.manual_status,
                    state.reason_other
                        ? state.reason_manual
                        : state.reason_desc,
                    params.session.server.id_user
                )((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;
                        let current_status = status_map.filter(
                            (item) =>
                                item.id_status ===
                                parseInt(metadata.current_status)
                        )[0];
                        console.log(
                            `expected ${metadata.current_status} got: ${current_status}`
                        );
                        let target_status = status_map.filter(
                            (item) =>
                                item.id_status ===
                                parseInt(metadata.target_status)
                        )[0];
                        console.log(
                            `expected ${metadata.target_status} got: ${target_status}`
                        );

                        setState({
                            ...state,
                            data: [
                                ...state.data,
                                {
                                    id: uuidv4(),
                                    pcb_sn: metadata.pcb_sn,
                                    prod_desc: metadata.prod_desc
                                        ? metadata.prod_desc
                                        : "Not found",
                                    current_status:
                                        current_status !== undefined
                                            ? current_status
                                            : -1,
                                    target_status:
                                        target_status !== undefined
                                            ? target_status
                                            : -1,
                                    user: metadata.id_user
                                        ? metadata.id_user
                                        : "Unknown",
                                    message: message,
                                    status: status,
                                },
                            ],
                        });

                        // setTimeout(() => {
                        //     alert(
                        //         `${status ? CONST_SUCCESS : CONST_FAILURE} ${
                        //             response.message
                        //         } data: ${data.select_count}`
                        //     );
                        // }, 200);
                        // console.log(JSON.stringify(state.data));
                        // TODO: Status out of data
                    } catch (error) {
                        setTimeout(() => {
                            alert(`PARSE ERROR: ${error}`);
                        }, 200);
                    }
                });
            } else {
                throw Error(`Connect the server first`);
            }
            event.target.value = "";
        } catch (error) {
            alert(`ERROR: ${error}`);
        }
    };

    const handleSelectTargetDropdown = (event) => {
        console.log("handleSelectTargetDropdown called ");
        // alert(JSON.stringify(event.target.id));
        const status = event.target.value;
        let manual_status = status_map.filter(
            (item) => item.status_desc === status
        )[0];
        console.log(
            `status: ${status} manual_status: ${JSON.stringify(manual_status)}`
        );
        setState({
            ...state,
            manual_status: manual_status.id_status,
        });
    };

    const handleSelectReasonDropdown = (event) => {
        console.log("handleSelectReasonDropdown called ");
        // alert(JSON.stringify(event.target.value));
        const reason = event.target.value;
        const isOther = reason.startsWith("Other");
        setState({
            ...state,
            reason_other: isOther,
            reason_desc: isOther ? state.reason_manual : reason,
        });
    };

    const handleChangeTextBox = (event) => {
        console.log("handleSelectReasonDropdown called " + event.target.value);
        setState({
            ...state,
            reason_manual: event.target.value,
        });
    };

    const handleRemoveItem = (id, rownum, serial) => {
        console.log("handleSelectReasonDropdown called ");
        if (
            window.confirm(
                `Confirm delete Row: ${rownum} - ${serial} from below list?`
            )
        ) {
            setState((state) => {
                const list = state.data.filter((item) => item.id !== id);
                // console.log(`list: ${list}`);
                return { ...state, data: list };
            });
        }
    };

    // console.log(status_map);
    // console.log(fake_data);

    return (
        <div className="absolute flex flex-col w-full mt-4 border-0 border-red-600 h-1/2">
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex w-1/5 ml-8 border-0 border-blue-700 border-double rounded-t-lg form-control">
                    <div className="">
                        <nav className="flex flex-col sm:flex-row">
                            <button
                                className={`flex-1 block px-6 py-4 lg:text-3xl md:text-xl sm:text-md font-bold  border-b-2 border-blue-500 hover:text-blue-500 focus:outline-none ${
                                    state.mode === MODE_INSTANT
                                        ? "text-blue-600 underline"
                                        : "text-gray-500"
                                }`}
                                onClick={modeInstant}
                            >
                                Instant
                            </button>
                            <button
                                className={`flex-1 block px-6 py-4 lg:text-3xl md:text-xl sm:text-md font-bold  border-b-2 border-blue-500 hover:text-blue-500 focus:outline-none ${
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
                    <div className="flex flex-col mt-2 border-0 border-red-600">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Select Reason Of Rollback
                            </span>
                        </label>
                        <select
                            className="flex min-w-full select select-bordered select-primary"
                            disabled=""
                            onChange={(e) => handleSelectReasonDropdown(e)}
                        >
                            {reasons_map.map((reason) => (
                                <option
                                    disabled={reason.id_status === 0}
                                    selected={reason.id_status === 0}
                                    key={reason.id_status}
                                    id={reason.id_status}
                                >
                                    {reason.status_desc}
                                </option>
                            ))}
                        </select>
                    </div>

                    {state.reason_other && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Write Reason</span>
                            </label>
                            <textarea
                                className="h-24 textarea textarea-bordered textarea-primary"
                                placeholder="NCR or Ticket No. with details."
                                onChange={(e) => handleChangeTextBox(e)}
                                value={state.reason_manual}
                            ></textarea>
                        </div>
                    )}
                    {state.mode === MODE_MANUAL && (
                        <div className="border-0 border-red-600">
                            <div className="flex flex-col mt-2 border-0 border-red-600">
                                <label className="text-black label">
                                    <span className="text-black label-text">
                                        Select Target Status
                                    </span>
                                </label>
                                <select
                                    className="flex min-w-full select select-bordered select-primary"
                                    onChange={(e) =>
                                        handleSelectTargetDropdown(e)
                                    }
                                >
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
                            {/* <div className="flex flex-col h-48 mt-8">
                                <button
                                    className="h-32 text-3xl btn btn-accent btn-active"
                                    onClick={handleSelectTargetDropdown}
                                >
                                    Rollback
                                </button>

                                <p>{state.message}</p>
                            </div> */}
                        </div>
                    )}
                    <div className="flex flex-col mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Enter PCB_Num / STB_Num
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter PCB_Num / STB_Num"
                            className="border-double input input-primary input-bordered"
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleBarcodeInput(e)
                            }
                        />
                    </div>
                </div>
                <div className="bottom-0 flex flex-1 px-4 pt-0 border-0 border-red-500">
                    <div className="flex-1 overflow-y-scroll">
                        <table className="flex table w-full overflow-x-hidden table-compact">
                            <thead className="overflow-x-hidden">
                                <tr className="bg-gray-400">
                                    <th></th>
                                    <th>Serial</th>
                                    <th>Product</th>
                                    <th>Current Status</th>
                                    <th>Target Status</th>
                                    <th>User</th>
                                    <th>Done?</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="overflow-y-scroll">
                                {state.data.map((resp, index) => (
                                    <tr
                                        key={resp.id}
                                        id={resp.id}
                                        className="p-0 border-0 border-red-600"
                                    >
                                        <th>{index + 1}</th>
                                        <td>{resp.pcb_sn}</td>
                                        <td>{resp.prod_desc}</td>
                                        <td>{`${resp?.current_status?.id_status} (${resp?.current_status?.status_desc})`}</td>
                                        <td>{`${resp?.target_status?.id_status} (${resp?.target_status?.status_desc})`}</td>
                                        <td>{resp.user}</td>
                                        <td
                                            className={
                                                resp.status === CONST_SUCCESS
                                                    ? `bg-yellow-200 text-green-500`
                                                    : `bg-yellow-200 text-red-500`
                                            }
                                        >
                                            {resp.status}
                                        </td>
                                        <td>
                                            <ActionButtons
                                                index={resp.id}
                                                rowNum={index + 1}
                                                serial={resp.pcb_sn}
                                                warn={
                                                    resp.status ===
                                                    CONST_FAILURE
                                                }
                                                removeItem={handleRemoveItem}
                                                message={resp.message}
                                            />
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
