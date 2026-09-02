const HOME_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRUVI1ApUTfIJgRT_itgwKts9UySXToy3pMMwSfxg131Ndkgx10AISs3AkluYz0EO1Xe46SnEbyaUGM/pub?gid=735900231&single=true&output=csv";
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
  renderTopFive("topPoints", "pts");
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


const homeTab = document.getElementById("homeTab");
const leaderboardTab = document.getElementById("leaderboardTab");
const profileTab = document.getElementById("profileTab");
const homeView = document.getElementById("homeView");
const leaderboardView = document.getElementById("leaderboardView");
const profileView = document.getElementById("profileView");
const playerSelect = document.getElementById("playerSelect");
const profilePhoto = document.getElementById("profilePhoto");
const profilePhotoFallback = document.getElementById("profilePhotoFallback");
const profilePhotoNote = document.getElementById("profilePhotoNote");

function setView(view) {
  const valid = ["home", "leaderboard", "profile"];
  if (!valid.includes(view)) view = "home";

  homeView.hidden = view !== "home";
  leaderboardView.hidden = view !== "leaderboard";
  profileView.hidden = view !== "profile";

  homeView.classList.toggle("active-view", view === "home");
  leaderboardView.classList.toggle("active-view", view === "leaderboard");
  profileView.classList.toggle("active-view", view === "profile");

  [homeTab, leaderboardTab, profileTab].forEach(tab => {
    const tabView = tab === homeTab ? "home" : tab === leaderboardTab ? "leaderboard" : "profile";
    const active = tabView === view;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  document.querySelectorAll("[data-view-link]").forEach(link => {
    link.classList.toggle("active", link.dataset.viewLink === view);
  });

  if (view === "profile") {
    if (!playerSelect.value && players.length) {
      playerSelect.value = rankedPlayers()[0]?.player || players[0].player;
    }
    renderProfile(playerSelect.value);
    history.replaceState(null, "", "#player-profile");
  } else if (view === "leaderboard") {
    history.replaceState(null, "", "#leaderboard");
  } else {
    history.replaceState(null, "", "#home");
  }
}

function populatePlayerSelect() {
  const selected = playerSelect.value;
  const sorted = [...players].sort((a, b) => a.player.localeCompare(b.player));
  playerSelect.innerHTML = sorted.map(p =>
    `<option value="${escapeHTML(p.player)}">${escapeHTML(p.player)}</option>`
  ).join("");

  const defaultName = sorted.some(p => p.player === selected)
    ? selected
    : (rankedPlayers()[0]?.player || sorted[0]?.player || "");

  playerSelect.value = defaultName;
  renderProfile(defaultName);
}

function photoCandidates(playerName) {
  const rawNames = [
    playerName,
    playerName.replace(/\s+/g, "_"),
    playerName.replace(/\s+/g, "-")
  ];
  const names = [...new Set(rawNames)];
  const folders = ["assets/players", "assets/icons/players"];
  const exts = ["png", "jpg", "jpeg", "webp"];
  const urls = [];

  for (const folder of folders) {
    for (const name of names) {
      for (const ext of exts) {
        urls.push(`${folder}/${encodeURIComponent(name)}.${ext}`);
      }
    }
  }
  return urls;
}

function loadProfilePhoto(playerName) {
  const candidates = photoCandidates(playerName);
  let index = 0;

  profilePhoto.hidden = true;
  profilePhoto.removeAttribute("src");
  profilePhotoFallback.hidden = false;
  profilePhotoFallback.textContent = playerName
    ? playerName.split(/\s+/).map(part => part[0]).join("").slice(0, 3).toUpperCase()
    : "FFL";
  profilePhotoNote.hidden = true;

  const tryNext = () => {
    if (index >= candidates.length) {
      profilePhoto.hidden = true;
      profilePhotoFallback.hidden = false;
      profilePhotoNote.hidden = false;
      return;
    }
    profilePhoto.src = candidates[index++];
  };

  profilePhoto.onload = () => {
    profilePhoto.hidden = false;
    profilePhotoFallback.hidden = true;
    profilePhotoNote.hidden = true;
  };
  profilePhoto.onerror = tryNext;
  tryNext();
}


function renderProfileBadges(p) {
  const badgeWrap = document.getElementById("profileBadges");
  if (!badgeWrap || !players.length) return;

  const maxPts = Math.max(...players.map(x => x.pts));
  const maxGoals = Math.max(...players.map(x => x.goals));
  const maxAssists = Math.max(...players.map(x => x.assists));
  const maxTotw = Math.max(...players.map(x => x.totw));
  const maxPotw = Math.max(...players.map(x => x.potw));
  const maxGoalsPerApp = Math.max(...players.map(x => Number(x.goalsPerApp) || 0));
  const maxAssistsPerApp = Math.max(...players.map(x => Number(x.assistsPerApp) || 0));
  const maxGoalInvolvementPerApp = Math.max(...players.map(x => Number(x.goalInvolvementPerApp) || 0));

  const badges = [];
  if (p.pts === maxPts && maxPts > 0) badges.push({ label: "Points Leader", cls: "badge-points" });
  if (p.goals === maxGoals && maxGoals > 0) badges.push({ label: "Top Goal Scorer", cls: "badge-goals" });
  if (p.assists === maxAssists && maxAssists > 0) badges.push({ label: "Top Assist", cls: "badge-assists" });
  if ((Number(p.goalsPerApp) || 0) === maxGoalsPerApp && maxGoalsPerApp > 0) badges.push({ label: "Top Goals Per App", cls: "badge-goals-app" });
  if ((Number(p.assistsPerApp) || 0) === maxAssistsPerApp && maxAssistsPerApp > 0) badges.push({ label: "Top Assists Per App", cls: "badge-assists-app" });
  if ((Number(p.goalInvolvementPerApp) || 0) === maxGoalInvolvementPerApp && maxGoalInvolvementPerApp > 0) badges.push({ label: "Top Goal Involvement Per App", cls: "badge-gi-app" });
  if (p.totw === maxTotw && maxTotw > 0) badges.push({ label: "Most TOTW", cls: "badge-totw" });
  if (p.potw === maxPotw && maxPotw > 0) badges.push({ label: "Most POTW", cls: "badge-potw" });

  badgeWrap.innerHTML = badges
    .map(b => `<span class="achievement-pill ${b.cls}">${b.label}</span>`)
    .join("");
}

function renderProfile(playerName) {
  if (!players.length || !playerName) return;
  const p = players.find(player => player.player === playerName);
  if (!p) return;

  const ranking = rankedPlayers();
  const rank = ranking.findIndex(player => player.player === p.player) + 1;

  document.getElementById("profileName").textContent = p.player;
  document.getElementById("profileRank").textContent = rank > 0 ? `League rank #${rank}` : "League rank —";
  renderProfileBadges(p);

  document.getElementById("profilePts").textContent = p.pts;
  document.getElementById("profileGoals").textContent = p.goals;
  document.getElementById("profileAssists").textContent = p.assists;
  document.getElementById("profileTotw").textContent = p.totw;
  document.getElementById("profilePotw").textContent = p.potw;
  document.getElementById("profileApps").textContent = p.apps;
  document.getElementById("profileGoalApp").textContent = formatValue(p.goalsPerApp, "goalsPerApp");
  document.getElementById("profileAssistApp").textContent = formatValue(p.assistsPerApp, "assistsPerApp");
  document.getElementById("profileGI").textContent = formatValue(p.goalInvolvementPerApp, "goalInvolvementPerApp");
  document.getElementById("profilePointsApp").textContent = Number(p.pointsPerApp).toFixed(2);
  document.getElementById("profileWinsApp").textContent = Number(p.winsPerApp).toFixed(2);

  loadProfilePhoto(p.player);
}

homeTab.addEventListener("click", () => setView("home"));
leaderboardTab.addEventListener("click", () => setView("leaderboard"));
profileTab.addEventListener("click", () => setView("profile"));
playerSelect.addEventListener("change", event => renderProfile(event.target.value));

document.querySelectorAll("[data-view-link]").forEach(link => {
  link.addEventListener("click", event => {
    const target = link.dataset.viewLink;
    if (["home", "leaderboard", "profile"].includes(target)) {
      event.preventDefault();
      setView(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});

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
    populatePlayerSelect();
    if (location.hash === "#player-profile") setView("profile");
    else if (location.hash === "#leaderboard") setView("leaderboard");
    else setView("home");
    statusEl.textContent = `Live data connected • ${players.length} players`;
    statusEl.classList.add("connected");
  } catch (error) {
    console.error("FFL stats load failed:", error);
    tbody.innerHTML = '<tr><td colspan="11">Live stats could not be loaded. Please refresh shortly.</td></tr>';
    statusEl.textContent = "Live data connection unavailable";
    statusEl.classList.add("error");
  }
}


function homeRowsToMap(rows) {
  const data = {};
  rows.slice(1).forEach(row => {
    const key = String(row[0] || "").trim();
    if (key) data[key] = String(row[1] || "").trim();
  });
  return data;
}

function loadImageWithFallback(img, fallback, src) {
  img.hidden = true;
  fallback.hidden = false;
  if (!src) return;
  img.onload = () => { img.hidden = false; fallback.hidden = true; };
  img.onerror = () => { img.hidden = true; fallback.hidden = false; };
  img.src = src;
}

function renderHome(data) {
  const folder = data["Weekly Folder"] || "assets/weekly/";
  const cleanFolder = folder.endsWith("/") ? folder : `${folder}/`;

  document.getElementById("homeWeek").textContent = data["Current Week"] || "Latest Week";
  document.getElementById("homeDate").textContent = data["Date"] || "—";
  document.getElementById("redScore").textContent = data["Red Score"] || "—";
  document.getElementById("blueScore").textContent = data["Blue Score"] || "—";
  document.getElementById("whiteScore").textContent = data["White Score"] || "—";
  document.getElementById("blackScore").textContent = data["Black Score"] || "—";
  document.getElementById("homePotwName").textContent = data["POTW Player"] || "POTW";

  loadImageWithFallback(
    document.getElementById("homePotwImage"),
    document.getElementById("homePotwFallback"),
    data["POTW Image"] ? cleanFolder + encodeURIComponent(data["POTW Image"]).replaceAll("%2F","/") : ""
  );
  loadImageWithFallback(
    document.getElementById("homeTotwImage"),
    document.getElementById("homeTotwFallback"),
    data["TOTW Image"] ? cleanFolder + encodeURIComponent(data["TOTW Image"]).replaceAll("%2F","/") : ""
  );

  const stories = [1,2].map(i => ({
    title: data[`News ${i} Title`] || "",
    summary: data[`News ${i} Summary`] || "",
    image: data[`News ${i} Image`] || ""
  })).filter(story => story.title || story.summary);

  const newsGrid = document.getElementById("homeNewsGrid");
  if (!stories.length) {
    newsGrid.innerHTML = `<article class="news-card panel news-placeholder"><div><span>FFL News</span><h3>Add your first weekly story</h3><p>Enter a headline and summary in the Home Page Data tab.</p></div></article>`;
  } else {
    newsGrid.innerHTML = stories.map((story, index) => {
      const image = story.image ? `${cleanFolder}${encodeURIComponent(story.image).replaceAll("%2F","/")}` : "";
      return `<article class="news-card panel">
        <div class="news-image">${image ? `<img src="${image}" alt="" onerror="this.parentElement.classList.add('no-image');this.remove()">` : ""}</div>
        <div class="news-copy"><span>FFL News ${String(index+1).padStart(2,"0")}</span><h3>${escapeHTML(story.title || "Latest FFL story")}</h3><p>${escapeHTML(story.summary || "")}</p></div>
      </article>`;
    }).join("");
  }
}

async function loadHomeData() {
  const status = document.getElementById("homeStatus");
  try {
    const response = await fetch(HOME_CSV_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Home data returned ${response.status}`);
    const rows = parseCSV(await response.text());
    const data = homeRowsToMap(rows);
    renderHome(data);
    status.textContent = "Home page connected";
    status.classList.add("connected");
  } catch (error) {
    console.error("FFL home load failed:", error);
    status.textContent = "Publish the Home Page Data tab to connect";
    status.classList.add("error");
  }
}


searchEl.addEventListener("input", event => render(event.target.value));
loadLiveStats();
loadHomeData();
