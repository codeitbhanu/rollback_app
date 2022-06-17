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

function StreamaRepairLogin({ eel, params, setParams }) {
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
        errorMessage: "ERROR, PLEASE SCAN A FAILED UNIT TO LOGIN",
        scanned_stb: "",
        testname: "Sample Test",
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
                eel.mes_box_retrieve_sync_results(
                    pcb_sn,
                    params.session.userdata.id_user
                )((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;

                        setState({
                            ...state,
                            scanned_stb: metadata.stb_num,
                            testname: metadata.testname,
                            // data: updated_data,
                            // tests: otl,
                            status:
                                metadata.result === "PASS" &&
                                metadata.testname === "factoryinspection",
                            // status:  metadata.log === 'PASS' && metadata.status === lTests[lTests.length - 1],
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

    const onClickRepairLogin = () => {
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
            if (state.testname === "" || state.testname === "Sample Test") {
                alert("Invalid Test Name");
                return;
            } else {
                if (
                    !getFailureCodeString(state.testname)
                        .toLowerCase()
                        .includes(state.testname)
                ) {
                    alert("Invalid Test Name");
                    return;
                }
            }
            if (params.server.status) {
                // state.tests.forEach(testname => {
                eel.update_repair_login(
                    state.scanned_stb,
                    state.testname,
                    getFailureCodeString(state.testname),
                    params.session.userdata.user_desc,
                    ""
                )((response) => {
                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        let status = response.status;
                        let message = response.message;
                        let metadata = response.data.metadata;

                        setState({
                            ...state,
                            scanned_stb: metadata.stb_num,
                            testname: metadata.testname,
                            // data: updated_data,
                            // tests: otl,
                            status: status,
                            // status:  metadata.log === 'PASS' && metadata.status === lTests[lTests.length - 1],
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
        if (!stb) return "ERROR, PLEASE SCAN A FAILED UNIT TO LOGIN.";
        else {
            if (log === "PASS")
                return "INFO, CANNOT LOGIN A PASSED UNIT. [" + stb + "]";
            else return log;
        }
    };

    return (
        <div className="absolute flex flex-col w-full mt-2 border-0 border-red-600 bg-gray-100 pb-8">
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex w-full mb-2 ml-8 border-0 border-blue-700 border-double rounded-t-lg form-control mr-8">
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

                    <div className="border-0 flex flex-col gap-4 border-blue-500 mt-8 max-h-96">
                        {/* {state.tests.map((test, index) => 
                            <div className="border-0 flex select-none border-red-500">
                                <div className="flex place-content-between">
                                    <div className="flex border-0 border-yellow-500">
                                        {test.passed ? <kbd className="w-8 h-8 text-xl kbd mx-2">✔️</kbd> : <kbd className="w-8 h-8 text-xl kbd mx-2">❌</kbd>}
                                        <kbd className="w-8 h-8 text-xl kbd mx-2">{index + 1}</kbd>
                                    </div>
                                    <div className="flex border-0 border-green-500">
                                        <div className="divider-vertical"></div>
                                        <div className="text-xl py-4">                  
                                            {test.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )} */}
                        <div className="card bg-base-100 shadow-md w-1/3">
                            <div className="card-body">
                                <h2 className="card-title text-left">
                                    {state.testname}
                                </h2>
                                <p className="text-lg text-left">{state.log}</p>
                                <a
                                    className="link text-blue-500 text-left flex"
                                    href={`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(
                                        state.log
                                    )}%0A&op=translate`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Translate Log{" "}
                                    <div className="w-6 h-6">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            classname="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokewidth="{2}"
                                        >
                                            <path
                                                strokelinecap="round"
                                                strokelinejoin="round"
                                                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                                            />
                                        </svg>
                                    </div>
                                </a>
                                <div className="card-actions justify-end">
                                    <button
                                        className="btn btn-primary"
                                        disabled={
                                            state.log === "PASS" && "disabled"
                                        }
                                        onClick={onClickRepairLogin}
                                    >
                                        Repair Login
                                    </button>
                                </div>
                            </div>
                        </div>
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
    );
}

export default StreamaRepairLogin;
