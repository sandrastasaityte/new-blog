import mongoose from "mongoose";
import slugify from "slugify";

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "Guest", maxlength: 60 },
    text: { type: String, trim: true, required: true, maxlength: 1000 },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },

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

    views: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },

    comments: { type: [commentSchema], default: [] },

    rating: { type: Number, default: 0, min: 0, max: 5 },

    author: { type: String, default: "Admin", trim: true },
    authorImage: { type: String, default: "" },

    published: { type: Boolean, default: true },
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

// SEO slug
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// indexes
blogSchema.index({ title: "text", content: "text" });
blogSchema.index({ tags: 1 });
blogSchema.index({ date: -1 });

export default mongoose.model("Blog", blogSchema);
