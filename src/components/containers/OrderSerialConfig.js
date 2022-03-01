import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import swal from "@sweetalert/with-react";
import { useTable } from "react-table";
import MaterialTable from "material-table";
import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

import ActionButtons from "../ActionButtons";

// import fake_data from "../datajson/data";
import status_map from "../../datajson/statusmap";
import reasons_map from "../../datajson/reasonsmap";
import { stat } from "fs";

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    ArrowUpward: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ArrowDownward: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
  };
// const defPath = "~";

function OrderSerialConfig({ eel, params, setParams, config_data }) {
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

    const tableRef = React.createRef();

    const default_product = {
        prod_id: 0,
        prod_desc: "Please Choose a Product",
    };
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
        prod_desc: "",
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
        ord_num: undefined,
        ord_start: undefined,
        ord_end: undefined,
        range_qty: 0
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    const columns = [
        // { title: "ID", field: "id" },
        { title: "Order Num", field: "order", type: 'numeric'  },
        { title: "Range-Start", field: "sn_start" },
        { title: "Range-End", field: "sn_end" },
        { title: "Quantity", field: 'qty', type: 'numeric' },
        { title: "Priority", field: "priority", type: 'numeric' },
    ]
    const actions=[
        {
          icon: ArrowUpward,
          tooltip: 'Move Up',
          onClick: (event, rowData) => handleMoveUp(rowData)
        },
        {
          icon: ArrowDownward,
          tooltip: 'Move Down',
          onClick: (event, rowData) => handleMoveDown(rowData)
        }
      ]
    // useEffect(() => {
    //     fetch("https://jsonplaceholder.typicode.com/users")
    //       .then(resp => resp.json())
    //       .then(resp => {
    //         setData(resp)
    //       })
    //   }, [])

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
                break;
            case "pallet_qty":
            default:
                re = /^[+-]?(?:\d*)?\d+$/;
        }

        try {
            result = re.exec(value);
            console.log(
                `onChangeParamValue called: ${value} validation_param: ${result}`
            );
            // console.log(result)
            // console.log(typeof(result))
            setState((prevState) => ({
                ...prevState,
                param_value: result ? result[0] : undefined,
                validation_param: result?.length > 0,
            }));
        } catch (e) {
            console.log("Error: " + e.message);
        }
    };

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

    const updateDataSeparated = (data) => {
        const ret = data.map((item, index) => ({
            id: index,
            order: item["data_value"].slice(0,6),
            sn_start: item["data_value"].slice(6,16),
            sn_end: item["data_value"].slice(16,26),
            qty: parseInt(item["data_value"].slice(17,26)) - parseInt(item["data_value"].slice(7,16)),
            priority: item["priority"],
            status: item["status"],
        }))
        console.log(ret)
        return ret
    }

    const updateDataCombined = (data) => {
        return data.map((item, index) => ({
            data_value: item.order + item.sn_start + item.sn_end,
            priority: item.priority,
            status: item.status
        }))
    }

    const handleMoveUp = (row) => {
        console.log("handleMoveUp " + row.order + row.sn_start + row.sn_end);
        const currIndex = row.priority;
        const nextIndex = row.priority - 1;
        const updateData = updateDataCombined(state.data)
        console.log(updateData);

        if (nextIndex >= 1) {
            const reordered = updateData.map((item,index) => ({
                data_value: item.data_value,
                priority: item.priority < currIndex ? item.priority + 1 : (item.priority === currIndex ? nextIndex : item.priority),
                status: item.priority === currIndex && nextIndex === 1 ? 4 : item.status
            }))
            console.log(reordered);
            setState((prevState) => ({
                ...prevState,
                data: updateDataSeparated(reordered)
            }));
        }
        // const newData = state.data;
        // newData.splice(currIndex >= 0 ? currIndex: 0, 1, {

        // } )
        // setState((prevState) => ({
        //     ...prevState,
        //     data: newData
        // }));
        // id: index,
        // order: item["data_value"].slice(0,6),
        // sn_start: item["data_value"].slice(6,16),
        // sn_end: item["data_value"].slice(16,26),
        // qty: parseInt(item["data_value"].slice(17,26)) - parseInt(item["data_value"].slice(7,16)),
        // priority: item["priority"],
    }

    const handleMoveDown = (row) => {
        console.log("handleMoveDown " + row.order + row.sn_start + row.sn_end);
    }

    const handleChangeOrderNum = (event) => {
        console.log("handleChangeOrderNum called " + event.target.value);
        const ord = event.target.value.trim();
        setState((prevState) => ({
            ...prevState,
            ord_num: ord
        }))
    };

    const updateQuantity = (start="", end="") => {
        let qty = 0;
        let ord_end = ""
        let ord_start = ""
        try {
            ord_end = end.trim().match(/\d+$/)[0];
            ord_start = start.trim().match(/\d+$/)[0];
        }
        catch (e) {
            console.log("Error: " + e.message);
        } 
        if (ord_start !== "" && ord_end !== "" && ord_end.length === ord_start.length) {
            qty = (ord_end - ord_start + 1)
            console.log(`end: ${ord_end} start: ${ord_start} qty: ${qty}`)
        }
        return qty;
    }

    const handleChangeStartRange = (event) => {
        console.log("handleChangeStartRange called " + event.target.value);
        const start = event.target.value.trim();
        setState((prevState) => ({
            ...prevState,
            ord_start: start,
            range_qty: updateQuantity(start, state.ord_end)
        }))
        
    };

    const handleChangeEndRange = (event) => {
        console.log("handleChangeEndRange called " + event.target.value);
        const end = event.target.value.trim();
        setState((prevState) => ({
            ...prevState,
            ord_end: end,
            range_qty: updateQuantity(state.ord_start, end)
        }))
    };

    const handleAddOrderSubmit = () => {
        console.log("handleAddOrderSubmit called ");
        console.log(state);
        if (state.ord_num && state.ord_num.length !== 6) {
            alert("Error: Order Number Incorrect")
            return
        } else if (state.range_qty <= 0) {
            alert("Error: Range Cannot Be 0 or less")
            return
        } else if (state.prod_id <= 0) {
            alert("Error: Product is incorrect")
            return
        } else {
            try {
                const prod_id = state.prod_id;
                const prod_desc = state.prod_desc;
                const ord_num = state.ord_num;
                const ord_start =  state.ord_start;
                const sn_length = state.ord_start.length;
                const ord_end =  state.ord_end
                const prefix = state.ord_end.match(/[a-zA-Z]+/g)[0];
                console.log(`prefix: ${prefix}`)
                const end_digits = String(parseInt(state.ord_end.match(/\d+$/)[0]) + 1);
                console.log(`end_digits: ${end_digits}`)
                const len_prefix = prefix.length;
                const ord_end_plus_one = prefix + end_digits.padStart(sn_length - prefix.length, "0")
                const full_len_sn_range = ord_num + ord_start + ord_end_plus_one
                console.log(full_len_sn_range)
                setState((prevState) => ({
                    ...prevState,
                    ord_num: "",
                    ord_start: "",
                    ord_end: "",
                    range_qty: updateQuantity()
                }))
                if (params.server.status) {
                    eel.add_new_order_ranges(
                        state?.prod_id,
                        state?.prod_desc,
                        ord_num,
                        ord_start,
                        ord_end,
                        state?.range_qty,
                        full_len_sn_range
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
                                )} metadata: ${JSON.stringify(metadata)}`
                            );
                            if (status === CONST_SUCCESS) {
                                const data_list = updateDataSeparated(metadata.prod_data)
                                setState((prevState) => ({
                                    ...prevState,
                                    data: data_list
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
        }
    };

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
    };

    const handleSaveItem = (id, rownum, param, data) => {
        console.log(`handleSaveItem called param_name: ${param}`);
        // console.log("params: " + JSON.stringify(params))
        // console.log("[state-handleSaveItem]" + JSON.stringify(state))

        if (params.session.active === false) {
            alert("Session not active, Please login first");
            return;
        }
        if (
            state.selected_product === "" ||
            state.selected_product === default_product.prod_desc
        ) {
            alert("Please choose a product first");
            return;
        }
        if (!state.validation_param) {
            alert("Please enter a valid input");
            return;
        }

        // console.log(prevState)
        switch (param) {
            case "pallet_qty":
            case "min_weight":
            case "max_weight":
            case "oqc_counter":
            case "production_target_count":
            case "software_version":
            case "load_sequence_number":
                try {
                    const paramObj = state.parameters.filter(
                        (p) => p.param_name === param
                    )[0];
                    console.log(paramObj);
                    if (params.server.status) {
                        eel.set_frequent_params(
                            state?.prod_id,
                            paramObj?.table,
                            paramObj?.param_name,
                            paramObj?.id_config_param ||
                                paramObj?.data_name ||
                                paramObj?.parameter,
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
                                    }));
                                    // This will refresh and display updated value
                                    // onSelectParam(paramObj?.param_name);
                                } else {
                                    setState((prevState) => ({
                                        ...prevState,
                                        prev_param_value: "",
                                        status: CONST_FAILURE,
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

    useEffect(() => {}, [state.selected_product]);

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

        setState((prevState) => ({
            ...prevState,
            prod_id: prodId,
            prod_desc: prodDesc,
            data: []
        }));

        try {
            if (params.server.status) {
                eel.get_prod_data_by_id(prodObj?.prod_id)((response) => {
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
                            const data_list = updateDataSeparated(metadata.prod_data)
                            setState((prevState) => ({
                                ...prevState,
                                data: data_list
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

        setState({
            ...state,
            status: CONST_NONE,
            param_name: DEFAULT_PARAMETER,
            prod_id: prodObj?.prod_id,
            selected_product: prodDesc,
        });
        // alert(JSON.stringify(event.target.value));
    };

    return (
        <div className="absolute flex flex-col w-full mt-4 border-0 border-gray-600 h-1/2">
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex w-1/5 ml-8 border-0 border-blue-700 border-double rounded-t-lg form-control">
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
                    <div className="flex flex-col justify-between mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Enter Order No.
                            </span>
                            {/* <span
                                className={
                                    state.valid_scanned === state.fraction_count
                                        ? "text-green-600 font-bold"
                                        : "text-red-600 font-bold"
                                }
                            >{`${state.valid_scanned} / ${state.fraction_count}`}</span> */}
                        </label>
                        <input
                            type="text"
                            value={state.ord_num}
                            placeholder="Enter Order No. (6-digits)"
                            className="border-double input input-primary input-bordered"
                            onChange={(e) =>
                                handleChangeOrderNum(e)
                            }
                        />
                    </div>
                    <div className="flex flex-col justify-between mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Start Range
                            </span>
                            {/* <span
                                className={
                                    state.valid_scanned === state.fraction_count
                                        ? "text-green-600 font-bold"
                                        : "text-red-600 font-bold"
                                }
                            >{`${state.valid_scanned} / ${state.fraction_count}`}</span> */}
                        </label>
                        <input
                            type="text"
                            value={state.ord_start}
                            placeholder="Enter Start Range"
                            className="border-double input input-primary input-bordered"
                            onChange={(e) =>
                                handleChangeStartRange(e)
                            }
                        />
                    </div>
                    <div className="flex flex-col justify-between mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                End Range (Last Inclusive)
                            </span>
                            {/* <span
                                className={
                                    state.valid_scanned === state.fraction_count
                                        ? "text-green-600 font-bold"
                                        : "text-red-600 font-bold"
                                }
                            >{`${state.valid_scanned} / ${state.fraction_count}`}</span> */}
                        </label>
                        <input
                            type="text"
                            value={state.ord_end}
                            placeholder="Enter End Range"
                            className="border-double input input-primary input-bordered"
                            onChange={(e) =>
                                handleChangeEndRange(e)
                            }
                        />
                    </div>
                    <div className="flex flex-col justify-between mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Confirm and Add
                            </span>
                            {/* <span
                                className={
                                    state.valid_scanned === state.fraction_count
                                        ? "text-green-600 font-bold"
                                        : "text-red-600 font-bold"
                                }
                            >{`${state.valid_scanned} / ${state.fraction_count}`}</span> */}
                        </label>
                        <div className="flex w-full input-group">
                            <input
                                    value={state.range_qty}
                                    type="text"
                                    placeholder="Quantity"
                                    className="w-3/4 input input-bordered"
                                    disabled="disabled"
                                />
                            <button className="btn btn-square" onClick={handleAddOrderSubmit}>
                                ADD
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bottom-0 flex flex-1 px-4 pt-0 border-0 border-red-500">
                    <div className="flex-1 overflow-y-scroll">
                        <MaterialTable
                            title={`Orders For Product ${state.selected_product}`}
                            tableRef={tableRef}
                            icons={tableIcons}
                            data={state.data}
                            columns={columns}
                            // actions={actions}
                            options={{
                                sorting: false,
                                search: false,
                                paging: false,
                                actionsColumnIndex: -1,
                                draggable: false,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderSerialConfig;
