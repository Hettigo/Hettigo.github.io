const clock = document.querySelector("#clock");

function updateClock() {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

  clock.textContent = `COLOMBO ${time} / UTC+05:30`;
}

updateClock();
setInterval(updateClock, 1000);
