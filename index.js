function calculateYearsSince(date) {
  const diffInMs = Date.now() - date.getTime();
  const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffInYears);
}

const myDate = new Date('2009-08-06');
document.getElementById("age").innerText = calculateYearsSince(myDate) + " Years old";


function countdownTimer() {
  const now = new Date().getTime();
  const nextYear = new Date("2023-06-08").getTime();
  const timeRemaining = nextYear - now;

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const countdownDiv = document.getElementById("countdown");
  countdownDiv.innerHTML = days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds";
}

// Call the countdownTimer() function every second using setInterval
setInterval(countdownTimer, 1000);