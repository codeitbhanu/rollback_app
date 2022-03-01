import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import swal from "@sweetalert/with-react";
import { useTable } from 'react-table'


import ActionButtons from "../ActionButtons";

// import fake_data from "../datajson/data";
import status_map from "../../datajson/statusmap";
import reasons_map from "../../datajson/reasonsmap";
import { stat } from "fs";

// const defPath = "~";

function FrequentParam({ eel, params, setParams, config_data }) {
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
        prod_desc: "Please Choose a Product",
    }
    const default_action_btns = [ACTION_BUTTON_EDIT];
    const [state, setState] = useState({
        mode: MODE_INSTANT,
        manual_status: -1,
        reason_other: false,
        reason_desc: "",
        reason_manual: "",
        status: CONST_NONE,
        parameters: [
            { param_name: DEFAULT_PARAMETER },
            ...config_data.frequent_param,
        ],
        param_name: DEFAULT_PARAMETER,
        param_desc: "",
        param_value: "",
        prev_param_value: "",
        validation_param: true,
        action_btns: default_action_btns,
        valid_scanned: 0,
        active_products: [default_product],
        prod_id: -1,
        selected_product: "",
        param_edit_mode: false,
        fraction_max_count: 8,
        fraction_count: 2,
        fraction_weight: 0.0,
        validation_fraction_weight: false,
        quantity_group: [],
        common_prod_id: -1,
        last_pallet: "",
        last_carton: "",
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    const onChangeParamValue = (event) => {
        const value = event.target.value.trim();
        let result = false;
        // let n = undefined;
        let re = undefined;
        switch (state.param_name) {
            case "software_version":
            case "load_sequence_number":
                re = /[\s\S]+/;
                break;
            case "min_weight":
            case "max_weight":
                re = /^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/;
                break
            case "carton_qty":
            case "pallet_qty":
            default:
                re = /^[+-]?(?:\d*)?\d+$/;
        }
        
        try {
            result = re.exec(value);
            console.log(`onChangeParamValue called: ${value} validation_param: ${result}`);
            // console.log(result)
            // console.log(typeof(result))
            setState((prevState) => ({
                ...prevState,
                param_value: result ? result[0] : undefined,
                validation_param: result?.length > 0
            }))
        } catch (e) {
            console.log("Error: " + e.message);
        } 
    }

    // function handleEditItem(index, rowNum, param, data) {
    //     console.log(state)
    //     swal("A wild Pikachu appeared! What do you want to do?", {
    //         title: "Please edit the parameter",
    //         buttons: {
    //           cancel: "Run away!",
    //           catch: {
    //             text: "Throw Pokéball!",
    //             value: "catch",
    //           },
    //           defeat: true,
    //         },
    //       })
    //       .then((value) => {
    //         switch (value) {
           
    //           case "defeat":
    //             swal("Pikachu fainted! You gained 500 XP!");
    //             break;
           
    //           case "catch":
    //             swal("Gotcha!", "Pikachu was caught!", "success");
    //             break;
           
    //           default:
    //             swal("Got away safely!");
    //         }
    //       });
    //     return;
    //     swal(<div>Hello world</div>, "error", {
    //         buttons: {
    //             accept: {
    //                 className:
    //                     "px-4 py-2 m-3 font-bold text-white bg-blue-500 border-b-4 border-blue-700 rounded min-w-max hover:bg-blue-400 hover:border-blue-500",
    //             },
    //             reject: {
    //                 className:
    //                     "px-4 py-2 m-3 font-bold text-white bg-red-500 border-b-4 border-red-700 rounded min-w-max hover:bg-red-400 hover:border-red-500",
    //             },
    //         },
    //     }).then((choice) => {
    //         console.log(`You chose: ${choice}`);
    //         if (choice === "accept") {
    //             // handleAcceptCaller(request, localStream);
                
    //         } else {
    //             // handleRejectCaller(request, localStream);
    //         }
    //     });
    // }

    const handleEditItem = (id, rownum, param) => {
        // console.log("params: " + JSON.stringify(params))
        const editModeActionBtns = [ACTION_BUTTON_SAVE, ACTION_BUTTON_CANCEL];
        setState((prevState) => ({
            ...prevState,
            param_edit_mode: true,
            prev_param_value: prevState.param_value,
            action_btns: editModeActionBtns,
            status: CONST_UNKNOWN,
        }));
    };

    const handleDeleteItem = (id, rownum, param) => {
        console.log(`handleDeleteItem called param_name: ${param}`);
    }

    const handleSaveItem = (id, rownum, param, data) => {
        console.log(`handleSaveItem called param_name: ${param}`);
        // console.log("params: " + JSON.stringify(params))
        // console.log("[state-handleSaveItem]" + JSON.stringify(state))
        
        if (params.session.active === false) {
            alert("Session not active, Please login first");
            return;
        }
        if (state.selected_product === "" || state.selected_product === default_product.prod_desc) {
            alert("Please choose a product first");
            return;
        }
        if (!state.validation_param) {
            alert("Please enter a valid input");
            return;
        }

        // console.log(prevState)
        switch (param) {
            case "carton_qty":
            case "pallet_qty":
            case "min_weight":
            case "max_weight":
            case "oqc_target_count":
            case "production_target_count":
            case "software_version":
            case "load_sequence_number":
                try {
                    const paramObj = state.parameters.filter(
                        (p) => p.param_name === param
                    )[0];
                    console.log(paramObj)
                    if (params.server.status) {
                        eel.set_frequent_params(
                            state?.prod_id,
                            paramObj?.table,
                            paramObj?.param_name,
                            paramObj?.id_config_param || paramObj?.data_name || paramObj?.parameter,
                            state?.param_value
                        )((response) => {
                            console.log(
                                `[PY]: ${JSON.stringify(response, null, 2)}`
                            );
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
                                        param_edit_mode: false,
                                        prev_param_value: "",
                                        status: CONST_SUCCESS,
                                    }))
                                    // This will refresh and display updated value
                                    onSelectParam(paramObj?.param_name)
                                } else {
                                    setState((prevState) => ({
                                        ...prevState,
                                        prev_param_value: "",
                                        status: CONST_FAILURE,
                                    }))
                                    
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
                break;
            default:
                alert("[Error] Incorrect Param Selection");
        }
        
        
    };
    const handleCancelItem = (id, rownum, serial) => {
        console.log("handleCancelItem called ");
        setState((prevState) => ({
            ...prevState,
            param_edit_mode: false,
            param_value: prevState.prev_param_value,
            action_btns: default_action_btns,
            status: CONST_SUCCESS,
        }));
    };


    useEffect(() => {

    },[state.selected_product, ])

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

    // useEffect(() => {
    //     console.log("useEffect called #2");
    // }, [state.valid_scanned, state.fraction_count, state.common_prod_id]);

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

    const onSelectParam = (paramName) => {
        console.log(`onSelectParam called param_name: ${paramName}`);
        // console.log(JSON.stringify(params))
        if (params.session.active === false) {
            alert("Session not active, Please login first");
            return;
        }
        if (state.selected_product === "" || state.selected_product === default_product.prod_desc) {
            alert("Please choose a product first");
            return;
        }
        
        // setState({
        //     ...state,
        //     param_name: paramName,
        //     status: CONST_NONE,
        // });

        switch (paramName) {
            case "carton_qty":
            case "pallet_qty":
            case "min_weight":
            case "max_weight":
            case "oqc_target_count":
            case "production_target_count":
            case "software_version":
            case "load_sequence_number":
                try {
                    const paramObj = state.parameters.filter(
                        (param) => param.param_name === paramName
                    )[0];
                    if (params.server.status) {
                        eel.get_frequent_params(
                            state?.prod_id,
                            paramObj?.table,
                            paramObj?.param_name,
                            paramObj?.id_config_param || paramObj?.data_name || paramObj?.parameter,
                        )((response) => {
                            console.log(
                                `[PY]: ${JSON.stringify(response, null, 2)}`
                            );
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
                                        param_name: paramName,
                                        param_desc: metadata.param_desc,
                                        param_value: metadata.param_value,
                                        param_edit_mode: false,
                                        validation_param: true,
                                        prev_param_value: "",
                                        status: CONST_SUCCESS,
                                        action_btns: default_action_btns
                                    }));
                                } else {
                                    setState((prevState) => ({
                                        ...prevState,
                                        status: CONST_NONE,
                                    }));
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
                break;
            default:
                alert("[Error] Incorrect Param Selection");
        }
        // alert(JSON.stringify(event.target.value));
    };

    return (
        <div className="absolute flex flex-col w-full mt-4 border-0 border-gray-600 h-1/2">
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
                                Select Product
                            </span>
                        </label>
                        <select
                            className="flex min-w-full select select-bordered select-primary"
                            disabled=""
                            onChange={(e) =>
                                onSelectProduct(e.target.id, e.target.value)
                            }
                        >
                            {state?.active_products?.map(
                                (prod_id_desc, index) => (
                                    <option
                                        disabled={index === 0}
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

                    <div className="flex flex-col mt-2 border-0 border-red-600">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Select Prameter
                            </span>
                        </label>
                        <select
                            className="flex min-w-full select select-bordered select-primary"
                            disabled=""
                            onChange={(e) => onSelectParam(e.target.value)}
                        >
                            {state?.parameters?.map((param, index) => (
                                <option
                                    disabled={index === 0}
                                    selected={
                                        state.param_name === param.param_name
                                    }
                                    key={"param#" + param.param_name}
                                    id={index}
                                >
                                    {param.param_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="bottom-0 flex flex-1 px-4 pt-0 border-0 border-red-500">
                    <div className="flex-1 overflow-y-scroll">
                        <table className="flex table w-full overflow-x-hidden table-compact">
                            <thead className="overflow-x-hidden">
                                <tr className="bg-gray-400">
                                    <th>param_name</th>
                                    <th>param_value</th>
                                    <th>Status?</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="overflow-y-scroll">
                                {state.status !== CONST_NONE && <tr className="p-0 border-0 border-red-600">
                                    <td>{state.param_desc}</td>
                                    {state.param_edit_mode ? (
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="param value"
                                                className={`input input-primary input-bordered ${
                                                    state.validation_param
                                                        ? "bg-yellow-300"
                                                        : "bg-red-300"
                                                }`}
                                                value={state.param_value}
                                                onChange={onChangeParamValue}
                                                onKeyDown={(e) => e.key === "Escape" ? handleCancelItem() : null}
                                            />
                                        </td>
                                    ) : (
                                        <td>{state.param_value}</td>
                                    )}
                                    <td
                                        className={
                                            state.status === CONST_SUCCESS
                                                ? `bg-yellow-200 text-green-500`
                                                : `bg-yellow-200 text-red-500`
                                        }
                                    >
                                        {state.status === CONST_SUCCESS && (
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
                                        )}
                                        {state.status === CONST_FAILURE && (
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
                                        {state.status === CONST_UNKNOWN && (
                                            <div className="w-6 h-6">
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
                                                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <ActionButtons
                                            actionList={state.action_btns}
                                            index={0}
                                            rowNum={0}
                                            param={state.param_name}
                                            actionEdit={handleEditItem}
                                            actionDelete={handleDeleteItem}
                                            actionSave={handleSaveItem}
                                            actionCancel={handleCancelItem}
                                            warn={
                                                state.status === CONST_FAILURE
                                            }
                                            message={state.message}
                                        />
                                    </td>
                                </tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FrequentParam;
