module.exports = {
    // mode: 'jit',
    purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: false, // or 'media' or 'class'
    theme: {
        height: {
            tableheight: "600px",
        },
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [require("daisyui")],
};
