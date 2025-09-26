"use client";
import React from "react";
import Lottie from "lottie-react";
import CoffeeLoadingJSON from "./coffee-loading.json";

type CoffeeLoadingProps = {
  visible: boolean;
};

export default function CoffeeLoading({ visible }: CoffeeLoadingProps) {
  if (!visible) return null;

  return (
    <div style={overlayStyle}>
      <div style={animationWrapperStyle}>
        <Lottie animationData={CoffeeLoadingJSON} loop={true} autoplay />
      </div>
    </div>
  );
}

// Styles as objects (or use CSS classes)
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(26, 14, 5, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999, // make sure it's on top
};

const animationWrapperStyle: React.CSSProperties = {
  width: "200px",
  height: "200px",
};
