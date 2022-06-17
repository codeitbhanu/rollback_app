import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import ActionButtons from "../ActionButtons";

// import fake_data from "../datajson/data";
import status_map from "../../datajson/statusmap";
import reasons_map from "../../datajson/reasonsmap";

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

const getFailureCodeString = (tn = "") => {
    return `OTT-${tn.toUpperCase()}-TEST-FAIL`;
};

function StreamaRepairLogout({ eel, params, setParams }) {
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

    const default_failures = [
        {
            failure_id: 44,
            failure_desc: "Repair Checked Out PCBA",
        },
        {
            failure_id: 45,
            failure_desc: "Repair Checked Out Mechanical",
        },
        {
            failure_id: 66,
            failure_desc: "Repair Checked Out PCB Label Duplication",
        },
        {
            failure_id: 68,
            failure_desc: "Repair Checked Out AOI",
        },
        {
            failure_id: 42,
            failure_desc: "Component Changer",
        },
        {
            failure_id: 46,
            failure_desc: "Component Changed PCBA",
        },
        {
            failure_id: 47,
            failure_desc: "Component Changed Mechanical",
        },
        {
            failure_id: 67,
            failure_desc: "Component Changed PCB Label Duplication",
        },
        {
            failure_id: 69,
            failure_desc: "Component Changed AOI",
        },
    ];

    const default_action_btns = [ACTION_BUTTON_DELETE];
    const [state, setState] = useState({
        action_btns: default_action_btns,
        data: [
            // {
            //     stb_num: 111111111111,
            //     status: "pass",
            // },
            // {
            //     stb_num: 111111111111,
            //     status: "pass",
            // },
        ], //fake_data,
        // tests: [
        //     {name: 'Motherboard Binding', tag: 'motherboardbinding', passed: false},
        //     {name: 'Interface Test', tag: 'interfacetest', passed: false},
        //     {name: 'Wireless | Throughput Test', tag: 'wirelesstest', passed: false},
        //     {name: 'Information check', tag: 'infocheck', passed: false},
        //     {name: 'Factory inspection', tag: 'factoryinspection', passed: false},
        // ],
        status: false,
        log: "PASS",
        errorMessage: "ERROR, PLEASE SCAN A UNIT TO LOGOUT",
        scanned_stb: "",
        testname: "Sample Test",
        failure_list: default_failures,
        failure_id: default_failures[0].failure_id,
        selected_failure: default_failures[0].failure_desc,
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
                // state.tests.forEach(testname => {
                setState({
                    ...state,
                    // data: [],
                    status: false,
                    tests: [
                        {
                            name: "Motherboard Binding",
                            tag: "motherboardbinding",
                            passed: false,
                        },
                        {
                            name: "Interface Test",
                            tag: "interfacetest",
                            passed: false,
                        },
                        {
                            name: "Wireless | Throughput Test",
                            tag: "wirelesstest",
                            passed: false,
                        },
                        {
                            name: "Information check",
                            tag: "infocheck",
                            passed: false,
                        },
                        {
                            name: "Factory inspection",
                            tag: "factoryinspection",
                            passed: false,
                        },
                    ],
                });
                // for ( const test in state.tests) {
                //     console.log("::: test.name: " + state.tests[test] + " :::");
                // eel.set_test_status_ott(pcb_sn, state.tests[test].tag)((response) => {
                const lTests = [
                    "motherboardbinding",
                    "interfacetest",
                    "wirelesstest",
                    "infocheck",
                    "factoryinspection",
                ];
                eel.get_device_repair_info(pcb_sn)((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;
                        // const updated_data = state.data;
                        // updated_data.unshift({
                        //     id: uuidv4(),
                        //     // ...updated_data,
                        //     id_repair: metadata.id_repair,
                        //     product: metadata.product,
                        //     checkin_date: metadata.checkin_date,
                        //     failure: metadata.failure,
                        //     failure_desc: metadata.failure_desc,
                        //     checkin_user: metadata.checkin_user,
                        //     checkin_station: metadata.checkin_station,

                        // });
                        setState({
                            ...state,
                            scanned_stb: metadata.stb_num,
                            data: metadata.repair_info,
                            status: status,
                            log: metadata.log,
                            failcount: metadata.failcount,
                        });
                    } catch (error) {
                        setTimeout(() => {
                            alert(`PARSE ERROR: ${error}`);
                        }, 200);
                    }
                });
                // }
            } else {
                throw Error(`Connect the server first`);
            }
            event.target.value = "";
        } catch (error) {
            alert(`ERROR: ${error}`);
        }
    };

    const onSelectFailure = (failureId, failureDesc) => {
        const failureObj = state.failure_list.filter(
            (failure) => failure.failure_desc === failureDesc
        )[0];
        console.log(
            `onSelectfailure called failureId: ${failureObj?.failure_id} failureDesc: ${failureDesc}`
        );

        setState({
            ...state,
            failure_id: failureObj?.failure_id,
            selected_failure: failureDesc,
        });
        // alert(JSON.stringify(event.target.value));
    };

    const onClickRepairLogout = () => {
        // alert(`___${pcb_sn}___`);
        try {
            if (params.session.active === false) {
                alert("Session not active, Please login first");
                return;
            }
            if (state.scanned_stb === "") {
                alert("Incorrect Serial for Login");
                return;
            }
            // if (state.testname === "" || state.testname === "Sample Test") {
            //     alert("Invalid Test Name");
            //     return;
            // } else {
            //     if (
            //         !getFailureCodeString(state.testname)
            //             .toLowerCase()
            //             .includes(state.testname)
            //     ) {
            //         alert("Invalid Test Name");
            //         return;
            //     }
            // }
            if (params.server.status) {
                // state.tests.forEach(testname => {
                eel.update_repair_logout(
                    state.scanned_stb,
                    state.selected_failure,
                    params.session.userdata.user_desc
                )((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;

                        setState({
                            ...state,
                            scanned_stb: metadata.stb_num,
                            status: status,
                            log: metadata.log,
                            errorMessage: metadata.ErrorMessage,
                            failcount: metadata.failcount,
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
        } catch (error) {
            alert(`ERROR: ${error}`);
        }
    };

    const getMessageBoxText = (stb, testname, status, log, failcount) => {
        console.log("getMessageBoxText " + stb);
        if (!stb) return "ERROR, PLEASE SCAN A UNIT TO LOGOUT.";
        else {
            if (log === "PASS")
                return "INFO, CANNOT LOGIN A PASSED UNIT. [" + stb + "]";
            else return log;
        }
    };

    return (
        <div className="absolute flex flex-col w-full mt-2 border-0 border-red-600 bg-gray-100 pb-8">
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex w-full ml-8 border-0 border-blue-700 border-double rounded-t-lg form-control mr-8">
                    <div className="flex gap-8 h-24 mt-2 border-0 border-yellow-600">
                        <div className="flex flex-col flex-1">
                            <label className="text-black label">
                                <span className="text-black label-text">
                                    Scan PCB or STB number
                                </span>
                            </label>
                            <input
                                type="text"
                                placeholder="Scan PCB or STB number"
                                className="border-double input input-primary input-bordered w-1/3"
                                // onChange={() => setState((prevState) => ({
                                //     ...prevState,
                                //     data: []
                                // }))}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleBarcodeInput(e)
                                }
                            />
                        </div>
                        {/* <div>
                            <label className="text-black label">
                                <span className="text-black label-text">Hotkey</span>
                            </label>
                            <kbd className="kbd">___SPACE___</kbd>
                        </div> */}
                        {/* <div>
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
                        </div> */}
                    </div>

                    <div className="border-0 flex flex-col gap-4 border-blue-500 mt-8">
                        <p className="text-left text-md font-bold my-0">
                            Repairs History is shown below, latest failure is
                            displayed first.
                        </p>
                        <table className="flex table w-full overflow-x-scroll table-compact text-2xs overflow-y-scroll">
                            <thead className="overflow-x-hidden rounded-tl-none rounded-bl-none border-0 border-red-500">
                                <tr className="bg-gray-400">
                                    <th className="overflow-x-hidden round"></th>
                                    <th>Check In Date</th>
                                    <th>Failure</th>
                                    <th>Failure Description</th>
                                    <th>Check In User</th>
                                    <th>Check In Station</th>
                                </tr>
                            </thead>
                            <tbody className=" max-h-3/4 overflow-x-hidden border-0 border-green-500">
                                {state?.data?.map((resp, index) => (
                                    <tr
                                        key={resp.id}
                                        id={resp.id}
                                        className={`p-0 overflow-x-hidden border-yellow-400 ${
                                            index === 0
                                                ? "border-0"
                                                : "border-0"
                                        }`}
                                    >
                                        <th>
                                            {state.data.length !== 0
                                                ? state.data.length - index
                                                : 0}
                                        </th>
                                        <td>{resp.checkin_date}</td>
                                        <td>{resp.failure}</td>
                                        <td>{resp.failure_desc}</td>
                                        <td>{resp.checkin_user}</td>
                                        <td>{resp.checkin_station}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-col mt-2 border-0 border-red-600  w-1/3">
                            <label className="text-black label">
                                <span className="text-black label-text">
                                    Select Target Status
                                </span>
                            </label>
                            <select
                                className="flex min-w-full select select-bordered select-primary"
                                disabled=""
                                onChange={(e) =>
                                    onSelectFailure(e.target.id, e.target.value)
                                }
                            >
                                {state?.failure_list?.map(
                                    (failure_id_desc, index) => (
                                        <option
                                            disabled={index === 44}
                                            selected={index === 44}
                                            key={
                                                "failure#" +
                                                failure_id_desc.failure_id
                                            }
                                            id={failure_id_desc.failure_id}
                                        >
                                            {failure_id_desc.failure_desc}
                                        </option>
                                    )
                                )}
                            </select>
                            <button
                                className="btn btn-primary w-36 mt-4"
                                disabled={state?.data?.length ? "" : "disabled"}
                                onClick={onClickRepairLogout}
                            >
                                Repair Logout
                            </button>
                        </div>
                        <div className="shadow mt-8 rounded-2xl bg-white p-4 align-middle">
                            <div className="">
                                <div
                                    className={` text-lg font-bold text-left ${
                                        state.status &&
                                        !state.errorMessage.startsWith("ERROR")
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }`}
                                >
                                    {getMessageBoxText(
                                        state.scanned_stb,
                                        state.testname,
                                        state.status,
                                        state.errorMessage,
                                        state.failcount
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StreamaRepairLogout;
