import React, { useState, useEffect } from "react";
import axios from "axios";

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [videos, setVideos] = useState([]);

  // const fetchVideos = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:3000/api/videos/mine", {
  //       withCredentials: true,
  //     });
  //     setVideos(res.data);
  //   } catch (err) {
  //     console.error("Failed to fetch videos:", err.message);
  //   }
  // };

  // useEffect(() => {
  //   fetchVideos();
  //   const interval = setInterval(fetchVideos, 10000); // auto-refresh every 10s
  //   return () => clearInterval(interval);
  // }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) return setStatus("Please select a video file.");

    const formData = new FormData();
    formData.append("video", file);

    try {
      setStatus("Uploading...");
      const res = await axios.post(
        "http://localhost:3000/api/videos/upload",
        formData,
        {
          withCredentials: true,
        }
      );

      setStatus("✅ Upload successful! Waiting for transcoding...");
      setVideos(res.data.transcodedVideos);
      setFile(null);
      // fetchVideos();
    } catch (error) {
      setStatus(
        "❌ Upload failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "40px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: 10 }}>
        Upload
      </button>
      {status && <p>{status}</p>}

      <hr />
      <h3>Your Videos</h3>
      {videos.length === 0 && <p>No videos yet.</p>}
      <ul>
        {videos.map((video, index) => (
          <li key={index}>
            <a
              href={`http://localhost:3000/api/videos/download/${encodeURIComponent(
                video.transcodedS3Key
              )}`}
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadVideo;
