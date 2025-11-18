'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('entrepreneur');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleRegister(e: any) {
    e.preventDefault();
    setMessage(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage(authError.message);
      return;
    }

    const user = authData.user;
    if (!user) {
      setMessage("User not created");
      return;
    }

    await supabase.from('profiles').insert({
      id: user.id,
      full_name: fullName,
      role,
    });

    setMessage("Account created! Redirecting…");
    setTimeout(() => router.push('/dashboard'), 1200);
  }

  return (
    <main className="max-w-md mx-auto pt-20 px-6">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          className="w-full border p-3 rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block font-medium text-sm">Select your role:</label>
        <select
          className="w-full border p-3 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="entrepreneur">Entrepreneur</option>
          <option value="agent">Agent</option>
          <option value="manufacturer">Manufacturer</option>
        </select>

        <button
          type="submit"
          className="w-full py-3 bg-sky-600 text-white rounded font-medium"
        >
          Register
        </button>

        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </main>
  );
}