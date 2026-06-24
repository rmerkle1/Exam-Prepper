const { parse } = require('csv-parse/sync');

const REQUIRED_FIELDS = ['draft_year', 'rank', 'player_name'];

function parseAndValidateCsv(buffer) {
  let records;
  try {
    records = parse(buffer.toString('utf-8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    throw new Error(`CSV parse error: ${err.message}`);
  }

  if (records.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = Object.keys(records[0]);
  for (const field of REQUIRED_FIELDS) {
    if (!headers.includes(field)) {
      throw new Error(`Missing required column: ${field}`);
    }
  }

  // author_name OR user_id required
  if (!headers.includes('author_name') && !headers.includes('user_id')) {
    throw new Error('CSV must include author_name or user_id column');
  }

  const draftYear = parseInt(records[0].draft_year);
  if (isNaN(draftYear) || draftYear < 1950 || draftYear > 2100) {
    throw new Error(`Invalid draft_year: ${records[0].draft_year}`);
  }

  const authorName = records[0].author_name || records[0].user_id || '';

  const entries = [];
  const seenRanks = new Set();
  const seenPlayers = new Set();
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const lineNum = i + 2; // 1-indexed with header

    const rank = parseInt(row.rank);
    if (isNaN(rank)) {
      errors.push(`Row ${lineNum}: invalid rank "${row.rank}"`);
      continue;
    }
    if (rank > 60) continue; // silently ignore

    if (rank < 1) {
      errors.push(`Row ${lineNum}: rank must be >= 1`);
      continue;
    }

    const playerName = (row.player_name || '').trim();
    if (!playerName) {
      errors.push(`Row ${lineNum}: player_name is empty`);
      continue;
    }

    if (seenRanks.has(rank)) {
      errors.push(`Row ${lineNum}: duplicate rank ${rank}`);
      continue;
    }
    const playerKey = playerName.toLowerCase();
    if (seenPlayers.has(playerKey)) {
      errors.push(`Row ${lineNum}: duplicate player "${playerName}"`);
      continue;
    }

    seenRanks.add(rank);
    seenPlayers.add(playerKey);

    entries.push({
      rank,
      player_name: playerName,
      player_id: row.player_id ? parseInt(row.player_id) || null : null,
      team: row.team || null,
      notes: row.notes || null,
    });
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return { draftYear, authorName, entries };
}

module.exports = { parseAndValidateCsv };
