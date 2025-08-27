//? The main server entry point

//!This is the main file that starts our server and connects to the database.

import dotenv from "dotenv";
import connectDB from "./db/index.js";

import {app} from './app.js';

dotenv.config({
    path: './.env'
})

// ADD THIS LINE FOR DEBUGGING
console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY); 


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server started on port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed: ", err);
})

/*

?Explanation:

*We load the environment variables from .env at the very top.

*We call connectDB(). Since it returns a promise, we use .then() to start the server only after the database connection is successful.


*/