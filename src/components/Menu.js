import UnitRollbackContainer from "./containers/UnitRollback";
import PalletRollbackContainer from "./containers/PalletRollback";
import FractionPalletContainer from "./containers/FractionPallet";
import FrequentParamContainer from "./containers/FrequentParam";
import PcbReportContainer from "./containers/PcbReport";
import OrderItemsContainer from "./containers/OrderItems";
import OrderSerialConfigContainer from "./containers/OrderSerialConfig";
import BoxFastForwardContainer from "./containers/BoxFastForward";

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
    const iconOrderSerialConfig = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            classname="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokelinecap="round"
                strokelinejoin="round"
                strokewidth="{2}"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
        </svg>
    );
    const iconFastForward = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            classname="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokelinecap="round"
                strokelinejoin="round"
                strokewidth="{2}"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
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
                        menuState.selectedMenu === "pcb_report"
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
                <li
                    className={
                        menuState.selectedMenu === "order_serial_config" ?
                        "bordered" : ""
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "box_fast_forward",
                                "Box Fast Forward",
                                iconFastForward,
                                BoxFastForwardContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconFastForward}</div>
                        Box Fast Forward

                    </a>
                </li>
                {/* 
                <li
                    className={
                        menuState.selectedMenu === "order_serial_config" ?
                        "bordered" : ""
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
                        <div className="w-5 h-5 mr-2">{iconOrderSerialConfig}</div>
                        Order Serial Config

                    </a>
                </li>
                {/* 
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
                </li>
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
                </li> */}
            </ul>
        </div>
    );
}

export default Menu;
