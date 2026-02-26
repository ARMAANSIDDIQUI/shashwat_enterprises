const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const nodemailer = require("nodemailer");
const User = require("../../models/User");
const Address = require("../../models/Address");

// Configure email transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gozoomtechnologies@gmail.com",
    pass: "qwuyqyxwiystcbhf",
  },
});

// Validate cart items
const validateCartItems = (cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return false;
  return cartItems.every(
    (item) =>
      item.title &&
      typeof item.title === "string" &&
      item.quantity &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.price &&
      typeof item.price === "number" &&
      item.price >= 0
  );
};

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      salesmanId,
      cartItems,
      addressInfo,
      notes,
      totalAmount,
      cartId,
      location: { latitude, longitude },
    } = req.body;

    // Validate location
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location (latitude and longitude) is required",
      });
    }

    // Validate cart
    if (!validateCartItems(cartItems)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart items. Please check product details.",
      });
    }

    // Fetch product details
    const detailedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.productId).select(
          "brand subcategory image title price"
        );
        if (!product) throw new Error(`Product with ID ${item.productId} not found.`);
        return {
          ...item,
          brand: product.brand,
          subcategory: product.subcategory,
          image: product.image,
          title: product.title,
          price: product.price,
        };
      })
    );

    // Create and save order
    const newOrder = new Order({
      userId,
      salesmanId,
      cartId,
      cartItems: detailedCartItems,
      addressInfo,
      notes,
      orderStatus: "pending",
      paymentMethod: "COD",
      paymentStatus: "pending",
      totalAmount,
      location: { latitude, longitude },
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    await newOrder.save();

    // Fetch salesman (if any)
    const salesmanDetails = salesmanId
      ? await User.findOne({ _id: salesmanId, role: "salesman" })
      : null;

    const orderPlacedBy = salesmanDetails
      ? `Salesman: ${salesmanDetails.userName}, Phone: ${salesmanDetails.phoneNo}`
      : "Shop Owner";

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    // Common email HTML
    const emailHTML = `
      <h1>New Order Details</h1>
      <p><strong>Order ID:</strong> ${newOrder._id}</p>
      <p><strong>Placed by:</strong> ${orderPlacedBy}</p>
      <p><strong>Shop Name:</strong> ${addressInfo.shopName}</p>
      <p><strong>Delivery Address:</strong> ${addressInfo.address}</p>
      <p><strong>Contact:</strong> ${addressInfo.phone}</p>
      <p><strong>Notes:</strong> ${notes || "None"}</p>
      <p><strong>Location:</strong> 
        <a href="${googleMapsUrl}" target="_blank">View on Google Maps</a>
      </p>
      <h2>Ordered Items</h2>
      <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
        <thead>
          <tr>
            <th style="padding: 8px;">S.No</th>
            <th style="padding: 8px;">Image</th>
            <th style="padding: 8px;">Title</th>
            <th style="padding: 8px;">Brand</th>
            <th style="padding: 8px;">Sub Category</th>
            <th style="padding: 8px;">Price (₹)</th>
            <th style="padding: 8px;">Quantity</th>
            <th style="padding: 8px;">Total Price (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${detailedCartItems
            .map(
              (item, index) => `
              <tr>
                <td style="padding: 8px;">${index + 1}</td>
                <td style="padding: 8px;"><img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px;" /></td>
                <td style="padding: 8px;">${item.title}</td>
                <td style="padding: 8px;">${item.brand}</td>
                <td style="padding: 8px;">${item.subcategory}</td>
                <td style="padding: 8px;">${item.price}</td>
                <td style="padding: 8px;">${item.quantity}</td>
                <td style="padding: 8px;">₹${item.price * item.quantity}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p>Thank you for using our service @Shashwat Enterprises!</p>
    `;

    // Send to main admin
    await transporter.sendMail({
      from: "gozoomtechnologies@gmail.com",
      to: "shashwatmbd@gmail.com", // main admin
      subject: `New Order Received - Shop Name: ${addressInfo.shopName}`,
      html: emailHTML,
    });

    // Try sending copy to shop
    try {
      const shopOwner = await User.findById(userId);
      let shopEmail = "";

      if (shopOwner) {
        const addresses = await Address.find({ userId: shopOwner._id });
        const validAddrEmail = addresses.find(
          (a) => a.email && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(a.email)
        );
        if (validAddrEmail) shopEmail = validAddrEmail.email;
        else if (shopOwner.email && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(shopOwner.email))
          shopEmail = shopOwner.email;
      }

      if (shopEmail) {
        await transporter.sendMail({
          from: "gozoomtechnologies@gmail.com",
          to: shopEmail,
          subject: `Copy of Order Received - ${addressInfo.shopName}`,
          html: emailHTML,
        });
        console.log(`Order copy sent to shop email: ${shopEmail}`);
      }
    } catch (err) {
      console.error("Error sending order copy to shop:", err);
    }

    // Try sending copy to salesman
    if (salesmanDetails && salesmanDetails.email && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(salesmanDetails.email)) {
      try {
        await transporter.sendMail({
          from: "gozoomtechnologies@gmail.com",
          to: salesmanDetails.email,
          subject: `Copy of Order Received - ${addressInfo.shopName}`,
          html: emailHTML,
        });
        console.log(`Order copy sent to salesman email: ${salesmanDetails.email}`);
      } catch (err) {
        console.error("Error sending order copy to salesman:", err);
      }
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully (COD). Email sent.",
      orderId: newOrder._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error creating order!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    let order = await Order.findById(orderId);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found!" });

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    for (let item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.title}`,
        });
      }
      product.totalStock -= item.quantity;
      await product.save();
    }

    await Cart.findByIdAndDelete(order.cartId);
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed and payment completed (COD).",
      data: order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error capturing payment!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    if (!orders.length)
      return res.status(404).json({ success: false, message: "No orders found!" });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error fetching orders!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found!" });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error fetching order details!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
