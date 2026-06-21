"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, MessageSquare, BarChart3, LogOut, Loader2, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      fetch('/api/stats')
        .then(res => res.json())
        .then(res => { setData(res); setLoading(false); });
    }
  }, [auth]);

  if (!auth) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="bg-gray-900/30 border border-gray-800 p-8 rounded-3xl w-full max-w-sm text-center">
          <Lock className="w-12 h-12 mx-auto text-gray-500 mb-6" />
          <input 
            type="password" 
            onChange={(e) => setPass(e.target.value)} 
            placeholder="Şifre" 
            className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white mb-4"
          />
          <button 
            onClick={() => pass === "Emirza120913" ? setAuth(true) : alert("Hatalı!")} 
            className="w-full bg-blue-600 py-4 rounded-xl font-bold mb-4"
          >
            Giriş Yap
          </button>
          <Link href="/" className="flex items-center justify-center text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>
        <button onClick={() => setAuth(false)} className="text-gray-400 hover:text-red-400 text-sm flex items-center">
          <LogOut className="w-4 h-4 mr-1" /> Çıkış Yap
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin w-8 h-8" /></div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/30 border border-gray-800 p-6 rounded-2xl">
              <p className="text-blue-400 flex items-center mb-2"><BarChart3 className="w-4 h-4 mr-2" /> Toplam Ziyaret</p>
              <p className="text-3xl font-bold">{data.totalVisits}</p>
            </div>
            <div className="bg-gray-900/30 border border-gray-800 p-6 rounded-2xl">
              <p className="text-green-400 flex items-center mb-2"><MessageSquare className="w-4 h-4 mr-2" /> Mesaj</p>
              <p className="text-3xl font-bold">{data.messageCount}</p>
            </div>
          </div>

          <section className="bg-gray-900/30 border border-gray-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6">Gelen Mesajlar</h2>
            <div className="space-y-4">
              {data.messages && data.messages.length > 0 ? (
                data.messages.map((msg: any, i: number) => (
                  <div key={i} className="p-5 bg-black/40 rounded-xl border border-gray-800">
                    <p className="text-blue-400 font-bold text-sm mb-1">{msg.email}</p>
                    <p className="text-gray-200">{msg.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz hiç mesaj yok.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}