"use client";

import { useEffect, useState } from 'react';

export default function TestDashboard() {
  const [authData, setAuthData] = useState<any>(null);

  useEffect(() => {
    const token = document.cookie.includes('auth_token');
    const user = localStorage.getItem('user');
    
    setAuthData({
      hasToken: token,
      hasUser: !!user,
      user: user ? JSON.parse(user) : null
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">✅ Login Successful!</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Auth Status:</h2>
        <pre>{JSON.stringify(authData, null, 2)}</pre>
      </div>
      
      <div className="mt-8 p-4 bg-green-50 rounded">
        <h2 className="text-xl font-bold mb-4">Welcome to HealthDecode!</h2>
        <p>You are successfully logged in.</p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-white rounded shadow">📊 Dashboard</div>
          <div className="p-3 bg-white rounded shadow">📋 Upload Reports</div>
          <div className="p-3 bg-white rounded shadow">🤖 AI Chatbot</div>
          <div className="p-3 bg-white rounded shadow">📈 Health Metrics</div>
        </div>
      </div>
    </div>
  );
}