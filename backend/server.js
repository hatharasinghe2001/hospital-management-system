const app = require("./src/app");
const connectDB = require("./src/config/db");
const seedAdmin = require("./src/utils/seedAdmin");
const { port } = require("./src/config/env");

async function start() {
    await connectDB();
    await seedAdmin();

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

start().catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
});
