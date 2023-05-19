function calculateYearsSince(date) {
  const diffInMs = Date.now() - date.getTime();
  const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffInYears);
}

const myDate = new Date('2009-01-01');
document.getElementById("age").innerText = calculateYearsSince(myDate);