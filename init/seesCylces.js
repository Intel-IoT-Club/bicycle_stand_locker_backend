const mongoose = require("mongoose");
const Cycle = require("../models/Cycle"); // adjust path if needed

// DB connection (reuse your existing config if you have one)
const MONGO_URI = process.env.MONGO_URI;

const demoCyclesArray = [
  {
    cycleName: "Firefox Ranger",
    cycleId: "C001",
    ownerID: "U001",
    status: "locked",
    type: "Geared",
    battery: 90,
    location: { type: "Point", coordinates: [76.900322, 10.899481] },
    availabilityFlag: true
  },
  {
    cycleName: "Hero Lectro C1",
    cycleId: "C002",
    ownerID: "U002",
    status: "unlocked",
    type: "NonGeared",
    battery: 65,
    location: { type: "Point", coordinates: [76.903519, 10.9001] },
    availabilityFlag: true
  },
  {
    cycleName: "Btwin Rockrider",
    cycleId: "C003",
    ownerID: "U003",
    status: "locked",
    type: "Geared",
    battery: 75,
    location: { type: "Point", coordinates: [76.903232, 10.900617] },
    availabilityFlag: true
  },
  {
    cycleName: "Montra Trance",
    cycleId: "C004",
    ownerID: "U004",
    status: "unlocked",
    type: "NonGeared",
    battery: 60,
    location: { type: "Point", coordinates: [76.898606, 10.903899] },
    availabilityFlag: true
  },
  {
    cycleName: "Trek Marlin 5",
    cycleId: "C005",
    ownerID: "U005",
    status: "locked",
    type: "Geared",
    battery: 80,
    location: { type: "Point", coordinates: [76.896986, 10.906581] },
    availabilityFlag: true
  },
  {
    cycleName: "Giant Escape 3",
    cycleId: "C006",
    ownerID: "U006",
    status: "locked",
    type: "NonGeared",
    battery: 50,
    location: { type: "Point", coordinates: [76.904847, 10.904308] },
    availabilityFlag: false
  },
  {
    cycleName: "Firefox Bad Attitude",
    cycleId: "C007",
    ownerID: "U007",
    status: "unlocked",
    type: "Geared",
    battery: 88,
    location: { type: "Point", coordinates: [76.899246, 10.904058] },
    availabilityFlag: true
  },
  {
    cycleName: "Hero Urban Trail",
    cycleId: "C008",
    ownerID: "U008",
    status: "locked",
    type: "NonGeared",
    battery: 40,
    location: { type: "Point", coordinates: [76.901207, 10.902244] },
    availabilityFlag: false
  },
  {
    cycleName: "Btwin Riverside 120",
    cycleId: "C009",
    ownerID: "U009",
    status: "locked",
    type: "Geared",
    battery: 92,
    location: { type: "Point", coordinates: [76.899785, 10.902458] },
    availabilityFlag: true
  },
  {
    cycleName: "Montra Helicon",
    cycleId: "C010",
    ownerID: "U010",
    status: "unlocked",
    type: "NonGeared",
    battery: 77,
    location: { type: "Point", coordinates: [76.896382, 10.902251] },
    availabilityFlag: true
  },
  {
    cycleName: "Hero Sprint Next",
    cycleId: "C011",
    ownerID: "U011",
    status: "locked",
    type: "Geared",
    battery: 66,
    location: { type: "Point", coordinates: [76.903055, 10.901843] },
    availabilityFlag: true
  },
  {
    cycleName: "Btwin MyBike",
    cycleId: "C012",
    ownerID: "U012",
    status: "unlocked",
    type: "NonGeared",
    battery: 55,
    location: { type: "Point", coordinates: [76.902199, 10.904458] },
    availabilityFlag: true
  },
  {
    cycleName: "Firefox Voya",
    cycleId: "C013",
    ownerID: "U013",
    status: "locked",
    type: "Geared",
    battery: 82,
    location: { type: "Point", coordinates: [76.901493, 10.905557] },
    availabilityFlag: true
  },
  {
    cycleName: "Trek FX1",
    cycleId: "C014",
    ownerID: "U014",
    status: "locked",
    type: "NonGeared",
    battery: 47,
    location: { type: "Point", coordinates: [76.896233, 10.903362] },
    availabilityFlag: false
  },
  {
    cycleName: "Hero Hawk Nuage",
    cycleId: "C015",
    ownerID: "U015",
    status: "unlocked",
    type: "Geared",
    battery: 89,
    location: { type: "Point", coordinates: [76.895541, 10.90187] },
    availabilityFlag: true
  },
  {
    cycleName: "Btwin Triban 100",
    cycleId: "C016",
    ownerID: "U016",
    status: "locked",
    type: "Geared",
    battery: 73,
    location: { type: "Point", coordinates: [76.894986, 10.901417] },
    availabilityFlag: true
  },
  {
    cycleName: "Montra Blues",
    cycleId: "C017",
    ownerID: "U017",
    status: "locked",
    type: "NonGeared",
    battery: 68,
    location: { type: "Point", coordinates: [76.899447, 10.901539] },
    availabilityFlag: true
  },
  {
    cycleName: "Firefox Fusion",
    cycleId: "C018",
    ownerID: "U018",
    status: "unlocked",
    type: "Geared",
    battery: 81,
    location: { type: "Point", coordinates: [76.9029, 10.9038] },
    availabilityFlag: true
  },
  {
    cycleName: "Giant Contend 3",
    cycleId: "C019",
    ownerID: "U019",
    status: "locked",
    type: "Geared",
    battery: 78,
    location: { type: "Point", coordinates: [76.899092, 10.90775] },
    availabilityFlag: true
  },
  {
    cycleName: "Hero Sprint RX2",
    cycleId: "C020",
    ownerID: "U020",
    status: "locked",
    type: "NonGeared",
    battery: 59,
    location: { type: "Point", coordinates: [76.899135, 10.905933] },
    availabilityFlag: false
  }
];

async function seedCycles() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connected");

    // clear existing data:
    // await Cycle.deleteMany({});

    const result = await Cycle.insertMany(demoCyclesArray);
    console.log(` ${result.length} cycles inserted successfully`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seedCycles();
