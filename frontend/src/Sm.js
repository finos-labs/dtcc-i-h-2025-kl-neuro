import React, { useState } from 'react';

function DappGenerator() {
  const [contractAddress, setContractAddress] = useState('');
  const [abi, setAbi] = useState('');
  const [loading, setLoading] = useState(false); // <-- loading state

  const handleGenerate = async () => {
    if (!contractAddress || !abi) {
      alert('Provide both contract address and ABI!');
      return;
    }

    setLoading(true);  // start loading

    try {
      const res = await fetch('http://127.0.0.1:5000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abi: abi,
          address: contractAddress
        })
      });

      const result = await res.json();

      if (res.ok) {
        window.open(result.url, '_blank');
      } else {
        alert('Failed to generate DApp page.');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleJsonFileUpload = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.abi) {
          setAbi(JSON.stringify(json.abi));
        } else {
          alert('ABI field not found in uploaded JSON.');
        }
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    fileReader.readAsText(e.target.files[0]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-800">⚙️ DApp HTML Generator</h1>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contract Address</label>
          <input
            type="text"
            placeholder="0x..."
            className="border border-gray-300 focus:ring-2 focus:ring-green-500 rounded-lg px-4 py-2 w-full"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload ABI JSON File</label>
          <input
            type="file"
            accept=".json"
            onChange={handleJsonFileUpload}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        <button
          className={`w-full ${
            loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          } text-white font-semibold py-3 rounded-xl shadow-lg transition duration-300`}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? '🔄 Generating...' : '🚀 Generate DApp Page'}
        </button>
      </div>
    </div>
  );
}

export default DappGenerator;
