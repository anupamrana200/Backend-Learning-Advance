import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  //1. Get user details from frontend
  const{fullName, email, username, password } = req.body

  //2. Validation, Check the fields are not-empty
  if (
    [fullName, email, username, password].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All Fields are required!")
  }

  //3. Check is the user already exists: Username, email id
  const existedUser = await User.findOne({
    $or: [{email},{username}]
  })
  if(existedUser){
    throw new ApiError(409, "User with email and username already exists! Please register with new.")
  }

  //4. Check for images, avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required! please attach this to proceed.")
  }

  //5. Upload them to cloudinary, check is the avatar is successfully uploaded on cloudinary or not
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if(!avatar){ 
    throw new ApiError(400, "Avatar file not successfully on cloudinary! Check it.")
  }

  //6. Create user object, create entry in db.
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  //7. Remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select("-password -refreshToken")

  //8. Check for user creation
  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering user")
  }

  //9. Return response
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )




})

export {registerUser}