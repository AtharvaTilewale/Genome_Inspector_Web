function saveResultToFile() {
  const resultElement = document.getElementById("result");
  const resultText = resultElement.textContent || resultElement.innerText;

  if (!resultText.trim()) {
    alert("No result to save!");
    return;
  }

  // Prepend "Genome Inspector Web" to the resultText
  const finalText = 'Genome Inspector Web V1.0\nCopyright (c) 2024, Atharva Tilewale - github.com/AtharvaTilewale\nCheck out: https://atharvatilewale.github.io/Genome_Inspector_Web\n\nFIND YOUR REPORT BELOW:\n\n' + resultText;

  const blob = new Blob([finalText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "result.txt";
  link.click();
}