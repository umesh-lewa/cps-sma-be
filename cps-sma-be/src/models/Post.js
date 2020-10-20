const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String,
    activeStatus: {
        type: Boolean,
        default: true,
    },
    following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    followingCount: {
        type: Number,
        default: 0,
    },
    followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    followersCount: {
        type: Number,
        default: 0,
    },
    posts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
    postCount: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("User", UserSchema);