const storage = {
  async get(key) { try { const v = localStorage.getItem(key); return v === null ? null : { key, value: v }; } catch { return null; } },
  async set(key, value) { try { localStorage.setItem(key, value); return { key, value }; } catch { return null; } },
  async delete(key) { try { localStorage.removeItem(key); return { key, deleted: true }; } catch { return null; } },
};
export default storage;
