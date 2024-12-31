

function validateDNA(sequence) {
  return /^[ACGTacgt]+$/.test(sequence);
}

function transcribeDNA(sequence) {
  if (!validateDNA(sequence)) return "Invalid DNA sequence.";
  return sequence.toUpperCase().replace(/T/g, "U");
}

function dnaComplement(sequence) {
  if (!validateDNA(sequence)) return "Invalid DNA sequence.";
  const complementMap = { A: "T", T: "A", C: "G", G: "C" };
  return sequence
    .toUpperCase()
    .split("")
    .map(nucleotide => complementMap[nucleotide] || nucleotide)
    .join("");
}

function reverseComplement(sequence) {
  return dnaComplement(sequence).split("").reverse().join("");
}

function dnaToAminoAcid(sequence) {
  const codonTable = {
    TTT: "F", TTC: "F", TTA: "L", TTG: "L",
    CTT: "L", CTC: "L", CTA: "L", CTG: "L",
    ATT: "I", ATC: "I", ATA: "I", ATG: "M",
    GTT: "V", GTC: "V", GTA: "V", GTG: "V",
    TCT: "S", TCC: "S", TCA: "S", TCG: "S",
    CCT: "P", CCC: "P", CCA: "P", CCG: "P",
    ACT: "T", ACC: "T", ACA: "T", ACG: "T",
    GCT: "A", GCC: "A", GCA: "A", GCG: "A",
    TAT: "Y", TAC: "Y", TAA: "*", TAG: "*",
    CAT: "H", CAC: "H", CAA: "Q", CAG: "Q",
    AAT: "N", AAC: "N", AAA: "K", AAG: "K",
    GAT: "D", GAC: "D", GAA: "E", GAG: "E",
    TGT: "C", TGC: "C", TGA: "*", TGG: "W",
    CGT: "R", CGC: "R", CGA: "R", CGG: "R",
    AGT: "S", AGC: "S", AGA: "R", AGG: "R",
    GGT: "G", GGC: "G", GGA: "G", GGG: "G",
  };

  if (!validateDNA(sequence)) return "Invalid DNA sequence.";
  const codons = sequence.toUpperCase().match(/.{1,3}/g) || [];
  return codons.map(codon => codonTable[codon] || "?").join("");
}

function translateReadingFrame(sequence, frame = 1) {
  if (!validateDNA(sequence)) return "Invalid DNA sequence.";
  const adjustedSequence = sequence.slice(frame - 1);
  return dnaToAminoAcid(adjustedSequence);
}

function findRestrictionSites(sequence) {
  const enzymes = {
    EcoRI: "GAATTC",
    HindIII: "AAGCTT",
    BamHI: "GGATCC",
  };
  const matches = {};
  for (const [enzyme, site] of Object.entries(enzymes)) {
    matches[enzyme] = (sequence.match(new RegExp(site, "g")) || []).length;
  }
  return matches;
}

function findORF(sequence) {
  if (!validateDNA(sequence)) return "Invalid DNA sequence.";
  const startCodon = /ATG/gi;
  const stopCodons = /TAA|TAG|TGA/gi;
  const orfs = [];
  sequence.replace(startCodon, (match, offset) => {
    const rest = sequence.slice(offset);
    const stopMatch = rest.match(stopCodons);
    if (stopMatch) {
      orfs.push(rest.slice(0, stopMatch.index + 3));
    }
  });
  return orfs;
}

function countNucleotideFrequency(sequence) {
  if (!validateDNA(sequence)) return "Invalid DNA sequence.";
  return {
    A: (sequence.match(/A/gi) || []).length,
    T: (sequence.match(/T/gi) || []).length,
    G: (sequence.match(/G/gi) || []).length,
    C: (sequence.match(/C/gi) || []).length,
  };
}

function gcContent(sequence) {
  if (!validateDNA(sequence)) return "Invalid DNA sequence.";
  const gcCount = (sequence.match(/[GC]/gi) || []).length;
  return ((gcCount / sequence.length) * 100).toFixed(2) + "%";
}

function meltingTemperature(sequence) {
  // Validate DNA sequence
  if (!validateDNA(sequence)) return "Invalid DNA sequence.";

  // Count nucleotide frequencies
  const freq = countNucleotideFrequency(sequence);
  const length = sequence.length;

  let tm;

  // Short sequences (<14 nucleotides)
  if (length < 14) {
    tm = 2 * (freq.A + freq.T) + 4 * (freq.G + freq.C);
  } 
  // Long sequences (≥14 nucleotides)
  else {
    tm = 64.9 + 41 * ((freq.G + freq.C - 16.4) / length);
  }

  return `${tm.toFixed(2)}°C`; // Return Tm rounded to two decimal places
}

function annealingTemperature(sequence) {
  if (!validateDNA(sequence)) return "Invalid DNA sequence.";

  const freq = countNucleotideFrequency(sequence);
  const length = sequence.length;

  const tm = length < 14
    ? 2 * (freq.A + freq.T) + 4 * (freq.G + freq.C) // Short sequences (<14 nt)
    : 64.9 + 41 * ((freq.G + freq.C - 16.4) / length); // Long sequences (≥14 nt)

  return `${tm.toFixed(2)}°C`;
}


function analyzeAll(sequence) {
if (!validateDNA(sequence)) return "Invalid DNA sequence.";

const results = {};
results["Transcription (RNA)"] = transcribeDNA(sequence);
results["DNA Complement"] = dnaComplement(sequence);
results["Reverse Complement"] = reverseComplement(sequence);
results["Translation (Amino Acids)"] = dnaToAminoAcid(sequence);
results["GC Content"] = gcContent(sequence);
results["Melting Temperature"] = meltingTemperature(sequence);
results["Nucleotide Frequency"] = countNucleotideFrequency(sequence);

const restrictionSites = findRestrictionSites(sequence);
results["Restriction Sites"] = Object.entries(restrictionSites)
  .map(([enzyme, count]) => `${enzyme}: ${count}`)
  .join(", ");

const orfs = findORF(sequence);
results["Open Reading Frames (ORFs)"] = orfs.length > 0 ? orfs.join("\n") : "None found";

return results;
}

function performAnalysis() {
  const showResult = document.getElementById("result");
  showResult.style.display = "block";
  const sequence = document.getElementById("dnaSequence").value.trim();
  const analysisType = document.getElementById("analysisType").value;

  // Check if the input sequence is empty
  if (!sequence) {
    document.getElementById("result").textContent = "No sequence entered.";
    return;
  }

  // Validate the sequence for invalid characters
  if (!validateDNA(sequence)) {
    document.getElementById("result").textContent = "Invalid character entered.";
    document.getElementById("result").style.color = "#ce1515";
    return;
  }

  if (!dnaSequence) {
    displayResult("Please enter a valid DNA sequence!");
    displayResult.style.color="#ce1515"
    return;
  }
  
  const saveButton = document.getElementById("saveButton");
  saveButton.style.display = "block";
  let result = "";

  switch (analysisType) {
    case "transcribe":
      result = transcribeDNA(sequence);
      break;
    case "complement":
      result = dnaComplement(sequence);
      break;
    case "reverseComplement":
      result = reverseComplement(sequence);
      break;
    case "translate":
      result = dnaToAminoAcid(sequence);
      break;
    case "translateReadingFrame":
      result = translateReadingFrame(sequence);
      break;
    case "restrictionSites":
      result = JSON.stringify(findRestrictionSites(sequence), null, 2);
      break;
    case "orf":
      result = JSON.stringify(findORF(sequence), null, 2);
      break;
    case "gcContent":
      result = gcContent(sequence);
      break;
    case "nucleotideFreq":
      result = JSON.stringify(countNucleotideFrequency(sequence), null, 2);
      break;
    case "meltingTemp":
      result = meltingTemperature(sequence);
      break;
    case "annealingTemp":
      result = annealingTemperature(sequence)
      break;
    case "analyzeAll":
      const allResults = analyzeAll(sequence);
      result = Object.entries(allResults)
        .map(([key, value]) => `${key}:\n${value}`)
        .join("\n\n");
      break;
    default:
      result = "Invalid analysis type selected.";
  }

  document.getElementById("result").textContent = result;
  document.getElementById("result").style.color = "#263e89";
}

function formatSequence(sequence, lineLength = 80) {
  return sequence.match(new RegExp(`.{1,${lineLength}}`, 'g')).join('\n');
}
// function displayResult(content) {
//   const resultElement = document.getElementById("result");
//   const saveButton = document.getElementById("saveButton");

//   if (content.trim()) {
//     resultElement.textContent = content;  // Display the result
//     saveButton.style.display = "inline-block";  // Show the save button
//   } else {
//     resultElement.textContent = "";  // Clear the result
//     saveButton.style.display = "none";  // Hide the save button
//   }
// }

