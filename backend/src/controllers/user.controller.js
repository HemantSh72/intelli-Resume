import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { use } from "bcrypt/promises.js";
import { uploadOnCloudinary } from "../utils/cloudinary.config.js";
import { upload } from "../middlewares/multer.middleware.js";

const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh token!"
        );
    }
}

const registerUser = asyncHandler(async(req,res)=>{

    //*Get user details from request body
    const {username, email, password, fullName} = req.body;
    console.log(req.body);

    //*Validate user
    if([username, email,password,fullName].some((field)=>field?.trim()==="")){
        throw new ApiError(400, "All fields are required!");
    }

    //*Check if user already exists
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    });

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists!");
    }

    //*Create new user object and save to db
    const user  = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password
    });

    //*Remove password from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    //*return response
    return res
    .status(201)
    .json(
        new ApiResponse(201, createdUser, "User Registered Successfully!")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // 1. Get user details from req.body

    const {username, email, password} = req.body;

    if(!username && !email){
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({ $or: [{email}, {username}]});

    if(!user){
        throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid user credentials!")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(
        user._id
    );

    // console.log(accessToken, refreshToken);

    const loggedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user:loggedUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    );
      //user ko logout karne ke liye hume uski cookies or refresh token dono delete karne padenge
});

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: undefined, // this removes the field from document
            },
        },
        {
            new: true,
        }
    );

    const options = {
        http: true,
        secure: true
    };

    return res 
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
})

const updateAccountDetails = asyncHandler(async(req,res)=>{

    const {fullName, username} = req.body;

    if(!fullName && !username){
        throw new ApiError(400, "At least one field (fullName or username) is required!"); //400 error tab aata h jab user kuch input field miss karta h
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                username,
                fullName
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Updated account info!"));
})

const updatePassword = asyncHandler(async(req,res)=>{

    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password!");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: true});

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
})

const uploadUserResume = asyncHandler(async(req,res)=>{
    const resumeLocalPath = req.file?.path;

    if(!resumeLocalPath){
        throw new ApiError(400, "Resume file is missing!");
    }

    const resume = await uploadOnCloudinary(resumeLocalPath);

    if(!resume){
        throw new ApiError(400, "Error while uploading resume!");
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                resume: resume.url
            }
        },
        {new: true}
    ).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Resume uploaded successfully!"));
})

export {registerUser, loginUser, logoutUser, updateAccountDetails, updatePassword, uploadUserResume};