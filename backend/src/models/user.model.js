import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true //optimized way of searching
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, "Password is required!"]
        },
        resume: {
            type: String //this will store the url from cloudinary
        }
    },{
        timestamps: true
    }
);

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  

export const User = mongoose.model("User", userSchema);

/*

?Explanation
!What this code does:

*Schema Definition: We define the fields every user document will have (username, email, etc.) and their rules (e.g., must be a String, is required, must be unique).

*Password Hashing: The userSchema.pre("save", ...) block is a powerful Mongoose feature. It tells our application: "Before you save any user to the database, check if the password was just changed. If it was, encrypt it using bcrypt." This ensures we never store plain-text passwords in our database, which is a critical security practice.

*/