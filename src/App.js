import { useState } from "react";

import "./App.css";

import Navbar from "./components/Navbar";
import Container from "./components/Container";

function App() {
    const [appState, setAppState] = useState({
        session: {
            user: "bhanu.pratap",
            timeout: 60,
            server: {
                status: false, // true: connected, false: disconnected
                host: `HOMEPC\\SQLEXPRESS`,
                username: `Bhanu.Pratap`,
                password: `Password123`,
            },
        },
    });
    return (
        <div className="App">
            <header className="w-full h-22">
                <Navbar params={appState} setParams={setAppState} />
            </header>
            {/* Code here */}
            <Container params={appState} setParams={setAppState} />
        </div>
    );
}

export default App;
