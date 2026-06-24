const GITHUB_USER = "herizador";

export async function getRepos() {
  console.log("Token cargado:", !!import.meta.env.GITHUB_TOKEN);

  const headers = import.meta.env.GITHUB_TOKEN &&
    import.meta.env.GITHUB_TOKEN !== "undefined" &&
    import.meta.env.GITHUB_TOKEN !== ""
    ? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` }
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
