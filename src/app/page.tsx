'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    setImageUrl('');

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setImageUrl(data.imageUrl);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray">
      <h1 className="text-3xl font-bold mb-4">AI Image Generator</h1>
      <div className="w-full max-w-md space-y-4">
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={generateImage}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Generated"
            className="mt-4 w-full rounded-md shadow"
          />
        )}
      </div>
    </main>
  );
}