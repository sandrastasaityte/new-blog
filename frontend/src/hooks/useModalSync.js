// src/hooks/useModalSync.js
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useModalSync(posts = []) {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState(null);
  const openedFromUrlRef = useRef(false);

  /* ---------------- Sync URL → Modal ---------------- */
  useEffect(() => {
    if (!posts.length) return; // ⬅ wait until posts exist

    const sp = new URLSearchParams(location.search);
    const openId = sp.get("open");

    if (!openId) {
      openedFromUrlRef.current = false;
      setSelectedId(null);
      return;
    }

    const id = decodeURIComponent(openId).trim();
    const exists = posts.some(
      (p) => String(p._id ?? p.id) === id
    );

    if (exists) {
      openedFromUrlRef.current = true;
      setSelectedId(id);
    } else {
      // invalid id → clean URL
      sp.delete("open");
      navigate(
        `/blogs${sp.toString() ? `?${sp}` : ""}`,
        { replace: true }
      );
    }
  }, [location.search, posts, navigate]);

  /* ---------------- Close Modal ---------------- */
  const closeModal = useCallback(() => {
    openedFromUrlRef.current = false;
    setSelectedId(null);

    const sp = new URLSearchParams(location.search);
    if (!sp.has("open")) return;

    sp.delete("open");
    navigate(
      `/blogs${sp.toString() ? `?${sp}` : ""}`,
      { replace: true }
    );
  }, [location.search, navigate]);

  /* ---------------- Open Modal ---------------- */
  const openPost = useCallback(
    (post) => {
      const id = post?._id ?? post?.id;
      if (!id) return;

      const sp = new URLSearchParams(location.search);
      sp.set("open", id);

      openedFromUrlRef.current = false;
      setSelectedId(id);

      // ⬅ push history instead of replace
      navigate(`/blogs?${sp.toString()}`);
      return id;
    },
    [location.search, navigate]
  );

  return {
    selectedId,
    openPost,
    closeModal,
    openedFromUrlRef
  };
}
