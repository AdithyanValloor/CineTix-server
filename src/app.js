import express from "express";
import stripeWebhookRoute from "./routes/stripeWebhook.js";
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { userRouter } from "./routes/userRouter.js";
import { adminRouter } from "./routes/adminRouter.js";
import { theaterRouter } from "./routes/theatersRouter.js";
import { moviesRouter } from "./routes/moviesRouter.js";
import { bookingRouter } from "./routes/bookingsRouter.js";
import { showsRouter } from "./routes/showsRouter.js";
import { exhibitorRouter } from "./routes/exhibitorRouter.js";
import { reviewRouter } from "./routes/reviewsRouter.js";
import { watchlistRouter } from "./routes/watchlistRouter.js";
import { paymentRouter } from "./routes/paymentsRouter.js";

const app = express()

// app.use("/api/webhook", stripeWebhookRoute);

app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookRoute
);
  

app.use(cors({
    origin: [
        "https://cine-tix-client.vercel.app",
        "http://192.168.20.5:5173",
        "http://192.168.20.8:5173",
        "http://localhost:5173"
    ],
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}))
app.options("*", cors());


app.use(cookieParser())
app.use(express.json())

// User route
app.use("/api/user", userRouter)

// Admin route
app.use("/api/admin", adminRouter)

// Exhibitor route
app.use("/api/exhibitor", exhibitorRouter)

// Theater route
app.use("/api/theater", theaterRouter)

// Movies route
app.use("/api/movies", moviesRouter)

// Shows route
app.use("/api/shows", showsRouter)

// Bookings route
app.use("/api/booking", bookingRouter)

// Review route
app.use("/api/reviews", reviewRouter)

// Payments route
app.use("/api/payments", paymentRouter)

// Watchlist
app.use("/api/watchlist", watchlistRouter)

export default app
