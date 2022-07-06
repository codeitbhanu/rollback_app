import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
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

const option_status = [
    {
        id_status: 0,
        status_desc: "Select a Target Status To Rollback",
    },
    {
        id_status: 85,
        status_desc: "Assembly Received",
    },
    {
        id_status: 13,
        status_desc: "PCBA Test Passed",
    },
    {
        id_status: 18,
        status_desc: "CA Test Passed",
    },
    {
        id_status: 73,
        status_desc: "Awaiting OQC Test",
    },
];

const getFormattedDateTime = (dt) => {
    if (!dt || dt === "None") return "";
    const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    };
    const dateTime = new Date(dt);

    return dateTime.toLocaleDateString("en-ZA", options).replace(/[.,]/g, "");
};

function StreamaValidateTests({ eel, params, setParams }) {
    // console.log(params);
    const CONST_SUCCESS = "SUCCESS";
    const CONST_FAILURE = "FAILURE";
    const ACTION_BUTTON_DELETE = "delete";

    const tableRef = React.createRef();

    const columns = [
        { title: "index", field: "index" },
        { title: "stb_num", field: "stb_num" },
        { title: "interfacetest", field: "interfacetest" },
        { title: "wirelesstest", field: "wirelesstest" },
        { title: "infocheck", field: "infocheck" },
        { title: "factoryinspection", field: "factoryinspection" },
        { title: "status", field: "status" },
        { title: "carton", field: "carton" },
        { title: "timestamp", field: "timestamp" },
    ];

    // const getOptionList = () => {
    //     const optList = [];
    //     for (let i = 0; i < state.field_list.length; i++) {
    //         if (state.field_list[i]["checked"])
    //             optList.push(state.field_list[i].tag);
    //     }
    //     console.log(optList);
    //     return optList;
    // };

    const default_action_btns = [ACTION_BUTTON_DELETE];
    const [state, setState] = useState({
        action_btns: default_action_btns,
        items: [],
        pallet_num: "Unknown",
        stb_num: "Unknown",
        status: CONST_SUCCESS,
        message: "Please scan a unit",
        pallet_size: -1,
        passed: -1,
        failed: -1,
        not_tested: -1,
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    const handleBarcodeInput = (event) => {
        const stb_num = event.target.value.trim();
        // alert(`___${pcb_sn}___`);
        console.log(params);
        try {
            if (params.session.active === false) {
                alert("Session not active, Please login first");
                return;
            }
            setState((prevState) => ({
                ...prevState,
                stb_num: "stb_num",
                message: "Request Pending",
                // status: CONST_FAILURE,
            }));

            if (params.server.status) {
                eel.streama_rework_rollback(stb_num, params.session.userdata.id_user)((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;
                        // if (status === CONST_FAILURE) {
                        //     setTimeout(() => alert(`Error: [${message}`), 200);
                        //     return;
                        // }

                        setState({
                            ...state,
                            stb_num: metadata.stb_num,
                            status: status,
                            message: message
                        });
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

    return (
        <div className="absolute flex flex-col w-full mt-2 border-0 border-red-600 h-1/2">
            <div className="flex flex-col border-0 border-green-400 border-dashed mx-4">
                <div className="flex mb-2 border-0 border-blue-700 border-double justify-between rounded-t-lg">
                    <div className="flex border-0 border-red-500 flex-1 justify-between">
                        <div className="flex flex-col border-0 border-green-500 ">
                            <label className="text-black label">
                                <span className="text-black label-text">
                                    Scan Serial No.
                                </span>
                                <span className="text-red-500 label-text">
                                (CAUTION: Use strictly for streama rework units!) 
                            </span>
                            </label>
                            <input
                                type="text"
                                placeholder="Scan Serial No."
                                className="border-double input input-primary input-bordered"
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleBarcodeInput(e)
                                }
                            />
                        </div>
                        <div className="my-auto">
                            {state.status === CONST_SUCCESS ? (
                                <div className="text-green-600 text-4xl">
                                    {state.stb_num} Rollback Success ✔
                                </div>
                            ) : (
                                <div className="text-red-600 text-4xl">
                                    {state.stb_num} Rollback Failed ❌
                                </div>
                            )}
                        </div>

                        <div className="stats stats-vertical sm:stats-horizontal">
                            {/* <div className="stat">
                                <div className="stat-title">Passed</div>
                                <div className="stat-value">{state.passed}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Failed</div>
                                <div className="stat-value">{state.failed}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">NT</div>
                                <div className="stat-value">
                                    {state.not_tested}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Pallet Size</div>
                                <div className="stat-value">
                                    {state.pallet_size}
                                </div>
                            </div> */}
                        </div>

                        {/* <div className="grid grid-flow-col grid-rows-2 gap-2 pl-4 mt-4 max-h-72">
                            {state.field_list.map((f) => {
                                return (
                                    <label
                                        className="flex items-center pl-2 align-middle border-0 border-gray-400 cursor-pointer hover:bg-gray-300"
                                        key={f.tag}
                                    >
                                        <input
                                            disabled={f.disabled}
                                            type="checkbox"
                                            defaultChecked={f.checked}
                                            className="checkbox-sm checkbox-primary"
                                            onClick={() =>
                                                handleChangeFields(f)
                                            }
                                        />
                                        <span className="justify-start mx-4 text-left select-none label-text whitespace-nowrap">
                                            {f.tag}
                                        </span>
                                    </label>
                                );
                            })}
                        </div> */}
                    </div>
                </div>
                {/* <div className="flex h-auto gap-2 px-4 pt-0 bg-white border-2 stats border-base-300">
                    <div className="flex flex-col flex-1 mb-16 overflow-x-auto border-0 border-green-400">
                        <MaterialTable
                            title={`${state.pallet_num}_failed_items`}
                            tableRef={tableRef}
                            icons={tableIcons}
                            data={state.items}
                            columns={columns}
                            options={{
                                sorting: false,
                                search: false,
                                paging: false,
                                actionsColumnIndex: -1,
                                draggable: false,
                                exportButton: true,
                            }}
                        />
                    </div>
                </div> */}
                <div className="bottom-0 flex flex-1 pt-0 border-0 border-red-500">
                    <div className="shadow stats mt-4 w-full rounded-none">
                        <div className="stat flex-wrap">
                            <div
                                className={`text-left text-xl text-red-500 flex-wrap ${
                                    state.status === CONST_SUCCESS
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            >
                                {state.message}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// "total_qty_choice": value["total_qty_choice"],
// "total_qty_target": value["total_qty_target"],
// "total_qty_produced": value["total_qty_produced"],
// "blacklisted": value["blacklisted"],
// "total_qty_produced": metadata["total_qty_produced"]

export default StreamaValidateTests;
