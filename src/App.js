import { useState, useEffect } from "react";

import "./App.css";

import Navbar from "./components/Navbar";
import UnitRollbackContainer from "./components/containers/UnitRollback";
import PalletRollbackContainer from "./components/containers/PalletRollback";
import FrequentParamContainer from "./components/containers/FrequentParam";
import FractionPalletContainer from "./components/containers/FractionPallet";
import PcbReportContainer from "./components/containers/PcbReport";
import OrderItemsContainer from "./components/containers/OrderItems";
import OrderSerialConfigContainer from "./components/containers/OrderSerialConfig";
import StreamaSynchronizeResultsContainer from "./components/containers/StreamaSynchronizeResults";
import StreamaMechanicalContainer from "./components/containers/StreamaMechanical";
import StreamaMesUpdateContainer from "./components/containers/StreamaMesUpdate";
import StreamaValidateTestsContainer from "./components/containers/StreamaValidateTests";
import StreamaRepairLoginContainer from "./components/containers/StreamaRepairLogin";
import StreamaRepairLogoutContainer from "./components/containers/StreamaRepairLogout";
import TPVPrepStationContainer from "./components/containers/TPVPrepStation";

import config_data from "./datajson/config.json";
import Menu from "./components/Menu";

// Point Eel web socket to the instance
export const eel = window.eel;
const eel_load = () => {
    try {
        // const local_ip = '10.10.0.100';
        const local_ip = 'localhost';
        console.log("WEBSITE IP > " + local_ip)
        eel.set_host("ws://" + local_ip + ":8888");

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
// HOMEPC\\SQLEXPRESS
function App() {
    // console.log(JSON.stringify(config_data.users[1]));
    // let userdata = config_data.users[1];
    const [appState, setAppState] = useState({
        version: config_data.app_version,
        server_type: config_data.default_host.startsWith("172.20.10.103") ? "Live" : "Development",
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
    // const defaultMenu = "unit_rollback";
    // const defaultTitle = "Unit Rollback";
    // const defaultIcon = (
    //     <svg
    //         xmlns="http://www.w3.org/2000/svg"
    //         className="w-6 h-6"
    //         fill="#8AE9FF"
    //         viewBox="0 0 24 24"
    //         stroke="#343434"
    //     >
    //         <path
    //             strokeLinecap="round"
    //             strokeLinejoin="round"
    //             strokeWidth="{2}"
    //             d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
    //         />
    //     </svg>
    // );
    ////////////////////////////////////////////////////////////////////////////
    // const defaultMenu = "streama_mechanical";
    // const defaultTitle = "Streama Mechanical";
    // const defaultIcon = (
    //     <svg
    //         xmlns="http://www.w3.org/2000/svg"
    //         className="w-6 h-6"
    //         fill="none"
    //         viewBox="0 0 24 24"
    //         stroke="currentColor"
    //     >
    //         <path
    //             strokeLinecap="round"
    //             strokeLinejoin="round"
    //             strokeWidth="{2}"
    //             d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
    //         />
    //     </svg>
    // );
    /////////
    const defaultMenu = "streama_repair_login";
    const defaultTitle = "Streama Repair Login";
    const defaultIcon = (
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
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
        </svg>
    );

    const [menuState, setMenuState] = useState({
        toggleMenu: false,
        selectedMenu: defaultMenu,
        title: defaultTitle,
        icon: defaultIcon,
    });

    const onToggleMenu = (selected = false) => {
        console.log("onToggleMenu selected: " + selected);
        setMenuState({ ...menuState, toggleMenu: selected });
    };

    const onSelectMenu = (
        selected = "_blank",
        title = "_blank",
        icon = defaultIcon
    ) => {
        console.log("onToggleMenu selected: " + selected);
        setMenuState({
            ...menuState,
            toggleMenu: false,
            selectedMenu: selected,
            title: title,
            icon: icon,
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
            {menuState.selectedMenu === "unit_rollback" && (
                <UnitRollbackContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "frequent_param" && (
                <FrequentParamContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "pcb_report" && (
                <PcbReportContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "order_items" && (
                <OrderItemsContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "fraction_pallet" && (
                <FractionPalletContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "rollback_pallet" && (
                <PalletRollbackContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "order_serial_config" && (
                <OrderSerialConfigContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "mes_status_sync" && (
                <StreamaSynchronizeResultsContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "streama_mechanical" && (
                <StreamaMechanicalContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "streama_mes_update" && (
                <StreamaMesUpdateContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "streama_validate_tests" && (
                <StreamaValidateTestsContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "streama_repair_login" && (
                <StreamaRepairLoginContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "streama_repair_logout" && (
                <StreamaRepairLogoutContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
            {menuState.selectedMenu === "tpv_prep_station" && (
                <TPVPrepStationContainer
                    eel={eel}
                    params={appState}
                    setParams={setAppState}
                    config_data={config_data}
                />
            )}
        </div>
    );
}

export default App;
