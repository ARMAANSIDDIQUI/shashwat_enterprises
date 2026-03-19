const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const salesmanRouter = require("./routes/salesman/salesman-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const adminBeatRouter = require("./routes/admin/beats-route");
const adminBrandRouter = require("./routes/admin/brands-route");
const adminCategoryRouter = require("./routes/admin/categories-route");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopRouter = require("./routes/admin/shops-route");
const enquiryRouter = require("./routes/shop/enquiry-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/beats", adminBeatRouter);
app.use("/api/admin/brand", adminBrandRouter);
app.use("/api/admin/category", adminCategoryRouter);
app.use("/api/admin/users", shopRouter);
app.use("/api/salesman", salesmanRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop", enquiryRouter);

app.use("/api/common/feature", commonFeatureRouter);

// Static files for frontend
const frontendPath = path.join(__dirname, "dist");
app.use(express.static(frontendPath));

app.get("/api/health", (req, res) => {
  res.send("Backend is live");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;