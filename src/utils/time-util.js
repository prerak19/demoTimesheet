function minsToTimeStr(val) {
  val = val > 0 ? val : -val;
  let m = val % 60;
  let h = (val - m) / 60;

  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;

  return `${h}.${m}`;
}

module.exports = { minsToTimeStr };
