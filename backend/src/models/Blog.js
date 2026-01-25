import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "Guest" },
    text: { type: String, trim: true, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true } // ✅ keep ids for comments
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },

    image: { type: String, default: "" },

    tags: {
      type: [String],
      default: [],
      set: (arr) => {
        const raw = Array.isArray(arr) ? arr : [];
        const cleaned = raw
          .map((t) => String(t || "").trim())
          .filter(Boolean)
          .map((t) => t.toLowerCase());
        return Array.from(new Set(cleaned));
      },
    },

    date: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },

    likes: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    author: { type: String, default: "Admin", trim: true },
    authorImage: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model("Blog", blogSchema);
