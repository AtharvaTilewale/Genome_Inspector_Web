// Validate DNA Sequence
function validateDNA(sequence) {
    return /^[ACGTacgt]+$/.test(sequence);
  }
  
  // Transcribe DNA to RNA
  function transcribeDNA(sequence) {
    if (!validateDNA(sequence)) return "Invalid DNA sequence.";
    return sequence.toUpperCase().replace(/T/g, "U");
  }
  
  // Find Complement of DNA
  function dnaComplement(sequence) {
    if (!validateDNA(sequence)) return "Invalid DNA sequence.";
    return sequence.toUpperCase().replace(/A/g, "T")
                                 .replace(/T/g, "A")
                                 .replace(/C/g, "G")
                                 .replace(/G/g, "C");
  }
  
  // Reverse Complement of DNA
  function reverseComplement(sequence) {
    return dnaComplement(sequence).split("").reverse().join("");
  }
  
  // Translate DNA to Amino Acids
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
  
  // Translate DNA Reading Frame
  function translateReadingFrame(sequence, frame = 1) {
    if (frame < 1 || frame > 3) return "Frame must be 1, 2, or 3.";
    const adjustedSeq = sequence.substring(frame - 1);
    return dnaToAminoAcid(adjustedSeq);
  }
  
  // Find Restriction Sites
  function findRestrictionSites(sequence, enzymeSites) {
    if (!validateDNA(sequence)) return "Invalid DNA sequence.";
    const sites = [];
    for (const [enzyme, site] of Object.entries(enzymeSites)) {
      const regex = new RegExp(site, "g");
      let match;
      while ((match = regex.exec(sequence.toUpperCase())) !== null) {
        sites.push({ enzyme, position: match.index + 1 });
      }
    }
    return sites.length ? sites : "No restriction sites found.";
  }
  
  // Find Open Reading Frames (ORFs)
  function findORF(sequence) {
    if (!validateDNA(sequence)) return "Invalid DNA sequence.";
    const orfs = [];
    for (let i = 0; i < sequence.length - 2; i++) {
      if (sequence.substring(i, i + 3).toUpperCase() === "ATG") {
        let orf = "ATG";
        for (let j = i + 3; j < sequence.length - 2; j += 3) {
          const codon = sequence.substring(j, j + 3).toUpperCase();
          orf += codon;
          if (["TAA", "TAG", "TGA"].includes(codon)) {
            orfs.push(orf);
            break;
          }
        }
      }
    }
    return orfs.length ? orfs : "No ORFs found.";
  }
  
  // Count Nucleotide Frequency
  function countNucleotideFrequency(sequence) {
    if (!validateDNA(sequence)) return "Invalid DNA sequence.";
    const freq = {
      A: (sequence.match(/A/gi) || []).length,
      T: (sequence.match(/T/gi) || []).length,
      G: (sequence.match(/G/gi) || []).length,
      C: (sequence.match(/C/gi) || []).length,
    };
    return freq;
  }
  
  // Calculate GC Content
  function gcContent(sequence) {
    if (!validateDNA(sequence)) return "Invalid DNA sequence.";
    const gcCount = (sequence.match(/[GC]/gi) || []).length;
    return ((gcCount / sequence.length) * 100).toFixed(2) + "%";
  }
  
  // Calculate Melting Temperature
  function meltingTemperature(sequence) {
    if (!validateDNA(sequence)) return "Invalid DNA sequence.";
    const freq = countNucleotideFrequency(sequence);
    const tm = 2 * (freq.A + freq.T) + 4 * (freq.G + freq.C);
    return `${tm}°C`;
  }
  
  // Calculate Annealing Temperature
  function annealingTemperature(sequence, primer) {
    if (!validateDNA(sequence) || !validateDNA(primer)) return "Invalid DNA sequence or primer.";
    const tmPrimer = meltingTemperature(primer);
    const gc = gcContent(sequence);
    return `Primer TM: ${tmPrimer}, GC Content: ${gc}`;
  }
  
  // Example Restriction Enzymes
  const restrictionEnzymes = {
    EcoRI: "GAATTC",
    HindIII: "AAGCTT",
    BamHI: "GGATCC",
  };
  
  // Usage Examples
  const exampleDNA = "ATGCGTACGTAGCTAGCTAGCGTATCGTAGCTAGCTAG";
  console.log("Transcribed RNA:", transcribeDNA(exampleDNA));
  console.log("DNA Complement:", dnaComplement(exampleDNA));
  console.log("Reverse Complement:", reverseComplement(exampleDNA));
  console.log("Amino Acids:", dnaToAminoAcid(exampleDNA));
  console.log("Reading Frame 2:", translateReadingFrame(exampleDNA, 2));
  console.log("Restriction Sites:", findRestrictionSites(exampleDNA, restrictionEnzymes));
  console.log("ORFs:", findORF(exampleDNA));
  console.log("Nucleotide Frequency:", countNucleotideFrequency(exampleDNA));
  console.log("GC Content:", gcContent(exampleDNA));
  console.log("Melting Temperature:", meltingTemperature(exampleDNA));
  console.log("Annealing Temperature:", annealingTemperature(exampleDNA, "ATGCGT"));
  