const hasNativeStorage = () =>
  typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";

export const storage = {
  async get(key, shared = false) {
    if (hasNativeStorage()) return window.storage.get(key, shared);
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error("Klucz nie istnieje: " + key);
    return { key, value: raw, shared };
  },

  async set(key, value, shared = false) {
    if (hasNativeStorage()) return window.storage.set(key, value, shared);
    localStorage.setItem(key, value);
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    if (hasNativeStorage()) return window.storage.delete(key, shared);
    localStorage.removeItem(key);
    return { key, deleted: true, shared };
  },

  async list(prefix = "", shared = false) {
    if (hasNativeStorage()) return window.storage.list(prefix, shared);
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    return { keys, prefix, shared };
  },
};
