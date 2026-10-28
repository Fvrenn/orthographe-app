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
      <label>Nouvelles règles par jour
        <select value={S.settings.newRules} onChange={(e) => setSettings({ newRules: Number(e.target.value) })}>
          {[1, 2, 3, 5].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label>Phrases par séance (maximum)
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
      <h2>Rédaction (analyse par IA)</h2>
      <p className="note">
        L&apos;analyse des rédactions utilise l&apos;API Gemini de Google. Crée une clé gratuite sur{" "}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey</a> et colle-la ici.
        Elle reste sur cet appareil (elle n&apos;est pas incluse dans la sauvegarde exportée). Les textes analysés sont envoyés à Google :
        avec l&apos;offre gratuite, Google peut s&apos;en servir pour améliorer ses modèles. N&apos;écris rien de personnel.
      </p>
      <label>Clé d&apos;API Gemini
        <input className="field" type="password" value={S.settings.aiKey} onChange={(e) => setSettings({ aiKey: e.target.value.trim() })}
          autoComplete="off" spellCheck={false} placeholder="AIza…" />
      </label>
      <label>Modèle
        <input className="field" type="text" value={S.settings.aiModel} onChange={(e) => setSettings({ aiModel: e.target.value.trim() || "gemini-2.5-flash" })}
          autoComplete="off" autoCapitalize="none" spellCheck={false} />
      </label>
      <h2>Sauvegarde</h2>
      <p className="note">
        Tes données restent sur cet appareil, dans l&apos;application installée. Sur iPhone, l&apos;application de l&apos;écran d&apos;accueil
        et Safari ne partagent pas leurs données, et <b>supprimer l&apos;icône efface la progression</b>. Les mises à jour, elles, ne l&apos;effacent pas.
        Exporte une sauvegarde de temps en temps (dernière : {S.backupAt ? new Date(S.backupAt).toLocaleDateString("fr-FR") : "jamais"}).
      </p>
      <button className="btn" onClick={doExport}>Exporter la sauvegarde</button>
      <label>Importer une sauvegarde (collé ou fichier)
        <textarea rows={3} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Colle ici le contenu JSON" />
      </label>
      <input ref={file} type="file" accept=".json,application/json" />
      <button className="btn" onClick={doImport}>Importer</button>
      <button className="btn danger" onClick={() => { if (confirm("Effacer toute ta progression ? Cette action est définitive.")) reset(); }}>Tout effacer</button>
      <p className="note">Version 3 · {RULES.length} règles · {Object.keys(ITEMS).length} exercices</p>
    </>
  );
}
