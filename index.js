function calculateYearsSince() {
  const myDate = new Date('2009-06-08');

  const diffInMs = Date.now() - myDate.getTime();
  const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById("age").innerText = math.floor(diffInYears) + " years, " + days + " days, " + hours + " hours and " + minutes + " minutes"
}

var year = 2023
const myDate = new Date('2009-06-08');

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
  const now = new Date().getTime();
  const nextYear = new Date(theDate).getTime();
  const timeRemaining = nextYear - now;

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const countdownDiv = document.getElementById("countdown");
  countdownDiv.innerHTML = days + " days, " + hours + " hours, " + minutes + " minutes and " + seconds + " seconds";
}

// Call the countdownTimer() function every second using setInterval
setInterval(countdown, 500);
setInterval(calculateYearsSince, 2000)