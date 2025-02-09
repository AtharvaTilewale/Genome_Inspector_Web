function validateDNA(sequence) {
  // Remove spaces and newlines before validation
  const cleanedSequence = sequence.replace(/[\s\n]/g, '');
  // Validate that only valid DNA characters remain
  return /^[ACGTNacgtn]+$/.test(cleanedSequence);
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

  // Function to find amino acid for codons with 'N'
  const resolveCodonWithN = (codon) => {
    const base1 = codon[0];
    const base2 = codon[1];
    const matchingCodons = Object.keys(codonTable).filter(
      key => key[0] === base1 && key[1] === base2
    );

    const aminoAcids = new Set(matchingCodons.map(key => codonTable[key]));
    return aminoAcids.size === 1 ? [...aminoAcids][0] : "?";
  };

  if (!validateDNA(sequence)) return "Invalid DNA sequence.";
  const codons = sequence.toUpperCase().match(/.{1,3}/g) || [];

  return codons
    .map(codon => {
      if (codon.includes("N")) {
        return resolveCodonWithN(codon); // Handle ambiguous codons
      }
      return codonTable[codon] || "?"; // Translate known codons
    })
    .join("");
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

  // Function to generate reading frames
  const generateFrames = (seq) => {
    const frames = [];
    for (let frame = 0; frame < 3; frame++) {
      frames.push(seq.slice(frame));
    }
    return frames;
  };

  // Function to get reverse complement
  const reverseComplement = (seq) => {
    const complement = { A: "T", T: "A", C: "G", G: "C", N: "N" }; // N maps to N
    return seq
      .split("")
      .reverse()
      .map((nucleotide) => complement[nucleotide] || nucleotide) // Handle N
      .join("");
  };

  // Function to translate nucleotide sequence to amino acids
  const translateToAminoAcids = (seq) => {
    const codonTable = {
      "ATA": "I", "ATC": "I", "ATT": "I", "ATG": "M", "ACA": "T", "ACC": "T", "ACG": "T", "ACT": "T",
      "AAC": "N", "AAT": "N", "AAA": "K", "AAG": "K", "AGC": "S", "AGT": "S", "AGA": "R", "AGG": "R",
      "CTA": "L", "CTC": "L", "CTG": "L", "CTT": "L", "CCA": "P", "CCC": "P", "CCG": "P", "CCT": "P",
      "CAC": "H", "CAT": "H", "CAA": "Q", "CAG": "Q", "CGA": "R", "CGC": "R", "CGG": "R", "CGT": "R",
      "GTA": "V", "GTC": "V", "GTG": "V", "GTT": "V", "GCA": "A", "GCC": "A", "GCG": "A", "GCT": "A",
      "GAC": "D", "GAT": "D", "GAA": "E", "GAG": "E", "GGA": "G", "GGC": "G", "GGG": "G", "GGT": "G",
      "TCA": "S", "TCC": "S", "TCG": "S", "TCT": "S", "TTC": "F", "TTT": "F", "TTA": "L", "TTG": "L",
      "TAC": "Y", "TAT": "Y", "TAA": "*", "TAG": "*", "TGA": "*", "TGC": "C", "TGT": "C", "TGG": "W"
    };
    
    let protein = "";
    // Process sequence in chunks of 3 nucleotides (codons)
    for (let i = 0; i < seq.length - 2; i += 3) {
      let codon = seq.substring(i, i + 3);
      if (codonTable[codon]) {
        protein += codonTable[codon];
      } else if (codon.includes("N")) {
        // If codon contains N, treat it as N (unknown amino acid)
        protein += "N";
      }
    }
    return protein;
  };

  // Forward frames
  const forwardFrames = generateFrames(sequence).map(translateToAminoAcids);

  // Reverse frames
  const reverseSequence = reverseComplement(sequence);
  const reverseFrames = generateFrames(reverseSequence).map(translateToAminoAcids);

  // Combine and return all six frames
  return {
    forwardFrames,
    reverseFrames,
  };
}

// Helper function to validate DNA sequence
function validateDNA(sequence) {
  return /^[ATCGN]*$/i.test(sequence); // Allow N in the sequence
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
// results["Nucleotide Frequency"] = countNucleotideFrequency(sequence);

// const restrictionSites = findRestrictionSites(sequence);
// results["Restriction Sites"] = Object.entries(restrictionSites)
//   .map(([enzyme, count]) => `${enzyme}: ${count}`)
//   .join(", ");

// const orfs = findORF(sequence);
// results["Open Reading Frames (ORFs)"] = orfs.length > 0 ? orfs.join("\n") : "None found";

return results;
}

function performAnalysis() {
  const showResult = document.getElementById("result");
  showResult.style.display = "block";
  let sequence = document.getElementById("dnaSequence").value.trim();
  const analysisType = document.getElementById("analysisType").value;

  try {
    // Remove spaces and newlines for processing
    sequence = sequence.replace(/[\s\n]/g, '');

    // Check if the input sequence is empty after cleaning
    if (!sequence) {
      throw new Error("No sequence entered. Please provide a DNA sequence.");
    }

    // Validate the cleaned sequence
    if (!validateDNA(sequence)) {
      throw new Error("Invalid character detected in the sequence. Allowed characters are A, T, G, C, and N only.");
    }
  } catch (error) {
    document.getElementById("result").textContent = error.message;
    document.getElementById("result").style.color = "#ce1515"; // Set error text color
    saveButton.style.display = "none"; // Hide save button
    return;
  }

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
      result = annealingTemperature(sequence);
      break;
    case "analyzeAll":
      const allResults = analyzeAll(sequence);
      result = Object.entries(allResults)
        .map(([key, value]) => `${key}:\n${value}`)
        .join("\n\n"); // Use line breaks for each result
      break;
    default:
      result = "Invalid analysis type selected.";
  }

  // Display the result with proper formatting
  document.getElementById("result").innerHTML = `<pre>${result}</pre>`;
  document.getElementById("result").style.color = "#263e89";
  // Show the save button and set its click event
  saveButton.style.display = "inline-block"; // Make save button visible
  saveButton.onclick = () => saveResultToFile(result);
  // Save result for file download if required
  // const saveButton = document.getElementById("saveButton");
  // if (saveButton) {
  //   saveButton.onclick = () => saveResultToFile(result);
  // }
}

function formatSequence(sequence, lineLength = 80) {
  return sequence.match(new RegExp(`.{1,${lineLength}}`, 'g')).join('\n');
}
// function displayResult(content) {
//   const resultElement = document.getElementById("result");
//   const saveButton = document.getElementById("saveButton");


