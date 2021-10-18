import "./App.css";

import Navbar from "./components/Navbar";
import Container from "./components/Container";

function App() {
    return (
        <div className="App">
            <header className="w-full h-22">
                <Navbar />
            </header>
            {/* Code here */}
            <Container />
        </div>
    );
}

export default App;
