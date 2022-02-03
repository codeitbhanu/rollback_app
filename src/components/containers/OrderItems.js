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

function OrderItems({ eel, params, setParams }) {
    // console.log(params);
    const CONST_SUCCESS = "SUCCESS";
    const CONST_FAILURE = "FAILURE";
    const ACTION_BUTTON_DELETE = "delete";

    const tableRef = React.createRef();

    // <th>PCB NUM</th>
    // <th>STB NUM</th>
    // <th>PROD ID</th>
    // <th>ID STATUS</th>
    // <th>TIMESTAMP</th>
    // <th>USER</th>
    const columns = [
        // { title: "ID", field: "id" },
        { title: "INDEX", field: "index"},
        { title: "PCB NUM", field: "pe.pcb_num"},
        { title: "STB NUM", field: "pe.stb_num" },
        { title: "PRODUCT", field: "prod.prod_desc"},
        { title: "STATUS", field: 's.status_desc'},
        { title: "TIMESTAMP", field: "pe.timestamp"},
        { title: "USER", field: "u.user_desc"},
    ]
    // const actions = [
    //     {
    //         icon: ArrowUpward,
    //         tooltip: "Move Up",
    //         onClick: (event, rowData) => {/** handleMoveUp(rowData) */},
    //     },
    //     {
    //         icon: ArrowDownward,
    //         tooltip: "Move Down",
    //         onClick: (event, rowData) =>{/**  handleMoveDown(rowData) */},
    //     },
    // ];
    // const handleDeleteItem = (id, rownum, serial) => {
    //     console.log("handleDeleteItem called ");
    //     if (
    //         window.confirm(
    //             `Confirm delete Row: ${rownum} - ${serial} from below list?`
    //         )
    //     ) {
    //         setState((state) => {
    //             const list = state.data.filter((item) => item.id !== id);
    //             // console.log(`list: ${list}`);
    //             return { ...state, data: list };
    //         });
    //     }
    // };

    const getOptionList = () => {
        const optList = [];
        for (let i = 0; i < state.field_list.length; i++) {
            if (state.field_list[i]["checked"])
                optList.push(state.field_list[i].tag);
        }
        console.log(optList);
        return optList;
    };

    const default_action_btns = [ACTION_BUTTON_DELETE];
    const [state, setState] = useState({
        field_list: [
            {
                tag: "DISPATCH",
                checked: false,
                disabled: true,
            },
            {
                tag: "PACKAGING",
                checked: false,
                disabled: false,
            },
            {
                tag: "FID",
                checked: true,
                disabled: false,
            },
            {
                tag: "A/W PCBA TEST",
                checked: false,
                disabled: false,
            },
            {
                tag: "SMD",
                checked: false,
                disabled: false,
            },
            {
                tag: "QC",
                checked: false,
                disabled: false,
            },
            {
                tag: "SCRAPPED",
                checked: false,
                disabled: false,
            },
            {
                tag: "BLACKLISTED",
                checked: false,
                disabled: false,
            },
            {
                tag: "REPAIRS",
                checked: true,
                disabled: false,
            },
            {
                tag: "SHIPPED",
                checked: false,
                disabled: true,
            },
            {
                tag: "TOTAL",
                checked: false,
                disabled: true,
            },
        ],
        action_btns: default_action_btns,
        ord_num: "Unknown",
        tabs: [],
        stats: [],
        items: [],
        active_tab: 0,
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    const handleChangeFields = (opt) => {
        console.log("handleChangeFields " + opt.tag);
        const newFields = state.field_list.map((item) => {
            return {
                tag: item.tag,
                checked: item.tag === opt.tag ? !opt.checked : item.checked,
            };
        });
        setState((prevState) => ({
            ...prevState,
            field_list: newFields,
            ord_num: "Please Enter Order",
            tabs: [],
            stats: [],
            items: [],
            active_tab: 0,
        }));
    };

    const handleBarcodeInput = (event) => {
        const ord_num = event.target.value.trim();
        // alert(`___${pcb_sn}___`);
        console.log(params);
        try {
            // if (params.session.active === false) {
            //     alert("Session not active, Please login first");
            //     return;
            // }
            if (
                state.reason_desc === "" ||
                state.reason_desc === reasons_map[0].id_status
            ) {
                alert(
                    "Incorrect reason to rollback, Please choose one from the dropdown."
                );
                return;
            }
            setState((prevState) => ({
                ...prevState,
                ord_num: ord_num,
                tabs: [],
                items: [],
                active_tab: 0,
            }));

            if (params.server.status) {
                eel.get_order_items(
                    ord_num,
                    getOptionList()
                )((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;
                        if (status === CONST_FAILURE) {
                            setTimeout(() => alert(`Error: [${message}`), 200);
                            return;
                        }

                        // const updated_data = state.data;
                        // updated_data.unshift({
                        //     id: uuidv4(),
                        //     ...metadata,
                        // });
                        const tabs = [],
                            items = [],
                            stats = [];
                        for (const [key, value] of Object.entries(
                            metadata?.order_data
                        )) {
                            tabs.push(key);
                            items.push(value.items);
                            stats.push({
                                qty_choice: value["qty_choice"],
                                qty_target: value["qty_target"],
                                qty_produced: value["qty_produced"],
                                blacklisted: value["blacklisted"],
                                total_qty_produced:
                                    metadata["total_qty_produced"],
                                total_qty_target: metadata["total_qty_target"],
                            });
                        }
                        console.log(`tabs: ${tabs}`);
                        console.log(typeof items);
                        setState({
                            ...state,
                            ord_num: ord_num,
                            tabs: tabs,
                            stats: stats,
                            items: items,
                            active_tab: 0,
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

    // const handleChangeTextBox = (event) => {
    //     console.log("handleSelectReasonDropdown called " + event.target.value);
    //     setState({
    //         ...state,
    //         reason_manual: event.target.value,
    //     });
    // };

    return (
        <div className="absolute flex flex-col w-full mt-2 border-0 border-red-600 h-1/2">
            <div className="flex flex-col border-0 border-green-400 border-dashed">
                <div className="flex mb-2 ml-4 border-0 border-blue-700 border-double rounded-t-lg">
                    <div className="flex border-0 border-red-500">
                        <div className="flex flex-col border-0 border-green-500">
                            <label className="text-black label">
                                <span className="text-black label-text">
                                    Enter Order Number
                                </span>
                            </label>
                            <input
                                type="text"
                                placeholder="Order Number"
                                className="border-double input input-primary input-bordered"
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleBarcodeInput(e)
                                }
                            />
                        </div>
                        <div className="grid grid-flow-col grid-rows-2 gap-2 pl-4 mt-4 max-h-72">
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
                        </div>
                    </div>
                </div>
                <div className="flex h-auto gap-2 px-4 pt-0 bg-gray-100 border stats border-base-300">
                    <div className="flex flex-col flex-1 mb-16 overflow-x-auto border-0 border-green-400">
                        <div class="tabs">
                            {state.tabs.map((pd, idx) => (
                                <a
                                    href="#/"
                                    onClick={() =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            active_tab: idx,
                                        }))
                                    }
                                    className={`tab tab-lg tab-lifted ${
                                        idx === state.active_tab
                                            ? "tab-active"
                                            : ""
                                    }`}
                                >
                                    {pd}
                                </a>
                            ))}
                        </div>
                        <MaterialTable
                            title={`${state.ord_num}_${state.tabs[state.active_tab]}_order_items_${getOptionList().join("_")}`}
                            tableRef={tableRef}
                            icons={tableIcons}
                            data={state.items[state.active_tab]}
                            columns={columns}
                            options={{
                                sorting: false,
                                search: false,
                                paging: false,
                                actionsColumnIndex: -1,
                                draggable: false,
                                exportButton: true
                            }}
                        />
                        {/* <table className="table w-full overflow-y-scroll table-compact">
                            <thead className="border-0 border-blue-500">
                                <tr className="">
                                    <th className="">SN</th>
                                    <th>PCB NUM</th>
                                    <th>STB NUM</th>
                                    <th>PROD ID</th>
                                    <th>ID STATUS</th>
                                    <th>TIMESTAMP</th>
                                    <th>USER</th>
                                </tr>
                            </thead>
                            <tbody className="h-screen overflow-y-scroll border-0 border-purple-500">
                                {state.items.length
                                    ? state.items[state.active_tab].map(
                                          (item, index) => (
                                              <tr
                                                  key={
                                                      state.tabs[
                                                          state.active_tab
                                                      ] +
                                                      "_" +
                                                      index
                                                  }
                                                  id={item.index}
                                                  className="p-0 border-0 border-red-600"
                                              >
                                                  <th>
                                                      {index + 1}
                                                  </th>
                                                  <td>{item["pe.pcb_num"]}</td>
                                                  <td>{item["pe.stb_num"]}</td>
                                                  <td>
                                                      {item["prod.prod_desc"]}
                                                  </td>
                                                  <td>
                                                      {item["s.status_desc"]}
                                                  </td>
                                                  <td>
                                                      {getFormattedDateTime(
                                                          item["pe.timestamp"]
                                                      )}
                                                  </td>
                                                  <td>{item["u.user_desc"]}</td>
                                              </tr>
                                          )
                                      )
                                    : null}
                            </tbody>
                        </table> */}
                    </div>
                    <div className="flex flex-col w-1/4 h-auto gap-2 border-0 border-red-500 stats">
                        <div className="stat">
                            <div className="stat-title">Order Number</div>
                            <div className="stat-value">{state.ord_num}</div>
                            <div className="mt-2 stat-desc">
                                <progress className="hidden progress" />
                            </div>
                        </div>

                        <div className="stat">
                            <div className="stat-title">Found Units</div>
                            <div className="stat-value">
                                {state.stats.length &&
                                    state.stats[state.active_tab]["qty_choice"]}
                            </div>
                            <div className="mt-2 stat-desc">
                                <progress className="hidden progress" />
                            </div>
                        </div>

                        <div className="stat">
                            <div className="stat-title">Produced vs Target</div>
                            <div
                                className={
                                    state.stats.length &&
                                    state.stats[state.active_tab][
                                        "total_qty_produced"
                                    ] !==
                                        state.stats[state.active_tab][
                                            "total_qty_target"
                                        ]
                                        ? "stat-value text-error"
                                        : "stat-value text-success"
                                }
                            >
                                {state.stats.length &&
                                    state.stats[state.active_tab][
                                        "total_qty_produced"
                                    ]}{" "}
                                /{" "}
                                {state.stats.length &&
                                    state.stats[state.active_tab][
                                        "total_qty_target"
                                    ]}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// "qty_choice": value["qty_choice"],
// "qty_target": value["qty_target"],
// "qty_produced": value["qty_produced"],
// "blacklisted": value["blacklisted"],
// "total_qty_produced": metadata["total_qty_produced"]

export default OrderItems;
