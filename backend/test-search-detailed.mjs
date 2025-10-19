import * as turf from '@turf/turf';

// Test data from the user
const staffProfile = {
  pickupLatitude: 6.845646827018849,
  pickupLongitude: 79.94749726034782,
  workLatitude: 6.917970747810977,
  workLongitude: 79.87814610451211
};

const childProfile1 = {
  pickupLatitude: 6.820868796199874,
  pickupLongitude: 79.93677382646031,
  schoolLatitude: 6.901588866438829,
  schoolLongitude: 79.87995927500361
};

const childProfile2 = {
  pickupLatitude: 6.861832771511613,
  pickupLongitude: 79.90339105266013,
  schoolLatitude: 6.90158886643883,
  schoolLongitude: 79.8799592750036
};

// Driver routes from database
const driverRoutes = [
  {
    driver_id: 14,
    name: "Gh Huh",
    cityIds: [638, 960, 1516, 1086, 1417, 903, 2159, 2147],
    cities: [
      { id: 638, name: "Homagama", latitude: 6.8432762, longitude: 80.0031833 },
      { id: 960, name: "Kirulapana", latitude: 6.8814717, longitude: 79.8763476 },
      { id: 1516, name: "Kottawa", latitude: 6.8411652, longitude: 79.9654324 },
      { id: 1086, name: "Maharagama", latitude: 6.8478004, longitude: 79.9217615 },
      { id: 1417, name: "Nugegoda", latitude: 6.8649081, longitude: 79.8996789 },
      { id: 903, name: "Pannipitiya", latitude: 6.8463993, longitude: 79.9484346 },
      { id: 2159, name: "Maradana", latitude: 6.9277038, longitude: 79.8660836 },
      { id: 2147, name: "Borella", latitude: 6.9121796, longitude: 79.8828828 }
    ]
  },
  {
    driver_id: 19,
    name: "Sineth Gamage",
    cityIds: [960, 1516, 1086, 1417, 903, 2156, 2158],
    cities: [
      { id: 960, name: "Kirulapana", latitude: 6.8814717, longitude: 79.8763476 },
      { id: 1516, name: "Kottawa", latitude: 6.8411652, longitude: 79.9654324 },
      { id: 1086, name: "Maharagama", latitude: 6.8478004, longitude: 79.9217615 },
      { id: 1417, name: "Nugegoda", latitude: 6.8649081, longitude: 79.8996789 },
      { id: 903, name: "Pannipitiya", latitude: 6.8463993, longitude: 79.9484346 },
      { id: 2156, name: "Havelock Town", latitude: 6.8887947, longitude: 79.8663024 },
      { id: 2158, name: "Cinnamon Gardens", latitude: 6.9116652, longitude: 79.8645678 }
    ]
  },
  {
    driver_id: 20,
    name: "Hs Yshs",
    cityIds: [960, 1516, 1086, 1417, 903, 2159, 2147],
    cities: [
      { id: 960, name: "Kirulapana", latitude: 6.8814717, longitude: 79.8763476 },
      { id: 1516, name: "Kottawa", latitude: 6.8411652, longitude: 79.9654324 },
      { id: 1086, name: "Maharagama", latitude: 6.8478004, longitude: 79.9217615 },
      { id: 1417, name: "Nugegoda", latitude: 6.8649081, longitude: 79.8996789 },
      { id: 903, name: "Pannipitiya", latitude: 6.8463993, longitude: 79.9484346 },
      { id: 2159, name: "Maradana", latitude: 6.9277038, longitude: 79.8660836 },
      { id: 2147, name: "Borella", latitude: 6.9121796, longitude: 79.8828828 }
    ]
  },
  {
    driver_id: 22,
    name: "Kalana Perera",
    cityIds: [638, 960, 1516, 1086, 1417, 903, 2159],
    cities: [
      { id: 638, name: "Homagama", latitude: 6.8432762, longitude: 80.0031833 },
      { id: 960, name: "Kirulapana", latitude: 6.8814717, longitude: 79.8763476 },
      { id: 1516, name: "Kottawa", latitude: 6.8411652, longitude: 79.9654324 },
      { id: 1086, name: "Maharagama", latitude: 6.8478004, longitude: 79.9217615 },
      { id: 1417, name: "Nugegoda", latitude: 6.8649081, longitude: 79.8996789 },
      { id: 903, name: "Pannipitiya", latitude: 6.8463993, longitude: 79.9484346 },
      { id: 2159, name: "Maradana", latitude: 6.9277038, longitude: 79.8660836 }
    ]
  },
  {
    driver_id: 18,
    name: "Fg Ggg",
    cityIds: [1585, 203, 220, 918, 2156, 2158],
    cities: [
      { id: 1585, name: "Bokundara", latitude: 6.8164327, longitude: 79.9206694 },
      { id: 203, name: "Boralesgamuwa", latitude: 6.823355, longitude: 79.9090246 },
      { id: 220, name: "Kohuwala", latitude: 6.8624842, longitude: 79.8854983 },
      { id: 918, name: "Piliyandala", latitude: 6.8017575, longitude: 79.9227313 },
      { id: 2156, name: "Havelock Town", latitude: 6.8887947, longitude: 79.8663024 },
      { id: 2158, name: "Cinnamon Gardens", latitude: 6.9116652, longitude: 79.8645678 }
    ]
  }
];

function pointToLineDistance(point, lineSegment) {
  const turfPoint = turf.point(point);
  const turfLine = turf.lineString(lineSegment);
  const distance = turf.pointToLineDistance(turfPoint, turfLine, { units: 'kilometers' });
  return distance;
}

function findNearestSegment(point, routeCoordinates) {
  let minDistance = Infinity;
  let nearestSegmentIndex = -1;

  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const segment = [routeCoordinates[i], routeCoordinates[i + 1]];
    const distance = pointToLineDistance(point, segment);

    if (distance < minDistance) {
      minDistance = distance;
      nearestSegmentIndex = i;
    }
  }

  return {
    segmentIndex: nearestSegmentIndex,
    distance: minDistance,
    isNearRoute: minDistance <= 10
  };
}

function isRouteSuitableForTrip(pickupPoint, dropPoint, routeCoordinates, maxDistanceKm = 10) {
  const pickupResult = findNearestSegment(pickupPoint, routeCoordinates);
  const dropResult = findNearestSegment(dropPoint, routeCoordinates);

  const bothNearRoute = pickupResult.distance <= maxDistanceKm && dropResult.distance <= maxDistanceKm;
  const correctOrder = dropResult.segmentIndex > pickupResult.segmentIndex;

  return {
    isSuitable: bothNearRoute && correctOrder,
    pickupDistance: pickupResult.distance,
    dropDistance: dropResult.distance,
    pickupSegment: pickupResult.segmentIndex,
    dropSegment: dropResult.segmentIndex
  };
}

function testProfile(profile, profileName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${profileName}`);
  console.log(`Pickup: ${profile.pickupLatitude}, ${profile.pickupLongitude}`);
  console.log(`Drop: ${profile.workLatitude || profile.schoolLatitude}, ${profile.workLongitude || profile.schoolLongitude}`);
  console.log(`${'='.repeat(80)}\n`);

  const pickupPoint = [profile.pickupLongitude, profile.pickupLatitude];
  const dropPoint = [
    profile.workLongitude || profile.schoolLongitude,
    profile.workLatitude || profile.schoolLatitude
  ];

  let matchCount = 0;

  for (const driver of driverRoutes) {
    // Build route coordinates in the order of cityIds
    const routeCoordinates = driver.cityIds.map(cityId => {
      const city = driver.cities.find(c => c.id === cityId);
      return [city.longitude, city.latitude];
    });

    const result = isRouteSuitableForTrip(pickupPoint, dropPoint, routeCoordinates, 10);

    console.log(`\nDriver: ${driver.name} (ID: ${driver.driver_id})`);
    console.log(`Route: ${driver.cities.map(c => c.name).join(' → ')}`);
    console.log(`Pickup Distance: ${result.pickupDistance.toFixed(2)} km (Segment ${result.pickupSegment})`);
    console.log(`Drop Distance: ${result.dropDistance.toFixed(2)} km (Segment ${result.dropSegment})`);
    console.log(`Near Route: ${result.pickupDistance <= 10 && result.dropDistance <= 10}`);
    console.log(`Correct Order: ${result.dropSegment > result.pickupSegment}`);
    console.log(`✓ SUITABLE: ${result.isSuitable ? '✓ YES' : '✗ NO'}`);

    if (result.isSuitable) {
      matchCount++;
      const pickupCities = driver.cities[result.pickupSegment].name + ' → ' + driver.cities[result.pickupSegment + 1].name;
      const dropCities = driver.cities[result.dropSegment].name + ' → ' + driver.cities[result.dropSegment + 1].name;
      console.log(`  → Pickup near segment: ${pickupCities}`);
      console.log(`  → Drop near segment: ${dropCities}`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Total Matches: ${matchCount} / ${driverRoutes.length}`);
  console.log(`${'='.repeat(80)}\n`);
}

// Test all profiles
testProfile(staffProfile, "Staff Profile (ID: 4)");
testProfile(childProfile1, "Child Profile - Gh Vh (ID: 6)");
testProfile(childProfile2, "Child Profile - Namala Baby (ID: 7)");
