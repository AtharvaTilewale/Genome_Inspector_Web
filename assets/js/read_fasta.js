function showFileName() {
    const fileInput = document.getElementById('fastaFile');
    const fileNameSpan = document.getElementById('fileName');
  
    if (fileInput.files.length > 0) {
      fileNameSpan.textContent = fileInput.files[0].name; // Display the file name
    } else {
      fileNameSpan.textContent = "No file selected"; // Reset if no file is selected
    }
  }
  function readFastaFile() {
    const fileInput = document.getElementById("fastaFile");
    const outputDiv = document.getElementById("sequenceOutput");
    const fileNameSpan = document.getElementById("fileName");
  
    if (!fileInput.files.length) {
      fileNameSpan.textContent = "No file selected.";
      outputDiv.textContent = "";
      return;
    }
  
    const file = fileInput.files[0];
    fileNameSpan.textContent = file.name; // Display file name
    const reader = new FileReader();
  
    reader.onload = function (event) {
      const content = event.target.result;
      const sequence = parseFasta(content);
  
      if (sequence) {
        document.getElementById("dnaSequence").value = sequence;
        outputDiv.textContent = "FASTA file read successfully. Sequence loaded!";
        outputDiv.className = "sequenceOutputSuccess"
      } else {
        outputDiv.textContent = "Invalid FASTA file or no sequence found. Please ensure you upload a valid genomic FASTA file.";
        outputDiv.className = "sequenceOutputError"
      }
    };
  
    reader.onerror = function () {
      outputDiv.textContent = "Error reading file.";
    };
  
    reader.readAsText(file);
  }
  
  function parseFasta(content) {
    const lines = content.split(/\r?\n/);
    let sequence = "";
  
    console.log("FASTA content:", content); // Log the file content
    console.log("Parsed lines:", lines); // Log the lines array
  
    lines.forEach(line => {
      if (line.startsWith(">")) {
        console.log("Header line:", line); // Log header lines
      } else {
        sequence += line.trim(); // Concatenate sequence lines
        console.log("Sequence line added:", line.trim());
      }
    });
  
    if (!sequence) {
      console.log("No sequence found in file.");
      return null;
    }
  
    const isValid = validateDNA(sequence);
    console.log("Extracted sequence:", sequence);
    console.log("Is sequence valid?:", isValid);
  
    return isValid ? sequence : null;
  }
  