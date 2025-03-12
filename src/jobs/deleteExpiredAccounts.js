import cron from "node-cron"
import { User } from "../models/userModel.js"

const deleteExpiredAccounts = async () => {
    try {
        // Current time (NOW)
        const now = new Date()

        // Delete users where deleteAt date has passed
        const deletedUsers = await User.deleteMany({deleteAt: {$lte: now}})

        console.log(`Deleted ${deletedUsers.deletedCount} permanently requested accounts.`);

    } catch (error) {
        console.error("Error deleting expired accounts:", error);
    }
}

// Runs every midnight at 00:00

cron.schedule("0 0 * * *", () => {
    console.log("Running account cleanup...");
    deleteExpiredAccounts();
});

export default deleteExpiredAccounts;
