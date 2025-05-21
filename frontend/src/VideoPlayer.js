import React, { useState, useEffect, useRef } from "react";
import "./VideoPlayer.css";
import Modal from "./Modal";
import ListModal from "./ListModal";
import AnalyzeModal from "./AnalyzeModal";
import ReactDOM from "react-dom";

function VideoPlayer() {
  const [videoSrc, setVideoSrc] = useState("");
  const [isFile, setIsFile] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [description, setDescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [topClips, setTopClips] = useState([]);

  const videoRef = useRef(null);
  const urlInputRef = useRef(null);
  const modalInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectURL = URL.createObjectURL(file);
    setVideoSrc(objectURL);
    setIsFile(true);

    const formData = new FormData();
    formData.append("video", file);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/analyzeFile", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleURLInput = async (e) => {
    const url = urlInput.trim();

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert("Please enter a valid URL.");
      return;
    }

    // Check for valid video extension
    const validExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
    const isVideoFile = validExtensions.some((ext) =>
      url.toLowerCase().includes(ext)
    );

    if (!isVideoFile) {
      alert("The URL does not appear to point to a valid video file.");
      return;
    }

    // All checks passed — proceed
    setVideoSrc(url);
    setIsFile(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("url", url);

      const res = await fetch("http://localhost:5000/analyzeURL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: formData,
      });

      const data = await res.json();
      console.log("URL analysis result:", data);
      setAnalysis(data);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl + G to open/save modal

    if (e.ctrlKey && e.key.toLowerCase() === "g") {
      e.preventDefault();
      if (!showModal) {
        if (videoRef.current) videoRef.current.pause();
        setShowModal(true);
        setTopicInput("");
        setTimeout(() => modalInputRef.current?.focus(), 100);
      } else {
        handleSaveTopic();
      }
    }
    // if (e.code === "Space" || e.key === " ") {
    //   e.preventDefault(); // Prevent page from scrolling
    //   if (videoRef.current) {
    //     if (videoRef.current.paused) {
    //       videoRef.current.play();
    //     } else {
    //       videoRef.current.pause();
    //     }
    //   }
    // }
  };

  const handleSaveTopic = async () => {
    if (!topicInput.trim()) return;

    try {
      console.log(topicInput);
      const res = await fetch("http://localhost:5000/topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: topicInput,
          timestamp: videoRef.current?.currentTime || 0,
        }),
      });

      if (!res.ok) {
        console.error("Failed to send topic");
      }
      const data = await res.json();
      console.log("Top 5 clips:", data.topVideos);

      // Example: update state or UI
      setTopClips(data.topVideos);
    } catch (err) {
      console.error("Error sending topic:", err);
    }

    setShowModal(false);
    setTopicInput("");
  };

  const handleCurrentDescribe = async () => {
    try {
      const res = await fetch("http://localhost:5000/describe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: videoRef.current?.currentTime || 0,
        }),
      });

      if (!res.ok) {
        console.error("Failed to send topic");
      }
      const response = await res.json();
      setDescription(response);
    } catch (err) {
      console.error("Error sending topic:", err);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="video-player-container">
      <h2>Video Player</h2>

      <div className="input-group">
        <label>Upload Local Video:</label>
        <input type="file" accept="video/*" onChange={handleFileUpload} />
      </div>

      <div className="input-group">
        <label>Or paste video URL:</label>
        <input
          ref={urlInputRef}
          type="text"
          placeholder="https://example.com/video.mp4"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleURLInput();
            }
          }}
        />
        <small>Press Enter to load and analyze the video.</small>
      </div>

      {videoSrc && (
        <video
          ref={videoRef}
          controls
          src={videoSrc}
          onPause={() => {
            handleCurrentDescribe(videoRef.current.currentTime);
          }}
          onPlay={() => {
            setDescription(null);
          }}
        />
      )}

      {loading && <p className="loading-message">Analyzing video...</p>}

      {description && (
        <div className="description-result">
          <h4>Description:</h4>
          <pre>{description}</pre>
        </div>
      )}
      {analysis &&
        ReactDOM.createPortal(
          <AnalyzeModal onClose={() => setAnalysis(null)}>
            <h4 className="text-lg font-semibold mb-4">Analysis Result:</h4>
            <h5 className="text-lg font-semibold mb-4">{analysis}</h5>
          </AnalyzeModal>,
          document.body
        )}

      {showModal && (
        <Modal
          value={topicInput}
          setValue={setTopicInput}
          onSave={handleSaveTopic}
          onClose={() => setShowModal(false)}
        />
      )}
      {Array.isArray(topClips) && topClips.length > 0 && (
        <ListModal onClose={() => setTopClips([])}>
          <h3>Top 5 Matching Clips</h3>
          <ul>
            {topClips.map((clip, idx) => (
              <li
                key={idx}
                style={{ cursor: "pointer", marginBottom: "10px" }}
                onClick={() => {
                  videoRef.current.currentTime = parseFloat(
                    clip.fragmentStartTime
                  );
                  videoRef.current.play();
                  setTopClips([]); // Close the modal
                }}
              >
                ▶️ Clip {idx + 1}: {clip.fragmentStartTime}s -{" "}
                {clip.fragmentEndTime}s
              </li>
            ))}
          </ul>
        </ListModal>
      )}
    </div>
  );
}

export default VideoPlayer;
