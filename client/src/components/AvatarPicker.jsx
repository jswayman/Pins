import { useState, useRef } from "react";
import S from "./styles";

const DICEBEAR_STYLES = [
  { id: "avataaars",  label: "People",  emoji: "😊" },
  { id: "bottts",     label: "Robots",  emoji: "🤖" },
  { id: "fun-emoji",  label: "Emoji",   emoji: "😜" },
];

const SPORTS_EMOJIS  = ["🏈","🏀","⚽","⚾","🎾","🏒","🏐","🏉","🎱","🥊","🏆","🥇","🎿","🏋️","🤸","🏄","🚴","🎯","🥋","⛷️"];
const ANIMALS_EMOJIS = ["🦁","🐯","🐻","🐼","🦊","🐺","🦅","🦆","🦉","🦈","🐬","🐋","🦖","🐲","🦄","🦝","🦔","🦦","🐸","🐊"];

const EMOJI_STYLES = [
  { id: "sports",  label: "Sports",  emoji: "🏆", items: SPORTS_EMOJIS },
  { id: "animals", label: "Animals", emoji: "🦁", items: ANIMALS_EMOJIS },
];

const ALL_TABS = [
  ...DICEBEAR_STYLES.map(s => ({ ...s, type: "dicebear" })),
  ...EMOJI_STYLES.map(s => ({ ...s, type: "emoji" })),
];

const GRID_SIZE = 20;
const SEED_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
function randomSeed(len = 8) {
  return Array.from({ length: len }, () => SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)]).join("");
}
function makeSeedBatch(n = GRID_SIZE) {
  return Array.from({ length: n }, () => randomSeed());
}
function dicebearUrl(style, seed) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&size=80`;
}

export default function AvatarPicker({ value, onChange, takenAvatars = [] }) {
  const [activeTab, setActiveTab] = useState(ALL_TABS[0].id);
  const [seeds,     setSeeds]     = useState(() => makeSeedBatch());
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef(null);

  const shuffle = () => setSeeds(makeSeedBatch());
  const currentTab = ALL_TABS.find(t => t.id === activeTab) || ALL_TABS[0];
  const isDicebear = currentTab.type === "dicebear";

  const isUrl    = (v) => v?.startsWith("https://") || v?.startsWith("data:");
  const isCustom = (v) => v?.startsWith("data:");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setUploadErr("Image must be under 2 MB."); return; }
    setUploadErr("");
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  const tabBtnStyle = (active) => ({
    padding: "5px 12px", borderRadius: 20,
    border: active ? "1px solid rgba(255,182,18,0.6)" : "1px solid rgba(255,255,255,0.12)",
    background: active ? "rgba(255,182,18,0.12)" : "rgba(255,255,255,0.04)",
    color: active ? "#FFB612" : "rgba(255,255,255,0.55)",
    fontFamily: "'Oswald',sans-serif", fontSize: "0.78rem",
    letterSpacing: "0.05em", cursor: "pointer",
  });

  const avatarBtnStyle = (selected) => ({
    position: "relative", padding: 3, borderRadius: 10, aspectRatio: "1",
    border: selected ? "2px solid #FFB612" : "2px solid rgba(255,255,255,0.08)",
    background: selected ? "rgba(255,182,18,0.1)" : "rgba(255,255,255,0.08)",
    cursor: "pointer", overflow: "hidden",
    transition: "border-color 0.15s, background 0.15s",
  });

  const checkMark = (
    <span style={{
      position: "absolute", bottom: 3, right: 3,
      background: "#FFB612", borderRadius: "50%", width: 16, height: 16,
      fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center",
      color: "#000", fontWeight: 700,
    }}>✓</span>
  );

  return (
    <div>
      {/* Style tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {ALL_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabBtnStyle(activeTab === tab.id)}>
            {tab.emoji} {tab.label}
          </button>
        ))}
        {isDicebear && (
          <button onClick={shuffle} style={{ ...tabBtnStyle(false), marginLeft: "auto" }} title="Generate new avatars">
            🔀 Shuffle
          </button>
        )}
      </div>

      {/* Avatar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
        {isDicebear
          ? seeds.map(seed => {
              const url = dicebearUrl(activeTab, seed);
              const selected = value === url;
              return (
                <button key={seed} onClick={() => onChange(url)} style={avatarBtnStyle(selected)}>
                  <img src={url} alt="" loading="lazy" style={{ width: "100%", height: "100%", display: "block", borderRadius: 7, objectFit: "cover" }} />
                  {selected && checkMark}
                </button>
              );
            })
          : currentTab.items.map(em => {
              const selected = value === em;
              const taken = takenAvatars.includes(em) && !selected;
              return (
                <button
                  key={em} onClick={() => !taken && onChange(em)} disabled={taken}
                  title={taken ? "Already taken" : undefined}
                  style={{
                    ...avatarBtnStyle(selected),
                    background: selected ? "rgba(255,182,18,0.1)" : "rgba(255,255,255,0.03)",
                    cursor: taken ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.6rem", opacity: taken ? 0.25 : 1,
                  }}
                >
                  {em}
                  {selected && checkMark}
                </button>
              );
            })
        }
      </div>

      {/* Upload */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: uploadErr ? 4 : 10 }}>
        <button style={S.uploadBtn} onClick={() => fileRef.current.click()}>
          {isCustom(value) ? "✓ Custom photo selected" : "📷 Upload your own photo"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
        {isCustom(value) && <img src={value} alt="" style={S.uploadPreview} />}
      </div>
      {uploadErr && (
        <div style={{ fontSize: "0.75rem", color: "#e74c3c", marginBottom: 8, fontFamily: "'Oswald',sans-serif" }}>
          {uploadErr}
        </div>
      )}

      {/* Current selection preview */}
      {value && isUrl(value) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(125,187,125,0.08)", border: "1px solid rgba(125,187,125,0.2)", borderRadius: 8 }}>
          <img src={value} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "#7dbb7d", fontFamily: "'Oswald',sans-serif", fontSize: "0.8rem" }}>✓ Avatar selected</span>
        </div>
      )}
      {value && !isUrl(value) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(125,187,125,0.08)", border: "1px solid rgba(125,187,125,0.2)", borderRadius: 8 }}>
          <span style={{ fontSize: "1.8rem" }}>{value}</span>
          <span style={{ color: "#7dbb7d", fontFamily: "'Oswald',sans-serif", fontSize: "0.8rem" }}>✓ Avatar selected</span>
        </div>
      )}
    </div>
  );
}
