function uniqueFilterBy(generateIdentifier) {
  return (value, index, array) => {
    const valueIdentifier = generateIdentifier(value);
    return (
      array.findIndex(arrayItem => generateIdentifier(arrayItem) === valueIdentifier) === index
    );
  };
}

const mapToObject = mapInstance => {
  const obj = {};
  for (let prop of mapInstance) {
    obj[prop[0]] = prop[1];
  }
  return obj;
};

function orderObject(o, getKey, sort, filter) {
  return Object.entries(o)
    .sort(([key1, value1], [key2, value2]) => sort(getKey(value1), getKey(value2)))
    .filter(([key, item]) => (filter ? filter(item) : true))
    .reduce((obj, [key, value]) => {
      obj[key] = o[key];
      return obj;
    }, {});
}

const fileFolder = './stats/';
const fs = require('fs');
const path = require('path');

const files = fs
  .readdirSync(fileFolder)
  .filter(file => file.endsWith('.json'))
  .filter(file => file !== 'compiled.json');

const allStats = files.map(file => JSON.parse(fs.readFileSync(path.join(fileFolder, file))));

const picks = []
  .concat(...allStats.map(stats => stats.picks))
  .filter(uniqueFilterBy(stat => stat.date));

const mapPicked = new Map();

for (const pick of picks) {
  for (const choice of pick.choices) {
    let mapItem;
    if (mapPicked.has(choice)) {
      mapItem = mapPicked.get(choice);
    } else {
      mapItem = {
        proposed: 0,
        picked: 0
      };
      mapPicked.set(choice, mapItem);
    }

    mapItem.proposed += 1;
    if (pick.pick === choice) {
      mapItem.picked += 1;
    }
  }
}

mapPicked.forEach((item, key) => {
  mapPicked.set(key, {
    ...item,
    pickRate: Math.round((item.picked / item.proposed) * 100) / 100
  });
});

console.log(mapPicked);

const feedbacks = []
  .concat(...allStats.map(stats => stats.feedbacks))
  .filter(uniqueFilterBy(stat => stat.date));

const mapFeedbacks = new Map();

for (const feedback of feedbacks) {
  let mapItem;
  if (mapFeedbacks.has(feedback.pick)) {
    mapItem = mapFeedbacks.get(feedback.pick);
  } else {
    mapItem = {
      played: 0,
      wins: 0,
      funLevels: []
    };
    mapFeedbacks.set(feedback.pick, mapItem);
  }
  mapItem.played++;
  mapItem.wins += feedback.win ? 1 : 0;
  mapItem.funLevels.push(feedback.funLevel);
}

mapFeedbacks.forEach((item, key) => {
  mapFeedbacks.set(key, {
    ...item,
    winRate: Math.round((item.wins / item.played) * 100) / 100,
    averageFun:
      Math.round((item.funLevels.reduce((a, b) => a + b, 0) / item.funLevels.length) * 100) / 100,
    funLevels: undefined
  });
});

console.log(mapToObject(mapFeedbacks));

const mapPlayerWins = new Map();

for (const feedback of feedbacks) {
  let mapItem;
  if (mapPlayerWins.has(feedback.name)) {
    mapItem = mapPlayerWins.get(feedback.name);
  } else {
    mapItem = {
      played: 0,
      wins: 0,
      funLevels: []
    };
    mapPlayerWins.set(feedback.name, mapItem);
  }
  mapItem.played++;
  mapItem.wins += feedback.win ? 1 : 0;
  mapItem.funLevels.push(feedback.funLevel);
}

mapPlayerWins.forEach((item, key) => {
  mapPlayerWins.set(key, {
    ...item,
    winRate: Math.round((item.wins / item.played) * 100) / 100,
    averageFun:
      Math.round((item.funLevels.reduce((a, b) => a + b, 0) / item.funLevels.length) * 100) / 100,
    funLevels: undefined
  });
});

fs.writeFileSync(
  path.join(fileFolder, 'compiled.json'),
  JSON.stringify(
    {
      picks: orderObject(
        mapToObject(mapPicked),
        item => item.pickRate,
        (pickRate1, pickRate2) => pickRate2 - pickRate1
      ),
      feedbacks: orderObject(
        mapToObject(mapFeedbacks),
        item => item.winRate,
        (a, b) => b - a
      ),
      feedbacksByFun: orderObject(
        mapToObject(mapFeedbacks),
        item => item.averageFun,
        (a, b) => b - a
      ),
      playerWinRate: orderObject(
        mapToObject(mapPlayerWins),
        item => item.winRate,
        (a, b) => b - a,
        item => item.played > 5
      ),
      playerFunLevel: orderObject(
        mapToObject(mapPlayerWins),
        item => item.averageFun,
        (a, b) => b - a,
        item => item.played > 5
      )
    },
    null,
    2
  )
);

console.log(feedbacks.length);

const games = feedbacks.reduce((games, feedback) => {
  const game = games.find(g => {
    return Math.abs(new Date(g.date) - new Date(feedback.date)) < 1000 * 60 * 10;
  });

  if (!game) {
    return [...games, { date: feedback.date, feedbacks: [feedback] }];
  }

  game.feedbacks.push(feedback);
  return games;
}, []);

console.log(games);
console.log(games.length);

function getTeam(character) {
  const firstLetter = character.charAt(0);

  switch (firstLetter) {
    case 'A':
    case 'B':
    case 'C':
    case 'D':
      return 'neutral';
    case 'G':
    case 'F':
    case 'E':
      return 'hunter';
    case 'M':
    case 'L':
    case 'V':
      return 'shadow';
  }
}

function getPlayerStatsTogether(player1, player2) {
  const gamesTogether = games.filter(game => {
    const p1 = game.feedbacks.find(fb => fb.name === player1);
    const p2 = game.feedbacks.find(fb => fb.name === player2);

    if (!p1 || !p2) return false;

    return (
      getTeam(p1.pick) === getTeam(p2.pick) && getTeam(p1.pick) !== 'neutral' && p1.win === p2.win
    );
  });

  //   console.log(gamesTogether.filter(game => game.feedbacks.find(fb => fb.name === player1).win));
  //   console.log('together', gamesTogether);

  const played = gamesTogether.length;
  const wins = gamesTogether
    .map(game => game.feedbacks.find(fb => fb.name === player1))
    .filter(fb => fb.win).length;

  return { played, wins, ratio: wins / played };
}

const players = Object.keys(
  orderObject(
    mapToObject(mapPlayerWins),
    item => item.winRate,
    (a, b) => b - a,
    item => item.played > 4
  )
);

console.log(players);

const allStatsTogether = [
  [, ...players],
  ...players.map(player1 => [
    player1,
    ...players.map(player2 => {
      const result = getPlayerStatsTogether(player1, player2);
      if (player1 === player2) return '';
      if ((!result.ratio && result.ratio !== 0) || result.played === 0) return '';
      return Math.floor(result.ratio * 100) + '%';
      //   return result.played;
    })
  ])
];

delete console.table;
require('console.table');

console.table(allStatsTogether);
