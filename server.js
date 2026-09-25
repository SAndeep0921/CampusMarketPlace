require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "campusmarket_secret_2026";

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        req.user = user;
        next();
    });
}

const app = express();
const PORT = 3000;

// Request logger
app.use((req, res, next) => {
    console.log("REQUEST RECEIVED:", req.method, req.url);
    next();
});

// Allow larger JSON requests because product images are stored as data
app.use(express.json({ limit: "10mb" }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("❌ MongoDB connection FAILED");
        console.error(error);
    });

// ==========================================
// PRODUCT SCHEMA
// ==========================================

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        sellerName: {
            type: String,
            required: true
        },

        contact: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },

        image: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// Product model
const Product = mongoose.model("Product", productSchema);

// ==========================================
// REGISTER
// ==========================================

app.post("/api/register", async (req, res) => {
    console.log("REGISTER ROUTE WAS HIT");

    try {
        console.log("REGISTER REQUEST:", req.body);

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        await user.save();

        console.log("USER SAVED:", user._id);

        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("========== REGISTRATION ERROR ==========");
        console.error(error);
        console.error("========================================");

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful!",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

// ==========================================
// GET ALL PRODUCTS
// ==========================================

app.get("/api/products", async (req, res) => {
    try {
        const products = await Product
            .find()
            .sort({ createdAt: -1 });

        res.json(products);

    } catch (error) {
        console.error("========== PRODUCTS ERROR ==========");
        console.error(error);
        console.error("====================================");

        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
});

// ==========================================
// ADD A NEW PRODUCT
// ==========================================

app.post("/api/products", authenticateToken, async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            sellerId: req.user.id
        });

        const savedProduct = await product.save();

        res.status(201).json({
            message: "Product added successfully!",
            product: savedProduct
        });

    } catch (error) {
        console.error("Error adding product:", error);

        res.status(500).json({
            message: "Failed to add product"
        });
    }
});

// ==========================================
// UPDATE PRODUCT
// ==========================================

app.put("/api/products/:id", authenticateToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Only the owner can edit the listing
        if (
            product.sellerId &&
            product.sellerId.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You can only edit your own listings"
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                category: req.body.category,
                price: req.body.price,
                description: req.body.description,
                sellerName: req.body.sellerName,
                contact: req.body.contact,
                email: req.body.email,
                image: req.body.image
            },
            {
                new: true,
                runValidators: true
            }
        );

        res.json({
            message: "Product updated successfully!",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error updating product:", error);

        res.status(500).json({
            message: "Failed to update product"
        });
    }
});

// ==========================================
// DELETE PRODUCT
// ==========================================

app.delete("/api/products/:id", authenticateToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Only the owner can delete the listing
        if (
            product.sellerId &&
            product.sellerId.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You can only delete your own listings"
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            message: "Product deleted successfully!"
        });

    } catch (error) {
        console.error("Error deleting product:", error);

        res.status(500).json({
            message: "Failed to delete product"
        });
    }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log("Campus Marketplace server started");
    console.log(`http://localhost:${PORT}`);
});