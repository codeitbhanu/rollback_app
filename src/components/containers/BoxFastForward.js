import React, { useCallback, useEffect, useState } from "react";
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

function BoxFastForward({ eel, params, setParams }) {
    console.log(params);
    const CONST_SUCCESS = "SUCCESS";
    const CONST_FAILURE = "FAILURE";
    const ACTION_BUTTON_DELETE = "delete";

    const handleDeleteItem = (id, rownum, serial) => {
        console.log("handleDeleteItem called ");
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

    const default_action_btns = [ACTION_BUTTON_DELETE];
    const [state, setState] = useState({
        action_btns: default_action_btns,
        data: [
            {
                stb_num: 111111111111,
                status: "pass",
            },
            {
                stb_num: 111111111111,
                status: "pass",
            },
        ], //fake_data,
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    // handle what happens on key press
    const handleKeyPress = useCallback((event) => {
        console.log(`Key pressed: ${event.key}`);
        if (event.keyCode === 32 && event.target === document.body) {
            event.preventDefault();
        }
    }, []);

    useEffect(() => {
        // attach the event listener
        document.addEventListener("keydown", handleKeyPress);

        // remove the event listener
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [handleKeyPress]);

    const handleBarcodeInput = (event) => {
        const pcb_sn = event.target.value.trim();
        // alert(`___${pcb_sn}___`);
        console.log(params);
        try {
            // if (params.session.active === false) {
            //     alert("Session not active, Please login first");
            //     return;
            // }
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
                eel.get_pcb_report(pcb_sn)((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;
                        if (status === CONST_FAILURE) {
                            setTimeout(() => alert(`Error: [${message}`), 200);
                            return;
                        }

                        const updated_data = state.data;
                        updated_data.unshift({
                            id: uuidv4(),
                            ...metadata,
                        });
                        setState({
                            ...state,
                            data: updated_data,
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
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex w-full mb-2 ml-8 border-0 border-blue-700 border-double rounded-t-lg form-control">
                    <div className="flex flex-1 gap-8 h-24 mt-2 border-0 border-yellow-600">
                        <div className="flex flex-col flex-1">
                            <label className="text-black label">
                                <span className="text-black label-text">
                                    Scan PCB_Num or STB_Num
                                </span>
                            </label>
                            <input
                                type="text"
                                placeholder="Scan PCB_Num or STB_Num"
                                className="border-double input input-primary input-bordered w-2/3"
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleBarcodeInput(e)
                                }
                            />
                        </div>
                        <div>
                            <label className="text-black label">
                                <span className="text-black label-text">Hotkey</span>
                            </label>
                            <kbd class="kbd">___SPACE___</kbd>
                        </div>
                        <div>
                            <label className="text-black label">
                                <span className="text-black label-text">
                                    All-in-one
                                </span>
                            </label>
                            <input
                                type="checkbox"
                                defaultChecked="checked"
                                className="toggle toggle-lg"
                            />
                        </div>
                    </div>

                    <div className="border-0 flex flex-col gap-8 border-blue-500 mt-8">
                        <div className="border-0 flex  cursor-pointer border-red-500">
                            <kbd className="w-12 h-12 text-3xl kbd mx-2">1</kbd>
                            <div className="divider-vertical"></div>
                            <div className="text-3xl py-4">Interface Test</div>
                        </div>
                        <div className="border-0 flex  cursor-pointer border-red-500">
                            <kbd className="w-12 h-12 text-3xl kbd mx-2">2</kbd>
                            <div className="divider-vertical"></div>
                            <div className="text-3xl py-4">
                                Wireless | Throughput Test
                            </div>
                        </div>
                        <div className="border-0 flex  cursor-pointer border-red-500">
                            <kbd className="w-12 h-12 text-3xl kbd mx-2">3</kbd>
                            <div className="divider-vertical"></div>
                            <div className="text-3xl py-4">
                                Information check
                            </div>
                        </div>
                        <div className="border-0 flex  cursor-pointer border-red-500">
                            <kbd className="w-12 h-12 text-3xl kbd mx-2">4</kbd>
                            <div className="divider-vertical"></div>
                            <div className="text-3xl py-4">
                                Factory inspection
                            </div>
                        </div>
                    </div>

                    <div className="shadow stats mt-8">
                        <div className="stat">
                            <div className="stat-value text-left text-green-500">
                                Proceed to Giftbox Pairing
                            </div>
                        </div>
                    </div>
                </div>
                <div class="divider divider-vertical">⚡</div>
                <div className="bottom-0 flex px-4 pt-0 border-0 border-red-500 w-full">
                    <div className="flex-1 overflow-y-scroll">
                        <table className="flex table w-full overflow-x-hidden table-compact text-2xs">
                            <thead className="overflow-x-hidden rounded-tl-none rounded-bl-none">
                                <tr className="bg-gray-400">
                                    <th className="overflow-x-hidden roun"></th>
                                    <th>STB NUM</th>
                                    <th>STATUS</th>
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
                                        <td>{resp.status}</td>
                                        {/* <td>{resp.pcb_for}</td>
                                        <td>{getFormattedDateTime(resp.pcb_ts)}</td>
                                        <td>{resp.sn_from}</td>
                                        <td>{resp.sn_min}</td>
                                        <td>{resp.sn_max}</td>
                                        <td>{getFormattedDateTime(resp.pcba_tp)}</td>
                                        <td>{resp.cus_ord}</td>
                                        <td>{getFormattedDateTime(resp.dispatch_ts)}</td>
                                        <td>{resp.invoice}</td>
                                        <td>{resp.cus_ord_full}</td>
                                        <td>
                                            <ActionButtons
                                                actionList={state.action_btns}
                                                index={resp.id}
                                                rowNum={index + 1}
                                                param={resp.pcb_num}
                                                actionDelete={handleDeleteItem}
                                                warn={
                                                    resp.status ===
                                                    CONST_FAILURE
                                                }
                                                message={resp.message}
                                            />
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BoxFastForward;
