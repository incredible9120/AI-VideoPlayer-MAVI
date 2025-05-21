import React from "react";
import VideoPlayer from "./VideoPlayer";
import AnalyzeModal from "./AnalyzeModal";

function App() {
  return (
    <div className="min-h-screen bg-white p-6 w-full text-center">
      <h1 style={{ fontSize: "2rem", marginLeft: "50px" }}>
        AI-Powered Video Analysis and Description
      </h1>
      <VideoPlayer />
    </div>
  );
}

export default App;
