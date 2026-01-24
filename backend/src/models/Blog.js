import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },

    image: { type: String, default: "" },
    tags: { type: [String], default: [] },

    date: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },

    author: { type: String, default: "Admin" },
    authorImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
