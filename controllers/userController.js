import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// @desc    Auth user with Google
// @route   POST /api/users/google-login
// @access  Public
export const googleLogin = async (req, res) => {
  const { tokenId } = req.body

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const { name, email, picture, sub } = ticket.getPayload()

    // Check if user exists
    let user = await User.findOne({ email })

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        picture,
        googleId: sub,
      })
    } else {
      // Update user info if needed
      user.name = name
      user.picture = picture
      if (!user.googleId) user.googleId = sub
      await user.save()
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    })
  } catch (error) {
    console.error("Google login error:", error)
    res.status(401).json({ message: "Invalid token" })
  }
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
