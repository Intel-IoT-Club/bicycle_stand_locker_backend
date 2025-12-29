exports.calculateFare = ({
  distanceKm = 0,
  timeMin = 0,
  bikeType = "Non-Geared"
}) => {
  const BASE = 10;

  const PER_KM = bikeType === "Geared" ? 12 : 10;

  const PER_MIN = 1;

  let fare = BASE + distanceKm * PER_KM + timeMin * PER_MIN;

  return Math.round(fare * 100) / 100;
};

