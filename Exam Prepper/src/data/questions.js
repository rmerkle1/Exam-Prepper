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

    // ── Chapter 1 ─────────────────────────────────────────────────────────
    {
      id: 'sig-figs-count',
      chapter: 1,
      topicGroup: 'Significant Figures',
      topic: 'Significant Figures — Counting',
      studyNote: 'Review the four sig fig rules: non-zero digits always count; zeros sandwiched between non-zeros count; trailing zeros after a decimal count; leading zeros never count. (OpenStax §1.5)',
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
      topicGroup: 'Significant Figures',
      topic: 'Significant Figures — Calculations',
      studyNote: 'For multiplication/division keep the fewest sig figs. For addition/subtraction keep the fewest decimal places. Always apply rounding at the end, not in intermediate steps. (OpenStax §1.5)',
      question: 'Can you apply significant figure rules when multiplying, dividing, adding, or subtracting measured values?',
      followUp: {
        prompt: 'Calculate 12.5 × 0.234 and express the answer with the correct number of significant figures.',
        options: [
          { id: 'a', latex: '12.5 \\times 0.234 = 2.9', text: '2 significant figures — incorrect; both factors have 3' },
          { id: 'b', latex: '12.5 \\times 0.234 = 2.93', text: '3 significant figures — matches the fewest sig figs in the problem' },
          { id: 'c', latex: '12.5 \\times 0.234 = 2.925', text: '4 significant figures — unrounded calculator result' },
          { id: 'd', latex: '12.5 \\times 0.234 = 2.9250', text: '5 significant figures — adds unjustified precision' },
        ],
        correctId: 'b',
      },
    },

    {
      id: 'metric-conversions',
      chapter: 1,
      topicGroup: 'Measurement & Conversions',
      topic: 'Metric Unit Conversions',
      studyNote: 'Memorize the common prefixes: kilo- (10³), centi- (10⁻²), milli- (10⁻³), micro- (10⁻⁶), nano- (10⁻⁹). Set up each conversion factor so the unwanted unit cancels. (OpenStax §1.4)',
      question: 'Can you convert between metric units such as mL to L, mg to g, or nm to m using dimensional analysis?',
      followUp: {
        prompt: 'How many liters are equivalent to 2,500 mL? Select the correct dimensional analysis setup.',
        options: [
          { id: 'a', latex: '2500 \\text{ mL} \\times \\dfrac{1000 \\text{ mL}}{1 \\text{ L}} = 2{,}500{,}000 \\text{ L}', text: 'Conversion factor is inverted — mL remain in numerator' },
          { id: 'b', latex: '2500 \\text{ mL} \\times \\dfrac{1 \\text{ L}}{100 \\text{ mL}} = 25.0 \\text{ L}', text: 'Wrong factor — divided by 100 instead of 1000' },
          { id: 'c', latex: '2500 \\text{ mL} \\times \\dfrac{1 \\text{ L}}{1000 \\text{ mL}} = 2.50 \\text{ L}', text: 'mL cancel correctly; 1 L = 1000 mL' },
          { id: 'd', latex: '2500 \\text{ mL} \\times \\dfrac{1 \\text{ L}}{10{,}000 \\text{ mL}} = 0.250 \\text{ L}', text: 'Wrong factor — divided by 10,000 instead of 1000' },
        ],
        correctId: 'c',
      },
    },

    {
      id: 'classifying-matter',
      chapter: 1,
      topicGroup: 'Classification of Matter',
      topic: 'Classifying Matter',
      studyNote: 'Learn the classification hierarchy: matter → pure substance (element or compound) vs. mixture (homogeneous = uniform, heterogeneous = visibly non-uniform). (OpenStax §1.2)',
      question: 'Can you classify a sample of matter as an element, compound, homogeneous mixture, or heterogeneous mixture?',
      followUp: {
        prompt: 'Which of the following is the best example of a heterogeneous mixture?',
        options: [
          { id: 'a', text: 'Salt dissolved in water  (uniform throughout — homogeneous mixture)' },
          { id: 'b', text: 'Pure copper metal  (single element, not a mixture)' },
          { id: 'c', text: 'Carbon dioxide gas  (two elements chemically combined — compound)' },
          { id: 'd', text: 'Italian salad dressing with visible oil and water layers  (two distinct phases — heterogeneous)' },
        ],
        correctId: 'd',
      },
    },

    // ── Chapter 2 ─────────────────────────────────────────────────────────
    {
      id: 'periodic-table-groups',
      chapter: 2,
      topicGroup: 'Periodic Table',
      topic: 'Periodic Table — Group Names',
      studyNote: 'Memorize group names by number: Group 1 = alkali metals, Group 2 = alkaline earth metals, Groups 3–12 = transition metals, Group 17 = halogens, Group 18 = noble gases. (OpenStax §2.5)',
      question: 'Can you identify the major group names on the periodic table and locate them by group number?',
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
      topicGroup: 'Atomic Structure',
      topic: 'Subatomic Particles — Isotopes & Ions',
      studyNote: 'Key rules: atomic number = # protons (never changes for an element); # neutrons = mass number − atomic number; neutral atom has # electrons = # protons; isotopes differ in neutrons; ions differ in electrons. (OpenStax §2.3)',
      question: 'Do you know how to find the number of protons, neutrons, and electrons for a neutral atom, an isotope, and an ion?',
      visual: {
        type: 'element-card',
        atomicNumber: 11,
        symbol: 'Na',
        name: 'Sodium',
        atomicMass: '22.990 amu',
      },
      followUp: {
        type: 'multi-dropdown',
        prompt: 'Using the sodium element card, fill in the number of protons, neutrons, and electrons for each species.',
        columnHeaders: ['Protons', 'Neutrons', 'Electrons'],
        subQuestions: [
          {
            id: 'neutral',
            label: 'Neutral Na (mass # 23)',
            fields: [
              { id: 'protons',   correctValue: '11', options: ['9','10','11','12','13'] },
              { id: 'neutrons',  correctValue: '12', options: ['10','11','12','13','14'] },
              { id: 'electrons', correctValue: '11', options: ['9','10','11','12','13'] },
            ],
          },
          {
            id: 'isotope',
            label: 'Sodium-24 (Na-24)',
            fields: [
              { id: 'protons',   correctValue: '11', options: ['9','10','11','12','13'] },
              { id: 'neutrons',  correctValue: '13', options: ['10','11','12','13','14'] },
              { id: 'electrons', correctValue: '11', options: ['9','10','11','12','13'] },
            ],
          },
          {
            id: 'ion',
            label: 'Sodium ion (Na⁺)',
            fields: [
              { id: 'protons',   correctValue: '11', options: ['9','10','11','12','13'] },
              { id: 'neutrons',  correctValue: '12', options: ['10','11','12','13','14'] },
              { id: 'electrons', correctValue: '10', options: ['9','10','11','12','13'] },
            ],
          },
        ],
      },
    },

    {
      id: 'avg-atomic-mass',
      chapter: 2,
      topicGroup: 'Atomic Structure',
      topic: 'Average Atomic Mass',
      studyNote: 'Use the weighted average formula: avg mass = Σ(fractional abundance × isotope mass). Always convert percent abundance to decimal form (divide by 100) before multiplying. (OpenStax §2.3)',
      question: 'Can you calculate the average atomic mass of an element from its isotopes\' masses and natural percent abundances?',
      followUp: {
        visual: {
          type: 'data-table',
          caption: 'Isotopic data for chlorine',
          headers: ['Isotope', 'Atomic Mass (amu)', 'Natural Abundance'],
          rows: [
            ['³⁵Cl', '34.97 amu', '75.77%'],
            ['³⁷Cl', '36.97 amu', '24.23%'],
          ],
        },
        prompt: 'Using the data above, which calculation gives the correct average atomic mass of chlorine?',
        options: [
          { id: 'a', latex: '\\dfrac{34.97 + 36.97}{2} = 35.97 \\text{ amu}', text: 'Simple average — ignores the different abundances' },
          { id: 'b', latex: '0.7577(34.97) + 0.2423(36.97) = 35.45 \\text{ amu}', text: 'Weighted by fractional abundance (decimal form)' },
          { id: 'c', latex: '75.77(34.97) + 24.23(36.97) = 3{,}550 \\text{ amu}', text: 'Used percent values directly instead of converting to decimals first' },
          { id: 'd', latex: '\\dfrac{75.77 + 24.23}{34.97 + 36.97} = 1.39 \\text{ amu}', text: 'Not a valid formula for weighted average' },
        ],
        correctId: 'b',
      },
    },

    {
      id: 'nomenclature',
      chapter: 2,
      topicGroup: 'Chemical Nomenclature',
      topic: 'Nomenclature — Ionic Compounds',
      studyNote: 'To write an ionic formula: identify each ion\'s charge, then use the criss-cross method to balance charges. For naming, state the cation name first, then the anion with "-ide" suffix. (OpenStax §2.6)',
      question: 'Can you name ionic compounds and write their molecular formulas from a name?',
      followUp: {
        prompt: 'What is the correct molecular formula for copper(II) nitrate?',
        options: [
          { id: 'a', text: 'CuNO₃  (assumes 1:1 ratio; charges don\'t balance: Cu²⁺ needs two NO₃⁻)' },
          { id: 'b', text: 'Cu(NO₃)₂  (Cu²⁺ requires two NO₃⁻ ions to give a net charge of zero)' },
          { id: 'c', text: 'Cu₂NO₃  (two Cu for one nitrate — charges still unbalanced)' },
          { id: 'd', text: 'Cu₂(NO₃)₃  (would imply each Cu is 3+, but name says copper(II))' },
        ],
        correctId: 'b',
      },
    },

    {
      id: 'covalent-nomenclature',
      chapter: 2,
      topicGroup: 'Chemical Nomenclature',
      topic: 'Nomenclature — Covalent Compounds',
      studyNote: 'Covalent compound naming: use IUPAC prefixes (mono, di, tri, tetra, penta…) for both elements; drop "mono" for the first element only; drop trailing vowel of prefix before element names starting with a vowel (e.g., "tetroxide" not "tetraoxide"). (OpenStax §2.6)',
      question: 'Do you know the IUPAC prefix rules for naming covalent (molecular) compounds?',
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
        // A wrong: N₂ requires "di-" prefix → dinitrogen tetroxide
        // B correct: no "mono" for first element; tetrachloride for 4 Cl ✓
        // C wrong: only one S → sulfur trioxide, not disulfur
        // D correct: no "mono" for first element; dioxide for 2 O ✓
      },
    },

    {
      id: 'ionic-transition-metal',
      chapter: 2,
      topicGroup: 'Chemical Nomenclature',
      topic: 'Nomenclature — Ionic Compounds (Transition Metals)',
      studyNote: 'For transition metals with variable charges, find the metal\'s charge from the anion(s): metal charge = total anion charge (reversed sign). Always include the Roman numeral in the name. (OpenStax §2.6)',
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
        // A correct: 2 Cl⁻ → Fe is 2+ → iron(II) chloride ✓
        // B wrong: Cu can be +1 or +2 — Roman numeral required
        // C correct: 2 O²⁻ = 4− total → Mn is 4+ → manganese(IV) oxide ✓
        // D wrong: 3 O²⁻ = 6−, shared by 2 Fe → each Fe is 3+ → iron(III) oxide
      },
    },

    {
      id: 'acid-nomenclature',
      chapter: 2,
      topicGroup: 'Chemical Nomenclature',
      topic: 'Nomenclature — Acid Naming',
      studyNote: 'Two systems: (1) Oxoacids — if the oxyanion ends in "-ate" → "-ic acid"; if it ends in "-ite" → "-ous acid". (2) Hydroacids — binary acids in water: HX(aq) → "hydro[root]ic acid" (e.g., HF → hydrofluoric acid). (OpenStax §2.7)',
      question: 'Do you know how to name oxoacids (using -ic acid / -ous acid suffixes) and hydroacids (using the hydro- prefix)?',
      followUp: {
        type: 'select-all',
        prompt: 'Which of the following acid formula–name pairs are written correctly? Select all that apply.',
        options: [
          { id: 'a', text: 'H₂SO₃  —  Sulfurous acid' },
          { id: 'b', text: 'HNO₂  —  Nitric acid' },
          { id: 'c', text: 'HF  —  Hydrofluoric acid' },
          { id: 'd', text: 'HClO₃  —  Hypochlorous acid' },
        ],
        correctIds: ['a', 'c'],
        // A correct: sulfite (SO₃²⁻) ends in "-ite" → sulfurous acid ✓
        // B wrong: HNO₂ comes from nitrite → nitrous acid, not nitric
        // C correct: HF is a hydroacid → hydrofluoric acid ✓
        // D wrong: HClO₃ comes from chlorate → chloric acid; hypochlorous = HClO
      },
    },

    // ── Chapter 3 ─────────────────────────────────────────────────────────
    {
      id: 'molar-mass-conversion',
      chapter: 3,
      topicGroup: 'Mole Conversions',
      topic: 'Molar Mass as a Conversion Factor',
      studyNote: 'Molar mass (g/mol) converts grams ↔ moles. Place it so the unit you want to cancel is in the denominator: grams → moles uses (1 mol / molar mass g). (OpenStax §3.1)',
      question: 'Can you use molar mass as a conversion factor to convert between grams and moles of a substance?',
      followUp: {
        prompt: 'How many moles are in 36.0 g of water (H₂O)? (Molar mass of H₂O = 18.02 g/mol) Select the correct setup.',
        options: [
          { id: 'a', latex: '36.0 \\text{ g} \\times \\dfrac{18.02 \\text{ g}}{1 \\text{ mol}}', text: 'Molar mass is inverted — grams appear in numerator and denominator' },
          { id: 'b', latex: '36.0 \\text{ g} \\times \\dfrac{1 \\text{ mol}}{18.02 \\text{ g}} = 2.00 \\text{ mol}', text: 'Grams cancel correctly, leaving moles' },
          { id: 'c', latex: '\\dfrac{18.02 \\text{ g/mol}}{36.0 \\text{ g}} = 0.501 \\text{ mol}^{-1}', text: 'Numerator and denominator are swapped; result has wrong units' },
          { id: 'd', latex: '36.0 \\text{ g} + 18.02 \\text{ g/mol}', text: 'Cannot add values with different units' },
        ],
        correctId: 'b',
      },
    },

    {
      id: 'avogadro',
      chapter: 3,
      topicGroup: 'Mole Conversions',
      topic: "Avogadro's Number & Particle Counting",
      studyNote: "Avogadro's number (6.022 × 10²³ mol⁻¹) converts moles ↔ particles. Multiply moles × Nₐ to get particles; divide particles by Nₐ to get moles. Chain g → mol → particles uses two conversion factors. (OpenStax §3.1)",
      question: "Can you use Avogadro's number (6.022 × 10²³ mol⁻¹) to convert between moles and number of atoms, molecules, or formula units?",
      followUp: {
        prompt: 'How many molecules are in 2.00 mol of CO₂?  (Nₐ = 6.022 × 10²³ mol⁻¹) Select the correct setup.',
        options: [
          { id: 'a', latex: '2.00 \\text{ mol} \\times \\dfrac{6.022 \\times 10^{23} \\text{ molecules}}{1 \\text{ mol}} = 1.20 \\times 10^{24} \\text{ molecules}', text: 'Moles cancel correctly, leaving molecules' },
          { id: 'b', latex: '2.00 \\text{ mol} \\times \\dfrac{1 \\text{ mol}}{6.022 \\times 10^{23} \\text{ molecules}}', text: "Avogadro's number is inverted — moles don't cancel" },
          { id: 'c', latex: '1.00 \\text{ mol} \\times \\dfrac{6.022 \\times 10^{23} \\text{ molecules}}{1 \\text{ mol}} = 6.022 \\times 10^{23}', text: 'Used 1 mol instead of the given 2.00 mol' },
          { id: 'd', latex: '44.0 \\tfrac{\\text{g}}{\\text{mol}} \\times \\dfrac{6.022 \\times 10^{23} \\text{ molecules}}{1 \\text{ mol}}', text: 'Used the molar mass of CO₂ instead of the given number of moles' },
        ],
        correctId: 'a',
      },
    },

    {
      id: 'percent-composition',
      chapter: 3,
      topicGroup: 'Percent Composition',
      topic: 'Percent Composition',
      studyNote: 'Formula: % element = (mass of element in 1 mol of compound / molar mass of compound) × 100. Be sure to multiply the element\'s molar mass by the number of atoms of that element in the formula. (OpenStax §3.2)',
      question: 'Can you calculate the percent by mass of each element in a compound from its molecular formula and molar masses?',
      followUp: {
        prompt: 'What is the percent by mass of oxygen in CO₂?  (C = 12.01 g/mol, O = 16.00 g/mol; molar mass CO₂ = 44.01 g/mol) Select the correct setup.',
        options: [
          { id: 'a', latex: '\\%\\,\\text{O} = \\dfrac{16.00 \\text{ g/mol}}{44.01 \\text{ g/mol}} \\times 100 = 36.4\\%', text: 'Counted only one oxygen atom instead of two' },
          { id: 'b', latex: '\\%\\,\\text{O} = \\dfrac{12.01 \\text{ g/mol}}{44.01 \\text{ g/mol}} \\times 100 = 27.3\\%', text: 'Calculated percent carbon, not oxygen' },
          { id: 'c', latex: '\\%\\,\\text{O} = \\dfrac{2}{3} \\times 100 = 66.7\\%', text: 'Counted atoms by number, not by mass' },
          { id: 'd', latex: '\\%\\,\\text{O} = \\dfrac{2(16.00) \\text{ g/mol}}{44.01 \\text{ g/mol}} \\times 100 = 72.7\\%', text: 'Both oxygen atoms included, divided by total molar mass' },
        ],
        correctId: 'd',
      },
    },

    {
      id: 'dilution',
      chapter: 3,
      topicGroup: 'Solution Concentration',
      topic: 'Dilution Equation  (C₁V₁ = C₂V₂)',
      studyNote: 'Rearrange C₁V₁ = C₂V₂ for the unknown. Remember: C₁ and V₁ are the concentrated stock solution; C₂ and V₂ are the diluted solution being prepared. V₂ is the total final volume, not the volume of water added. (OpenStax §3.4)',
      question: 'Can you use the dilution equation C₁V₁ = C₂V₂ to find a missing concentration or volume when preparing a diluted solution?',
      followUp: {
        prompt: 'What volume of a 12.0 M HCl stock solution is needed to prepare 500 mL of 0.300 M HCl? Select the correct setup.',
        options: [
          { id: 'a', latex: 'V_1 = \\dfrac{C_1 \\times C_2}{V_2} = \\dfrac{12.0 \\times 0.300}{500} = 0.0072 \\text{ mL}', text: 'Incorrect rearrangement of C₁V₁ = C₂V₂' },
          { id: 'b', latex: 'V_1 = \\dfrac{C_2 V_2}{C_1} = \\dfrac{0.300 \\text{ M} \\times 500 \\text{ mL}}{12.0 \\text{ M}} = 12.5 \\text{ mL}', text: 'Correct rearrangement: V₁ = C₂V₂ / C₁' },
          { id: 'c', latex: 'V_1 = \\dfrac{C_1 V_2}{C_2} = \\dfrac{12.0 \\text{ M} \\times 500 \\text{ mL}}{0.300 \\text{ M}} = 20{,}000 \\text{ mL}', text: 'C₁ and C₂ are swapped in the rearrangement' },
          { id: 'd', latex: 'V_1 = C_1 \\times C_2 \\times V_2 = 12.0 \\times 0.300 \\times 500 = 1800', text: 'All three values multiplied together — not a valid rearrangement' },
        ],
        correctId: 'b',
      },
    },

    {
      id: 'molarity-conversion',
      chapter: 3,
      topicGroup: 'Solution Concentration',
      topic: 'Molarity as a Conversion Factor',
      studyNote: 'Use molarity (mol/L) as a conversion factor between moles and liters. Always convert mL → L first (÷ 1000), then apply molarity. Chain the fractions so each unwanted unit cancels. (OpenStax §3.4)',
      question: 'Can you use molarity (mol/L) as a conversion factor to find moles of solute from a given solution volume?',
      followUp: {
        prompt: 'How many moles of NaCl are in 250 mL of a 2.00 M NaCl solution? Select the correct setup.',
        options: [
          { id: 'a', latex: '250 \\text{ mL} \\times \\dfrac{1000 \\text{ mL}}{1 \\text{ L}} \\times \\dfrac{2.00 \\text{ mol}}{1 \\text{ L}}', text: 'mL→L conversion is inverted — mL multiply instead of cancel' },
          { id: 'b', latex: '250 \\text{ mL} \\times \\dfrac{1 \\text{ L}}{1000 \\text{ mL}} \\times \\dfrac{2.00 \\text{ mol}}{1 \\text{ L}} = 0.500 \\text{ mol}', text: 'mL cancel, then L cancel — only mol remains' },
          { id: 'c', latex: '250 \\text{ mL} \\times \\dfrac{2.00 \\text{ mol}}{1 \\text{ L}} = 500 \\text{ mol}', text: 'Skipped mL→L conversion; mL and L never cancel' },
          { id: 'd', latex: '250 \\text{ mL} \\times \\dfrac{1 \\text{ L}}{1000 \\text{ mL}} \\times \\dfrac{1 \\text{ L}}{2.00 \\text{ mol}}', text: 'Molarity is inverted — gives L²/mol, not mol' },
        ],
        correctId: 'b',
      },
    },

    {
      id: 'grams-to-molecules',
      chapter: 3,
      topicGroup: 'Mole Conversions',
      topic: 'Grams → Moles → Molecules',
      studyNote: 'Two-step chain: (1) g → mol using molar mass as (1 mol / molar mass g); (2) mol → molecules using Nₐ as (6.022 × 10²³ / 1 mol). Write units at each step and verify they cancel before calculating. (OpenStax §3.1)',
      question: 'Can you set up a dimensional analysis chain to convert grams to number of molecules using molar mass and Avogadro\'s number?',
      followUp: {
        prompt: 'How many molecules are in 9.00 g of H₂O? (Molar mass H₂O = 18.02 g/mol, Nₐ = 6.022 × 10²³ mol⁻¹) Select the correct setup.',
        options: [
          { id: 'a', latex: '9.00 \\text{ g} \\times \\dfrac{18.02 \\text{ g}}{1 \\text{ mol}} \\times \\dfrac{6.022 \\times 10^{23} \\text{ molec.}}{1 \\text{ mol}}', text: 'Molar mass is inverted — grams don\'t cancel' },
          { id: 'b', latex: '9.00 \\text{ g} \\times \\dfrac{1 \\text{ mol}}{18.02 \\text{ g}} \\times \\dfrac{6.022 \\times 10^{23} \\text{ molec.}}{1 \\text{ mol}} = 3.01 \\times 10^{23}', text: 'g cancel, then mol cancel — only molecules remain' },
          { id: 'c', latex: '9.00 \\text{ g} \\times \\dfrac{1 \\text{ mol}}{18.02 \\text{ g}} \\times \\dfrac{1 \\text{ mol}}{6.022 \\times 10^{23} \\text{ molec.}}', text: "Avogadro's number is inverted — units don't simplify to molecules" },
          { id: 'd', latex: '9.00 \\text{ g} \\times \\dfrac{6.022 \\times 10^{23} \\text{ molec.}}{1 \\text{ mol}}', text: 'Skipped the g→mol step; grams never cancel' },
        ],
        correctId: 'b',
      },
    },
  ],

  // ─── CHM116: Chapters 12–17 ──────────────────────────────────────────────
  CHM116: [
    {
      id: 'solutions-molarity', chapter: 11, topic: 'Solutions & Concentration',
      question: 'Can you calculate the molarity of a solution or set up a dilution problem?',
      followUp: {
        prompt: 'Which correctly calculates molarity when 4.0 mol NaCl is dissolved to make 2.0 L of solution?',
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
      id: 'colligative', chapter: 11, topic: 'Colligative Properties',
      question: 'Do you understand how dissolved solutes affect boiling point, freezing point, and osmotic pressure?',
      followUp: {
        prompt: 'Which statement correctly explains why dissolving a solute in water raises its boiling point?',
        options: [
          { id: 'a', text: 'Solute particles increase vapor pressure, so less energy is needed to boil.' },
          { id: 'b', text: 'Solute particles lower vapor pressure; more heat is needed to reach atmospheric pressure.' },
          { id: 'c', text: 'The solute reacts with water to release heat, raising the temperature.' },
          { id: 'd', text: 'The added mass makes the solution denser and harder to heat.' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'rate-laws', chapter: 12, topic: 'Chemical Kinetics — Rate Laws',
      question: 'Can you determine the order of a reaction and write a rate law from experimental data?',
      followUp: {
        prompt: 'When [A] doubles and rate quadruples, which rate law fits?',
        options: [
          { id: 'a', text: 'rate = k  (zero order)' },
          { id: 'b', text: 'rate = k[A]  (first order)' },
          { id: 'c', text: 'rate = k[A]²  (second order)' },
          { id: 'd', text: 'rate = k[A]³  (third order)' },
        ],
        correctId: 'c',
      },
    },
    {
      id: 'half-life', chapter: 12, topic: 'Chemical Kinetics — Half-Life',
      question: 'Do you know how to calculate the half-life of a first-order reaction?',
      followUp: {
        prompt: 'A first-order reaction has k = 0.0693 min⁻¹. What is t½?',
        options: [
          { id: 'a', text: 't½ = k ÷ ln 2 = 0.10 min' },
          { id: 'b', text: 't½ = ln 2 ÷ k = 10.0 min' },
          { id: 'c', text: 't½ = 1 ÷ k = 14.4 min' },
          { id: 'd', text: 't½ = k × ln 2 = 0.048 min' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'equilibrium', chapter: 13, topic: 'Chemical Equilibrium',
      question: 'Can you write the equilibrium constant expression (Kc) for a reaction?',
      followUp: {
        prompt: 'For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), which is the correct Kc?',
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
      id: 'ph-strong', chapter: 14, topic: 'Acid-Base Equilibria — pH',
      question: 'Can you calculate the pH of a strong acid or base solution?',
      followUp: {
        prompt: 'What is the pH of 0.010 M HCl at 25 °C?',
        options: [
          { id: 'a', text: 'pH = 1.0' },
          { id: 'b', text: 'pH = 2.0' },
          { id: 'c', text: 'pH = 7.0' },
          { id: 'd', text: 'pH = 12.0' },
        ],
        correctId: 'b',
      },
    },
    {
      id: 'buffers', chapter: 15, topic: 'Buffers & Henderson-Hasselbalch',
      question: 'Can you use Henderson-Hasselbalch to find the pH of a buffer?',
      followUp: {
        prompt: 'Buffer: 0.10 M acetic acid + 0.10 M sodium acetate, pKₐ = 4.74. What is pH?',
        options: [
          { id: 'a', text: 'pH = 2.37' },
          { id: 'b', text: 'pH = 7.00' },
          { id: 'c', text: 'pH = 4.74' },
          { id: 'd', text: 'pH = 9.48' },
        ],
        correctId: 'c',
      },
    },
    {
      id: 'gibbs', chapter: 16, topic: 'Thermodynamics — Gibbs Free Energy',
      question: 'Can you use ΔG = ΔH − TΔS to predict spontaneity?',
      followUp: {
        prompt: 'ΔH = −50 kJ/mol, ΔS = +100 J/(mol·K), T = 298 K. What is ΔG?',
        options: [
          { id: 'a', text: 'ΔG = −50 − 298(0.100) = −79.8 kJ; spontaneous' },
          { id: 'b', text: 'ΔG = −50 + 298(0.100) = −20.2 kJ; spontaneous' },
          { id: 'c', text: 'ΔG = +50 − 298(0.100) = +20.2 kJ; non-spontaneous' },
          { id: 'd', text: 'ΔG = −50 ÷ 298 = −0.17 kJ; spontaneous' },
        ],
        correctId: 'a',
      },
    },
    {
      id: 'electrochemistry', chapter: 17, topic: 'Electrochemistry — Cell Potential',
      question: 'Can you calculate E°cell from standard reduction potentials?',
      followUp: {
        prompt: 'E°(cathode) = +0.34 V, E°(anode) = −0.76 V. What is E°cell?',
        options: [
          { id: 'a', text: 'E°cell = 0.34 − (−0.76) = +1.10 V' },
          { id: 'b', text: 'E°cell = 0.34 + (−0.76) = −0.42 V' },
          { id: 'c', text: 'E°cell = −0.76 − 0.34 = −1.10 V' },
          { id: 'd', text: 'E°cell = 0.34 − 0.76 = −0.42 V' },
        ],
        correctId: 'a',
      },
    },
  ],
}
