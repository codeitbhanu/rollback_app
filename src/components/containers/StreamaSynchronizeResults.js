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

function StreamaSynchronizeResults({ eel, params, setParams }) {
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
        tests: [
            {name: 'Motherboard Binding', tag: 'motherboardbinding', passed: false},
            {name: 'Interface Test', tag: 'interfacetest', passed: false},
            {name: 'Wireless | Throughput Test', tag: 'wirelesstest', passed: false},
            {name: 'Information check', tag: 'infocheck', passed: false},
            {name: 'Factory inspection', tag: 'factoryinspection', passed: false},
        ],
        status: false,
        log: 'PASS',
        scanned_stb: '',
        testname: ''
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
                        {name: 'Motherboard Binding', tag: 'motherboardbinding', passed: false},
                        {name: 'Interface Test', tag: 'interfacetest', passed: false},
                        {name: 'Wireless | Throughput Test', tag: 'wirelesstest', passed: false},
                        {name: 'Information check', tag: 'infocheck', passed: false},
                        {name: 'Factory inspection', tag: 'factoryinspection', passed: false},
                    ]
                })
                // for ( const test in state.tests) {
                //     console.log("::: test.name: " + state.tests[test] + " :::");
                    // eel.set_test_status_ott(pcb_sn, state.tests[test].tag)((response) => {
                    const lTests = ['motherboardbinding','interfacetest','wirelesstest','infocheck','factoryinspection']
                    eel.mes_box_retrieve_sync_results(pcb_sn,params.session.userdata.id_user)((response) => {
                        console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                        try {
                            let status = response.status;
                            let message = response.message;
                            let metadata = response.data.metadata;
                            const updated_data = state.data;
                            updated_data.unshift({
                                id: uuidv4(),
                                ...updated_data,
                                stb_num: metadata.stb_num,
                                status: metadata.testname,
                                log: metadata.log,
                                failcount: metadata.failcount
                            });
                            const otl = []
                            for (let tIndex in state.tests) {
                                console.log(metadata.result + ' ' + tIndex + ' vs ' +  lTests.indexOf(metadata.testname))
                                if ((metadata.result === 'FAIL' || metadata.result === 'NT') && parseInt(tIndex) === lTests.indexOf(metadata.testname)) {
                                    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
                                    otl.push({
                                        ...state.tests[tIndex],
                                        passed: false
                                    })
                                } else {
                                    console.log("=========================================")
                                    otl.push({
                                        ...state.tests[tIndex],
                                        passed: tIndex <= lTests.indexOf(metadata.testname) 
                                    })    
                                }
                            }
                            
                            setState({
                                ...state,
                                scanned_stb: metadata.stb_num,
                                testname: metadata.testname,
                                data: updated_data,
                                tests: otl,
                                status:  metadata.result === 'PASS' && metadata.testname === 'factoryinspection',
                                // status:  metadata.log === 'PASS' && metadata.status === lTests[lTests.length - 1],
                                log: metadata.log,
                                failcount: metadata.failcount
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

    // const handleChangeTextBox = (event) => {
    //     console.log("handleSelectReasonDropdown called " + event.target.value);
    //     setState({
    //         ...state,
    //         reason_manual: event.target.value,
    //     });
    // };

    // useEffect(() => {
    //     // let res = state.tests.filter((item) => item.passed === true)
    //     let res = state.tests.filter((item) => item.passed === true)
    //     console.log(res);
    //     if (res.length === state.tests.length) {
    //         setState((prevState) => ({
    //             ...prevState,
    //             final: true
    //         }));
    //     } else {
    //         setState((prevState) => ({
    //             ...prevState,
    //             final: false
    //         }));
    //     }
    // },[state.tests])
    const getMessageBoxText = (stb, testname, status, log, failcount) => {
        if (!stb) return 'ERROR, PLEASE SCAN AN STB'
        if (!log && testname) return `PENDING, ${testname} NOT ATTEMPTED FOR ${stb}, TAKE TO TESTING STATION.`

        if (log !== 'PASS' && failcount < 3) {
            return `ERROR, ${stb} FAILED ON ${testname} (${failcount}/3) TIMES, PLEASE RE-TEST.`
        }
        if (log !== 'PASS' && failcount >= 3) {
            return `ERROR, ${stb} FAILED ON ${testname} (${failcount}/3) TIMES, SEND TO REPAIRS.`
        }
        else {
            if (status) {
                return `SUCCESS, ${stb} PROCEED TO GIFTBOX.`
            } else {
                return testname !== 'motherboardbinding' ? `PENDING, ${testname} ATTEMPTED (${failcount}/3) FOR ${stb}, TAKE TO TESTING STATION.` : `PENDING, ${'interfacetest'} NOT ATTEMPTED FOR ${stb}, TAKE TO TESTING STATION.`
            }
        }
    }

    return (
        <div className="absolute flex flex-col w-full mt-2 border-0 border-red-600 h-1/2">
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex w-full mb-2 ml-8 border-0 border-blue-700 border-double rounded-t-lg form-control">
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
                                className="border-double input input-primary input-bordered w-2/3"
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
                        {state.tests.map((test, index) => 
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
                        )}
                    </div>

                    <div className="shadow stats mt-8">
                        <div className="stat">
                            <div className={`stat-value text-lg text-left ${state.status ? "text-green-500" : "text-red-500"}`}>
                                {getMessageBoxText(state.scanned_stb, state.testname, state.status, state.log, state.failcount)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="divider divider-vertical"></div>
                <div className="flex px-4 pt-0 border-0 border-red-500 w-1/2 max-w-1/2 overflow-x-hidden">
                    <div className="flex-1 overflow-y-scroll">
                        <table className="flex table w-full overflow-x-scroll table-compact text-2xs overflow-y-scroll">
                            <thead className="overflow-x-hidden rounded-tl-none rounded-bl-none border-0 border-red-500">
                                <tr className="bg-gray-400">
                                    <th className="overflow-x-hidden round"></th>
                                    <th>STB NUM</th>
                                    <th>STATUS</th>
                                    <th>LOG</th>
                                    <th>FAIL COUNT</th>
                                </tr>
                            </thead>
                            <tbody className=" max-h-3/4 overflow-x-hidden border-0 border-green-500">
                                {state.data.map((resp, index) => (
                                    <tr
                                        key={resp.id}
                                        id={resp.id}
                                        className={`p-0 overflow-x-hidden border-yellow-400 ${index === 0 ? "border-0" : "border-0"}`}
                                    >
                                        <th>
                                            {state.data.length !== 0
                                                ? state.data.length - index
                                                : 0}
                                        </th>
                                        <td>{resp.stb_num}</td>
                                        <td>{resp.status}</td>
                                        <td>{resp.log}</td>
                                        <td>{resp.failcount}</td>
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

export default StreamaSynchronizeResults;
