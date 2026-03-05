import fs from "fs";
import Parser from "rss-parser";
import fetch from "node-fetch";

const parser = new Parser();

// NHL RSS feed
const feedUrl = "https://nhltradetalk.com/feed";

// Example NHL API endpoint for scores (JSON, public CORS allowed):
const gamesApiUrl = "https://statsapi.web.nhl.com/api/v1/schedule?date=" + new Date().toISOString().slice(0,10);

async function fetchHeadlines() {
    const feed = await parser.parseURL(feedUrl);
    // top 3 headlines
    return feed.items.slice(0,3).map(i => ({title: i.title, link: i.link}));
}

async function fetchGames() {
    const res = await fetch(gamesApiUrl);
    const json = await res.json();

    if (!json.dates || json.dates.length === 0) return [];

    const games = json.dates[0].games.map(game => {
        const home = game.teams.home.team.name;
        const away = game.teams.away.team.name;
        const homeScore = game.teams.home.score;
        const awayScore = game.teams.away.score;
        const status = game.status.detailedState; // "Scheduled", "In Progress", "Final"
        const time = game.gameDate.slice(11,16); // HH:MM
        return {home, away, homeScore, awayScore, status, time};
    });

    return games;
}

async function main() {
    const headlines = await fetchHeadlines();
    const games = await fetchGames();

    const data = { headlines, games };

    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
    console.log("Updated data.json");
}

main();