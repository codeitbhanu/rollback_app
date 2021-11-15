import UnitRollbackContainer from "./containers/UnitRollback";
import PalletRollbackContainer from "./containers/PalletRollback";
import FractionPalletContainer from "./containers/FractionPallet";
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
                {/* <li>
                    <a>Item without icon</a>
                </li> */}
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
                        menuState.selectedMenu === "fraction_pallet" &&
                        "bordered"
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
                <li
                    className={
                        menuState.selectedMenu === "rollback_pallet" &&
                        "bordered"
                    }
                >
                    <a
                        onClick={() =>
                            onSelectMenu(
                                "rollback_pallet",
                                "Rollback Pallet",
                                iconRollbackPallet,
                                PalletRollbackContainer
                            )
                        }
                    >
                        <div className="w-5 h-5 mr-2">{iconRollbackPallet}</div>
                        Rollback Pallet
                        {/* <div className="ml-2 badge success">3</div> */}
                    </a>
                </li>
            </ul>
        </div>
    );
}

export default Menu;