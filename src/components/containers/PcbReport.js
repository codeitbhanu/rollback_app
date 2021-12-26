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
		id_status : 85,
		status_desc : "Assembly Received",
	},
	{
		id_status : 13,
		status_desc : "PCBA Test Passed",
	},
	{
		id_status : 18,
		status_desc : "CA Test Passed",
	},
	{
		id_status : 73,
		status_desc : "Awaiting OQC Test",
	},
];

const getFormattedDateTime = (dt) => {
    const options = {year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'}
    const dateTime  = new Date(dt);

    return dateTime.toLocaleDateString("en-ZA", options).replace(/[.,]/g, "");
}

function PcbReport({ eel, params, setParams }) {
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
        data: [], //fake_data,
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    const handleBarcodeInput = (event) => {
        const pcb_sn = event.target.value.trim();
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
            if (params.server.status) {
                eel.get_pcb_report(
                    pcb_sn
                )((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;
                        if (
                            status === CONST_FAILURE
                        ) {
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
            <div className="flex flex-col border-0 border-green-400 border-dashed">
                <div className="flex w-1/5 mb-2 ml-8 border-0 border-blue-700 border-double rounded-t-lg form-control">
                    <div className="flex flex-col mt-2">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Scan PCB_Num or STB_Num
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="Scan PCB_Num or STB_Num"
                            className="border-double input input-primary input-bordered"
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleBarcodeInput(e)
                            }
                        />
                    </div>
                </div>
                <div className="bottom-0 flex flex-1 px-4 pt-0 border-0 border-red-500">
                    <div className="flex-1 overflow-y-scroll">
                        <table className="flex table w-full overflow-x-hidden table-compact text-2xs">
                            <thead className="overflow-x-hidden rounded-tl-none rounded-bl-none">
                                <tr className="bg-gray-400">
                                    <th className="overflow-x-hidden roun"></th>
                                    <th>PCB NUM</th>
                                    <th>STB NUM</th>
                                    <th>PCB WAS FOR</th>
                                    <th>PRNITED TS</th>
                                    <th>SN RANGE ORD</th>
                                    <th>SN_MIN</th>
                                    <th>SN_MAX</th>
                                    <th>PCBA TS</th>
                                    <th>SENT TO CUS ORD</th>
                                    <th>DISPATCH TS</th>
                                    <th>INVOICE</th>
                                    <th>FULL CO</th>
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
                                        <td>{resp.pcb_num}</td>
                                        <td>{resp.stb_num}</td>
                                        <td>{resp.pcb_for}</td>
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

export default PcbReport;
