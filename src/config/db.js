import {connect} from "mongoose";

const dbURI = process.env.MONGO_URI

export const connectDb = async () => {
    
    try {
        await connect(dbURI)
        console.log(`DB Connected`);
        
    } catch (error) {
        console.log(error);
    }
};