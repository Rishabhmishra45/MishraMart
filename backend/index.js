import exprees from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

let port = process.env.PORT || 6000;

let app = exprees();

app.use(exprees.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDb()
});