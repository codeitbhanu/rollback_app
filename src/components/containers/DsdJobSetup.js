import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast, { Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from "uuid";
import swal from "@sweetalert/with-react";
import { useTable } from "react-table";
import MaterialTable from "material-table";
import { forwardRef } from "react";

import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";

import ActionButtons from "../ActionButtons";

// import fake_data from "../datajson/data";
import status_map from "../../datajson/statusmap";
import reasons_map from "../../datajson/reasonsmap";
import { stat } from "fs";

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    ArrowUpward: forwardRef((props, ref) => (
        <ArrowUpward {...props} ref={ref} />
    )),
    ArrowDownward: forwardRef((props, ref) => (
        <ArrowDownward {...props} ref={ref} />
    )),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => (
        <ChevronRight {...props} ref={ref} />
    )),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => (
        <ChevronLeft {...props} ref={ref} />
    )),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => (
        <ArrowDownward {...props} ref={ref} />
    )),
    ThirdStateCheck: forwardRef((props, ref) => (
        <Remove {...props} ref={ref} />
    )),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};
// const defPath = "~";

function DsdJobSetup({ eel, params, setParams, config_data }) {
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
        ord_qty: 0,
        kit_start: undefined,
        kit_end: undefined,
        kit_qty: 0,
        file_path: "",
        disableDropzone: true,
        selectedQtyRoundOff: 500,
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    const columns = [
        // { title: "ID", field: "id" },
        { title: "Order Num", field: "order", type: "numeric" },
        { title: "Range-Start", field: "sn_start" },
        { title: "Range-End", field: "sn_end" },
        { title: "Quantity", field: "qty", type: "numeric" },
        { title: "Priority", field: "priority", type: "numeric" },
    ];
    const actions = [
        {
            icon: ArrowUpward,
            tooltip: "Move Up",
            onClick: (event, rowData) => handleMoveUp(rowData),
        },
        {
            icon: ArrowDownward,
            tooltip: "Move Down",
            onClick: (event, rowData) => handleMoveDown(rowData),
        },
    ];

    const firstRunUpdateRanges = (
        prod_desc = "",
        ord_num = "",
        kit_start = "",
        kit_end = "",
        kit_qty = 0
    ) => {
        console.log(
            `firstRunUpdateRanges called: prod_desc: ${prod_desc}\nord_num: ${ord_num}\nkit_start: ${kit_start}\nkit_end: ${kit_end}\nkit_qty: ${kit_qty}`
        );
        console.log(
            `firstRunUpdateRanges called: ord_num_len: ${
                ord_num.length
            }\nkit_start_len: ${kit_start.length}\nkit_end_len: ${
                kit_end.length
            }\nkit_qty: ${typeof kit_qty}`
        );
        let rangeObj = {
            main: {
                start: undefined,
                end: undefined,
                qty: undefined,
            },
            foc: {
                start: undefined,
                end: undefined,
                qty: undefined,
            },
        };
        if (
            ord_num.length === 6 &&
            kit_start.length === 10 &&
            kit_end.length === 10 &&
            kit_qty > 0
        ) {
            console.log(`1 ${prod_desc}`);
            if (prod_desc.includes("MCS")) {
                console.log(`2`);
                //Need to calculate foc, default round-off 500
                console.log(`Need to calculate foc, default round-off 500`);
                const roundedQty =
                    Math.floor(kit_qty / state.selectedQtyRoundOff) *
                    state.selectedQtyRoundOff;
                const focQty = kit_qty - (Math.floor(kit_qty / state.selectedQtyRoundOff) * state.selectedQtyRoundOff);

                let ord_start = kit_start;
                let ord_end =
                    kit_start.slice(0, 2) +
                    (parseInt(kit_start.slice(2, 10)) + roundedQty - 1);
                let ord_qty = calcQuantity(ord_start, ord_end);

                let foc_start =
                    ord_end.slice(0, 2) +
                    (parseInt(ord_end.slice(2, 10)) + 1);
                let foc_end =
                    foc_start.slice(0, 2) +
                    (parseInt(foc_start.slice(2, 10)) + focQty - 1);
                let foc_qty = calcQuantity(foc_start, foc_end);

                rangeObj = {
                    main: {
                        start: ord_start,
                        end: ord_end,
                        qty: ord_qty,
                    },
                    foc: {
                        start: foc_start,
                        end: foc_end,
                        qty: foc_qty,
                    },
                };
            } else {
                console.log(`3`);
                rangeObj = {
                    ...rangeObj,
                    main: {
                        start: kit_start,
                        end: kit_end,
                        qty: kit_qty,
                    },
                };
            }
        } else {
            setTimeout(() => {
                alert(
                    `ERROR: UPLOADED FILE CONTENT IS IN INCORRECT FORMAT OR STRUCTURE: ord_num: ${ord_num}\nkit_start: ${kit_start}\nkit_end: ${kit_end}\n`
                );
            }, 200);
        }
        return rangeObj;
    };

    const onSelectKitFile = useCallback((acceptedFiles) => {
        console.log(`Reading file: ${acceptedFiles[0].path}`);
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onabort = () => alert("Error: file reading was aborted");
            reader.onerror = () => alert("Error: file reading has failed");
            reader.onload = (state) => {
                // Do whatever you want with the file contents
                // const fileStr = reader.result.split('\n').shift(); //first line
                const filePath = acceptedFiles[0].path;
                const fileStr = reader.result
                    .split("Factory SW Time")[0]
                    .replace("SN", "")
                    .replace(/\W/g, "");
                console.log(fileStr);

                if (fileStr.length === 20) {
                    setState((prevState) => {
                        const ord_num = filePath.slice(0, 6);
                        const kit_start = fileStr.slice(0, 10);
                        const kit_end = fileStr.slice(10, 20);
                        const kit_qty = calcQuantity(kit_start, kit_end);
                        const rangeObj = firstRunUpdateRanges(
                            prevState.prod_desc,
                            ord_num,
                            kit_start,
                            kit_end,
                            kit_qty
                        );
                        console.log(rangeObj);

                        const retState = {
                            ...prevState,
                            ord_num,
                            kit_start,
                            kit_end,
                            kit_qty,
                            ord_start: rangeObj.main.start,
                            ord_end: rangeObj.main.end,
                            ord_qty: rangeObj.main.qty,
                            foc_start: rangeObj.foc.start,
                            foc_end: rangeObj.foc.end,
                            foc_qty: rangeObj.foc.qty,
                            file_path: filePath,
                        };
                        return retState;
                    });
                } else {
                    alert("Error: file reading failed, please input manually!");
                }
            };
            reader.readAsText(file);
        });
    }, []);
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: onSelectKitFile,
        disabled: state.disableDropzone,
    });
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
            order: item["data_value"].slice(0, 6),
            sn_start: item["data_value"].slice(6, 16),
            sn_end: item["data_value"].slice(16, 26),
            qty:
                parseInt(item["data_value"].slice(17, 26)) -
                parseInt(item["data_value"].slice(7, 16)),
            priority: item["priority"],
            status: item["status"],
        }));
        console.log(ret);
        return ret;
    };

    const updateDataCombined = (data) => {
        return data.map((item, index) => ({
            data_value: item.order + item.sn_start + item.sn_end,
            priority: item.priority,
            status: item.status,
        }));
    };

    const handleMoveUp = (row) => {
        console.log("handleMoveUp " + row.order + row.sn_start + row.sn_end);
        const currIndex = row.priority;
        const nextIndex = row.priority - 1;
        const updateData = updateDataCombined(state.data);
        console.log(updateData);

        if (nextIndex >= 1) {
            const reordered = updateData.map((item, index) => ({
                data_value: item.data_value,
                priority:
                    item.priority < currIndex
                        ? item.priority + 1
                        : item.priority === currIndex
                        ? nextIndex
                        : item.priority,
                status:
                    item.priority === currIndex && nextIndex === 1
                        ? 4
                        : item.status,
            }));
            console.log(reordered);
            setState((prevState) => ({
                ...prevState,
                data: updateDataSeparated(reordered),
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
    };

    const handleQtyRoundOff = (val) => {
        console.log("handleQtyRoundOff called " + val);
        let _start = state.ord_start;
        let _end = state.ord_end;
        let _ord_qty = state.ord_qty;
        let _foc_start = "";
        let _foc_end = "";
        setState((prevState) => ({
            ...prevState,
            selectedQtyRoundOff: val,
        }));
    };

    const handleMoveDown = (row) => {
        console.log("handleMoveDown " + row.order + row.sn_start + row.sn_end);
    };

    const handleChangeOrderNum = (event) => {
        console.log("handleChangeOrderNum called " + event.target.value);
        const ord = event.target.value.trim();
        // setState((prevState) => ({
        //     ...prevState,
        //     ord_num: ord,
        // }));
    };

    const calcQuantity = (start = "", end = "") => {
        let qty = 0;
        let ord_end = "";
        let ord_start = "";
        try {
            ord_end = end.trim().match(/\d+$/)[0];
            ord_start = start.trim().match(/\d+$/)[0];
        } catch (e) {
            console.log("Error: " + e.message);
        }
        if (
            ord_start !== "" &&
            ord_end !== "" &&
            ord_end.length === ord_start.length
        ) {
            qty = ord_end - ord_start + 1;
            console.log(`end: ${ord_end} start: ${ord_start} qty: ${qty}`);
        }
        return qty;
    };

    const handleChangeStartRange = (event) => {
        console.log("handleChangeStartRange called " + event.target.value);
        const start = event.target.value.trim();
        setState((prevState) => ({
            ...prevState,
            ord_start: start,
            ord_qty: calcQuantity(start, state.ord_end),
        }));
    };

    const CalcFocRange = (
        kit_start = "",
        kit_end = "",
        ord_start = "",
        ord_qty = ""
    ) => {
        console.log(
            `CalcFocRange called: kit_start: ${kit_start}\nord_start: ${ord_start}\nord_qty: ${ord_qty}`
        );
        let focObj = {
            start: undefined,
            end: undefined,
            qty: undefined,
        };

        if (ord_start !== kit_start)
        {
            setTimeout(() => {
                alert(
                    `ERROR: ORDER START CANNOT BE DIFFERENT FROM KIT START: ${kit_start}`
                );
            }, 200);
            return focObj;
        }

        let foc_start =
                    kit_start.slice(0, 2) +
                    (parseInt(kit_start.slice(2, 10)) + ord_qty);
        let foc_end = kit_end;

        let foc_qty = calcQuantity(foc_start, foc_end);
        
        focObj = {
            start: foc_start,
            end: foc_end,
            qty: foc_qty,
        }

        return focObj;
    };

    const handleChangeEndRange = (event) => {
        console.log("handleChangeEndRange called " + event.target.value);
        const end = event.target.value.trim();
        const ord_qty = calcQuantity(state.ord_start, end);
        if (ord_qty > state.kit_qty)
        {
            setTimeout(() => {
                alert(
                    `ERROR: ORDER QTY CANNOT EXCEED KIT QTY: ${state.kit_qty}`
                );
            }, 200);
            return;
        }
        const focObj = CalcFocRange(state.kit_start,state.kit_end,state.ord_start,ord_qty);
        setState((prevState) => ({
            ...prevState,
            ord_end: end,
            ord_qty: ord_qty,
            foc_start: focObj.start,
            foc_end: focObj.end,
            foc_qty: focObj.qty
        }));
    };

    // const handleUpKeyEndRange = (event) => {
    //     console.log("handleChangeEndRange called " + event.target.value);
    // }

    // const handleDownKeyEndRange = (event) => {
    //     console.log("handleChangeEndRange called " + event.target.value);
    // }

    const handleChangeFOCStartRange = (event) => {
        console.log("handleChangeFOCStartRange called " + event.target.value);
        const start = event.target.value.trim();
        setState((prevState) => ({
            ...prevState,
            foc_start: start,
            foc_qty: calcQuantity(start, state.foc_end),
        }));
    };

    const handleChangeFOCEndRange = (event) => {
        console.log("handleChangeFOCEndRange called " + event.target.value);
        const end = event.target.value.trim();
        setState((prevState) => ({
            ...prevState,
            foc_end: end,
            foc_qty: calcQuantity(state.foc_start, end),
        }));
    };

    const handleAddOrderSubmit = () => {
        console.log("handleAddOrderSubmit called ");
        console.log(state);
        if (state?.ord_num && state?.ord_num?.length !== 6) {
            alert("Error: Order Number Incorrect");
            return;
        } else if (state?.ord_qty <= 0) {
            alert("Error: Range Cannot Be 0 or less");
            return;
        } else if (state?.prod_id <= 0) {
            alert("Error: Product is incorrect");
            return;
        } else if (state?.foc_qty >= state?.ord_qty || state?.foc_qty >= state?.kit_qty) {
            alert("Error: Product is incorrect");
            return;
        } else {
            try {
                const prod_id = state.prod_id;
                const prod_desc = state.prod_desc;
                const ord_num = state.ord_num;
                const ord_start = state.ord_start;
                const ord_end = state.ord_end;
                const ord_qty = calcQuantity(ord_start,ord_end);
                const foc_start = state.foc_start;
                const foc_end = state.foc_end;
                const sn_length = state.ord_start.length;
                const prefix = state.ord_end.match(/[a-zA-Z]+/g)[0];
                console.log(`prefix: ${prefix}`);
                const end_digits = String(
                    parseInt(state.ord_end.match(/\d+$/)[0]) + 1
                );
                console.log(`end_digits: ${end_digits}`);
                const len_prefix = prefix.length;
                const ord_end_plus_one =
                    prefix +
                    end_digits.padStart(sn_length - prefix.length, "0");
                const full_len_sn_range =
                    ord_num + ord_start + ord_end_plus_one;
                console.log(full_len_sn_range);
                // setState((prevState) => ({
                //     ...prevState,
                //     ord_num: "",
                //     ord_start: "",
                //     ord_end: "",
                    
                // }));
                if (params.server.status) {
                    eel.add_new_order_ranges(
                        prod_id,
                        prod_desc,
                        ord_num,
                        ord_start,
                        ord_end,
                        ord_qty,
                        full_len_sn_range,
                        foc_start,
                        foc_end,
                        params.session.userdata.user_desc
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
                                const data_list = updateDataSeparated(
                                    metadata.prod_data
                                );
                                setState((prevState) => ({
                                        ...prevState,
                                        ord_num: "",
                                        kit_start: "",
                                        kit_end: "",
                                        kit_qty: "",
                                        ord_start: "",
                                        ord_end: "",
                                        ord_qty: "",
                                        foc_start: "",
                                        foc_end: "",
                                        foc_qty: "",
                                        file_path: "",
                                }));
                                toast.success('Successfully updated!')

                            } else {
                                setTimeout(() => {
                                    toast.error(`RESPONSE ERROR: ${message}`)
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
            state.prod_desc === "" ||
            state.prod_desc === default_product.prod_desc
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
            case "oqc_target_count":
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

    useEffect(() => {}, [state.prod_desc]);

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
            // alert(`${error}`);
        }

        // return () => {
        //     cleanup
        // }
    }, [eel, params.server.status]);

    // useEffect(() => {
    //     console.log("useEffect called #2");
    // }, [state.valid_scanned, state.fraction_count, state.common_prod_id]);
    
    const onSelectProduct = (prod_id, prod_desc) => {
        const prodObj = state.active_products.filter(
            (prod) => prod.prod_desc === prod_desc
        )[0];
        console.log(
            `onSelectProduct called prod_id: ${prodObj?.prod_id} prod_desc: ${prod_desc}`
        );

        setState((prevState) => ({
            ...prevState,
            prod_id: prodObj?.prod_id,
            prod_desc: prod_desc,
            disableDropzone: false,
            data: [],
        }));

        try {
            if (params.server.status) {
                // eel.get_prod_data_by_id(prodObj?.prod_id)((response) => {
                //     console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                //     try {
                //         const function_name = response.function_name;
                //         const status = response.status;
                //         const message = response.message;
                //         const metadata = response.data.metadata;
                //         console.log(
                //             `${function_name} message got: ${JSON.stringify(
                //                 message
                //             )} metadata: ${JSON.stringify(metadata)}`
                //         );
                //         if (status === CONST_SUCCESS) {
                //             const data_list = updateDataSeparated(
                //                 metadata.prod_data
                //             );
                //             setState((prevState) => ({
                //                 ...prevState,
                //                 data: data_list,
                //                 disableDropzone: data_list.length
                //                     ? false
                //                     : prevState.disableDropzone,
                //             }));
                //         } else {
                //             setTimeout(() => {
                //                 alert(`RESPONSE ERROR: ${message}`);
                //             }, 200);
                //         }
                //     } catch (error) {
                //         setTimeout(() => {
                //             alert(`PARSE ${error}`);
                //         }, 200);
                //     }
                // });
            } else {
                throw Error(`Connect the server first`);
            }
        } catch (error) {
            alert(`${error}`);
        }

        // setState({
        //     ...state,
        //     status: CONST_NONE,
        //     param_name: DEFAULT_PARAMETER,
        //     prod_id: prodObj?.prod_id,
        //     prod_desc: prod_desc,
        // });
        // setState((prevState) => ({
        //     ...prevState,
        //     prod_id: prod_id,
        //     prod_desc: prod_desc,
        //     disableDropzone: false,
        //     data: [],
        // }));
        // alert(JSON.stringify(event.target.value));
    };

    return (
        <div className="absolute flex flex-col w-full mt-4 border-0 border-gray-600 h-1/2">
            <Toaster position="bottom-left" reverseOrder={false} />
            <div className="flex mx-8 flex-col border-0 border-green-400 border-dashed">
                <div className="flex w-full border-0 border-red-600">
                    <div className="flex flex-col w-1/5">
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
                    <div className="ml-8 flex flex-col w-1/4">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Provide Kit File
                            </span>
                        </label>
                        <div
                            {...getRootProps()}
                            className={`border-0 border-green-700 alert select-none shadow-lg mr-16 ${
                                state.disableDropzone
                                    ? "cursor-not-allowed"
                                    : "cursor-pointer"
                            }`}
                        >
                            <input {...getInputProps()} />
                            <p>
                                {state.file_path
                                    ? state.file_path
                                    : state.disableDropzone
                                    ? "Select Product First"
                                    : `Drag 'n' drop kit file, or click to select it.`}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex w-full mt-4 border-0 border-red-700 border-double rounded-t-lg">
                    <div className="flex flex-col w-auto mt-4 border-0 border-blue-700 border-double rounded-t-lg">
                        <div>
                            <div className="h-20 card bg-base-300 place-items-center w-full">
                                Mainstream Production Range
                            </div>
                            {/* <div className="divider" /> */}
                        </div>

                        <div className="flex w-auto mt-2 border-0 border-yellow-500">
                            <div className="flex w-28 flex-col border-0 border-purple-600 justify-between mt-2 mr-4">
                                <label className="text-black label">
                                    <span className="text-black label-text">
                                        Order No.
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={state.ord_num}
                                    placeholder="Order No."
                                    className="border-double input input-primary input-bordered"
                                    onChange={(e) => handleChangeOrderNum(e)}
                                />
                            </div>
                            <div className="flex w-36 flex-col border-0 border-purple-600 justify-between mt-2 mr-2">
                                <label className="text-black label">
                                    <span className="text-black label-text">
                                        Start Range
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={state.ord_start}
                                    placeholder="Enter Start Range"
                                    className="border-double input input-primary input-bordered"
                                    onChange={(e) => handleChangeStartRange(e)}
                                />
                            </div>
                            <div className="flex w-36 flex-col border-0 border-purple-600 justify-between mt-2 mr-2">
                                <label className="text-black label">
                                    <span className="text-black label-text">
                                        End Range
                                        {/* End Range (Last Inclusive) */}
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={state.ord_end}
                                    placeholder="Enter End Range"
                                    className="border-double input input-primary input-bordered"
                                    onChange={(e) => handleChangeEndRange(e)}
                                    // onKeyDown={(e) =>
                                    //     e.which === 38 || e.which === 104 ? handleUpKeyEndRange(e) 
                                    //     : e.which === 40 || e.which === 98 ? handleDownKeyEndRange(e) 
                                    //     : null
                                    // }
                                />
                            </div>
                            <div className="flex w-28 flex-col border-0 border-green-600 justify-between mt-2">
                                <label className="text-black label">
                                    <span className="text-black label-text">
                                        Target Qty
                                    </span>
                                </label>
                                <div className="flex">
                                    <input
                                        value={state.ord_qty}
                                        type="text"
                                        placeholder="Quantity"
                                        className="w-full input input-bordered"
                                        disabled="disabled"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* {state.prod_desc.includes("MCS") ? (
                            <div>
                                <label className="text-black label mt-2">
                                    <span className="text-black label-text">
                                        Qty Round-off
                                    </span>
                                </label>
                                <div className="btn-group">
                                    <input
                                        type="radio"
                                        name="options"
                                        data-title={10}
                                        className="btn btn-sm"
                                        checked={
                                            state.selectedQtyRoundOff === 10
                                        }
                                        onChange={() => handleQtyRoundOff(10)}
                                    />
                                    <input
                                        type="radio"
                                        name="options"
                                        data-title={100}
                                        className="btn btn-sm"
                                        checked={
                                            state.selectedQtyRoundOff === 100
                                        }
                                        onChange={() => handleQtyRoundOff(100)}
                                    />
                                    <input
                                        type="radio"
                                        name="options"
                                        data-title={500}
                                        className="btn btn-sm"
                                        checked={
                                            state.selectedQtyRoundOff === 500
                                        }
                                        onChange={() => handleQtyRoundOff(500)}
                                    />
                                    <input
                                        type="radio"
                                        name="options"
                                        data-title={1000}
                                        className="btn btn-sm"
                                        checked={
                                            state.selectedQtyRoundOff === 1000
                                        }
                                        onChange={() => handleQtyRoundOff(1000)}
                                    />
                                </div>
                            </div>
                        ) : null} */}
                    </div>
                    {state.prod_desc.includes("MCS") ? (
                        <div className="flex flex-col w-auto ml-4 mt-4 border-0 border-blue-700 border-double rounded-t-lg">
                            <div>
                                <div className="h-20 card bg-base-300 place-items-center w-full">
                                    FOC Range
                                </div>
                                {/* <div className="divider" /> */}
                            </div>

                            <div className="flex w-auto mt-2 border-0 border-yellow-500">
                                <div className="flex w-36 flex-col border-0 border-purple-600 justify-between mt-2 mr-2">
                                    <label className="text-black label">
                                        <span className="text-black label-text">
                                            Start Range
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={state.foc_start}
                                        placeholder="Enter Start Range"
                                        className="border-double input input-primary input-bordered"
                                        disabled="disabled"
                                        onChange={(e) =>
                                            handleChangeFOCStartRange(e)
                                        }
                                    />
                                </div>
                                <div className="flex w-36 flex-col border-0 border-purple-600 justify-between mt-2 mr-2">
                                    <label className="text-black label">
                                        <span className="text-black label-text">
                                            End Range
                                            {/* End Range (Last Inclusive) */}
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={state.foc_end}
                                        placeholder="Enter End Range"
                                        className="border-double input input-primary input-bordered"
                                        disabled="disabled"
                                        onChange={(e) =>
                                            handleChangeFOCEndRange(e)
                                        }
                                    />
                                </div>
                                <div className="flex w-28 flex-col border-0 border-green-600 justify-between mt-2">
                                    <label className="text-black label">
                                        <span className="text-black label-text">
                                            FOC Qty
                                        </span>
                                    </label>
                                    <div className="flex">
                                        <input
                                            value={state.foc_qty}
                                            type="text"
                                            placeholder="FOC Qty"
                                            className="w-full input input-bordered"
                                            disabled="disabled"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <div className="flex flex-col w-auto ml-4 mt-4 border-0 border-blue-700 border-double rounded-t-lg">
                        <div>
                            <div className="h-20 mt-5 card place-items-center w-full"></div>
                            {/* <div className="divider" /> */}
                        </div>

                        <div className="flex w-36 mt-2 border-0 border-yellow-500">
                            <div className="flex w-full flex-col border-0 border-purple-600 justify-between mt-2 mr-4">
                                <label className="text-black label">
                                    <span className="text-black label-text">
                                        Submit
                                    </span>
                                </label>
                                <button
                                    className="btn w-full"
                                    onClick={handleAddOrderSubmit}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <div className="bottom-0 flex flex-1 px-4 pt-0 border-0 border-red-500">
                    <div className="flex-1 overflow-y-scroll">
                        <MaterialTable
                            title={`Orders For Product ${state.prod_desc}`}
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
                </div> */}
            </div>
        </div>
    );
}

export default DsdJobSetup;
