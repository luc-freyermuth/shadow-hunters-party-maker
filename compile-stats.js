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

function orderObject(o, getKey, sort) {
  return Object.entries(o)
    .sort(([key1, value1], [key2, value2]) => sort(getKey(value1), getKey(value2)))
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
      )
    },
    null,
    2
  )
);

console.log(feedbacks.length);
