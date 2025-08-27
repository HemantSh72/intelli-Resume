//? The main Express app file

//!This file is where we configure our Express application and its middlewares.

// Import express to create the server
import express from "express";

// Import cors to handle cross-origin requests (frontend ↔ backend)
import cors from "cors";

// Import cookie-parser to handle cookies sent from the client
//access and set cookies from user and for user
import cookieParser from "cookie-parser";

import bodyParser from "body-parser";

// Create an instance of the Express application
const app = express();

// Enable CORS (Cross-Origin Resource Sharing)
// Allows frontend (e.g., React app) to make requests to your backend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Allowed origin from environment (e.g., http://localhost:3000)
    credentials: true, // Allow sending cookies and credentials (like sessions, tokens)
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

app.use(cookieParser());
// Export the app so it can be used in index.js or other files

//routes import
import userRouter from "./routes/user.routes.js";
import aiRouter from "./routes/ai.routes.js";
//routes declaration

//pehle hum routes ko use karna ke liye app.get karte the
//par vo tab karte hai jab vo same file mein hota h
//ab humne cheezein separate kardi hai or router ko
//use karne ke liye hum likhenge app.use

app.use("/api/v1/users", userRouter);
app.use("/api/v1/ai", aiRouter);
// http://localhost:8000/api/v1/users/register


export { app }; // You can also write: export default app;uu


/*

? Explanation

*cors allows our frontend (which will be on a different URL) to make requests to our backend.

*express.json() allows the server to accept and parse JSON in request bodies.

*express.urlencoded() allows the server to parse form data.

 */