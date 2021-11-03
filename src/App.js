import { useState } from "react";

import "./App.css";

import Navbar from "./components/Navbar";
import Container from "./components/Container";

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
    const [appState, setAppState] = useState({
        session: {
            user: "bhanu.pratap",
            timeout: 60,
            server: {
                status: false, // true: connected, false: disconnected
                host: `HOMEPC\\SQLEXPRESS`,
                username: `bhanu.pratap`,
                id_user: 127,
                password: `Password123`,
            },
        },
    });
    return (
        <div className="border-0 border-yellow-600 App">
            <header className="w-full h-22">
                <Navbar eel={eel} params={appState} setParams={setAppState} />
            </header>
            {/* Code here */}
            <Container eel={eel} params={appState} setParams={setAppState} />
        </div>
    );
}

export default App;
