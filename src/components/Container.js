import React, { useState } from "react";
import ActionButtons from "./ActionButtons";

import fake_data from "../datajson/data";
import status_map from "../datajson/statusmap";

// Point Eel web socket to the instance
export const eel = window.eel;
const eel_load = () => {
    try {
        eel.set_host("ws://localhost:8080");

        // Expose the `sayHelloJS` function to Python as `say_hello_js`
        function sayHelloJS(x) {
            console.log("Hello from " + x);
        }
        // WARN: must use window.eel to keep parse-able eel.expose{...}
        window.eel.expose(sayHelloJS, "say_hello_js");

        // Test anonymous function when minimized. See https://github.com/samuelhwilliams/Eel/issues/363
        function show_log(msg) {
            console.log(msg);
        }
        window.eel.expose(show_log, "show_log");

        // Test calling sayHelloJS, then call the corresponding Python function
        sayHelloJS("Javascript World!");
        eel.say_hello_py("Javascript World!");
    } catch (error) {
        console.log(`error: ${error}`);
    }
};

eel_load();

const defPath = "~";

function Container() {
    const [state, setState] = useState({
        message: `Click button to choose a random file from the user's system`,
        path: defPath,
        data: fake_data,
    });

    const pickFile = () => {
        eel.pick_file(defPath)((message) => {
            console.log(`message: ${message}`);
            setState({ ...state, message });
        });
    };
    console.log(status_map);
    console.log(fake_data);

    return (
        <div className="absolute flex flex-col w-full border-0 border-red-600 h-1/2 top-24">
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex ml-8 border-0 border-blue-700 border-double form-control">
                    <div className="flex flex-col">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Enter PCB_Num / STB_Num
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter PCB_Num / STB_Num"
                            className="input input-primary input-bordered"
                        />
                    </div>
                    <div className="flex flex-col mt-8 border-0 border-red-600">
                        <label className="text-black label">
                            <span className="text-black label-text">
                                Select Target Status
                            </span>
                        </label>
                        <select className="flex min-w-full select select-bordered select-primary">
                            {status_map.map((status) => (
                                <option
                                    disabled={status.id_status === -1}
                                    selected={status.id_status === -1}
                                    key={status.id_status}
                                    id={status.id_status}
                                >
                                    {status.status_desc}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col h-48 mt-8">
                        <button
                            className="h-32 text-3xl btn btn-accent btn-active"
                            onClick={pickFile}
                        >
                            Rollback `{state.path}`
                        </button>

                        <p>{state.message}</p>
                    </div>
                </div>
                <div className="bottom-0 flex flex-1 px-8 border-0 border-red-500 pt-9 h-tableheight">
                    <div className="flex flex-1 overflow-y-scroll">
                        <table className="flex table w-full table-compact">
                            <thead className="">
                                <tr className="bg-gray-400">
                                    <th></th>
                                    <th>Serial</th>
                                    <th>Product</th>
                                    <th>Current Status</th>
                                    <th>Target Status</th>
                                    <th>User</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="overflow-y-scroll">
                                {fake_data.map((data, index) => (
                                    <tr key={index}>
                                        <th>{index + 1}</th>
                                        <td>{data.serial}</td>
                                        <td>{data.product}</td>
                                        <td>{data.curr_status}</td>
                                        <td>{data.target_status}</td>
                                        <td>{data.user}</td>
                                        <td>
                                            <ActionButtons warn={true} />
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

export default Container;
