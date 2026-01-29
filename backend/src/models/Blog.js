import mongoose from "mongoose";
import slugify from "slugify";

const commentSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: "Guest", maxlength: 60 },
  text: { type: String, trim: true, required: true, maxlength: 1000 },
  date: { type: Date, default: Date.now },
}, { _id: true });

const isValidUrl = (str) => { if (!str) return true; try { new URL(str); return true; } catch { return false; } };

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  image: { type: String, default: "", validate: [isValidUrl, "Invalid image URL"] },
  tags: { type: [String], default: [], set: (arr) => Array.from(new Set((Array.isArray(arr) ? arr : []).map(t => String(t || "").trim().toLowerCase()).filter(Boolean))) },
  date: { type: Date, default: Date.now },
  views: { type: Number, default: 0, min: 0 },
  likes: { type: Number, default: 0, min: 0 },
  comments: { type: [commentSchema], default: [] },
  rating: { type: Number, default: 0, min: 0, max: 5, set: v => Math.round(v * 10)/10 },
  author: { type: String, default: "Admin", trim: true },
  authorImage: { type: String, default: "", validate: [isValidUrl, "Invalid author image URL"] },
  published: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret._id; delete ret.__v; return ret; } } });

blogSchema.pre("save", async function(next){
  if (!this.isModified("title")) return next();
  let baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug, count = 1;
  while(await mongoose.models.Blog.exists({ slug, _id: { $ne: this._id } })) slug = `${baseSlug}-${count++}`;
  this.slug = slug;
  next();
});

blogSchema.virtual("commentCount").get(function(){ return this.comments.length; });
blogSchema.index({ title: "text", content: "text" });
blogSchema.index({ tags: 1 });
blogSchema.index({ date: -1 });

export default mongoose.model("Blog", blogSchema);
