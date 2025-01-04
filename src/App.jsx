import { useState } from 'react'
import './App.css'

function App() {
  const [videoLink, setVideoLink] = useState('');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchTranscript = async () => {
    try {
      setError(null);
      setTranscript('');
      setIsLoading(true);

      const videoId = extractVideoId(videoLink);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const response = await fetch(
        `https://www.searchapi.io/api/v1/youtube/transcript?video_id=${videoId}&api_key=${import.meta.env.VITE_SEARCH_API_KEY}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': 'https://youtube-transcript-omega-lyart.vercel.app',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }

      const data = await response.json();
      
      if (data.transcript) {
        const fullTranscript = data.transcript
          .map(item => item.text)
          .join('\n');
        setTranscript(fullTranscript);
      } else {
        throw new Error('No transcript available for this video');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript).then(() => {
      alert('Transcript copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="container">
      <h1>YouTube Transcript Fetcher</h1>
      <div className="input-section">
        <input
          type="text"
          placeholder="Enter YouTube video link"
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
        />
        <button 
          onClick={fetchTranscript}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Fetch Transcript'}
        </button>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      {transcript && (
        <div className="transcript-box">
          <pre>{transcript}</pre>
          <button onClick={copyToClipboard}>Copy Transcript</button>
        </div>
      )}
    </div>
  )
}

export default App
