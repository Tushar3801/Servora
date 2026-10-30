const mongo = require("mongoose");
const booking = new mongo.Schema({
    customer: {
        type: mongo.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },worker:{
        type: mongo.Schema.Types.ObjectId,
        ref: "workers",
        required: true
    },serviceDate:{
        type: Date,
        required: true
    },serviceTime:{
        type: String,
        required: true
    },address:{
        type: String,
        required: true
    },description: {
        type: String,
        default: ''
    },totalPrice: {
        type: Number,
        required: true,
        min: 0
    },status: {
        type: String,
        enum: ["pending","accepted","rejected","completed","cancelled"],
        default: "pending"
    },service: {
    type: mongo.Schema.Types.ObjectId,
    ref: "services",
    required: true}
},{ timestamps: true });
booking.index(
    { worker: 1, serviceDate: 1, serviceTime: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: ["pending", "accepted"] }
        }
    }
);
const bookings = mongo.model("bookings",booking);
module.exports = bookings;