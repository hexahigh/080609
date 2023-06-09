function calculateYearsSince() {
    const myDate = new Date('2009-06-08');

    const diffInMs = Date.now() - myDate.getTime();
    const diffInNs = diffInMs * 1000000

    document.getElementById("number").innerText = diffInNs
}

setInterval(calculateYearsSince, 0.1)