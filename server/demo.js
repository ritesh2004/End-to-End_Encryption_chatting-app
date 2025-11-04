const utcDate = new Date("2025-11-04T01:24:39.470Z");

// IST = UTC + 5 hours 30 minutes
const istDate = new Date(utcDate.getTime() + (5 * 60 + 30) * 60000);

console.log(istDate.toISOString());