"use client";
import { useRef, useState } from "react";
import { ITEMS, RULES } from "@/lib/rules";
import { useApp } from "@/lib/store";
import type { Mode } from "@/lib/types";

export default function Reglages() {
  const { S, setSettings, exportJson, importJson, reset, notify } = useApp();
  const [txt, setTxt] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const data = exportJson();
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
      a.download = `ortho-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch { /* téléchargement indisponible */ }
    navigator.clipboard?.writeText(data).catch(() => {});
    notify("Sauvegarde exportée (fichier et presse-papiers).");
  };
  const doImport = async () => {
    const f = file.current?.files?.[0];
    importJson(f ? await f.text() : txt);
  };

  return (
    <>
      <h1>Réglages</h1>
      <label>Nouvelles cartes par jour
        <select value={S.settings.newPerDay} onChange={(e) => setSettings({ newPerDay: Number(e.target.value) })}>
          {[4, 8, 12, 20].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label>Cartes par séance (maximum)
        <select value={S.settings.sessionMax} onChange={(e) => setSettings({ sessionMax: Number(e.target.value) })}>
          {[10, 25, 40].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label>Mode de réponse
        <select value={S.settings.mode} onChange={(e) => setSettings({ mode: e.target.value as Mode })}>
          <option value="saisie">Écrire la réponse (recommandé)</option>
          <option value="boutons">Boutons (plus rapide, moins efficace)</option>
        </select>
      </label>
      <h2>Sauvegarde</h2>
      <p className="note">Tes données restent sur cet appareil. Fais une sauvegarde de temps en temps.</p>
      <button className="btn" onClick={doExport}>Exporter la sauvegarde</button>
      <label>Importer une sauvegarde (collé ou fichier)
        <textarea rows={3} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Colle ici le contenu JSON" />
      </label>
      <input ref={file} type="file" accept=".json,application/json" />
      <button className="btn" onClick={doImport}>Importer</button>
      <button className="btn danger" onClick={() => { if (confirm("Effacer toute ta progression ? Cette action est définitive.")) reset(); }}>Tout effacer</button>
      <p className="note">Version 2 (Next.js) · {RULES.length} règles · {Object.keys(ITEMS).length} exercices</p>
    </>
  );
}
