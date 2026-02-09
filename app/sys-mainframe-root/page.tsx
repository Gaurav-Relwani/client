"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Save, Trash2, Terminal, Database, LogOut, Check, X, User, Activity, Siren, Settings } from 'lucide-react';

export default function AdminConsole() {
  const [data, setData] = useState<any>({ 
      settings: { allowedDomain: '', idPattern: '', lockdown: false }, 
      files: [], 
      requests: [], 
      logs: [] 
  });
  const [editSettings, setEditSettings] = useState({ allowedDomain: '', idPattern: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/');
    try {
        const res = await axios.get('http://localhost:5000/admin/data', { headers: { Authorization: `Bearer ${token}` } });
        setData(res.data);
        
        // Only set local edit state once on load
        if (loading) {
            setEditSettings({ 
                allowedDomain: res.data.settings.allowedDomain, 
                idPattern: res.data.settings.idPattern 
            });
        }
        setLoading(false);
    } catch (e) { router.push('/'); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5000/admin/data', { headers: { Authorization: `Bearer ${token}` } });
            // Only update data, not the edit form inputs
            setData((prev: any) => ({
                ...prev,
                files: res.data.files,
                requests: res.data.requests,
                logs: res.data.logs,
                settings: { ...prev.settings, lockdown: res.data.settings.lockdown } 
            }));
        } catch (e) {}
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  const saveFirewallRules = async () => {
      const token = localStorage.getItem('token');
      // Use editSettings for values, current data for lockdown status
      const newSettings = { ...editSettings, lockdown: data.settings.lockdown };
      await axios.post('http://localhost:5000/admin/settings', newSettings, { headers: { Authorization: `Bearer ${token}` } });
      alert("FIREWALL RULES UPDATED");
      fetchData();
  };

  const toggleLockdown = async () => {
      const token = localStorage.getItem('token');
      const newState = !data.settings.lockdown;
      await axios.post('http://localhost:5000/admin/lockdown', { enabled: newState }, { headers: { Authorization: `Bearer ${token}` } });
      // Optimistic update
      setData((prev: any) => ({ ...prev, settings: { ...prev.settings, lockdown: newState } }));
  };

  const handleRequest = async (requestId: string, action: 'Approve' | 'Deny') => {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/admin/approve-request', { requestId, action }, { headers: { Authorization: `Bearer ${token}` } });
      const res = await axios.get('http://localhost:5000/admin/data', { headers: { Authorization: `Bearer ${token}` } });
      setData((prev: any) => ({ ...prev, requests: res.data.requests, logs: res.data.logs }));
  };

  const deleteFile = async (id: any) => {
      if(!confirm("PERMANENTLY DELETE FILE?")) return;
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/admin/delete-file', { id }, { headers: { Authorization: `Bearer ${token}` } });
      setData((prev: any) => ({ ...prev, files: prev.files.filter((f:any) => f.id !== id) }));
  };

  if (loading) return <div className="bg-black h-screen text-green-500 font-mono flex items-center justify-center">INITIALIZING ROOT...</div>;

  const isLockdown = data.settings.lockdown;
  const theme = isLockdown ? 'text-red-500 border-red-500 selection:bg-red-900' : 'text-green-500 border-green-500 selection:bg-green-900';
  const inputTheme = isLockdown ? 'bg-red-900/10 border-red-500 text-red-500 placeholder-red-800' : 'bg-green-900/10 border-green-500 text-green-500 placeholder-green-800';

  return (
    <div className={`scanline-container min-h-screen bg-black font-mono p-4 lg:p-8 transition-colors duration-500 ${theme}`}>
      <header className={`flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-6 gap-4 ${theme}`}>
        <div className="flex items-center gap-4 w-full md:w-auto">
             <div className={`p-3 border ${theme}`}><ShieldAlert size={32} className={isLockdown ? 'animate-pulse' : ''}/></div>
             <div><h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">SYS_ROOT</h1><p className="text-xs opacity-70">{isLockdown ? '⚠ CRITICAL: SYSTEM LOCKDOWN ACTIVE' : 'STATUS: NORMAL OPERATIONS'}</p></div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <button onClick={toggleLockdown} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border font-bold hover:bg-white/10 transition-colors ${isLockdown ? 'bg-red-900/20 animate-pulse' : ''}`}><Siren size={20}/> {isLockdown ? 'LIFT LOCKDOWN' : 'INITIATE LOCKDOWN'}</button>
            <button onClick={() => {localStorage.clear(); router.push('/')}} className="border px-4 py-2 hover:bg-white/10 transition-colors"><LogOut size={20}/></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
              <div className={`border p-5 ${theme}`}>
                  <div className="flex items-center gap-2 border-b pb-2 mb-4 font-bold"><Settings size={18}/> FIREWALL RULES</div>
                  <div className="space-y-4">
                      <div><label className="text-xs opacity-70 block mb-1">STRICT DOMAIN POLICY</label><input type="text" value={editSettings.allowedDomain} onChange={e => setEditSettings({...editSettings, allowedDomain: e.target.value})} className={`w-full p-2 border bg-black outline-none font-mono text-sm ${inputTheme}`}/></div>
                      <div><label className="text-xs opacity-70 block mb-1">ID REGEX PATTERN</label><input type="text" value={editSettings.idPattern} onChange={e => setEditSettings({...editSettings, idPattern: e.target.value})} className={`w-full p-2 border bg-black outline-none font-mono text-sm ${inputTheme}`}/></div>
                      <button onClick={saveFirewallRules} className={`w-full py-2 border font-bold hover:bg-white/10 flex items-center justify-center gap-2 ${theme}`}><Save size={16}/> UPDATE PROTOCOLS</button>
                  </div>
              </div>
              <div className={`border p-5 flex-1 ${theme}`}>
                  <div className="flex items-center gap-2 border-b pb-2 mb-4 font-bold"><User size={18}/> PENDING CLEARANCE</div>
                  <div className="overflow-y-auto max-h-[300px] space-y-3">
                      {data.requests.filter((r:any) => r.status==='Pending').length === 0 && <div className="text-center opacity-50 py-4 text-sm">NO PENDING REQUESTS</div>}
                      {data.requests.filter((r:any) => r.status==='Pending').map((r: any) => (
                          <div key={r.id} className="p-3 border border-current bg-white/5">
                              <div className="flex justify-between items-start mb-2"><span className="font-bold text-sm">{r.username}</span><span className="text-[10px] opacity-70">{new Date(r.requestedAt).toLocaleTimeString()}</span></div>
                              <div className="text-xs mb-3 opacity-80">REQ: <span className="font-bold">{r.department}</span> ({r.duration}m)<br/>REASON: "{r.reason}"</div>
                              <div className="grid grid-cols-2 gap-2">
                                  <button onClick={() => handleRequest(r.id, 'Deny')} className="py-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black flex justify-center items-center transition-colors"><X size={16}/></button>
                                  <button onClick={() => handleRequest(r.id, 'Approve')} className="py-1 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black flex justify-center items-center transition-colors"><Check size={16}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
              <div className={`border p-4 h-[400px] flex flex-col ${theme}`}>
                  <div className="flex items-center gap-2 border-b pb-2 mb-2 font-bold"><Terminal size={16}/> LIVE AUDIT STREAM</div>
                  <div className="overflow-y-auto flex-1 font-xs space-y-1 pr-2">
                      {data.logs.map((log: any) => (
                          <div key={log.id} className="flex gap-4 border-b border-white/5 pb-1 hover:bg-white/5 text-xs">
                              <span className="opacity-50 w-20 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                              <span className={`w-14 shrink-0 font-bold ${log.type === 'ALERT' ? 'text-red-500 animate-pulse' : log.type==='WARN'?'text-yellow-500':'text-blue-500'}`}>{log.type}</span>
                              <span className="flex-1 break-all">{log.message}</span>
                              <span className="opacity-50 w-24 shrink-0 truncate text-right">{log.user}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div className={`border p-4 h-[300px] flex flex-col ${theme}`}>
                   <div className="flex items-center gap-2 border-b pb-2 mb-2 font-bold"><Database size={16}/> ENCRYPTED REPOSITORY ({data.files.length})</div>
                   <div className="overflow-y-auto flex-1 text-xs pr-2">
                       {data.files.map((f: any) => (
                           <div key={f.id} className="grid grid-cols-12 items-center py-2 border-b border-white/10 hover:bg-white/5">
                               <div className="col-span-4 font-bold truncate pr-2">{f.filename}</div>
                               <div className="col-span-3 opacity-70">{f.department}</div>
                               <div className="col-span-3 opacity-50 truncate">{f.owner}</div>
                               <div className="col-span-2 text-right"><button onClick={() => deleteFile(f.id)} className="text-red-500 hover:text-white transition-colors p-1"><Trash2 size={14}/></button></div>
                           </div>
                       ))}
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
}