import { useState, useRef } from 'react';

const D = {
  border:  'rgba(255,255,255,0.08)',
  textPri: '#f0f6fc',
  textSec: '#8b949e',
};

export function compressImage(file, maxDim = 900, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoPick({ photo, onPhoto, color }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try { onPhoto(await compressImage(file)); } catch (err) { console.error('Photo error:', err); }
    setBusy(false);
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
      {photo ? (
        <div style={{ position: 'relative' }}>
          <img src={photo} alt="proof" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 16, display: 'block' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => inputRef.current.click()} style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'rgba(255,255,255,0.06)', color: D.textPri, border: `1px solid ${D.border}`, cursor: 'pointer' }}>↻ Retake</button>
            <button onClick={() => onPhoto(null)} style={{ padding: '10px 16px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>✕ Remove</button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current.click()} disabled={busy} style={{ width: '100%', padding: '22px 0', borderRadius: 16, fontWeight: 700, fontSize: 15, background: 'rgba(255,255,255,0.04)', color: busy ? D.textSec : (color || D.textPri), border: `2px dashed ${D.border}`, cursor: 'pointer' }}>
          {busy ? '⏳ Loading photo...' : '📸 Add a Photo'}
        </button>
      )}
    </div>
  );
}

export function ProofSheet({ chore, color, onSubmit, onClose }) {
  const [photo, setPhoto] = useState(null);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={e => { e.stopPropagation(); onClose(); }}>
      <div style={{ background: '#1a2234', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 520, padding: '24px 20px 40px', border: `1px solid ${D.border}`, boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h3 style={{ color: D.textPri, fontWeight: 900, fontSize: 22, margin: '0 0 4px' }}>Nice work! 🎉</h3>
        <p style={{ color: D.textSec, fontSize: 14, margin: '0 0 16px' }}>Snap a photo of "{chore.title}" so your parent can approve it from anywhere!</p>
        <PhotoPick photo={photo} onPhoto={setPhoto} color={color} />
        <button
          onClick={() => onSubmit(photo)}
          style={{ width: '100%', marginTop: 16, padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 20px ${color}44`, border: 'none', cursor: 'pointer' }}
        >
          {photo ? 'Send with Photo ✓' : 'Send without Photo ✓'}
        </button>
      </div>
    </div>
  );
}
