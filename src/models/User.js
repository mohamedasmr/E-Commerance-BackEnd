const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: {
            type: String,
            required: true,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email invalid!");
                }
            },
        },
        pic: {
            type: Buffer,
        },

        password: {
            type: String,
            required: true,
            minlenght: 7,
            validate(value) {
                if (value) {
                    if (value.toLowerCase().includes("password")) {
                        throw new Error('Password cannot be "Password"');
                    }
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    require: true,
                },
            },
        ],

        isAdmin: {
            type: Boolean,
            default: false,
        },
        resetLink: {
            data: String,
            default: "",
        },
    },
    { timestamps: true }
);

userSchema.virtual("cart", {
    ref: "Cart",
    localField: "_id",
    foreignField: "owner",
});

// Signup Method

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        {
            _id: user._id,
            isAdmin: user.isAdmin.toString(),
        },
        process.env.JWT_SEC,
        { expiresIn: "3d" }
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

// Login Method
userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error("Unabel to login!");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Unabel to login!");
    }
    return user;
};

// Hide Password & Tokens
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};

//  Hash Password
userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
