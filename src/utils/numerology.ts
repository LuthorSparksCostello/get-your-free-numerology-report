
// Chaldean numerology mapping
const chaldeanValues: { [key: string]: number } = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
  N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7
};

// Helper function to reduce to single digit while preserving master numbers
const reduceWithMasterNumbers = (num: number): { final: number, steps: string[] } => {
  const steps: string[] = [];
  
  // First, reduce very large numbers by breaking them down
  while (num > 99) {
    const digits = num.toString().split('');
    const sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);
    steps.push(`${num} → ${digits.join(' + ')} = ${sum}`);
    num = sum;
  }
  
  // Preserve master numbers 11 and 22
  if (num === 11 || num === 22) {
    steps.push(`${num} is a Master Number - not reduced further`);
    return { final: num, steps };
  }
  
  // Continue reducing if it's not a master number but still > 9
  while (num > 9) {
    const digits = num.toString().split('');
    const sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);
    steps.push(`${num} → ${digits.join(' + ')} = ${sum}`);
    num = sum;
    
    // Check again for master numbers after reduction
    if (num === 11 || num === 22) {
      steps.push(`${num} is a Master Number - not reduced further`);
      return { final: num, steps };
    }
  }
  
  return { final: num, steps };
};

// Standard reduction to single digit (for non-master number calculations)
const reduceToSingleDigit = (num: number): { final: number, steps: string[] } => {
  const steps: string[] = [];
  
  while (num > 9) {
    const digits = num.toString().split('');
    const sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);
    steps.push(`${num} → ${digits.join(' + ')} = ${sum}`);
    num = sum;
  }
  
  return { final: num, steps };
};

// Helper function to calculate name-based numbers with breakdown
const calculateNameValue = (name: string): { sum: number, breakdown: string[] } => {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  const breakdown: string[] = [];
  
  console.log('Calculating name value for:', cleanName);
  
  for (const char of cleanName) {
    if (chaldeanValues[char]) {
      sum += chaldeanValues[char];
      breakdown.push(`${char} = ${chaldeanValues[char]}`);
      console.log(`${char} = ${chaldeanValues[char]}, running sum: ${sum}`);
    }
  }
  
  console.log('Total sum before reduction:', sum);
  return { sum, breakdown };
};

export const calculateLifePathNumber = (birthDate: string): { number: number, breakdown: string[] } => {
  // Parse the date string directly to avoid timezone issues
  const dateParts = birthDate.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);
  
  console.log('Life Path Calculation:', { birthDate, year, month, day });
  
  // Chaldean method: Add the full numbers first (month + day + year), then reduce the total
  const totalSum = month + day + year;
  const breakdown = [`Month: ${month}`, `Day: ${day}`, `Year: ${year}`, `Total: ${month} + ${day} + ${year} = ${totalSum}`];
  
  console.log('Total sum before reduction:', totalSum);
  
  const reduction = reduceWithMasterNumbers(totalSum);
  breakdown.push(...reduction.steps);
  
  console.log('Final Life Path Number:', reduction.final);
  
  return { number: reduction.final, breakdown };
};

export const calculateExpressionNumber = (fullName: string): { number: number, breakdown: string[] } => {
  console.log('Expression Number Calculation for:', fullName);
  const nameCalc = calculateNameValue(fullName);
  const breakdown = [`Letters: ${nameCalc.breakdown.join(', ')}`, `Sum: ${nameCalc.sum}`];
  
  const reduction = reduceWithMasterNumbers(nameCalc.sum);
  breakdown.push(...reduction.steps);
  
  console.log('Expression Number result:', reduction.final);
  return { number: reduction.final, breakdown };
};

export const calculateSoulUrgeNumber = (fullName: string): { number: number, breakdown: string[] } => {
  console.log('Soul Urge (Heart\'s Desire) Number Calculation for:', fullName);
  // Extract only vowels
  const vowels = fullName.toUpperCase().replace(/[^AEIOU]/g, '');
  console.log('Vowels extracted:', vowels);
  
  const nameCalc = calculateNameValue(vowels);
  const breakdown = [`Vowels: ${vowels}`, `Values: ${nameCalc.breakdown.join(', ')}`, `Sum: ${nameCalc.sum}`];
  
  const reduction = reduceWithMasterNumbers(nameCalc.sum);
  breakdown.push(...reduction.steps);
  
  console.log('Soul Urge Number result:', reduction.final);
  return { number: reduction.final, breakdown };
};

export const calculatePersonalityNumber = (fullName: string): { number: number, breakdown: string[] } => {
  console.log('Personality Number Calculation for:', fullName);
  // Extract only consonants (remove vowels and spaces)
  const consonants = fullName.toUpperCase().replace(/[AEIOU\s]/g, '');
  console.log('Consonants extracted:', consonants);
  
  const nameCalc = calculateNameValue(consonants);
  const breakdown = [`Consonants: ${consonants}`, `Values: ${nameCalc.breakdown.join(', ')}`, `Sum: ${nameCalc.sum}`];
  
  const reduction = reduceWithMasterNumbers(nameCalc.sum);
  breakdown.push(...reduction.steps);
  
  console.log('Personality Number result:', reduction.final);
  return { number: reduction.final, breakdown };
};

export const calculateBirthdayNumber = (birthDate: string): { number: number, breakdown: string[] } => {
  // Parse the date string directly to avoid timezone issues
  const dateParts = birthDate.split('-');
  const day = parseInt(dateParts[2], 10);
  
  console.log('Birthday Number Calculation:', { birthDate, day });
  
  const breakdown = [`Birth Day: ${day}`];
  
  // Birthday number is typically reduced to single digit (no master numbers for birthday)
  const reduction = reduceToSingleDigit(day);
  breakdown.push(...reduction.steps);
  
  console.log('Birthday Number result:', reduction.final);
  return { number: reduction.final, breakdown };
};

export const calculateMaturityNumber = (lifePathNumber: number, expressionNumber: number): { number: number, breakdown: string[] } => {
  console.log('Maturity Number Calculation:', { lifePathNumber, expressionNumber });
  
  const sum = lifePathNumber + expressionNumber;
  const breakdown = [`Life Path (${lifePathNumber}) + Expression (${expressionNumber}) = ${sum}`];
  
  const reduction = reduceToSingleDigit(sum);
  breakdown.push(...reduction.steps);
  
  console.log('Maturity Number result:', reduction.final);
  return { number: reduction.final, breakdown };
};

export const calculateAchievementNumber = (birthDate: string): { number: number, breakdown: string[] } => {
  // Parse the date string directly to avoid timezone issues
  const dateParts = birthDate.split('-');
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);
  
  console.log('Achievement Number Calculation:', { birthDate, month, day });
  
  const sum = month + day;
  const breakdown = [`Month (${month}) + Day (${day}) = ${sum}`];
  
  const reduction = reduceToSingleDigit(sum);
  breakdown.push(...reduction.steps);
  
  console.log('Achievement Number result:', reduction.final);
  return { number: reduction.final, breakdown };
};

export const calculateHiddenPassionNumber = (fullName: string): { numbers: number[], breakdown: string[] } => {
  console.log('Hidden Passion Number Calculation for:', fullName);
  
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  const frequency: { [key: number]: number } = {};
  const letterBreakdown: string[] = [];
  
  // Count frequency of each number
  for (const char of cleanName) {
    if (chaldeanValues[char]) {
      const value = chaldeanValues[char];
      frequency[value] = (frequency[value] || 0) + 1;
      letterBreakdown.push(`${char} = ${value}`);
    }
  }
  
  // Find the highest frequency
  const maxFrequency = Math.max(...Object.values(frequency));
  const hiddenPassionNumbers = Object.keys(frequency)
    .filter(num => frequency[parseInt(num)] === maxFrequency)
    .map(num => parseInt(num));
  
  const breakdown = [
    `Letters: ${letterBreakdown.join(', ')}`,
    `Frequency count: ${Object.entries(frequency).map(([num, count]) => `${num} appears ${count} time${count > 1 ? 's' : ''}`).join(', ')}`,
    `Most frequent: ${hiddenPassionNumbers.join(', ')} (appears ${maxFrequency} time${maxFrequency > 1 ? 's' : ''})`
  ];
  
  console.log('Hidden Passion Numbers result:', hiddenPassionNumbers);
  return { numbers: hiddenPassionNumbers, breakdown };
};

export const calculateKarmicLessonNumbers = (fullName: string): { numbers: number[], breakdown: string[] } => {
  console.log('Karmic Lesson Numbers Calculation for:', fullName);
  
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  const presentNumbers = new Set<number>();
  const letterBreakdown: string[] = [];
  
  // Find which numbers are present in the name
  for (const char of cleanName) {
    if (chaldeanValues[char]) {
      const value = chaldeanValues[char];
      presentNumbers.add(value);
      letterBreakdown.push(`${char} = ${value}`);
    }
  }
  
  // Find missing numbers (1-8 in Chaldean system)
  const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
  const missingNumbers = allNumbers.filter(num => !presentNumbers.has(num));
  
  const breakdown = [
    `Letters: ${letterBreakdown.join(', ')}`,
    `Numbers present: ${Array.from(presentNumbers).sort().join(', ')}`,
    `Missing numbers (Karmic Lessons): ${missingNumbers.length > 0 ? missingNumbers.join(', ') : 'None - all numbers are present'}`
  ];
  
  console.log('Karmic Lesson Numbers result:', missingNumbers);
  return { numbers: missingNumbers, breakdown };
};

export const generateNumerologyReport = (name: string, email: string, birthDate: string) => {
  console.log('Generating comprehensive numerology report for:', { name, email, birthDate });
  
  const lifePathCalc = calculateLifePathNumber(birthDate);
  const expressionCalc = calculateExpressionNumber(name);
  const soulUrgeCalc = calculateSoulUrgeNumber(name);
  const personalityCalc = calculatePersonalityNumber(name);
  const birthdayCalc = calculateBirthdayNumber(birthDate);
  const maturityCalc = calculateMaturityNumber(lifePathCalc.number, expressionCalc.number);
  const achievementCalc = calculateAchievementNumber(birthDate);
  const hiddenPassionCalc = calculateHiddenPassionNumber(name);
  const karmicLessonCalc = calculateKarmicLessonNumbers(name);
  
  const report = {
    name,
    email,
    birthDate,
    lifePathNumber: lifePathCalc.number,
    lifePathBreakdown: lifePathCalc.breakdown,
    expressionNumber: expressionCalc.number,
    expressionBreakdown: expressionCalc.breakdown,
    soulUrgeNumber: soulUrgeCalc.number,
    soulUrgeBreakdown: soulUrgeCalc.breakdown,
    personalityNumber: personalityCalc.number,
    personalityBreakdown: personalityCalc.breakdown,
    birthdayNumber: birthdayCalc.number,
    birthdayBreakdown: birthdayCalc.breakdown,
    maturityNumber: maturityCalc.number,
    maturityBreakdown: maturityCalc.breakdown,
    achievementNumber: achievementCalc.number,
    achievementBreakdown: achievementCalc.breakdown,
    hiddenPassionNumbers: hiddenPassionCalc.numbers,
    hiddenPassionBreakdown: hiddenPassionCalc.breakdown,
    karmicLessonNumbers: karmicLessonCalc.numbers,
    karmicLessonBreakdown: karmicLessonCalc.breakdown
  };
  
  console.log('Complete numerology report:', report);
  return report;
};
