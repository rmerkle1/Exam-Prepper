// Chapter metadata — title and availability per class
export const CHAPTER_META = {
  CHM113: {
    1:  { title: 'Matter, Measurement & Problem Solving',        available: true  },
    2:  { title: 'Atoms, Molecules & Ions',                      available: true  },
    3:  { title: 'Composition of Substances & Solutions',        available: true  },
    4:  { title: 'Stoichiometry of Chemical Reactions',          available: false },
    5:  { title: 'Thermochemistry',                              available: false },
    6:  { title: 'Electronic Structure & Periodic Properties',   available: false },
    7:  { title: 'Chemical Bonding & Molecular Geometry',        available: false },
    8:  { title: 'Advanced Theories of Covalent Bonding',        available: false },
    9:  { title: 'Gases',                                        available: false },
    10: { title: 'Liquids & Solids',                             available: false },
    11: { title: 'Solutions & Colloids',                         available: false },
  },
}

export const QUESTIONS = {
  // ─── CHM113: Chapters 1–11 ───────────────────────────────────────────────
  CHM113: [
    // ── Chapter 1: Matter, Measurement & Problem Solving ──────────────────
    {
      id: 'sig-figs-count',
      chapter: 1,
      topic: 'Significant Figures — Counting',
      question: 'Can you identify the number of significant figures in a measurement?',
      followUp: {
        prompt: 'How many significant figures are in the measurement 0.00450 g?',
        options: [
          { id: 'a', text: '2  (only the 4 and 5 count; leading zeros are never significant)' },
          { id: 'b', text: '3  (the 4, 5, and trailing zero all count; leading zeros do not)' },
          { id: 'c', text: '5  (all digits after the decimal point)' },
          { id: 'd', text: '6  (every digit written, including leading zeros)' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'sig-figs-calc',
      chapter: 1,
      topic: 'Significant Figures — Calculations',
      question: 'Can you apply significant figure rules when multiplying, dividing, adding, or subtracting measured values?',
      followUp: {
        prompt: 'Calculate 12.5 × 0.234 and express the answer with the correct number of significant figures.',
        options: [
          { id: 'a', text: '2.9  (2 significant figures — incorrect; both values have 3)' },
          { id: 'b', text: '2.93  (3 significant figures — matches the least precise factor)' },
          { id: 'c', text: '2.925  (4 significant figures — unrounded calculator result)' },
          { id: 'd', text: '2.9250  (5 significant figures — adds extra precision that isn\'t justified)' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'metric-conversions',
      chapter: 1,
      topic: 'Metric Unit Conversions',
      question: 'Can you convert between metric units such as mL to L, mg to g, or nm to m using dimensional analysis?',
      followUp: {
        prompt: 'How many liters are equivalent to 2,500 mL?',
        options: [
          { id: 'a', text: '2,500,000 L  (multiplied by 1000 instead of dividing)' },
          { id: 'b', text: '25.0 L  (divided by 100 — wrong conversion factor)' },
          { id: 'c', text: '2.50 L  (divided by 1000; 1 L = 1000 mL)' },
          { id: 'd', text: '0.250 L  (divided by 10,000 — wrong conversion factor)' },
        ],
        correctId: 'c',
      },
    },
    {
      id: 'classifying-matter',
      chapter: 1,
      topic: 'Classifying Matter',
      question: 'Can you classify a sample of matter as an element, compound, homogeneous mixture, or heterogeneous mixture?',
      followUp: {
        prompt: 'Which of the following is the best example of a heterogeneous mixture?',
        options: [
          { id: 'a', text: 'Salt dissolved in water  (uniform throughout — homogeneous mixture)' },
          { id: 'b', text: 'Pure copper metal  (single element, not a mixture)' },
          { id: 'c', text: 'Carbon dioxide gas  (two elements chemically combined — compound)' },
          { id: 'd', text: 'Italian salad dressing with visible oil and water layers  (two phases, not uniform — heterogeneous)' },
        ],
        correctId: 'd',
      },
    },

    // ── Chapter 2: Atoms, Molecules & Ions ────────────────────────────────
    {
      id: 'periodic-table-groups',
      chapter: 2,
      topic: 'Periodic Table — Group Names',
      question: 'Can you identify the major group names on the periodic table (alkali metals, alkaline earth metals, halogens, noble gases, transition metals) and locate them by group number?',
      followUp: {
        prompt: 'Which of the following correctly pairs a group number with its name?',
        options: [
          { id: 'a', text: 'Group 1 — Alkaline earth metals' },
          { id: 'b', text: 'Group 2 — Alkali metals' },
          { id: 'c', text: 'Group 17 — Halogens' },
          { id: 'd', text: 'Group 18 — Transition metals' },
        ],
        correctId: 'c',
      },
    },
    {
      id: 'subatomic-particles',
      chapter: 2,
      topic: 'Subatomic Particles — Isotopes & Ions',
      question: 'Do you know how changing the number of protons, neutrons, or electrons produces a different element, a different isotope, or an ion?',
      followUp: {
        prompt: 'A neutral sodium atom (Na, atomic number 11, mass number 23) loses one electron to form Na⁺. Which description correctly identifies Na⁺?',
        options: [
          { id: 'a', text: '11 protons, 12 neutrons, 11 electrons  (still neutral — no change made)' },
          { id: 'b', text: '10 protons, 12 neutrons, 11 electrons  (fewer protons would make it a different element)' },
          { id: 'c', text: '11 protons, 12 neutrons, 10 electrons  (same element; losing an electron makes it a +1 cation)' },
          { id: 'd', text: '12 protons, 11 neutrons, 11 electrons  (more protons would make it Mg, not Na)' },
        ],
        correctId: 'c',
      },
    },
    {
      id: 'avg-atomic-mass',
      chapter: 2,
      topic: 'Average Atomic Mass',
      question: 'Can you calculate the average atomic mass of an element from its isotopes\' masses and natural percent abundances?',
      followUp: {
        prompt: 'Chlorine has two stable isotopes: ³⁵Cl (75.77% abundant, 34.97 u) and ³⁷Cl (24.23% abundant, 36.97 u). Which calculation gives the correct average atomic mass?',
        options: [
          { id: 'a', text: 'avg = (34.97 + 36.97) ÷ 2 = 35.97 u  (simple average ignores abundance)' },
          { id: 'b', text: 'avg = 0.7577 × 34.97 + 0.2423 × 36.97 = 35.45 u  (weighted by fractional abundance)' },
          { id: 'c', text: 'avg = 75.77 × 34.97 + 24.23 × 36.97 = 3,550 u  (used percentages instead of decimals)' },
          { id: 'd', text: 'avg = (75.77 + 24.23) ÷ (34.97 + 36.97) = 1.39 u  (divided total % by total mass — not a valid formula)' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'nomenclature',
      chapter: 2,
      topic: 'Chemical Nomenclature',
      question: 'Can you name ionic, covalent (molecular), and acidic compounds, and write molecular formulas from their names?',
      followUp: {
        prompt: 'What is the correct molecular formula for copper(II) nitrate?',
        options: [
          { id: 'a', text: 'CuNO₃  (assumes a 1:1 ratio, but charges don\'t balance: Cu²⁺ and NO₃⁻)' },
          { id: 'b', text: 'Cu(NO₃)₂  (Cu²⁺ needs two NO₃⁻ to balance the 2+ charge)' },
          { id: 'c', text: 'Cu₂NO₃  (two Cu for one nitrate — charges don\'t balance)' },
          { id: 'd', text: 'Cu₂(NO₃)₃  (would imply Cu is 3+, but the name says copper(II))' },
        ],
        correctId: 'b',
      },
    },

    {
      id: 'covalent-nomenclature',
      chapter: 2,
      topic: 'Nomenclature — Covalent Compounds',
      question: 'Do you know the IUPAC prefix rules for naming covalent (molecular) compounds — including when to use "mono-" and how to handle vowel drops?',
      followUp: {
        type: 'select-all',
        prompt: 'Which of the following covalent compound name–formula pairs are written correctly? Select all that apply.',
        options: [
          { id: 'a', text: 'N₂O₄  —  Nitrogen tetroxide' },
          { id: 'b', text: 'CCl₄  —  Carbon tetrachloride' },
          { id: 'c', text: 'SO₃  —  Disulfur trioxide' },
          { id: 'd', text: 'NO₂  —  Nitrogen dioxide' },
        ],
        correctIds: ['b', 'd'],
        // A is wrong: N₂ needs "di-" prefix → dinitrogen tetroxide
        // B is correct: no "mono" for first element; tetra- for 4 Cl
        // C is wrong: only one S → sulfur trioxide, not disulfur
        // D is correct: no "mono" for first element; di- for 2 O
      },
    },
    {
      id: 'ionic-transition-metal',
      chapter: 2,
      topic: 'Nomenclature — Ionic Compounds (Transition Metals)',
      question: 'Can you determine the charge of a transition metal ion in an ionic compound and correctly name it using Roman numerals?',
      followUp: {
        type: 'select-all',
        prompt: 'Which of the following ionic compound formula–name pairs are written correctly? Select all that apply.',
        options: [
          { id: 'a', text: 'FeCl₂  —  Iron(II) chloride' },
          { id: 'b', text: 'CuO  —  Copper oxide' },
          { id: 'c', text: 'MnO₂  —  Manganese(IV) oxide' },
          { id: 'd', text: 'Fe₂O₃  —  Iron(II) oxide' },
        ],
        correctIds: ['a', 'c'],
        // A correct: 2 Cl⁻ → Fe must be 2+ → iron(II) chloride ✓
        // B wrong: Cu can be +1 or +2 — Roman numeral required → copper(II) oxide
        // C correct: 2 O²⁻ = 4− → Mn must be 4+ → manganese(IV) oxide ✓
        // D wrong: 3 O²⁻ = 6− shared by 2 Fe → each Fe is 3+ → iron(III) oxide
      },
    },
    {
      id: 'oxoacid-nomenclature',
      chapter: 2,
      topic: 'Nomenclature — Oxoacids',
      question: 'Do you know the naming rules for oxoacids — using "-ic acid" for oxyanions ending in "-ate" and "-ous acid" for those ending in "-ite"?',
      followUp: {
        type: 'select-all',
        prompt: 'Which of the following oxoacid formula–name pairs are written correctly? Select all that apply.',
        options: [
          { id: 'a', text: 'H₂SO₄  —  Sulfuric acid' },
          { id: 'b', text: 'HNO₂  —  Nitric acid' },
          { id: 'c', text: 'H₃PO₃  —  Phosphorous acid' },
          { id: 'd', text: 'HClO₃  —  Hypochlorous acid' },
        ],
        correctIds: ['a', 'c'],
        // A correct: sulfate (SO₄²⁻) → sulfuric acid ✓
        // B wrong: HNO₂ comes from nitrite (NO₂⁻) → nitrous acid, not nitric
        // C correct: phosphite (PO₃³⁻) → phosphorous acid ✓
        // D wrong: HClO₃ comes from chlorate (ClO₃⁻) → chloric acid; hypochlorous acid is HClO
      },
    },

    // ── Chapter 3: Composition of Substances & Solutions ──────────────────
    {
      id: 'molar-mass-conversion',
      chapter: 3,
      topic: 'Molar Mass as a Conversion Factor',
      question: 'Can you use molar mass as a conversion factor to convert between grams and moles of a substance?',
      followUp: {
        prompt: 'How many moles are in 36.0 g of water (H₂O)? (Molar mass of H₂O = 18.02 g/mol)',
        options: [
          { id: 'a', text: '36.0 mol  (forgot to divide by molar mass)' },
          { id: 'b', text: '18.02 mol  (used the molar mass value directly as the answer)' },
          { id: 'c', text: '2.00 mol  (36.0 g ÷ 18.02 g/mol = 2.00 mol)' },
          { id: 'd', text: '0.501 mol  (divided molar mass by mass — inverted the conversion)' },
        ],
        correctId: 'c',
      },
    },
    {
      id: 'avogadro',
      chapter: 3,
      topic: "Avogadro's Number & Particle Counting",
      question: "Can you use Avogadro's number (6.022 × 10²³ mol⁻¹) to convert between moles and number of atoms, molecules, or formula units?",
      followUp: {
        prompt: 'How many molecules are in 2.00 mol of CO₂?  (Nₐ = 6.022 × 10²³ mol⁻¹)',
        options: [
          { id: 'a', text: '1.20 × 10²⁴ molecules  (2.00 mol × 6.022 × 10²³ mol⁻¹)' },
          { id: 'b', text: '3.32 × 10⁻²⁴ molecules  (divided instead of multiplied by Nₐ)' },
          { id: 'c', text: '6.022 × 10²³ molecules  (the number for 1 mol, not 2 mol)' },
          { id: 'd', text: '2.65 × 10²⁵ molecules  (mistakenly used molar mass 44.0 instead of 2.00 mol)' },
        ],
        correctId: 'a',
      },
    },
    {
      id: 'percent-composition',
      chapter: 3,
      topic: 'Percent Composition',
      question: 'Can you calculate the percent by mass of each element in a compound from its molecular formula and molar masses?',
      followUp: {
        prompt: 'What is the percent by mass of oxygen in CO₂?  (C = 12.01 g/mol, O = 16.00 g/mol; molar mass of CO₂ = 44.01 g/mol)',
        options: [
          { id: 'a', text: '% O = 16.00 / 44.01 × 100 = 36.4%  (counted only one oxygen atom)' },
          { id: 'b', text: '% O = 12.01 / 44.01 × 100 = 27.3%  (calculated percent carbon, not oxygen)' },
          { id: 'c', text: '% O = 2/3 × 100 = 66.7%  (counted atoms by number, not by mass)' },
          { id: 'd', text: '% O = 2(16.00) / 44.01 × 100 = 72.7%  (both oxygens included, divided by molar mass)' },
        ],
        correctId: 'd',
      },
    },
    {
      id: 'dilution',
      chapter: 3,
      topic: 'Dilution Equation  (C₁V₁ = C₂V₂)',
      question: 'Can you use the dilution equation C₁V₁ = C₂V₂ to find a missing concentration or volume when preparing a diluted solution?',
      followUp: {
        prompt: 'What volume of a 12.0 M HCl stock solution is needed to prepare 500 mL of 0.300 M HCl?',
        options: [
          { id: 'a', text: 'V₁ = (12.0 × 0.300) / 500 = 0.00720 mL  (rearrangement error)' },
          { id: 'b', text: 'V₁ = (0.300 × 500) / 12.0 = 12.5 mL  (correct: V₁ = C₂V₂ / C₁)' },
          { id: 'c', text: 'V₁ = (12.0 × 500) / 0.300 = 20,000 mL  (C₁ and C₂ are swapped)' },
          { id: 'd', text: 'V₁ = 0.300 × 500 × 12.0 = 1,800 mL  (multiplied all three values together)' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'molarity-conversion',
      chapter: 3,
      topic: 'Molarity as a Conversion Factor',
      question: 'Can you use molarity (mol/L) as a conversion factor in a dimensional analysis chain to find moles of solute from a given solution volume?',
      followUp: {
        prompt: 'How many moles of NaCl are in 250 mL of a 2.00 M NaCl solution? Which setup is correct?',
        options: [
          { id: 'a', text: '250 mL × (1000 mL / 1 L) × (2.00 mol / 1 L)' },
          { id: 'b', text: '250 mL × (1 L / 1000 mL) × (2.00 mol / 1 L) = 0.500 mol' },
          { id: 'c', text: '250 mL × (2.00 mol / 1 L) = 500 mol' },
          { id: 'd', text: '250 mL × (1 L / 1000 mL) × (1 L / 2.00 mol)' },
        ],
        correctId: 'b',
        // A wrong: mL→L conversion is inverted (multiplies by 1000 instead of dividing)
        // B correct: mL→L first, then mol/L gives mol ✓
        // C wrong: skipped the mL→L conversion; units don't cancel
        // D wrong: molarity is inverted (L/mol instead of mol/L)
      },
    },
    {
      id: 'grams-to-molecules',
      chapter: 3,
      topic: 'Grams → Moles → Molecules',
      question: 'Can you set up a dimensional analysis chain to convert a mass in grams to a number of molecules, using molar mass and Avogadro\'s number as conversion factors?',
      followUp: {
        prompt: 'How many molecules are in 9.00 g of H₂O? (Molar mass H₂O = 18.02 g/mol, Nₐ = 6.022 × 10²³ mol⁻¹) Which setup is correct?',
        options: [
          { id: 'a', text: '9.00 g × (18.02 g / 1 mol) × (6.022 × 10²³ molecules / 1 mol)' },
          { id: 'b', text: '9.00 g × (1 mol / 18.02 g) × (6.022 × 10²³ molecules / 1 mol) = 3.01 × 10²³ molecules' },
          { id: 'c', text: '9.00 g × (1 mol / 18.02 g) × (1 mol / 6.022 × 10²³ molecules)' },
          { id: 'd', text: '9.00 g × (6.022 × 10²³ molecules / 1 mol)' },
        ],
        correctId: 'b',
        // A wrong: molar mass is inverted (g/mol used as mol/g) — grams don't cancel
        // B correct: g → mol → molecules, all units cancel ✓
        // C wrong: Avogadro's number is inverted; gives mol²/molecules instead of molecules
        // D wrong: skipped g→mol step; grams never cancel
      },
    },
  ],

  // ─── CHM116: Chapters 12–17 (formerly CHM113 second semester) ───────────
  CHM116: [
    {
      id: 'solutions-molarity',
      chapter: 11,
      topic: 'Solutions & Concentration',
      question: 'Can you calculate the molarity of a solution or set up a dilution problem?',
      followUp: {
        prompt: 'Which of the following correctly calculates the molarity when 4.0 mol of NaCl is dissolved in enough water to make 2.0 L of solution?',
        options: [
          { id: 'a', text: 'M = 4.0 mol ÷ 2.0 L = 2.0 M' },
          { id: 'b', text: 'M = 2.0 L ÷ 4.0 mol = 0.50 M' },
          { id: 'c', text: 'M = 4.0 mol × 2.0 L = 8.0 M' },
          { id: 'd', text: 'M = (4.0 + 2.0) ÷ 2 = 3.0 M' },
        ],
        correctId: 'a',
      },
    },
    {
      id: 'colligative',
      chapter: 11,
      topic: 'Colligative Properties',
      question: 'Do you understand how dissolved solutes affect boiling point, freezing point, and osmotic pressure of a solution?',
      followUp: {
        prompt: 'Which statement correctly explains why dissolving a solute in water raises its boiling point?',
        options: [
          { id: 'a', text: 'Solute particles increase the vapor pressure of water, so less energy is needed to reach boiling.' },
          { id: 'b', text: 'Solute particles lower the vapor pressure of water; more heat is needed to bring the pressure up to atmospheric.' },
          { id: 'c', text: 'The solute reacts with water to release heat, directly raising the temperature of the solution.' },
          { id: 'd', text: 'The added mass of the solute makes the solution denser and harder to heat.' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'rate-laws',
      chapter: 12,
      topic: 'Chemical Kinetics — Rate Laws',
      question: 'Can you determine the order of a reaction and write a rate law from experimental data?',
      followUp: {
        prompt: 'In an experiment, when [A] = 0.10 M the rate = 0.020 M/s, and when [A] = 0.20 M the rate = 0.080 M/s (all else constant). Which rate law fits this data?',
        options: [
          { id: 'a', text: 'rate = k  (zero order — rate is independent of [A])' },
          { id: 'b', text: 'rate = k[A]  (first order — doubling [A] doubles the rate)' },
          { id: 'c', text: 'rate = k[A]²  (second order — doubling [A] quadruples the rate)' },
          { id: 'd', text: 'rate = k[A]³  (third order — doubling [A] gives 8× the rate)' },
        ],
        correctId: 'c',
      },
    },
    {
      id: 'half-life',
      chapter: 12,
      topic: 'Chemical Kinetics — Half-Life',
      question: 'Do you know how to calculate the half-life of a first-order reaction from its rate constant?',
      followUp: {
        prompt: 'A first-order reaction has a rate constant k = 0.0693 min⁻¹. What is its half-life?',
        options: [
          { id: 'a', text: 't½ = k ÷ ln 2 = 0.0693 ÷ 0.693 = 0.10 min' },
          { id: 'b', text: 't½ = ln 2 ÷ k = 0.693 ÷ 0.0693 = 10.0 min' },
          { id: 'c', text: 't½ = 1 ÷ k = 1 ÷ 0.0693 = 14.4 min' },
          { id: 'd', text: 't½ = k × ln 2 = 0.0693 × 0.693 = 0.048 min' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'equilibrium',
      chapter: 13,
      topic: 'Chemical Equilibrium',
      question: 'Can you write the equilibrium constant expression (Kc) for a chemical reaction?',
      followUp: {
        prompt: 'For the reaction  N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g),  which is the correct Kc expression?',
        options: [
          { id: 'a', text: 'Kc = [N₂][H₂]³ / [NH₃]²' },
          { id: 'b', text: 'Kc = [NH₃]² / ([N₂][H₂]³)' },
          { id: 'c', text: 'Kc = 2[NH₃] / ([N₂] + 3[H₂])' },
          { id: 'd', text: 'Kc = [NH₃] / ([N₂][H₂])' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'ph-strong',
      chapter: 14,
      topic: 'Acid-Base Equilibria — pH',
      question: 'Can you calculate the pH of a strong acid or base solution, and explain the difference between strong and weak acids?',
      followUp: {
        prompt: 'What is the pH of a 0.010 M HCl solution at 25 °C?',
        options: [
          { id: 'a', text: 'pH = 1.0  (using pH = −log[HCl] = −log(0.10))' },
          { id: 'b', text: 'pH = 2.0  (pH = −log(0.010) = 2.0)' },
          { id: 'c', text: 'pH = 7.0  (HCl is neutral in water)' },
          { id: 'd', text: 'pH = 12.0  (pOH = −log(0.010) = 2, then pH = 14 − 2)' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'buffers',
      chapter: 15,
      topic: 'Buffers & Henderson-Hasselbalch',
      question: 'Can you use the Henderson-Hasselbalch equation to calculate the pH of a buffer solution?',
      followUp: {
        prompt: 'A buffer contains 0.10 M acetic acid and 0.10 M sodium acetate (pKₐ = 4.74). What is the pH?',
        options: [
          { id: 'a', text: 'pH = 2.37  (pH = pKₐ ÷ 2)' },
          { id: 'b', text: 'pH = 7.00  (a buffer always gives a neutral pH)' },
          { id: 'c', text: 'pH = 4.74  (pH = pKₐ + log([A⁻]/[HA]) = 4.74 + log(1) = 4.74)' },
          { id: 'd', text: 'pH = 9.48  (pH = 2 × pKₐ)' },
        ],
        correctId: 'c',
      },
    },
    {
      id: 'gibbs',
      chapter: 16,
      topic: 'Thermodynamics — Gibbs Free Energy',
      question: 'Can you use ΔG = ΔH − TΔS to determine whether a reaction is thermodynamically spontaneous?',
      followUp: {
        prompt: 'A reaction has ΔH = −50 kJ/mol and ΔS = +100 J/(mol·K) at 298 K. What is ΔG, and is the reaction spontaneous?',
        options: [
          { id: 'a', text: 'ΔG = −50 kJ − 298(0.100 kJ/K) = −79.8 kJ; spontaneous' },
          { id: 'b', text: 'ΔG = −50 kJ + 298(0.100 kJ/K) = −20.2 kJ; spontaneous' },
          { id: 'c', text: 'ΔG = +50 kJ − 298(0.100 kJ/K) = +20.2 kJ; non-spontaneous' },
          { id: 'd', text: 'ΔG = −50 kJ ÷ 298 K = −0.17 kJ; spontaneous' },
        ],
        correctId: 'a',
      },
    },
    {
      id: 'electrochemistry',
      chapter: 17,
      topic: 'Electrochemistry — Cell Potential',
      question: 'Can you calculate the standard cell potential (E°cell) for a galvanic cell using standard reduction potentials?',
      followUp: {
        prompt: 'A galvanic cell has E°(cathode) = +0.34 V (Cu²⁺/Cu) and E°(anode) = −0.76 V (Zn²⁺/Zn). What is E°cell?',
        options: [
          { id: 'a', text: 'E°cell = E°cathode − E°anode = 0.34 − (−0.76) = +1.10 V' },
          { id: 'b', text: 'E°cell = E°cathode + E°anode = 0.34 + (−0.76) = −0.42 V' },
          { id: 'c', text: 'E°cell = E°anode − E°cathode = −0.76 − 0.34 = −1.10 V' },
          { id: 'd', text: 'E°cell = |E°cathode| − |E°anode| = 0.34 − 0.76 = −0.42 V' },
        ],
        correctId: 'a',
      },
    },
  ],
}
