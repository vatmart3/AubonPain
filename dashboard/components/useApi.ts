"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiErrorBody } from "@/lib/types";

export type ApiError = ApiErrorBody["error"];

export interface ApiState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  /** Date de la dernière réponse réussie */
  updatedAt: Date | null;
  reload: () => void;
}

const NETWORK_ERROR: ApiError = {
  kind: "network",
  title: "Pas de connexion",
  message: "Le téléphone n'arrive pas à joindre le tableau de bord. Nouvel essai automatique.",
};

/**
 * Chargement d'une route /api avec :
 *  - rafraîchissement périodique (par défaut 60 s),
 *  - relance quand l'écran redevient visible (téléphone déverrouillé),
 *  - conservation des derniers chiffres si un rafraîchissement échoue.
 */
export function useApi<T>(url: string | null, refreshMs = 60_000): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const seq = useRef(0);
  const lastUrl = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!url) return;
    const id = ++seq.current;
    if (lastUrl.current !== url) {
      lastUrl.current = url;
      setError(null);
    }
    setLoading(true);
    try {
      const res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const body = await res.json().catch(() => null);
      if (id !== seq.current) return;
      if (!res.ok || !body || (body as ApiErrorBody).error) {
        setError((body as ApiErrorBody | null)?.error ?? { kind: "http", title: "Erreur", message: `Réponse ${res.status}` });
      } else {
        setData(body as T);
        setError(null);
        setUpdatedAt(new Date());
      }
    } catch {
      if (id === seq.current) setError(NETWORK_ERROR);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void load();
    if (!refreshMs) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, refreshMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, [load, refreshMs]);

  return { data, error, loading, updatedAt, reload: load };
}
