import UnitRollbackContainer from "./containers/UnitRollback";
import PalletRollbackContainer from "./containers/PalletRollback";
import FractionPalletContainer from "./containers/FractionPallet";
import FrequentParamContainer from "./containers/FrequentParam";
import PcbReportContainer from "./containers/PcbReport";
import OrderItemsContainer from "./containers/OrderItems";
import DsdJobSetupContainer from "./containers/DsdJobSetup";
import OrderSerialConfigContainer from "./containers/OrderSerialConfig";
import StreamaSynchronizeResultsContainer from "./containers/StreamaSynchronizeResults";
import StreamaMechanicalContainer from "./containers/StreamaMechanical";
import StreamaMesUpdateContainer from "./containers/StreamaMesUpdate";
import StreamaValidateTestsContainer from "./containers/StreamaValidateTests";
import PalletCheckDuplicatesContainer from "./containers/PalletCheckDuplicates";
import StreamaReworkRollbackContainer from "./containers/StreamaReworkRollback";
import StreamaRepairLoginContainer from "./containers/StreamaRepairLogin";
import StreamaRepairLogoutContainer from "./containers/StreamaRepairLogout";
import TPVPrepStationContainer from "./containers/TPVPrepStation";

function Menu({ hideMenu, menuState, setMenuState, onSelectMenu }) {
    const iconUnitRollback = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="#8AE9FF"
            viewBox="0 0 24 24"
            stroke="#343434"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="{2}"
                d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
            />
        </svg>
    );
    const iconFrequentParam = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="#8AE9FF"
            viewBox="0 0 24 24"
            stroke="#343434"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
        </svg>
    );
    const iconPcbReport = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="{2}"
                d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
            />
        </svg>
    );

    const iconOrderItems = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="{2}"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
        </svg>
    );

    const iconFractionPallet = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="#8AE9FF"
            viewBox="0 0 24 24"
            stroke="#343434"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="{2}"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
        </svg>
    );
    const iconRollbackPallet = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 20 20"
            fill="#8AE9FF"
            stroke="#343434"
        >
            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
        </svg>
    );
    const iconDsdJobSetup = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="{2}"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
        </svg>
    );
    const iconOrderSerialConfig = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="{2}"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
        </svg>
    );

    const iconMesStatusSync = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fillRule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                clipRule="evenodd"
            />
        </svg>
    );
    const iconStreamaMechanical = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="{2}"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
        </svg>
    );
    const iconStreamaMesUpdate = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="{2}"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
            />
        </svg>
    );
    const iconStramaValidateTests = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
        </svg>
    );
    const iconPalletCheckDuplicates = (
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
        </svg>
    );
    const iconTpvPrepStation = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
        </svg>
    );
    const iconStreamaRepairLogin = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="{2}"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
        </svg>
    );
    const iconStreamaRepairLogout = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="{2}"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
        </svg>
    );

    const iconStreamaReworkRollback = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path
                fillrule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                cliprule="evenodd"
            />
        </svg>
    );
    return (
        <div className="absolute z-50 min-h-screen overflow-hidden rounded-none shadow-lg artboard bg-base-200 w-96">
            <div className="flex justify-between p-4 border-b-2 border-gray-300">
                <div className="content-start pt-3 text-lg font-bold text-center border-0 border-red-400">
                    Choose an option
                </div>

                <button
                    className="w-12 h-12 p-0 bg-opacity-0 rounded-full btn"
                    onClick={hideMenu}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                        fill="#8AE9FF"
                        viewBox="0 0 24 24"
                        // stroke="#343434"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="{2}"
                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                    </svg>
                </button>
            </div>
            
            <ul className="py-3 menu bg-base-100">
                <li
                    className={
                        menuState.selectedMenu === "streama_validate_pallet"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "streama_validate_pallet",
                                "Streama Validate Pallet",
                                iconStramaValidateTests,
                                StreamaValidateTestsContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconStramaValidateTests}</div>
                        Streama Validate Pallet
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "streama_rework_rollback"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "streama_rework_rollback",
                                "Streama Rework Rollback",
                                iconStreamaReworkRollback,
                                StreamaReworkRollbackContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">
                            {iconStreamaReworkRollback}
                        </div>
                        Streama Rework Rollback
                    </a>
                </li>
                {/* <li
                    className={
                        menuState.selectedMenu === "streama_mechanical"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "streama_mechanical",
                                "Streama Mechanical",
                                iconStreamaMechanical,
                                StreamaMechanicalContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">
                            {iconStreamaMechanical}
                        </div>
                        Streama Mechanical
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "streama_mes_update"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "streama_mes_update",
                                "Streama Mes Update",
                                iconStreamaMesUpdate,
                                StreamaMesUpdateContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">
                            {iconStreamaMesUpdate}
                        </div>
                        Streama Mes Update
                    </a>
                    </li>
                <li
                    className={
                        menuState.selectedMenu === "mes_status_sync"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "mes_status_sync",
                                "Streama Synchronize Results",
                                iconMesStatusSync,
                                StreamaSynchronizeResultsContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconMesStatusSync}</div>
                        Streama Synchronize Results
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "streama_repair_login"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "streama_repair_login",
                                "Streama Repair Login",
                                iconStreamaRepairLogin,
                                StreamaRepairLoginContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconStreamaRepairLogin}</div>
                        Streama Repair Login
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "streama_repair_logout"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "streama_repair_logout",
                                "Streama Repair Logout",
                                iconStreamaRepairLogout,
                                StreamaRepairLogoutContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconStreamaRepairLogout}</div>
                        Streama Repair Logout
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "mes_status_sync"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "tpv_prep_station",
                                "TV Prep Assembly",
                                iconTpvPrepStation,
                                TPVPrepStationContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconTpvPrepStation}</div>
                        TV Prep Assembly
                    </a>
                </li>   */}
                <li
                    className={
                        menuState.selectedMenu === "pallet_check_duplicates"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "pallet_check_duplicates",
                                "Check Duplicates",
                                iconPalletCheckDuplicates,
                                PalletCheckDuplicatesContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconPalletCheckDuplicates}</div>
                        Check Duplicates
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "unit_rollback"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "unit_rollback",
                                "Unit Rollback",
                                iconUnitRollback,
                                UnitRollbackContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconUnitRollback}</div>
                        Unit Rollback
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "frequent_param"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "frequent_param",
                                "Edit Common Params",
                                iconFrequentParam,
                                FrequentParamContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconFrequentParam}</div>
                        Edit Common Params
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "pcb_report"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "pcb_report",
                                "PCB Tracking",
                                iconPcbReport,
                                PcbReportContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconPcbReport}</div>
                        PCB Tracking
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "order_items"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "order_items",
                                "Order Items",
                                iconOrderItems,
                                OrderItemsContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconOrderItems}</div>
                        Order Items
                    </a>
                </li>
                {/* <li
                    className={
                        menuState.selectedMenu === "order_serial_config"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "dsd_job_setup",
                                "DSD Job Setup",
                                iconDsdJobSetup,
                                DsdJobSetupContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">
                            {iconDsdJobSetup}
                        </div>
                        DSD Job Setup
                    </a>
                </li> */}
                {/* <li
                    className={
                        menuState.selectedMenu === "order_serial_config"
                            ? "bordered"
                            : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "order_serial_config",
                                "Order Serial Config",
                                iconOrderSerialConfig,
                                OrderSerialConfigContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">
                            {iconOrderSerialConfig}
                        </div>
                        Order Serial Config
                    </a>
                </li>
                <li
                    className={
                        menuState.selectedMenu === "rollback_pallet" ?
                        "bordered" : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "rollback_pallet",
                                "Pallet Rollback",
                                iconRollbackPallet,
                                PalletRollbackContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconRollbackPallet}</div>
                        Pallet Rollback

                    </a>
                </li> */}
                <li
                    className={
                        menuState.selectedMenu === "fraction_pallet" ?
                        "bordered" : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "fraction_pallet",
                                "Fraction Pallet",
                                iconFractionPallet,
                                FractionPalletContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconFractionPallet}</div>
                        Fraction Pallet
                    </a>
                </li> 
            </ul>
        </div>
    );
}

export default Menu;
