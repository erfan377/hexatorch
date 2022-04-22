let params = new URL(document.location).searchParams;
let real = params.get("real");
let proceed = params.get("proceed");

if (real === "null") document.getElementById("real").hidden = true;
document.getElementById("real").href = `https://${real}`;
document.getElementById("real").innerText = "Go to " + real + " (safe)";
document.getElementById("proceed").href = proceed;

document.getElementById("proceed").addEventListener("click", () => {
  console.log("cklicked it ");
  chrome.runtime.sendMessage({
    command: { type: "proceedAnyway", value: proceed },
  });
});
