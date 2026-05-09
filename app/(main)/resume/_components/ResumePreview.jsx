"use client";

import { useRef, useEffect, useState } from "react";
import { RESUME_TEMPLATES } from "./templates";

const A4_WIDTH_PX = 794;

export default function ResumePreview({ values, user: rawUser, templateId = "minimal", forPDF = false }) {
  const user = rawUser ? { ...rawUser, fullName: rawUser.fullName || rawUser.name } : rawUser;
  const SelectedTemplate = RESUME_TEMPLATES[templateId]?.component || RESUME_TEMPLATES.minimal.component;
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (forPDF) return;
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(1, containerWidth / A4_WIDTH_PX);
        setScale(newScale);
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [forPDF]);

  if (forPDF) {
    // Standalone full-A4 render used by the hidden print element
    return (
      <div style={{ width: `${A4_WIDTH_PX}px` }}>
        <SelectedTemplate values={values} user={user} />
      </div>
    );
  }

  return (
    // This is the on-screen preview. id="resume-pdf" is targeted by @media print.
    // The inner scaled div gets transform:none in print CSS so it renders full-size.
    <div id="resume-pdf" ref={containerRef} className="w-full overflow-hidden">
      <div
        className="resume-inner selection:bg-primary/10"
        style={{
          width: `${A4_WIDTH_PX}px`,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          marginBottom: scale < 1 ? `${(A4_WIDTH_PX * 1.414 * scale) - (A4_WIDTH_PX * 1.414)}px` : 0,
        }}
      >
        <SelectedTemplate values={values} user={user} />
      </div>
    </div>
  );
}
