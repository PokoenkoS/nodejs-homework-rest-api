const {User} = require("../models/user");
const { ctrlWrapper, HttpError } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = process.env;
const path = require("path");
const avatarDir = path.join(__dirname, "../", "public", "avatars");
const gravatar = require ("gravatar")

const fs = require("fs/promises")

const register = async (req, res) => {
    const {email,password}=req.body;
    const user = await User.findOne({email});
    if(user){
        throw HttpError(409, "Email in use")
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const avatarUrl = gravatar.url(email)
    const newUser = await User.create({...req.body, password: hashPassword, avatarUrl});
    res.status(201).json({
        email:newUser.email,
        name: newUser.name
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
    updateAvatar: ctrlWrapper(updateAvatar)
}