// src/hooks/useModalSync.js
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ----------------- Hook to sync modal with URL -----------------
export function useModalSync(posts) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const openedFromUrlRef = useRef(false);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const openId = sp.get("open");

    if (openId) {
      const id = decodeURIComponent(openId).trim();
      const post = posts.find((p) => String(p._id ?? p.id) === id);
      if (post) {
        openedFromUrlRef.current = true;
        setSelectedId(id);
      }
    } else {
      openedFromUrlRef.current = false;
      setSelectedId(null);
    }
  }, [location.search, posts]);

  const closeModal = useCallback(() => {
    setSelectedId(null);
    const sp = new URLSearchParams(location.search);
    if (sp.has("open")) {
      sp.delete("open");
      const next = sp.toString();
      navigate(`/blogs${next ? `?${next}` : ""}`, { replace: true });
    }
  }, [location.search, navigate]);

  const openPost = useCallback(
    (post) => {
      const id = post._id ?? post.id;
      if (!id) return;
      const sp = new URLSearchParams(location.search);
      sp.set("open", id);
      navigate(`/blogs?${sp.toString()}`, { replace: true });
      setSelectedId(id);
      return id;
    },
    [location.search, navigate]
  );

  return { selectedId, openPost, closeModal, openedFromUrlRef };
}
