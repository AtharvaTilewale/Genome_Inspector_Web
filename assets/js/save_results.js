function saveResultToFile() {
    const resultElement = document.getElementById("result");
    const resultText = resultElement.textContent || resultElement.innerText;
  
    if (!resultText.trim()) {
      alert("No result to save!");
      return;
    }
  
    const blob = new Blob([resultText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "result.txt";
    link.click();
  }
  