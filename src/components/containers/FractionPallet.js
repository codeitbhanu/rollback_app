import React, { useState, useEffect, useRef } from "react";
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
    const CONST_UNKNOWN = "UNKNOWN";

    const DEFAULT_PARAMETER = "Choose a parameter";
    const ACTION_BUTTON_EDIT = "edit";
    const ACTION_BUTTON_SAVE = "save";
    const ACTION_BUTTON_CANCEL = "cancel";
    const ACTION_BUTTON_DELETE = "delete";

    const refBarcodeScan = useRef(null);
    const refWeight = useRef(null);
    const refPallet = useRef(null);

    const handleDeleteItem = (id, rownum, serial) => {
        console.log("handleRemoveItem called ");
        if (
            window.confirm(
                `Confirm delete Row: ${rownum} - ${serial} from below list?`
            )
        ) {
            setState((state) => {
                let valid_scanned = state.valid_scanned;
                const list = state.data.filter((item) => {
                    const ret = item.id !== id;
                    if (ret === false && item.valid) {
                        valid_scanned = valid_scanned - 1;
                    }
                    return ret;
                });
                // console.log(`list: ${list}`);
                return { ...state, data: list, valid_scanned: valid_scanned };
            });
        }
    };

    const default_action_btns = [ACTION_BUTTON_DELETE];
    const [state, setState] = useState({
        mode: MODE_INSTANT,
        manual_status: -1,
        reason_other: false,
        reason_desc: "",
        reason_manual: "",
        action_btns: default_action_btns,
        data: [],
        valid_scanned: 0,
        printer_list: [],
        selectedPrinter: "",
        fraction_max_count: 8,
        fraction_count: 2,
        fraction_weight: 0.0,
        validation_fraction_weight: false,
        quantity_group: [],
        common_prod_desc: -1,
        last_pallet: "",
        last_carton: "",
        status: CONST_SUCCESS,
        message: "",
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    const resetState = () => {
        setState({
            ...state,
            data: [],
            valid_scanned: 0,
            fraction_max_count: 8,
            fraction_count: 2,
            fraction_weight: 0.0,
            validation_fraction_weight: false,
            // quantity_group: [],
            last_pallet: "",
            last_carton: "",
            // status: CONST_SUCCESS,
            // message: "",
        });
        refBarcodeScan.current.focus();
    };

    const onSelectFractionQty = (id = -1) => {
        console.log(
            "prev state.fraction_count: " +
                state.fraction_count +
                " and onSelectFractionQty",
            id
        );
        // data: id > state.fraction_count ? state.data : [],
        setState((prevState) => ({
            ...prevState,
            data: [],
            valid_scanned: 0,
            fraction_max_count: 8,
            fraction_count: id,
            last_pallet: "",
            last_carton: "",
        }));
    };

    const onChangeWeight = (event) => {
        const value = event.target.value.trim();
        let result = false;
        // let n = 0.0;
        try {
            // [+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)
            const re = /^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/;

            result = re.exec(value);
            console.log(`onChangeParamValue called: ${value} validation_param: ${result}`);
            // if (result) 
            //     n = parseFloat(result[0]);
                
                setState((prevState) => ({
                    ...prevState,
                    fraction_weight: result ? result[0] : undefined,
                    validation_fraction_weight: result?.length > 0,
                }));
                // if (state.validation_fraction_weight) refPallet.current.focus();
        } catch (e) {
            console.log("Error: " + e.message);
        }
    };

    const update_fraction_buttons = (active = 2, max = 18) => {
        const button_group = [];
        for (let i = 2; i <= max; i = i + 2) {
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

    const validateInputParams = () => {
        let return_status = false;
        // Is Weight Valid?
        if (state.validation_fraction_weight === false) {
            alert("[ERROR] Please enter valid weight");
            return return_status;
        }
        if (state.data.filter((item) => item.valid === false).length) {
            alert("[ERROR] Please remove invalid entries from the list");
            return return_status;
        }
        if (state.fraction_count != state.valid_scanned) {
            alert(
                "[ERROR] fraction_count and valid_scanned items count does not match"
            );
            return return_status;
        }
        if (state.selectedPrinter === "") {
            alert("[ERROR] Please choose a printer before printing");
            return return_status;
        }
        return_status = true;
        return return_status;

        // Are Status Valid for All STBs
    };

    const handlePrint = () => {
        console.log(state);
        if (validateInputParams()) {
            const stb_list = state.data.map((item) => item.stb_num);
            console.log(`list of stbs: ${stb_list}`);
            eel.send_fraction_print(
                state.selectedPrinter,
                state.last_pallet,
                stb_list,
                state.fraction_weight
            )((response) => {
                console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                try {
                    const function_name = response.function_name;
                    const status = response.status;
                    const message = response.message;
                    const metadata = response.data.metadata;
                    // let prod_id = metadata.prod_id;
                    console.log(
                        `${function_name} message got: ${JSON.stringify(
                            message
                        )} metadata: ${metadata}`
                    );

                    setState((prevState) => ({
                        ...prevState,
                        status: status,
                        message: message,
                        data: [],
                        valid_scanned: 0,
                        fraction_weight: 0.0,
                        validation_fraction_weight: false,
                        last_pallet: ""
                    }))
                    refWeight.current.value = 0.0
                } catch (error) {
                    setTimeout(() => {
                        alert(`PARSE ${error}`);
                    }, 200);
                }
            });
        }
    };

    useEffect(() => {
        console.log("useEffect called #1");
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
                        const function_name = response.function_name;
                        const status = response.status;
                        const message = response.message;
                        const metadata = response.data.metadata;
                        console.log(
                            `${function_name} message got: ${JSON.stringify(
                                message
                            )} metadata: ${metadata}`
                        );
                        if (status === CONST_SUCCESS) {
                            setState((prevState) => ({
                                ...prevState,
                                printer_list: [
                                    "Please Choose a printer",
                                    ...metadata.printers,
                                ],
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
    }, [params.server.status]);

    useEffect(() => {
        console.log("useEffect called #2");
        if (state.valid_scanned === state.fraction_count) {
            fetchLastCartonPallet(state.common_prod_desc);
            refWeight.current.focus();
        }
    }, [state.valid_scanned, state.fraction_count, state.common_prod_desc]);

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
        event.target.value = "";
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
                        const function_name = response.function_name;
                        const status = response.status;
                        const message = response.message;
                        const metadata = response.data.metadata;
                        // let prod_id = metadata.prod_desc;
                        console.log(
                            `${function_name} message got: ${JSON.stringify(
                                message
                            )} metadata: ${metadata}`
                        );

                        if (
                            metadata.prod_desc &&
                            state.data.length &&
                            state.common_prod_desc !== metadata.prod_desc
                        ) {
                            console.log(
                                `${metadata.prod_desc} conflict with previous scanned product ${state.data[0].prod_id} \nPlease scan similar product`
                            );
                            throw new Error(
                                `${metadata.prod_desc} conflict with previous scanned product ${state.data[0].prod_desc} \nPlease scan similar product`
                            );
                        }

                        let current_status = status_map.filter(
                            (item) =>
                                item.id_status ===
                                parseInt(metadata.current_status)
                        )[0];
                        const updated_data = state.data;
                        if (metadata.stb_num) {
                            updated_data.push({
                                id: uuidv4(),
                                // prod_id: metadata.prod_desc,
                                stb_num: metadata.stb_num,
                                pcb_num: metadata.pcb_num,
                                cdsn_iuc: metadata.cdsn_iuc,
                                prod_desc: metadata.prod_desc,
                                current_status: current_status,
                                carton_num: metadata.carton_num,
                                pallet_num: metadata.pallet_num,
                                message: message,
                                status: status,
                                valid: status === CONST_SUCCESS,
                            });
                            setState((prevState) => ({
                                ...prevState,
                                data: updated_data,
                                common_prod_desc:
                                    state.valid_scanned === 0 &&
                                    status === CONST_SUCCESS
                                        ? metadata.prod_desc
                                        : state.common_prod_desc,
                                valid_scanned:
                                    status === CONST_SUCCESS
                                        ? state.valid_scanned + 1
                                        : state.valid_scanned,
                            }));
                        }
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

    const fetchLastCartonPallet = (prod_desc, choice = 'pallet') => {
        // const pallet_num = event.target.value.trim();
        console.log(`${eel}___${prod_desc}___`);

        try {
            if (params.session.active === false) {
                alert("Session not active, Please login first");
                return;
            }
            if (params.server.status) {
                // let prod_desc = 115;
                eel.get_last_pallet_carton(
                    prod_desc,
                    choice
                )((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        const function_name = response.function_name;
                        const status = response.status;
                        const message = response.message;
                        const metadata = response.data.metadata;
                        console.log(
                            `${function_name} message got: ${JSON.stringify(
                                message
                            )} metadata: ${metadata}`
                        );
                        if (status === CONST_SUCCESS) {
                            setState((prevState) => ({
                                ...prevState,
                                last_pallet: metadata.last_pallet,
                                last_carton: metadata.last_carton,
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

    const onSelectPrinter = (event) => {
        console.log("onSelectPrinter called:" + event.target.value);
        const printerName = event.target.value;
        setState({
            ...state,
            selectedPrinter: printerName,
        });
        refBarcodeScan.current.focus();
    };

    const handleChangeTextBox = (event) => {
        console.log("handleChangeTextBox called " + event.target.value);
    };

    

    // console.log(status_map);
    // console.log(fake_data);

    return (
        <div className="absolute flex flex-col w-full mt-4 border-0 border-gray-600 h-1/2">
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex w-1/4 ml-8 border-0 border-blue-700 border-double rounded-t-lg form-control">
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
                            onChange={(e) => onSelectPrinter(e)}
                        >
                            {state?.printer_list?.map((printer, index) => (
                                <option
                                    disabled={printer.index === 0}
                                    selected={index === 0}
                                    key={"printer#" + index}
                                    id={index}
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
                                Scan giftbox
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
                            ref={refBarcodeScan}
                            type="text"
                            placeholder="Scan giftbox"
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
                                ref={refWeight}
                                type="text"
                                placeholder="eg. 9.12"
                                className="flex-1 input input-bordered input-md"
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
                            ref={refPallet}
                            type="text"
                            placeholder="Enter Fraction Pallet"
                            className="border-double input input-primary input-bordered"
                            value={state.last_pallet}
                            // onKeyDown={(e) =>
                            //     e.key === "Enter" && fetchLastCartonPallet(e)
                            // }
                            onChange={onChangePalletInput}
                        />
                    </div>
                    <div className="flex flex-col mt-4">
                        <button className="btn btn-lg" onClick={handlePrint}>
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
                    <div className="bottom-0 flex flex-1 pt-0 border-0 border-red-500">
                        <div className="shadow stats mt-4 w-full rounded-none">
                            <div className="stat flex-wrap">
                                <div className={`text-left text-xl text-red-500 flex-wrap ${state.status === CONST_SUCCESS ? "text-green-500" : "text-red-500"}`}>
                                    {state.message}
                                </div>
                            </div>
                        </div>
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
                                                ? index + 1
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
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="green"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-6 h-6"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="red"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <ActionButtons
                                                actionList={state.action_btns}
                                                index={resp.id}
                                                rowNum={
                                                    state.data.length !== 0
                                                        ? state.data.length -
                                                          index
                                                        : 0
                                                }
                                                param={resp.stb_num}
                                                actionDelete={handleDeleteItem}
                                                warn={
                                                    resp.status ===
                                                    CONST_FAILURE
                                                }
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
