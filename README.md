> "Supervisor Toolbox": Built with Create-React-App (CRA) and Eel

**Table of Contents**

<!-- TOC -->

<!-- - [07 - CreateReactApp Documentation](#07---createreactapp-documentation)
    - [Quick Start](#quick-start)
    - [About](#about)
    - [Main Files](#main-files) -->

<!-- /TOC -->

# CRA

Bootstraped from Create-React-App for the frontend

## Quick Start

Check package.json scripts for:

-   1. use `yarn dev:js` and `yarn dev:py` for development
-   2. use `yarn package` to build and create executable in /dist
        > Remember to remove build and dist directories before building.

## About

> Use `window.eel.expose(func, 'func')` to circumvent `npm run build` code mangling

`npm run build` will rename variables and functions to minimize file size renaming `eel.expose(funcName)` to something like `D.expose(J)`. The renaming breaks Eel's static JS-code analyzer, which uses a regular expression to look for `eel.expose(*)`. To fix this issue, in your JS code, convert all `eel.expose(funcName)` to `window.eel(funcName, 'funcName')`. This workaround guarantees that 'funcName' will be available to call from Python.

## Main Files

Critical files for this demo

-   `conda_env.yaml`: Anaconda Python Environment for development and build.
-   `src/App.js`: Modified to demonstrate exposing a function from JavaScript and how to use callbacks from Python to update React GUI
-   `Supervisor_Toolbox.py`: Basic `eel` file
    -   If run without arguments, the `eel` script will load `index.html` from the build/ directory (which is ideal for building with PyInstaller/distribution)
    -   If any 2nd argument (i.e. `true`) is provided, the app enables a "development" mode and attempts to connect to the React server on port 3000
-   `public/index.html`: Added location of `eel.js` file based on options set in eel_CRA.py

    ```html
    <!-- Load eel.js from the port specified in the eel.start options -->
    <script type="text/javascript" src="http://localhost:8080/eel.js"></script>
    ```

-   `src/react-app-env.d.ts`: This file declares window.eel as a valid type for tslint. Note: capitalization of `window`
-   `src/App.css`: Added some basic styling
