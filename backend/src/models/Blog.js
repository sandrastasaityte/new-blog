import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },

  slug: { type: String, required: true, unique: true },

  content: { type: String, required: true },

  tags: { type: [String], default: [] },

  image: String,

  author: { type: String, default: "Admin" },

  likes: { type: Number, default: 0 },

  likedBy: { type: [String], default: [] },

  comments: [
    {
      name: String,
      text: String,
      date: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Blog", blogSchema);
