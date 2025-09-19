import Logo from "@/assets";
import React from "react";

function Loading() {
  return (
    <div className="h-screen w-screen flex flex-col justify-center bg-card">
      <img src={Logo} alt="Logo" className="size-10"/>
      <p>Nafis Dashboard Loading...</p>
    </div>
  );
}

export default Loading;
