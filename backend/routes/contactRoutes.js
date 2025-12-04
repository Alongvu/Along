import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

// 📨 Nhận dữ liệu từ form Contact (frontend)
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.json({ success: true, message: "Đã lưu liên hệ thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi khi lưu liên hệ." });
  }
});

// 📄 Lấy danh sách liên hệ (để hiện bên trang admin)
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: "Không thể lấy dữ liệu liên hệ." });
  }
});

export default router;
