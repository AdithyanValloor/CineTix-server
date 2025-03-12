import express from "express";
import { userRouter } from "./routes/userRouter.js";
import { adminRouter } from "./routes/adminRouter.js";
import { theaterRouter } from "./routes/theatersRouter.js";
import { seatsRouter } from "./routes/seatsRouter.js";
import { moviesRouter } from "./routes/moviesRouter.js";
import { bookingRouter } from "./routes/bookingsRouter.js";
import { showsRouter } from "./routes/showsRouter.js";
import { exhibitorRouter } from "./routes/exhibitorRouter.js";
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json())
app.use(cookieParser());

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

// Seats route
app.use("/api/seats", seatsRouter)

// Shows route
app.use("/api/shows", showsRouter)

// Bookings route
app.use("/api/booking", bookingRouter)

export default app
