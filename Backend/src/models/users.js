const mongo = require("mongoose");

const users = new mongo.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: String,
    role: {
        type: String,
        enum: ["customer", "worker", "admin"],
        default: "customer"
    }
});

const user = mongo.model("user", users);

module.exports = user;