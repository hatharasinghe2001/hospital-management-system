import { useState } from "react";
import HeroIllustration from "./HeroIllustration";
import "./HeroVideo.css";

// Put the video file at frontend/public/videos/hospital-hero.mp4 (optionally a .webm next to it).
const VIDEO_MP4 = "/videos/hospital-hero.mp4";
const VIDEO_WEBM = "/videos/hospital-hero.webm";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// Looping, muted hero video for the homepage. Falls back to the SVG illustration when the
// video file is missing/unsupported or the visitor has asked for reduced motion.
export default function HeroVideo() {
  const [failed, setFailed] = useState(false);
  const [reducedMotion] = useState(prefersReducedMotion);

  if (failed || reducedMotion) {
    return <HeroIllustration />;
  }

  return (
    <div className="hero-video">
      <video
        className="hero-video__media"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Doctors and nurses caring for patients in a modern hospital"
        onError={() => setFailed(true)}
      >
        {/* The browser tries each source in order; an error on the last one means none worked. */}
        <source src={VIDEO_WEBM} type="video/webm" />
        <source src={VIDEO_MP4} type="video/mp4" onError={() => setFailed(true)} />
      </video>
      <div className="hero-video__overlay" aria-hidden="true" />
    </div>
  );
}
