const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    completed: { type: Boolean, default: false }, // ✅ thêm trường này để đánh dấu phản hồi đã xử lý
  },
  { timestamps: true } // tự động thêm createdAt và updatedAt
);

module.exports = mongoose.model("Contact", contactSchema);
