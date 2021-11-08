import { useState } from "react";

import "./App.css";

import Navbar from "./components/Navbar";
import Container from "./components/Container";
import config_data from "./datajson/config.json";

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

function App() {
    console.log(JSON.stringify(config_data.users[1]));
    // let userdata = config_data.users[1];

    const [appState, setAppState] = useState({
        server: {
            status: false, // true: connected, false: disconnected
            host: config_data.default_host,
            driver: config_data.default_driver,
            database: config_data.default_database,
            // username: userdata.user_desc,
            // password: userdata.password,
            // id_user: userdata.id_user,
        },
        session: {
            userdata: {},
            active: false,
            timeout: 60,
        },
    });
    return (
        <div className="border-0 border-yellow-600 App">
            <header className="w-full h-22">
                <Navbar
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            </header>
            {/* Code here */}
            <Container
                eel={eel}
                params={appState}
                setParams={setAppState}
                config_data={config_data}
            />
        </div>
    );
}

export default App;
