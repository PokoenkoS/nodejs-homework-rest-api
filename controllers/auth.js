const {User} = require("../models/user");
const {nanoid} = require('nanoid')
const { ctrlWrapper, HttpError, sendEmail } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {SECRET_KEY, BASE_URL} = process.env;
const path = require("path");
const avatarDir = path.join(__dirname, "../", "public", "avatars");
const gravatar = require ("gravatar");


const fs = require("fs/promises")

const register = async (req, res) => {
    const {email,password}=req.body;
    const user = await User.findOne({email});
    if(user){
        throw HttpError(409, "Email in use")
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const avatarUrl = gravatar.url(email);
    const verificationToken = nanoid();
    const newUser = await User.create({...req.body, password: hashPassword, avatarUrl, verificationToken});
    const verifyEmail = {
        to: email,subject:"Verify email",
        html: `<a target="_blank" href=${BASE_URL}/api/auth/verify/${verificationToken}>Click verify email </a> `
    }
    await sendEmail(verifyEmail)
    res.status(201).json({
        email:newUser.email,
        name: newUser.name
    })
}

const verifyEmail = async (req, res) => {
    const {verificationToken} = req.params;
    const user = await User.findOne({verificationToken});

    if(!user){
        throw HttpError(404, "Not found")
    }
    await User.findByIdAndUpdate(user.id, {verify:true, verificationToken: null});

    res.status(201).json({
        message: 'Verification successful'
    })
}

const resendVerifyEmail = async (req, res) => {
const {email}= req.body;
const user = await User.findOne({email});
  if(!user){
    res.status(400).json({
        message:"missing required field email"
    })
}

  if (user.verify) {
    res.status(400).json({
        "message":"Verification has already been passed"
    })
  }

  const verifyEmail = {
    to: email,subject:"Verify email",
    html: `<a target="_blank" href=${BASE_URL}/api/auth/verify/${user.verificationToken}>Click verify email </a> `
}

await sendEmail(verifyEmail);
res.json({
    message:"Verify email send success"
})
}

const login = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw HttpError(401, "Email or password invalid")
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare) {
        throw HttpError(401, "Email or password invalid")
    }
    if(!user.verify){
        throw HttpError(404, "Not found")
    }
    const payload ={
        id: user._id
    }
    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"} );
    await User.findByIdAndUpdate(user._id, {token})
    res.json({token})
}

const getCurrent = async (req, res) => {
    const{email, name} = req.user;
    res.json({
      email,
      name
    })
  }

const logout = async(req, res) => {
    const{_id}= req.user;
    await User.findByIdAndUpdate(_id, {token: ""})
    res.json({
        message: "Logout succes"
    })
}

const updateAvatar = async(req, res) => {
    const{_id} = req.user;
    const {path: tempUpload, originalname}= req.file;
    const filename = `${_id}_${originalname}`
    const resultUpload = path.join(avatarDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarUrl = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, {avatarUrl});
    res.json({
        avatarUrl,
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    logout: ctrlWrapper(logout),
    getCurrent: ctrlWrapper(getCurrent),
    updateAvatar: ctrlWrapper(updateAvatar),
    verifyEmail: ctrlWrapper(verifyEmail),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail)
}