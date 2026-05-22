export const QUESTIONS = {
  CHM113: [
    {
      id: 'molarity',
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
