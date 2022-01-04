import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import ActionButtons from "../ActionButtons";

// import fake_data from "../datajson/data";
import status_map from "../../datajson/statusmap";
import reasons_map from "../../datajson/reasonsmap";

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
            },
            {
                tag: "PACKAGING",
                checked: false,
            },
            {
                tag: "FID",
                checked: true,
            },
            {
                tag: "A/W PCBA TEST",
                checked: false,
            },
            {
                tag: "SMD",
                checked: false,
            },
            {
                tag: "QC",
                checked: false,
            },
            {
                tag: "SCRAPPED",
                checked: false,
            },
            {
                tag: "BLACKLISTED",
                checked: false,
            },
            {
                tag: "REPAIRS",
                checked: true,
            },
            {
                tag: "SHIPPED",
                checked: false,
            },
            {
                tag: "TOTAL",
                checked: false,
            },
        ],
        action_btns: default_action_btns,
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
        }));
    };

    const handleBarcodeInput = (event) => {
        const ord_num = event.target.value.trim();
        // alert(`___${pcb_sn}___`);
        console.log(params);
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
            setState((prevState) => ({
                ...prevState,
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
                                "qty_choice": value["qty_choice"],
                                "qty_target": value["qty_target"],
                                "qty_produced": value["qty_produced"],
                                "blacklisted": value["blacklisted"],
                                "total_qty_produced": metadata["total_qty_produced"],
                                "total_qty_target": metadata["total_qty_target"],
                            })
                        }
                        console.log(`tabs: ${tabs}`);
                        console.log(typeof items);
                        setState({
                            ...state,
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
                                    <label className="flex items-center pl-2 align-middle border-0 border-gray-400 cursor-pointer hover:bg-gray-300">
                                        <input
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
                <div className="flex gap-2 px-4 pt-0 bg-gray-100 border-0 border-red-500 h-tableheight">
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
                        <table className="table w-full overflow-y-scroll table-compact">
                            <thead className="border-0 border-blue-500">
                                {/* <thead className="flex w-full overflow-x-hidden rounded-tl-none rounded-bl-none"> */}
                                <tr className="">
                                    <th className="">SN</th>
                                    <th>PCB NUM</th>
                                    <th>STB NUM</th>
                                    <th>PROD ID</th>
                                    <th>ID STATUS</th>
                                    <th>TIMESTAMP</th>
                                    <th>USER</th>
                                    {/* <th>Actions</th> */}
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
                                                      {/* {state.items[state.active_tab].length !== 0
                                                    ? state.items[state.active_tab].length - index
                                                    : 0} */}
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
                    <div className="border stats max-h-32">
                        <div className="stat">
                            <div className="stat-title">Found Units</div> 
                            <div className="stat-value">{state.stats.length && state.stats[state.active_tab]["qty_choice"]}</div> 
                            <div className="mt-2 stat-desc">
                                <progress className="hidden progress" />
                            </div>
                        </div>

                        <div className="stat">
                            <div className="stat-title">Produced vs Target</div> 
                            <div className={state.stats.length && state.stats[state.active_tab]["total_qty_produced"] !== state.stats[state.active_tab]["total_qty_target"] ? "stat-value text-error" : "stat-value text-success"}>{state.stats.length && state.stats[state.active_tab]["total_qty_produced"]} / {state.stats.length && state.stats[state.active_tab]["total_qty_target"]}</div> 
                            <div className="mt-2 stat-desc">
                                <progress value={state.stats.length && state.stats[state.active_tab]["total_qty_produced"]} max={state.stats.length && state.stats[state.active_tab]["total_qty_target"]} className="progress" />
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
