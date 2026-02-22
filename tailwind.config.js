/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#c9a227",
                secondary: "#0f3d3e",
                dark: "#0a192f",
                card: "#112240",
            },
        },
    },
    plugins: [],
}
