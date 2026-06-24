const cheerio = require('cheerio');

const BASE = 'https://www.basketball-reference.com';
const DELAY_MS = 3500;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchHtml(url) {
  await sleep(DELAY_MS);
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const html = await res.text();
  // BBref wraps some tables (inside <div> wrappers) in HTML comments for lazy-loading.
  // Strip any comment that contains actual HTML tags so cheerio can see the tables.
  return html.replace(/<!--([\s\S]*?)-->/g, (match, inner) => {
    return (inner.includes('<table') || inner.includes('<div')) ? inner : match;
  });
}

function playerIdFromHref(href) {
  if (!href) return null;
  return href.split('/').pop().replace('.html', '');
}

// ── Draft picks ────────────────────────────────────────────────────────────────
// Returns [{name, bball_ref_id, draft_pick, draft_team}]
async function scrapeDraft(year) {
  const html = await fetchHtml(`${BASE}/draft/NBA_${year}.html`);
  const $ = cheerio.load(html);

  const players = [];
  $('#stats tbody tr').each((_, row) => {
    const $row = $(row);
    if ($row.hasClass('thead') || $row.hasClass('partial_table')) return;

    const playerEl = $row.find('td[data-stat="player"] a');
    if (!playerEl.length) return;
    const name = playerEl.text().trim();
    if (!name) return;

    const bball_ref_id = playerIdFromHref(playerEl.attr('href'));
    const pick = parseInt($row.find('td[data-stat="pick_overall"]').text()) || null;
    const draft_team = $row.find('td[data-stat="team_id"]').text().trim() || null;

    players.push({ name, bball_ref_id, draft_pick: pick, draft_team });
  });

  if (players.length === 0) throw new Error('No draft picks found — page structure may have changed');
  return players;
}

// ── Per-game season stats ──────────────────────────────────────────────────────
// Returns { bball_ref_id: { games_played, games_started } }
// BBref uses data-stat="name_display" / "games" / "games_started" / "team_name_abbr"
// in their current table format. The bball_ref_id is in data-append-csv on the td.
async function scrapePerGameStats(seasonYear) {
  const html = await fetchHtml(`${BASE}/leagues/NBA_${seasonYear}_per_game.html`);
  const $ = cheerio.load(html);

  const stats = {};
  $('#per_game_stats tbody tr').each((_, row) => {
    const $row = $(row);
    if ($row.hasClass('thead')) return;

    // Try current format first (data-stat="name_display" with data-append-csv id)
    const nameCell = $row.find('td[data-stat="name_display"]');
    let id = nameCell.attr('data-append-csv') || null;

    // Fall back to legacy format (data-stat="player" with href)
    if (!id) {
      const playerEl = $row.find('td[data-stat="player"] a');
      if (playerEl.length) id = playerIdFromHref(playerEl.attr('href'));
    }
    if (!id) return;

    // Current format column names
    const team = $row.find('td[data-stat="team_name_abbr"]').text().trim()
               || $row.find('td[data-stat="team_id"]').text().trim();
    const g = parseInt($row.find('td[data-stat="games"]').text()
                    || $row.find('td[data-stat="g"]').text()) || 0;
    const gs = parseInt($row.find('td[data-stat="games_started"]').text()
                     || $row.find('td[data-stat="gs"]').text()) || 0;

    // For players traded mid-season, BBref shows a "2TM"/"3TM"/TOT row — prefer it
    const isTotals = team === 'TOT' || team === '2TM' || team === '3TM';
    if (stats[id] && (stats[id].isTotals)) return;
    stats[id] = { games_played: g, games_started: gs, team, isTotals };
  });

  return stats;
}

// ── Season awards ──────────────────────────────────────────────────────────────
// Returns { mvp, roy, sixth_man, all_nba: [], all_defense: [], all_rookie: [] }
// BBref table IDs for voting tables changed c.2024:
//   old: #all_nba / #all_defensive / #all_rookie
//   new: #leading_all_nba / #leading_all_defense / #leading_all_rookie
async function scrapeAwards(seasonYear) {
  const html = await fetchHtml(`${BASE}/awards/awards_${seasonYear}.html`);
  const $ = cheerio.load(html);

  // Extract player id from a cell — tries data-append-csv first, then href
  function cellId($td) {
    const csv = $td.attr('data-append-csv');
    if (csv) return csv;
    const a = $td.find('a');
    return a.length ? playerIdFromHref(a.attr('href')) : null;
  }

  // First-place winner from a voting table (MVP, ROY, etc.)
  function firstWinner(tableId) {
    const row = $(`${tableId} tbody tr`).first();
    const id = cellId(row.find('td[data-stat="player"]'));
    return id || null;
  }

  // Top-N from a team-voting table by points_won (All-NBA=15, All-Def=10, All-Rookie=10)
  // Tries both old and new table IDs.
  function teamWinners(newId, oldId, topN) {
    const tableId = $(`#${newId}`).length ? `#${newId}` : `#${oldId}`;
    const rows = [];
    $(`${tableId} tbody tr`).each((_, row) => {
      const id = cellId($(row).find('td[data-stat="player"]'));
      const pts = parseInt($(row).find('td[data-stat="points_won"]').text()) || 0;
      if (id) rows.push({ id, pts });
    });
    // Sort desc by points and take topN — players who made a team have highest votes
    rows.sort((a, b) => b.pts - a.pts);
    return rows.slice(0, topN).map(r => r.id);
  }

  return {
    mvp: firstWinner('#mvp'),
    roy: firstWinner('#roy'),
    sixth_man: firstWinner('#smoy'),
    all_nba: teamWinners('leading_all_nba', 'all_nba', 15),
    all_defense: teamWinners('leading_all_defense', 'all_defensive', 10),
    all_rookie: teamWinners('leading_all_rookie', 'all_rookie', 10),
  };
}

// ── All-Star selections ────────────────────────────────────────────────────────
// Returns [bball_ref_id, ...]  — empty array on failure (format varies by year)
// The All-Star page format has changed over the years; we look for any /players/ links.
async function scrapeAllStars(seasonYear) {
  try {
    const html = await fetchHtml(`${BASE}/allstar/NBA_${seasonYear}.html`);
    const $ = cheerio.load(html);
    const ids = new Set();
    $('a[href*="/players/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/\/players\/\w+\/(\w+)\.html/);
      if (match) ids.add(match[1]);
    });
    return [...ids];
  } catch {
    return [];
  }
}

module.exports = { scrapeDraft, scrapePerGameStats, scrapeAwards, scrapeAllStars };
