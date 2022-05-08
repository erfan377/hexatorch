

let params = new URL(document.location).searchParams;
let real = params.get("real");
let proceed = params.get("proceed");

realIDs = real.split(",");
console.log(realIDs[0]);
console.log(proceed);

window.onload = function () {
    document.getElementById("Safe").onclick = function () {
         //alert("Hello! I am an alert box!!");
         window.location.href = `https://${realIDs[0]}`;
    };
}();

window.onload = function () {
    document.getElementById("nonSafe").onclick = function () {
         //alert("Hello! I am an alert box!!");
         window.location.href = proceed;
    };
    document.getElementById("nonSafe").addEventListener("click", () => {
      console.log("clicked it ");
      chrome.runtime.sendMessage({
      command: { type: "proceedAnyway", value: proceed },
    });
});
}();

function handleAddButtonEvent(command) {
  if (command === 'danger') {
    return (realIDs[0]);
  }
}

