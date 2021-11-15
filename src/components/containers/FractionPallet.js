import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import ActionButtons from "../ActionButtons";

// import fake_data from "../datajson/data";
import status_map from "../../datajson/statusmap";
import reasons_map from "../../datajson/reasonsmap";

// const defPath = "~";

function FractionPallet({ eel, params, setParams }) {
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
        printer_list: [],
        last_pallet: "",
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    useEffect(() => {
        try {
            // if (params.session.active === false) {
            //     alert("Session not active, Please login first");
            //     return;
            // }
            if (true || params.server.status) {
                eel.get_printer_list()((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;

                        if (status === CONST_SUCCESS) {
                            setState((prevState) => ({
                                ...prevState,
                                printer_list: metadata.printers,
                            }));
                        } else {
                            setTimeout(() => {
                                alert(`RESPONSE ERROR: ${message}`);
                            }, 200);
                        }
                    } catch (error) {
                        setTimeout(() => {
                            alert(`PARSE ERROR: ${error}`);
                        }, 200);
                    }
                });
            } else {
                throw Error(`Connect the server first`);
            }
        } catch (error) {
            alert(`ERROR: ${error}`);
        }

        // return () => {
        //     cleanup
        // }
    }, []);

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
        const pallet_num = event.target.value.trim();
        console.log(`${eel}___${pallet_num}___`);

        try {
            // if (params.session.active === false) {
            //     alert("Session not active, Please login first");
            //     return;
            // }
            if (true || params.server.status) {
                let prod_id = 115;
                eel.get_last_pallet(prod_id)((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;

                        if (status === CONST_SUCCESS) {
                            setState((prevState) => ({
                                ...prevState,
                                printer_list: metadata.printers,
                            }));
                        } else {
                            setTimeout(() => {
                                alert(`RESPONSE ERROR: ${message}`);
                            }, 200);
                        }
                    } catch (error) {
                        setTimeout(() => {
                            alert(`PARSE ERROR: ${error}`);
                        }, 200);
                    }
                });
            } else {
                throw Error(`Connect the server first`);
            }
        } catch (error) {
            alert(`ERROR: ${error}`);
        }
    };

    const handleWeight = (event) => {
        const pallet_num = event.target.value.trim();
        console.log(`${eel}___${pallet_num}___`);

        try {
        } catch (error) {
            alert(`ERROR: ${error}`);
        }
    };

    const handleSelectTargetDropdown = (event) => {
        console.log("handleSelectTargetDropdown called ");
        // alert(JSON.stringify(event.target.id));
    };

    const handleSelectReasonDropdown = (event) => {
        console.log("handleSelectReasonDropdown called ");
        // alert(JSON.stringify(event.target.value));
    };

    const handleChangeTextBox = (event) => {
        console.log("handleSelectReasonDropdown called " + event.target.value);
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
        <div className="absolute flex flex-col w-full mt-4 border-2 border-gray-600 h-1/2">
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex w-1/5 ml-8 border-0 border-blue-700 border-double rounded-t-lg form-control">
                    <div className="">
                        {/* <nav className="flex flex-col sm:flex-row">
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
                        </nav> */}
                    </div>
                    <div className="flex flex-col mt-2 border-0 border-red-600">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Select Printer
                            </span>
                        </label>
                        <select
                            className="flex min-w-full select select-bordered select-primary"
                            disabled=""
                            onChange={(e) => handleSelectReasonDropdown(e)}
                        >
                            {state?.printer_list?.map((printer, index) => (
                                <option
                                    // disabled={printer.index === 0}
                                    selected={printer.index === 0}
                                    key={printer.index}
                                    id={printer.index}
                                >
                                    {printer}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* 
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
                    )} */}
                    {state.mode === MODE_MANUAL && (
                        <div className="border-0 border-red-600">
                            {/* <div className="flex flex-col mt-2 border-0 border-red-600">
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
                            </div> */}
                        </div>
                    )}
                    <div className="flex flex-col mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Choose Qty
                            </span>
                        </label>
                        <div className="w-full btn-group">
                            <input
                                type="radio"
                                name="options"
                                id="option1"
                                data-title={1}
                                className="btn btn-sm"
                            />
                            <input
                                type="radio"
                                name="options"
                                id="option2"
                                data-title={2}
                                defaultChecked="checked"
                                className="btn btn-sm"
                            />
                            <input
                                type="radio"
                                name="options"
                                id="option3"
                                data-title={3}
                                className="btn btn-sm"
                            />
                            <input
                                type="radio"
                                name="options"
                                id="option4"
                                data-title={4}
                                className="btn btn-sm"
                            />
                            <input
                                type="radio"
                                name="options"
                                id="option5"
                                data-title={5}
                                className="btn btn-sm"
                            />
                            <input
                                type="radio"
                                name="options"
                                id="option6"
                                data-title={6}
                                className="btn btn-sm"
                            />
                            <input
                                type="radio"
                                name="options"
                                id="option7"
                                data-title={7}
                                className="btn btn-sm"
                            />
                            <input
                                type="radio"
                                name="options"
                                id="option8"
                                data-title={8}
                                className="btn btn-sm"
                            />
                        </div>
                    </div>
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
                    <div className="flex flex-col mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Weight (in Kgs.)
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="Decimal eg. 9.12"
                            className="border-double input input-primary input-bordered"
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleWeight(e)
                            }
                        />
                    </div>
                    <div className="flex flex-col mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Edit Fraction Pallet (if incorrect)
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Fraction Pallet"
                            className="border-double input input-primary input-bordered"
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleBarcodeInput(e)
                            }
                        />
                    </div>
                    <div className="flex flex-col mt-4">
                        <button className="btn btn-lg">
                            <div className="w-8 h-8 mr-2">
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
                                        strokeWidth="{2}"
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                    />
                                </svg>
                            </div>
                            Print
                        </button>{" "}
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
                                        <th>
                                            {state.data.length !== 0
                                                ? state.data.length - index
                                                : 0}
                                        </th>
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

export default FractionPallet;
