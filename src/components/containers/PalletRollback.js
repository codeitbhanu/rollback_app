import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import ActionButtons from "../ActionButtons";

// import fake_data from "../datajson/data";
import status_map from "../../datajson/statusmap";
import reasons_map from "../../datajson/reasonsmap";

// const defPath = "~";

function PalletRollback({ eel, params, setParams }) {
    const MODE_MANUAL = "manual";
    const MODE_INSTANT = "instant";
    const INSTANT_MODE_STATUS_ID = -1;
    const CONST_NONE = "NONE";
    const CONST_SUCCESS = "SUCCESS";
    const CONST_FAILURE = "FAILURE";
    const CONST_UNKNOWN = "UNKNOWN";

    const DEFAULT_PARAMETER = "Choose a parameter";
    const ACTION_BUTTON_EDIT = "edit";
    const ACTION_BUTTON_SAVE = "save";
    const ACTION_BUTTON_CANCEL = "cancel";
    const ACTION_BUTTON_DELETE = "delete";

    const default_product = {
        prod_id: 0,
        prod_desc: "Do not convert",
    };
    const default_action_btns = [ACTION_BUTTON_DELETE];
    const [state, setState] = useState({
        mode: MODE_MANUAL,
        manual_status: -1,
        pallet_num: "",
        convert_prod_flag: false,
        convert_prod_id: -1,
        convert_product: "",
        reason_other: false,
        reason_desc: "",
        reason_manual: "",
        action_btns: default_action_btns,
        data: [], //fake_data,
        active_products: [default_product],
        conversion_products: [default_product],
        prod_id: -1,
        selected_product: "",
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

    const handleBarcodeInput = (pcb_sn) => {
        const pallet_num = pcb_sn.trim();
        // alert(`___${pcb_sn}___`);
        console.log(params);
        try {
            if (params.session.active === false) {
                alert("Session not active, Please login first");
                return;
            }
            // if (
            //     state.reason_desc === "" ||
            //     state.reason_desc === reasons_map[0].id_status
            // ) {
            //     alert(
            //         "Incorrect reason to rollback, Please choose one from the dropdown."
            //     );
            //     return;
            // }
            if (params.server.status) {
                eel.get_pallet_items(
                    pallet_num,
                    // state.manual_status,
                    // state.reason_other
                    //     ? state.reason_manual
                    //     : state.reason_desc,
                    // params.session.userdata.id_user
                )((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;
                        let results_data = response.data.results;
                        
                        console.log("Result count : " + metadata.count)
                        if (status === CONST_SUCCESS) {
                            const updated_data = results_data.map((item) => ({
                                id: uuidv4(),
                                pallet_num: item.pallet_num,
                                pcb_sn: item.pcb_sn,
                                prod_desc: item.prod_desc
                                    ? item.prod_desc
                                    : "Not found",
                                current_status: {id_status: item.id_status, status_desc: item.status_desc},
                                user: item.user_desc
                                    ? item.user_desc
                                    : "Unknown",
                                status: status,
                                message: message
                            }))
                            const filtered_prod_id_list = state.active_products.filter((item) => metadata.conversion_prod_id.includes(item.prod_id));
                            console.log(filtered_prod_id_list)
                            setState({
                                ...state,
                                pallet_num: metadata.pallet_num,
                                prod_id: metadata.prod_id,
                                data: updated_data,
                                conversion_products: [
                                    default_product,
                                    ...filtered_prod_id_list
                                ]
                            });
                        }
                        // let current_status = status_map.filter(
                        //     (item) =>
                        //         item.id_status ===
                        //         parseInt(metadata.current_status)
                        // )[0];
                        // console.log(
                        //     `expected ${metadata.current_status} got: ${current_status}`
                        // );
                        // let target_status = status_map.filter(
                        //     (item) =>
                        //         item.id_status ===
                        //         parseInt(metadata.target_status)
                        // )[0];
                        // console.log(
                        //     `expected ${metadata.target_status} got: ${target_status}`
                        // );

                        
                        // updated_data.unshift({
                        //     id: uuidv4(),
                        //     pcb_sn: metadata.pcb_sn,
                        //     prod_desc: metadata.prod_desc
                        //         ? metadata.prod_desc
                        //         : "Not found",
                        //     current_status:
                        //         current_status !== undefined
                        //             ? current_status
                        //             : -1,
                        //     target_status:
                        //         target_status !== undefined
                        //             ? target_status
                        //             : -1,
                        //     user: metadata.id_user
                        //         ? metadata.id_user
                        //         : "Unknown",
                        //     message: message,
                        //     status: status,
                        //     allowed_target_status:
                        //         metadata?.allowed_target_status,
                        // });
                        

                        else if (status === CONST_FAILURE) {
                            setTimeout(() => {
                                alert(`Error ${message}`);
                            }, 200);
                        }
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
        } catch (error) {
            alert(`ERROR: ${error}`);
        }
    };

    const handle_rollback_pallet = () => {
        console.log(state);
        // if (validateInputParams()) {
        //     const stb_list = state.data.map((item) => item.stb_num);
        //     console.log(`list of stbs: ${stb_list}`);
        //     eel.send_fraction_print(
        //         state.selectedPrinter,
        //         state.last_pallet,
        //         stb_list
        //     );
        // }
        const pallet_num = state.pallet_num.trim();
        // alert(`___${pcb_sn}___`);
        const stb_num_list = state.data.map((item) => item.pcb_sn)
        console.log(stb_num_list);
        try {
            if (params.session.active === false) {
                alert("Session not active, Please login first");
                return;
            }
            if (
                state.reason_desc === "" ||
                state.reason_desc === reasons_map[0].id_status
            ) {
                alert(
                    "Incorrect reason to rollback, Please choose one from the dropdown."
                );
                return;
            }
            if (stb_num_list.length > 0) {
                if (params.server.status) {
                    eel.rollback_pallet_items(
                        pallet_num,
                        state.manual_status,
                        stb_num_list,
                        state.reason_other
                            ? state.reason_manual
                            : state.reason_desc,
                        state.prod_id,
                        params.session.userdata.id_user
                    )((response) => {
                        console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                        try {
                            let status = response.status;
                            let message = response.message;
                            let metadata = response.data.metadata;
                            // let results_data = response.data.results;
                            
                            console.log("Result count : " + metadata.count)
                            if (status === CONST_SUCCESS) {
                                handleBarcodeInput(metadata.pallet_num)
                                //TODO: Reset state and re-call the list
                                // const updated_data = results_data.map((item) => ({
                                //     id: uuidv4(),
                                //     pallet_num: item.pallet_num,
                                //     pcb_sn: item.pcb_sn,
                                //     prod_desc: item.prod_desc
                                //         ? item.prod_desc
                                //         : "Not found",
                                //     current_status: {id_status: item.id_status, status_desc: item.status_desc},
                                //     user: item.user_desc
                                //         ? item.user_desc
                                //         : "Unknown",
                                //     status: status,
                                //     message: message
                                // }))
                                // const filtered_prod_id_list = state.active_products.filter((item) => metadata.conversion_prod_id.includes(item.prod_id));
                                // console.log(filtered_prod_id_list)
                                // setState({
                                //     ...state,
                                //     data: updated_data,
                                //     conversion_products: [
                                //         default_product,
                                //         ...filtered_prod_id_list
                                //     ]
                                // });
                            }
                            
                            

                            else if (status === CONST_FAILURE) {
                                setTimeout(() => {
                                    alert(`Error ${message}`);
                                }, 200);
                            }
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
            } else {
                alert(`ERROR: STB List is Empty`);
            }
        } catch (error) {
            alert(`ERROR: ${error}`);
        }
    };

    const onSelectProduct = (prodId, prodDesc) => {
        const prodObj = state.active_products.filter(
            (prod) => prod.prod_desc === prodDesc
        )[0];
        console.log(
            `onSelectProduct called prodId: ${prodObj?.prod_id} prodDesc: ${prodDesc}`
        );

        setState({
            ...state,
            status: CONST_NONE,
            param_name: DEFAULT_PARAMETER,
            prod_id: prodObj?.prod_id,
            selected_product: prodDesc,
        });
        // alert(JSON.stringify(event.target.value));
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
    };

    const handleDeleteItem = (id, rownum, serial) => {
        console.log("handleDeleteItem called " + id, rownum, serial);
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

    useEffect(() => {
        console.log("useEffect called #1");
        try {
            if (params.server.status) {
                eel.get_active_products()((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        const function_name = response.function_name;
                        const status = response.status;
                        const message = response.message;
                        const metadata = response.data.metadata;
                        console.log(
                            `${function_name} message got: ${JSON.stringify(
                                message
                            )} metadata: ${JSON.stringify(metadata)}`
                        );
                        if (status === CONST_SUCCESS) {
                            setState((prevState) => ({
                                ...prevState,
                                active_products: [
                                    default_product,
                                    ...metadata.prod_list,
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
    }, [eel, params.server.status]);

    // console.log(status_map);
    // console.log(fake_data);

    return (
        <div className="absolute flex flex-col w-full mt-4 border-0 border-green-600 h-1/2">
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
                    <div className="flex flex-col mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Scan Pallet
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="Scan Pallet"
                            className="border-double input input-primary input-bordered"
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleBarcodeInput(e.target.value)
                            }
                        />
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
                    {/* <div className="flex flex-col mt-2 border-0 border-red-600">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Covert to
                            </span>
                        </label>
                        <div className="btn-group">
                            <button className="btn btn-outline btn-wide">
                                YES
                            </button>
                            <button className="btn btn-outline btn-wide">
                                NO
                            </button>
                        </div>
                    </div> */}

                    <div className="flex flex-col mt-2 border-0 border-red-600">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Convert to product
                            </span>
                        </label>
                        <select
                            className="flex min-w-full select select-bordered select-primary"
                            disabled=""
                            onChange={(e) =>
                                onSelectProduct(e.target.id, e.target.value)
                            }
                        >
                            {state?.conversion_products?.map(
                                (prod_id_desc, index) => (
                                    <option
                                        // disabled={index === 0}
                                        selected={index === 0}
                                        key={"product#" + prod_id_desc.prod_id}
                                        id={prod_id_desc.prod_id}
                                    >
                                        {prod_id_desc.prod_desc}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
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
                    <div className="flex flex-col mt-4">
                        <button
                            className="btn btn-lg"
                            onClick={handle_rollback_pallet}
                        >
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
                                        d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                                    />
                                </svg>
                            </div>
                            Rollback Pallet
                        </button>{" "}
                    </div>
                </div>
                <div className="bottom-0 flex flex-1 px-4 pt-0 border-0 border-red-500">
                    <div className="flex-1 overflow-y-scroll">
                        <table className="flex table w-full overflow-x-hidden table-compact">
                            <thead className="overflow-x-hidden">
                                <tr className="bg-gray-400">
                                    <th></th>
                                    <th>Pallet</th>
                                    <th>Serial</th>
                                    <th>Product</th>
                                    <th>Current Status</th>
                                    {/* <th>Target Status</th> */}
                                    <th>User</th>
                                    {/* <th>Done?</th> */}
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
                                        <td>{resp.pallet_num}</td>
                                        <td>{resp.pcb_sn}</td>
                                        <td>{resp.prod_desc}</td>
                                        <td>{`${resp?.current_status?.id_status} (${resp?.current_status?.status_desc})`}</td>
                                        {/* <td>{`${resp?.target_status?.id_status} (${resp?.target_status?.status_desc})`}</td> */}
                                        <td>{resp.user}</td>
                                        {/* <td
                                            className={
                                                resp.status === CONST_SUCCESS
                                                    ? `bg-yellow-200 text-green-500`
                                                    : `bg-yellow-200 text-red-500`
                                            }
                                        >
                                            {resp.status}
                                        </td> */}
                                        <td>
                                            <ActionButtons
                                                actionList={state.action_btns}
                                                index={resp.id}
                                                rowNum={index + 1}
                                                param={resp.pcb_sn}
                                                warn={
                                                    resp.status ===
                                                    CONST_FAILURE
                                                }
                                                actionDelete={handleDeleteItem}
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

export default PalletRollback;
