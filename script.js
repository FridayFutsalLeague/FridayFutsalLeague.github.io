const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRUVI1ApUTfIJgRT_itgwKts9UySXToy3pMMwSfxg131Ndkgx10AISs3AkluYz0EO1Xe46SnEbyaUGM/pub?gid=623646539&single=true&output=csv";

let players = [];
const tbody = document.getElementById("leaderboardBody");
const statusEl = document.getElementById("dataStatus");
const searchEl = document.getElementById("search");

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      if (row.some(value => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some(value => value.trim() !== "")) rows.push(row);
  return rows;
}

function num(value) {
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function rowToPlayer(row) {
  return {
    player: (row[0] || "").trim(),
    apps: num(row[1]),
    pts: num(row[2]),
    wins: num(row[3]),
    draws: num(row[4]),
    goals: num(row[5]),
    assists: num(row[6]),
    cs: num(row[7]),
    totw: num(row[8]),
    potw: num(row[9]),
    goalsPerApp: num(row[10]),
    assistsPerApp: num(row[11]),
    winsPerApp: num(row[12]),
    goalInvolvementPerApp: num(row[13]),
    pointsPerApp: num(row[14])
  };
}

function sortBy(key) {
  return [...players].sort((a, b) =>
    (b[key] - a[key]) ||
    (b.pts - a.pts) ||
    (b.goals - a.goals) ||
    a.player.localeCompare(b.player)
  );
}

function leader(key) {
  return sortBy(key)[0];
}

function setLeader(nameId, valueId, key) {
  const p = leader(key);
  document.getElementById(nameId).textContent = p?.player || "—";
  document.getElementById(valueId).textContent = p ? formatValue(p[key], key) : "—";
}

function renderCards() {
  setLeader("pointsLeader", "pointsLeaderValue", "pts");
  setLeader("goalLeader", "goalLeaderValue", "goals");
  setLeader("assistLeader", "assistLeaderValue", "assists");
  setLeader("potwLeader", "potwLeaderValue", "potw");
  setLeader("totwLeader", "totwLeaderValue", "totw");
}

function rankedPlayers() {
  return [...players].sort((a, b) =>
    (b.pts - a.pts) ||
    (b.goals - a.goals) ||
    (b.assists - a.assists) ||
    a.player.localeCompare(b.player)
  );
}

function formatValue(value, key = "") {
  if (["goalsPerApp", "assistsPerApp", "goalInvolvementPerApp"].includes(key)) {
    return Number(value).toFixed(2);
  }
  return Number.isInteger(value) ? String(value) : String(value);
}

function render(query = "") {
  const top20 = rankedPlayers().slice(0, 20).map((p, index) => ({ ...p, position: index + 1 }));
  const search = query.trim().toLowerCase();
  const rows = top20.filter(p => p.player.toLowerCase().includes(search));

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="11">No players found in the top 20.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(p => `
    <tr>
      <td>${p.position}</td>
      <td>${escapeHTML(p.player)}</td>
      <td>${p.apps}</td>
      <td class="points-cell">${p.pts}</td>
      <td>${formatValue(p.goalsPerApp, "goalsPerApp")}</td>
      <td>${formatValue(p.assistsPerApp, "assistsPerApp")}</td>
      <td>${formatValue(p.goalInvolvementPerApp, "goalInvolvementPerApp")}</td>
      <td>${p.goals}</td>
      <td>${p.assists}</td>
      <td>${p.totw}</td>
      <td>${p.potw}</td>
    </tr>`).join("");
}

function renderTopFive(listId, key) {
  const list = document.getElementById(listId);
  const top = sortBy(key).slice(0, 5);
  list.innerHTML = top.map((p, index) => `
    <li>
      <span class="rank">${index + 1}</span>
      <span class="name">${escapeHTML(p.player)}</span>
      <strong>${formatValue(p[key], key)}</strong>
    </li>`).join("");
}

function renderTopFiveLists() {
  renderTopFive("topGoals", "goals");
  renderTopFive("topAssists", "assists");
  renderTopFive("topTotw", "totw");
  renderTopFive("topPotw", "potw");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadLiveStats() {
  try {
    const response = await fetch(CSV_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Google Sheets returned ${response.status}`);

    const text = await response.text();
    const rows = parseCSV(text);
    if (rows.length < 2) throw new Error("No player rows were returned");

    players = rows
      .slice(1)
      .map(rowToPlayer)
      .filter(p => p.player && p.player.toLowerCase() !== "player");

    if (!players.length) throw new Error("No player data could be read");

    renderCards();
    renderTopFiveLists();
    render(searchEl.value);
    statusEl.textContent = `Live data connected • ${players.length} players`;
    statusEl.classList.add("connected");
  } catch (error) {
    console.error("FFL stats load failed:", error);
    tbody.innerHTML = '<tr><td colspan="11">Live stats could not be loaded. Please refresh shortly.</td></tr>';
    statusEl.textContent = "Live data connection unavailable";
    statusEl.classList.add("error");
  }
}

searchEl.addEventListener("input", event => render(event.target.value));
loadLiveStats();
