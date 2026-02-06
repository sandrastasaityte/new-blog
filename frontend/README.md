frontend/
├─ package.json
├─ vite.config.js
├─ vercel.json
├─ public/
│   └─ ... static assets like favicon, images ...
│
├─ src/
│   ├─ main.jsx
│   ├─ App.jsx
│
│   ├─ lib/
│   │   ├─ env.js
│   │   ├─ api.js
│   │   ├─ authApi.js
│   │   ├─ blogApi.js
│   │   └─ postsStorage.js
│
│   ├─ hooks/
│   │   └─ useModalSync.js
│
│   ├─ Context/
│   │   ├─ PostsContext.jsx
│   │   └─ postStorage.js
│
│   ├─ Components/
│   │   ├─ Navbar/
│   │   │   ├─ Navbar.jsx
│   │   │   └─ Navbar.css
│   │   │
│   │   ├─ Footer/
│   │   │   ├─ Footer.jsx
│   │   │   └─ Footer.css
│   │   │
│   │   ├─ Home/
│   │   │   ├─ Home.jsx
│   │   │   └─ Home.css
│   │   │
│   │   ├─ Blogs/
│   │   │   ├─ Blogs.jsx
│   │   │   ├─ Blogs.css              # NEW
│   │   │   ├─ BlogCard.jsx
│   │   │   ├─ BlogForm.jsx
│   │   │   ├─ Pagination.jsx
│   │   │   ├─ BlogModal.jsx 
│   │   │   ├─ BlogCard.css
│   │   │   ├─ BlogForm.css
│   │   │   ├─ Pagination.css
│   │   │   └─ BlogModal.css          # NEW
│   │   │
│   │   ├─ BlogDetails/
│   │   │   ├─ BlogDetails.jsx
│   │   │   └─ BlogDetails.css
│   │   │
│   │   ├─ AddBlog/
│   │   │   ├─ AddBlog.jsx
│   │   │   └─ AddBlog.css
│   │   │
│   │   ├─ About/
│   │   │   ├─ About.jsx
│   │   │   └─ About.css
│   │   │
│   │   ├─ Contact/
│   │   │   ├─ Contact.jsx
│   │   │   └─ Contact.css
│   │   │
│   │   ├─ Auth/
│   │   │   ├─ AuthForm.jsx
│   │   │   ├─ AuthModal.jsx
│   │   │   ├─ Auth.css
│   │   │   └─ AuthForm.css
│   │   │
│   │   ├─ Login/
│   │   │   ├─ Login.jsx
│   │   │   └─ Login.css
│   │   │
│   │   ├─ SignUp/
│   │   │   ├─ SignUp.jsx
│   │   │   └─ SignUp.css
│   │   │
│   │   ├─ Sidebar/
│   │   │   ├─ Sidebar.jsx
│   │   │   └─ Sidebar.css
│   │   │
│   │   ├─ CommentSection/
│   │   │   ├─ CommentSection.jsx
│   │   │   └─ CommentSection.css
│   │   │
│   │   └─ ProtectedRoute.jsx
│
│   ├─ assets/
│   │   ├─ blogsData.json
│   │   └─ authors.js
|___env.local

