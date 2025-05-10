const date = new Date();

const minute = 1000 * 60;
const hour = minute * 60;
const day = hour * 24;
const year = day * 365;
let time_since_2025 = Math.round((Date.now()-year*55)-day*18);
let days_since_2025 = Math.round(time_since_2025/day)

const ctime = 354
document.getElementById("tuc").textContent = String(ctime-days_since_2025)

const svtime = 880
document.getElementById("tuitsv").textContent = String(svtime-days_since_2025)