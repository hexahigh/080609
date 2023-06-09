function calculateYearsSince() {
    const myDate = new Date('2009-06-08');

    const diffInMs = Date.now() - myDate.getTime();
    const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(hoursSince())
    const minutes = Math.floor(diffInMs / 1000 / 60)
    //const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    //const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById("number").innerText = diffInMs
}

setInterval(calculateYearsSince, 0.1)