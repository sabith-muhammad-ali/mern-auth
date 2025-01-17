import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";

const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ email });

  if (admin) {
    if (admin.isAdmin) {
      if (await admin.matchPassword(password)) {
        generateToken(res, admin._id);
        res.status(200).json({
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          isAdmin: admin.isAdmin,
        });
      } else {
        res.status(401);
        throw new Error("Invalid email or password");
      }
    } else {
      res.status(403);
      throw new Error("Access denied: Not an admin");
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const logoutAdmin = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Admin logged out" });
});

const getUser = asyncHandler(async (req, res) => {
  const users = await User.find({ isAdmin: false });
  res.json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  console.log("users", user);

  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isBlock = !user.isBlock;
    await user.save();
    res.json({ message: `user ${user.isBlock ? "blocked" : "unblocked"}` });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});
export { authAdmin, logoutAdmin, getUser, deleteUser, blockUser };
