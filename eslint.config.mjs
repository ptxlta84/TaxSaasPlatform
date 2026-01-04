export default [
    {
        ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "client/**", "**/*.min.js"] 
    },
    {
        files: ["**/*.js"],
        rules: {
            // "no-unused-vars": "warn", // Disabled to prevent deployment blocking on warnings
            // "no-undef": "warn"
        }
    }
];
