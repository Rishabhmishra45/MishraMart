import User from "../model/UserModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { genToken } from "../config/token.js";

export const registration = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // check if user already exists
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: "User already exist" });
        }

        // validate email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Enter valid Email" });
        }

        // validate password
        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters" });
        }

        // hash password
        let hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = await User.create({ name, email, password: hashedPassword });

        // generate token
        let token = await genToken(user._id);

        // set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json(user);
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: `registration error ${error}` });
    }
};



export const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User is not Found" })
        }
        let isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" })
        }
        let token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({ message: "login successful" });
    } catch (error) {

    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "logout successful" })
    } catch (error) {
        console.log("logOut error")
        return res.status(500).json({ message: `LogOut error ${error}` })
    }
}


export const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // TODO: in production set this to true with HTTPS
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("googleLogin error:", error); 
    return res
      .status(500)
      .json({ message: "googleLogin error", error: error.message });
  }
};
