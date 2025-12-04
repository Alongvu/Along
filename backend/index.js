const port = 4000;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { type } = require("os");
const { error } = require("console");
const { log } = require("console");
const Contact = require("./models/Contact");
const qs = require("qs");
const crypto = require("crypto");

app.use(express.json());
app.use(cors());


//Database Connection with mongoose
mongoose.connect("mongodb+srv://longvu24:longvu@ecommerce.mq1vgmd.mongodb.net/e-commerce");

//API Creation

app.get("/", (req, res) => {
  res.send("Express App is Running")
});

//Cấu hình nơi lưu ảnh
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})


const upload = multer({ storage: storage })

//Creating Upload Endpoint for image
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    //success: 1,
    success: true,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  })
})

//Schema for Creating Product/Sơ đồ để Tạo Sản Phẩm
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
})
//API thêm sp
app.post('/addproduct', async (req, res) => {
  //
  console.log("Body nhận được:", req.body);
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }
  else {
    id = 1;
  }
  const product = new Product({
    id: Date.now(),
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  //console.log("Saved");
  console.log("Product saved:", product.name);
  res.json({
    success: true,
    name: req.body.name,

  })
})

// Creating API for deleting Products/ API Xóa Sản Phẩm
app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  })
})

//Creating API for getting all product/ API Lấy Tất Cả Sản Phẩm
app.get('/allproduct', async (req, res) => {
  let products = await Product.find({});
  console.log("All Product Fetched");
  res.send(products);
})

// Tạo API cho user model
const User = mongoose.model('Users', {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  }
})

//Tạo Tài khoản đăng kí người dùng
app.post('/signup', async (req, res) => {

  let check = await User.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, error: "Email này đã tồn tại " })
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new User({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  })
  await user.save();
  const data = {
    user: {
      id: user.id
    }
  }
  const token = jwt.sign(data, 'LongVu24');
  res.json({ success: true, token })
})

//Tạo API đăng nhập người dùng
app.post('/login', async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id
        }
      }
      const token = jwt.sign(data, 'LongVu24');
      res.json({ success: true, token });
    }
    else {
      res.json({ success: false, error: "Mật khẩu của bạn không đúng" });
    }
  }
  else {
    res.json({ success: false, error: "Email của bạn không đúng" })
  }
})

// ✅ API hiển thị danh sách Order
const OrderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => {
        // Sinh số ngẫu nhiên từ 1 đến 1000
        const randomNum = Math.floor(Math.random() * 1000) + 1;
        // Đảm bảo đủ 3 chữ số (ví dụ: 007, 245, 999)
        const formattedNum = randomNum.toString().padStart(3, "0");
        return `ORD-${formattedNum}`;
      },
    },
    customer: { type: String, default: "Khách Hàng" },
    phone: { type: String, default: "0123456789" },
    address: { type: String, default: "Hồ Chí Minh" },
    total: { type: Number, required: true },
    status: { type: String, default: "Đang xử lý" },
    products: [
      {
        name: String,
        quantity: Number,
        price: Number,
         category: String,
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

// 🧾 API: thêm đơn hàng (tự động lấy category)
app.post("/addorders", async (req, res) => {
  try {
    const { customer, phone, address, total, products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Đơn hàng trống" });
    }

   // 🔍 Tìm category của từng sản phẩm trong DB
const productsWithCategory = await Promise.all(
  products.map(async (p) => {
    const found = await Product.findOne({ name: p.name });

    // Lấy category từ DB, nếu không có thì null
    const category = found?.category?.toLowerCase() ;

    return {
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      category,
    };
  })
);


    const newOrder = new Order({
      customer,
      phone,
      address,
      total,
      products: productsWithCategory,
    });

    await newOrder.save();
    console.log("🆕 New order saved with categories:", newOrder);

    res.status(200).json({
      success: true,
      message: "Order added successfully",
      orderId: newOrder.id,
    });
  } catch (error) {
    console.error("❌ Error saving order:", error);
    res.status(500).json({ message: "Failed to save order" });
  }
});

// 📋 API: lấy toàn bộ đơn hàng
app.get("/allorders", async (req, res) => {
  try {
    const allOrders = await Order.find().sort({ createdAt: -1 });
    res.json(allOrders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});
// 🗑️ API: xóa đơn hàng
app.post("/removeorder", async (req, res) => {
  try {
    const { id } = req.body;
   //await Order.findByIdAndDelete(id);
   await Order.findOneAndDelete({ id: id });
    console.log("🗑️ Removed order:", id);
    res.status(200).json({
  message: "Order added successfully",
  
});
  } catch (error) {
    console.error("❌ Error removing order:", error);
    res.status(500).json({ message: "Failed to remove order" });
  }
});


//phản hồi khách hàng
// 📩 API: Gửi liên hệ từ người dùng
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ success: true, message: "Liên hệ đã được gửi thành công!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi gửi liên hệ." });
  }
});

// 📜 API: Lấy tất cả liên hệ (trang admin)
app.get("/allcontact", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Không thể tải danh sách liên hệ." });
  }
});


// 📩 API: Gửi liên hệ từ người dùng
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ success: true, message: "Liên hệ đã được gửi thành công!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi gửi liên hệ." });
  }
});
// 📜 API: Lấy tất cả liên hệ (trang admin)
app.get("/allcontact", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Không thể tải danh sách liên hệ." });
  }
});

// ✅ API: Đánh dấu phản hồi đã xử lý
app.put("/contact/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(
      id,
      { completed: true },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi." });
    }

    res.status(200).json({ success: true, message: "Đã đánh dấu phản hồi là hoàn thành.", contact });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật phản hồi:", error);
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật phản hồi." });
  }
});

// 🗑️ API: Xóa phản hồi khách hàng
app.delete("/contact/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi." });
    }

    res.status(200).json({ success: true, message: "Phản hồi đã được xóa." });
  } catch (error) {
    console.error("❌ Lỗi khi xóa phản hồi:", error);
    res.status(500).json({ success: false, message: "Lỗi khi xóa phản hồi." });
  }
});


// api xuất hóa đơn pdf
const PDFDocument = require("pdfkit");
const fs = require("fs");

// 🧾 API: Xuất hóa đơn PDF cho đơn hàng theo ID
app.get("/invoice/:id", async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 📄 Tạo file PDF
    const doc = new PDFDocument();
    const filePath = `./invoices/invoice_${order.id}.pdf`;

    // Tạo folder invoices nếu chưa có
    if (!fs.existsSync("./invoices")) {
      fs.mkdirSync("./invoices");
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // 🧾 Nội dung hóa đơn
    doc.fontSize(20).text("HÓA ĐƠN MUA HÀNG", { align: "center" });
    doc.moveDown();
    
    doc.fontSize(14).text(`Mã đơn hàng: ${order.id}`);
    doc.text(`Khách hàng: ${order.customer}`);
    doc.text(`Tổng tiền: ${order.total.toLocaleString()} $`);
    doc.text(`Trạng thái: ${order.status}`);
    
    doc.moveDown();
    doc.text("Danh sách sản phẩm:");
    doc.moveDown();

    order.products.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.name} - SL: ${p.quantity}`);
    });

    doc.moveDown();
    doc.text("Cảm ơn bạn đã mua hàng tại SHOPPER 🛍️", {
      align: "center",
      underline: true,
    });

    // Kết thúc PDF
    doc.end();

    // Khi file đã ghi xong → trả về file cho client
    stream.on("finish", () => {
      res.download(filePath, `HoaDon_${order.id}.pdf`);
    });
  } catch (error) {
    console.error("❌ Lỗi tạo PDF:", error);
    res.status(500).json({ message: "Không thể tạo hóa đơn PDF" });
  }
});

// ==================== API Chat Box (Gemini) ====================
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

// ✅ Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ API Chat Box: nhận message, gửi đến Gemini, trả về phản hồi
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Kiểm tra có gửi nội dung không
    if (!message || message.trim() === "") {
      return res.status(400).json({ reply: "Tin nhắn trống." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(message);

    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    res.status(500).json({ reply: "Lỗi khi gọi Gemini API." });
  }
});

// ==================== API THỐNG KÊ DASHBOARD ====================
app.get("/stats", async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();

    // --- 1️⃣ Tổng số lượng sản phẩm theo danh mục ---
    const productsByCategory = {};
    products.forEach((p) => {
      const category = p.category?.toLowerCase() || "khác";
      productsByCategory[category] = (productsByCategory[category] || 0) + 1;
    });

    // --- 2️⃣ Số lượng đã bán theo danh mục ---
    const soldByCategory = {};
    orders.forEach((order) => {
      order.products.forEach((item) => {
        const category = item.category?.toLowerCase() || "khác";
        const qty = item.quantity || 1;
        soldByCategory[category] = (soldByCategory[category] || 0) + qty;
      });
    });

    // --- 3️⃣ Tổng đơn hàng và doanh thu ---
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalSoldProducts = Object.values(soldByCategory).reduce(
      (a, b) => a + b,
      0
    );

    // --- 4️⃣ Doanh thu theo tháng ---
    const revenueByMonth = {};
    orders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenueByMonth[key] = (revenueByMonth[key] || 0) + (o.total || 0);
    });
    const monthlyLabels = Object.keys(revenueByMonth).sort();

    // --- 5️⃣ Chuẩn hóa dữ liệu trả về ---
    res.json({
      productsByCategory,       // Tổng sản phẩm theo danh mục
      productsSoldByCategory: soldByCategory, // Đã bán theo danh mục
      orders: {
        totalOrders,
        totalRevenue,
        totalSoldProducts,
      },
      revenueByMonth,           // ✅ thêm doanh thu theo tháng
      monthlyLabels,            // ✅ thêm danh sách tháng
    });
  } catch (err) {
    console.error("❌ Lỗi trong /stats:", err);
    res.status(500).json({ error: err.message });
  }
});

const PAYPAL_API = "https://api-m.sandbox.paypal.com";

// 1️⃣ Tạo access token
const generateAccessToken = async () => {
  const auth = Buffer.from(
    process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!data.access_token) {
    console.error("❌ Lỗi tạo access token:", data);
    throw new Error("Không tạo được PayPal access token");
  }
  return data.access_token;
};

// 2️⃣ Tạo order
app.post("/create-paypal-order", async (req, res) => {
  try {
    const { total } = req.body;
    if (!total) return res.status(400).json({ error: "Missing total" });

    const accessToken = await generateAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: Number(total).toFixed(2),
            },
          },
        ],
      }),
    });

    const text = await response.text(); // Debug: in ra xem PayPal trả gì
    let order;
    try {
      order = JSON.parse(text);
    } catch {
      console.error("❌ Lỗi parse JSON create order:", text);
      return res.status(500).json({ error: "PayPal create order failed" });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ CREATE ERROR:", err);
    res.status(500).json({ error: "SERVER ERROR" });
  }
});

// 3️⃣ Capture order
app.post("/capture-paypal-order", async (req, res) => {
  try {
    const { orderID } = req.body;
    if (!orderID) return res.status(400).json({ error: "Missing orderID" });

    const accessToken = await generateAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const text = await response.text(); // Debug: in ra response
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Lỗi parse JSON capture order:", text);
      return res.status(500).json({ error: "PayPal capture order failed" });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ CAPTURE ERROR:", err);
    res.status(500).json({ error: "SERVER ERROR" });
  }
});


const PORT = process.env.PORT || 4000;

// helper: get exchange rate (try API, fallback to .env)
async function getUsdToVndRate() {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=VND');
    const j = await res.json();
    if (j && j.rates && j.rates.VND) return Number(j.rates.VND);
  } catch (e) {
    console.log('Could not fetch exchange rate, use fallback', e.message);
  }
  return Number(process.env.USD_VND_RATE || 24000);
}

/* ------------------- MoMo ------------------- */
// POST { amount }  // amount expected in VND (integer)
// (crypto was moved here to be available for payment helpers)

app.post('/create-momo', async (req, res) => {
  try {
    let { amount } = req.body;
    amount = Number(amount);
    if (!Number.isFinite(amount)) return res.status(400).json({ message: 'Invalid amount' });
    if (amount < 1000 || amount > 50000000) return res.status(400).json({ message: 'Amount phải >=1000 và <=50000000 (VND)' });

    const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const orderId = 'MOMO' + Date.now();
    const requestId = orderId;
    const orderInfo = 'Thanh toán đơn hàng';
    const redirectUrl = 'http://localhost:3000/payment-success';
    const ipnUrl = 'http://localhost:4000/momo-notify';
    const requestType = 'captureWallet';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount: String(amount),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData: '',
      requestType,
      signature,
      lang: 'vi'
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log('MoMo response:', data);
    res.json(data);
  } catch (err) {
    console.error('MoMo error:', err);
    res.status(500).json({ message: 'Lỗi MoMo' });
  }
});

app.post('/momo-notify', (req, res) => {
  console.log('MoMo notify:', req.body);
  res.json({ message: 'ok' });
});


// Hàm SORT BẮT BUỘC của VNPay (KHÔNG sửa)
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(k => sorted[k] = obj[k]);
    return sorted;
}

/* ------------------- VNPay ------------------- */
// Debug helper: GET returns usage info so opening URL in browser is informative
app.get('/create-vnpay', (req, res) => {
  return res.json({ method: 'POST', usage: { path: '/create-vnpay', body: { amount: 'number (VND)' } } });
});

app.post("/create-vnpay", (req, res) => {
    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    console.log("ENV VNPay:", tmnCode ? '***' : tmnCode, secretKey ? '***' : secretKey, vnpUrl, returnUrl);

    // Validate env
    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      console.error('VNPay configuration missing. Check VNP_TMNCODE, VNP_HASH_SECRET, VNP_URL, VNP_RETURN_URL');
      return res.status(500).json({ error: 'VNPay configuration missing on server' });
    }

    // Validate request body
    if (!req.body || typeof req.body.amount === 'undefined') {
      return res.status(400).json({ error: 'Missing amount in request body. Send JSON {"amount": <VND number>} via POST.' });
    }

    // Parse amount safely and reject non-numeric values early
    const rawAmount = req.body.amount;
    const amountNum = Number(rawAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      console.error('Invalid amount received for VNPay:', rawAmount);
      return res.status(400).json({ error: 'Invalid amount value' });
    }

    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const date = new Date();
    const createDate = date.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const orderId = date.getTime();

    // VNPay expects amount in smallest currency unit (amount * 100)
    const vnpAmount = Math.round(amountNum) * 100;

    let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: "other",
        vnp_Amount: vnpAmount,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;
    const paymentUrl = vnpUrl + "?" + qs.stringify(vnp_Params, { encode: false });

    return res.json({ url: paymentUrl });
});

/* ------------------- ZaloPay ------------------- */
app.post('/create-zalopay', async (req, res) => {
  try {
    let { amount } = req.body;
    amount = Number(amount);
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Invalid amount' });

    const config = {
      app_id: Number(process.env.ZALOPAY_APP_ID),
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: process.env.ZALOPAY_ENDPOINT,
      callback_url: process.env.ZALOPAY_CALLBACK
    };

    // Validate ZaloPay env
    if (!config.app_id || !config.key1 || !config.endpoint || !config.callback_url) {
      console.error('ZaloPay configuration missing or invalid:', config);
      return res.status(500).json({ error: 'ZaloPay configuration missing on server' });
    }
    console.log("ENV ZaloPay:", config);

    const dateStr = new Date().toISOString().slice(2,10).replace(/-/g, "");
    const app_trans_id = `${dateStr}_${Math.floor(Math.random() * 100000)}`;

    const order = {
      app_id: config.app_id,
      app_trans_id,
      app_user: "user123",
      app_time: Date.now(),
      item: "[]",
      embed_data: "{}",
      amount,
      description: `Thanh toán đơn hàng #${app_trans_id}`,
      callback_url: config.callback_url
    };

    const dataToSign =
      `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = crypto.createHmac("sha256", config.key1)
                      .update(dataToSign)
                      .digest("hex");

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    const result = await response.json();
    console.log("ZaloPay:", result);

    if (result.order_url) return res.json({ order_url: result.order_url });
    return res.status(400).json({ message: "Không tạo được đơn ZaloPay", raw: result });

  } catch (err) {
    console.error("ZaloPay error:", err);
    res.status(500).json({ message: "Lỗi ZaloPay" });
  }
});


app.post("/convert-usd-to-vnd", (req, res) => {
  try {
    const { amountUSD } = req.body;
    if (!amountUSD) return res.status(400).json({ error: "Missing amountUSD" });

    const rate = 24000; // hoặc lấy API từ Vietcombank
    const amountVND = Math.round(amountUSD * rate);

    res.json({ amountVND });
  } catch (err) {
    res.status(500).json({ error: "Convert error" });
  }
});


app.listen(port, (error) => {
  if (!error) {
    console.log("Server is Successfully Running,and App is listening on port " + port)
  }
  else {
    console.log("Error occurred, server can't start :" + error);
  }
})

