const GITHUB_USER = "HeriDev";

export async function getRepos() {
  const token = import.meta.env.GITHUB_TOKEN;
  const tokenValido = token && token !== "undefined" && token !== "";

  const headers = tokenValido
    ? { Authorization: `Bearer ${token}` }
    : {};

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
      { headers }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data
      .filter((repo) => repo.private === false && repo.fork === false)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  } catch {
    return [];
  }
}

export function getTokenStatus() {
  const token = import.meta.env.GITHUB_TOKEN;
  return token && token !== "undefined" && token !== "";
}
