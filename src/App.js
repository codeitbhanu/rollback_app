import { useState } from "react";

import "./App.css";

import Navbar from "./components/Navbar";
import UnitRollbackContainer from "./components/containers/UnitRollback";
import config_data from "./datajson/config.json";
import Menu from "./components/Menu";

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
    // console.log(JSON.stringify(config_data.users[1]));
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
    // fraction_pallet;
    const defaultMenu = "rollback_units";
    const defaultTitle = "Unit Rollback";
    const defaultIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            classname="w-5 h-5"
            fill="#8AE9FF"
            viewBox="0 0 24 24"
            stroke="#343434"
        >
            <path
                strokelinecap="round"
                strokelinejoin="round"
                strokewidth="{2}"
                d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
            />
        </svg>
    );
    const defaultContainer = (
        <UnitRollbackContainer
            eel={eel}
            params={appState}
            setParams={setAppState}
            config_data={config_data}
        />
    );

    const [menuState, setMenuState] = useState({
        toggleMenu: false,
        selectedMenu: defaultMenu,
        title: defaultTitle,
        icon: defaultIcon,
        container: defaultContainer,
    });

    const onToggleMenu = (selected = false) => {
        console.log("onToggleMenu selected: " + selected);
        setMenuState({ ...menuState, toggleMenu: selected });
    };

    const onSelectMenu = (
        selected = "_blank",
        title = "_blank",
        icon = defaultIcon,
        Container = defaultContainer
    ) => {
        console.log("onToggleMenu selected: " + selected);
        setMenuState({
            ...menuState,
            toggleMenu: false,
            selectedMenu: selected,
            title: title,
            icon: icon,
            container: (
                <Container
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            ),
        });
    };

    return (
        <div className="border-0 border-yellow-600 App">
            {menuState.toggleMenu && (
                <Menu
                    hideMenu={() => onToggleMenu(false)}
                    onSelectMenu={onSelectMenu}
                    menuState={menuState}
                    setMenuState={setMenuState}
                />
            )}
            <header className="w-full h-22">
                <Navbar
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                    onToggleMenu={onToggleMenu}
                    menuState={menuState}
                    setMenuState={setMenuState}
                />
            </header>
            {/* Code here */}
            {menuState.container}
        </div>
    );
}

export default App;
