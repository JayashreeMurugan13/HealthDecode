"use client";

import { useState } from 'react';

export default function DebugAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');

  const testLogin = async () => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.text();
      setResult(`Status: ${res.status}\nResponse: ${data}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const checkUsers = async () => {
    try {
      const res = await fetch('/api/test');
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Debug Auth</h1>
      
      <div className="space-y-4">
        <input 
          className="w-full p-2 border rounded"
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          className="w-full p-2 border rounded"
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <div className="space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={testLogin}>Test Login</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={checkUsers}>Check Users</button>
        </div>
        
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
          {result}
        </pre>
      </div>
    </div>
  );
}