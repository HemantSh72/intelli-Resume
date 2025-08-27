//!This file will handle our connection to MongoDB.


import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";


const connectDB = async() =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(`\n✅ MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("❌MONGODB connection failed", error);
        process.exit(1);
    }
}

export default connectDB;

/*

?Explanation:

We import Mongoose.

We create an async function because connecting to a database is an asynchronous operation.

We use a try...catch block to handle any errors during the connection.

If the connection fails, process.exit(1) will stop the application, which is good practice.



*/