import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        optional: true,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    googleId: {
      type: String,
      // required: true,
      unique: true,
      sparse: true, // This allows multiple documents to have a null/missing googleId
      required: function () {
        return !this.password; // googleId is required only if password is not present
      },
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password is required only if googleId is not present
      },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
