function calculateYearsSince(date) {
  const diffInMs = Date.now() - date.getTime();
  const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffInYears);
}

var year = 2023
const myDate = new Date('2009-06-08');
document.getElementById("age").innerText = calculateYearsSince(myDate) + " Years old";

const currentYear = new Date().getFullYear();
const theDate = year + "-06-08"

function countdownTimer() {
  const now = new Date().getTime();
  const nextYear = new Date(theDate).getTime();
  const timeRemaining = nextYear - now;
  if (nextYear < 0) {
    year = year + 1
    countdownTimer()
  } else {
    countdown()
  }
}

function countdown() {
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const countdownDiv = document.getElementById("countdown");
  countdownDiv.innerHTML = days + " days, " + hours + " hours, " + minutes + " minutes and " + seconds + " seconds";
}

// Call the countdownTimer() function every second using setInterval
setInterval(countdown, 1000);