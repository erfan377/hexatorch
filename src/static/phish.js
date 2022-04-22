let params = new URL(document.location).searchParams;
let real = params.get("real");
let proceed = params.get("proceed");

console.log("relm", real);
if (real === "null") {
  document.getElementById("real").hidden = true;
} else {
  real.split(",").forEach(function (e) {
    console.log("e", e);
    let real = document.createElement("a");
    real.href = `https://${e}`;
    real.innerText = "Go to " + e + " (safe)";
    document.body.appendChild(real);
  });
}

document.getElementById("proceed").href = proceed;
document.getElementById("proceed").addEventListener("click", () => {
  console.log("cklicked it ");
  chrome.runtime.sendMessage({
    command: { type: "proceedAnyway", value: proceed },
  });
});
