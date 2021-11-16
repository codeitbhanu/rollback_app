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
        data: [],
        valid_scanned: 0,
        printer_list: [],
        fraction_max_count: 8,
        fraction_count: 2,
        fraction_weight: 0.0,
        validation_fraction_weight: false,
        quantity_group: [],
        last_pallet: "",
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    const resetState = () => {
        setState({
            ...state,
            data: [],
            valid_scanned: 0,
            printer_list: [],
            fraction_max_count: 8,
            fraction_count: 2,
            fraction_weight: 0.0,
            validation_fraction_weight: false,
            quantity_group: [],
            last_pallet: "",
        });
    };

    const onSelectFractionQty = (id = -1) => {
        console.log("onSelectFractionQty", id);
        setState((prevState) => ({
            ...prevState,
            data: [],
            valid_scanned: 0,
            fraction_max_count: 8,
            fraction_count: id,
            last_pallet: "",
        }));
    };

    const onChangeWeight = (event) => {
        const str = event.target.value.trim();
        let result = false;
        let n = 0.0;
        try {
            const re=/^[+-]?(?:\d*\.)?\d+$/;

            result = re.exec(str)
            if(result) {
                n = parseFloat(result[0])
            }
        } catch (e) {
            console.log("Error: " + e.message);
        }
        console.log("onChangeWeight: ", n);
        setState((prevState) => ({
            ...prevState,
            fraction_weight: n,
            validation_fraction_weight: result,
        }));
    };

    const update_fraction_buttons = (active = 2, max = 8) => {
        const button_group = [];
        for (let i = 1; i <= max; i++) {
            button_group.push(
                <input
                    type="radio"
                    name="options"
                    id={i}
                    key={"input-key-" + i}
                    data-title={i}
                    defaultChecked={i === state.fraction_count ? "checked" : ""}
                    onClick={() => onSelectFractionQty(i)}
                    className="btn btn-sm"
                />
            );
        }
        setState((prevState) => ({
            ...prevState,
            fraction_count: active,
            fraction_max_count: max,
            quantity_group: button_group,
        }));
    };

    const sendPrint = () => {
        console.log(state);
        resetState();
    };

    useEffect(() => {
        try {
            // if (params.session.active === false) {
            //     alert("Session not active, Please login first");
            //     return;
            // }
            update_fraction_buttons();
            if (params.server.status) {
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
                            alert(`PARSE ${error}`);
                        }, 200);
                    }
                });
            } else {
                throw Error(`Connect the server first`);
            }
        } catch (error) {
            alert(`${error}`);
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
    const checkDuplicate = (pcb_sn) => {
        const list = state.data.filter(
            (item) => item.stb_num === pcb_sn || item.pcb_num === pcb_sn
        );
        console.log(`duplicate___${list}___`);
        return list.length > 0;
    };

    const handleBarcodeInput = (event) => {
        const pcb_sn = event.target.value.trim();
        console.log(`${eel}___${pcb_sn}___`);

        try {
            if (params.session.active === false) {
                alert("Session not active, Please login first");
                return;
            }
            if (params.server.status) {
                // let prod_id = 115;
                if (checkDuplicate(pcb_sn)) {
                    throw new Error(
                        `[${pcb_sn}] - Duplicate unit! please scan unique unit`
                    );
                }

                if (!pcb_sn) {
                    throw new Error(
                        `Please scan barcode correctly, found blank`
                    );
                }

                if (state.valid_scanned === state.fraction_count) {
                    throw new Error(
                        `Fraction Target Already Satisfied !! \nTo change fraction units please delete from the list`
                    );
                }
                
                const allowed_target_status = [80, 22];
                eel.is_valid_unit(
                    "fraction_pallet",
                    allowed_target_status,
                    pcb_sn
                )((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;
                        // let prod_id = metadata.prod_id;

                        let current_status = status_map.filter(
                            (item) =>
                                item.id_status ===
                                parseInt(metadata.current_status)
                        )[0];
                        console.log(`status got: ${JSON.stringify(current_status)}`);
                        const updated_data = state.data;
                        updated_data.unshift({
                            id: uuidv4(),
                            stb_num: metadata.stb_num,
                            pcb_num: metadata.pcb_num,
                            cdsn_iuc: metadata.cdsn_iuc,
                            prod_desc: metadata.prod_desc,
                            current_status: current_status,
                            carton_num: metadata.carton_num,
                            pallet_num: metadata.pallet_num,
                            message: message,
                            status: status,
                            valid: status === CONST_SUCCESS
                        });
                        setState((prevState) => ({
                            ...prevState,
                            data: updated_data,
                            valid_scanned:
                                status === CONST_SUCCESS
                                    ? state.valid_scanned + 1
                                    : state.valid_scanned,
                        }));
                        if (status === CONST_SUCCESS) {
                            console.log(metadata);
                        } else {
                            setTimeout(() => {
                                alert(`ERROR: ${message}`);
                            }, 200);
                        }
                        // else if (status === CONST_FAILURE && prod_id === -1) {
                        //     setTimeout(() => {
                        //         alert(`ERROR: ${message}`);
                        //     }, 200);
                        // } else} else
                        //     setTimeout(() => {
                        //         const ret_list = allowed_target_status.map(
                        //             (item) => {
                        //                 console.log(`${item}`);
                        //                 return `${item} - ${
                        //                     status_map.filter(
                        //                         (status) =>
                        //                             status.id_status === item
                        //                     )[0].status_desc
                        //                 }`;
                        //             }
                        //         );
                        //         alert(
                        //             `Error: [${
                        //                 metadata.stb_num
                        //             }] can only have below target statuses:\n ${ret_list.join(
                        //                 "\n"
                        //             )}`
                        //         );
                        //     }, 200);
                    } catch (error) {
                        setTimeout(() => {
                            alert(`PARSE ${error}`);
                        }, 200);
                    }
                });
            } else {
                throw Error(`Connect the server first`);
            }
        } catch (error) {
            alert(`${error}`);
        }
    };

    const onChangePalletInput = (event) => {
        const pallet_num = event.target.value.trim();
        console.log(`${eel}___${pallet_num}___`);
        setState((prevState) => ({
            ...prevState,
            last_pallet: pallet_num,
        }));
    };

    const fetchPalletInput = (prod_id) => {
        // const pallet_num = event.target.value.trim();
        console.log(`${eel}___${prod_id}___`);

        try {
            if (params.session.active === false) {
                alert("Session not active, Please login first");
                return;
            }
            if (params.server.status) {
                // let prod_id = 115;
                eel.get_last_pallet_carton(
                    prod_id,
                    "pallet"
                )((response) => {
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
                            alert(`PARSE ${error}`);
                        }, 200);
                    }
                });
            } else {
                throw Error(`Connect the server first`);
            }
        } catch (error) {
            alert(`${error}`);
        }
    };

    const handleWeight = (event) => {
        const pallet_num = event.target.value.trim();
        console.log(`${eel}___${pallet_num}___`);

        try {
        } catch (error) {
            alert(`${error}`);
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
                let valid_scanned = state.valid_scanned
                const list = state.data.filter((item) => {
                    const ret = item.id !== id
                    if (ret === false && item.valid) {
                        valid_scanned = valid_scanned - 1
                    }
                    return ret
                });
                // console.log(`list: ${list}`);
                return { ...state, data: list, valid_scanned: valid_scanned };
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
                            {state.quantity_group}
                        </div>
                    </div>
                    <div className="flex flex-col justify-between mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Enter PCB_Num / STB_Num
                            </span>
                            <span
                                className={
                                    state.valid_scanned === state.fraction_count
                                        ? "text-green-600 font-bold"
                                        : "text-red-600 font-bold"
                                }
                            >{`${state.valid_scanned} / ${state.fraction_count}`}</span>
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
                    <div className="justify-between w-full mt-4 text-black form-control">
                        {/* <label className="text-black label">
                            <span className="text-black label-text">
                                Weight
                            </span>
                        </label> */}
                        <label
                            className={`${
                                state.validation_fraction_weight
                                    ? ""
                                    : "border-b-4 border-red-500"
                            } py-2 input-group input-group-md rounded-lg rounded-b-none justify-between flex`}
                        >
                            <span className="text-sm">Weight (in kgs.)</span>
                            <input
                                type="text"
                                placeholder="eg. 9.12"
                                className="flex-shrink input input-bordered input-md"
                                onChange={onChangeWeight}
                            />
                            {/* <span className="">kgs</span> */}
                        </label>
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
                            value={state.last_pallet}
                            // onKeyDown={(e) =>
                            //     e.key === "Enter" && fetchPalletInput(e)
                            // }
                            onChange={onChangePalletInput}
                        />
                    </div>
                    <div className="flex flex-col mt-4">
                        <button className="btn btn-lg" onClick={sendPrint}>
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
                                    <th>stb_num</th>
                                    <th>pcb_num</th>
                                    <th>cdsn_iuc / mac</th>
                                    <th>product</th>
                                    <th>current_status</th>
                                    <th>carton_num</th>
                                    <th>pallet_num</th>
                                    <th>valid?</th>
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
                                        <td>{resp.stb_num}</td>
                                        <td>{resp.pcb_num}</td>
                                        <td>{resp.cdsn_iuc}</td>
                                        <td>{resp.prod_desc}</td>
                                        <td>{`${resp?.current_status?.id_status} (${resp?.current_status?.status_desc})`}</td>
                                        <td>{resp.carton_num}</td>
                                        <td>{resp.pallet_num}</td>
                                        <td
                                            className={
                                                resp.status === CONST_SUCCESS
                                                    ? `bg-yellow-200 text-green-500`
                                                    : `bg-yellow-200 text-red-500`
                                            }
                                        >
                                            {resp.status === CONST_SUCCESS ? (
                                                <div className="w-6 h-6">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-6 h-6"
                                                        fill="#efefef"
                                                        viewBox="0 0 24 24"
                                                        stroke="green"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="{2}"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-6 h-6"
                                                        fill="#efefef"
                                                        viewBox="0 0 24 24"
                                                        stroke="red"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="{2}"
                                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <ActionButtons
                                                index={resp.id}
                                                rowNum={state.data.length !== 0
                                                    ? state.data.length - index
                                                    : 0}
                                                serial={resp.stb_num}
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
