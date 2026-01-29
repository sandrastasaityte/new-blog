import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 100 },
  passwordHash: { type: String, required: true, minlength: 20 },
  email: { type: String, trim: true, lowercase: true, match: emailRegex },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret._id; delete ret.__v; delete ret.passwordHash; return ret; } }
});

userSchema.virtual("isAdmin").get(function () { return this.role === "admin"; });
userSchema.methods.hasRole = function (role) { return this.role === role; };

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string" } } });

export default mongoose.model("User", userSchema);
