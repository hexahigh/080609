function calculateYearsSince() {
    const myDate = new Date('2009-06-08');

    const diffInMs = Date.now() - myDate.getTime();
    
    document.getElementById("number").innerText = diffInMs
}

setInterval(calculateYearsSince, 0.1)