import {connect} from "mongoose";
import dotenv from "dotenv";
dotenv.config();  

const dbURI = process.env.MONGO_URI

export const connectDb = async () => {
    
    try {
        await connect(dbURI)
        console.log(`DB Connected`);
        
    } catch (error) {
        console.log(error);
    }
};