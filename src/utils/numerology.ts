
// Chaldean numerology mapping
const chaldeanValues: { [key: string]: number } = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
  N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7
};

// Helper function to reduce to single digit while preserving master numbers
const reduceWithMasterNumbers = (num: number): number => {
  while (num > 22) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  
  // Preserve master numbers 11 and 22
  if (num === 11 || num === 22) {
    return num;
  }
  
  // Continue reducing if it's not a master number but still > 9
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  
  return num;
};

// Standard reduction to single digit (for non-master number calculations)
const reduceToSingleDigit = (num: number): number => {
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
};

export const calculateNameNumber = (name: string): number => {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  
  for (const char of cleanName) {
    if (chaldeanValues[char]) {
      sum += chaldeanValues[char];
    }
  }
  
  return reduceWithMasterNumbers(sum);
};

export const calculateLifePathNumber = (birthDate: string): number => {
  // Parse the date string directly to avoid timezone issues
  const dateParts = birthDate.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);
  
  console.log('Life Path Calculation:', { birthDate, year, month, day });
  
  // Add the full numbers first (month + day + year), then reduce the total
  const totalSum = month + day + year;
  console.log('Total sum before reduction:', totalSum);
  
  const result = reduceWithMasterNumbers(totalSum);
  console.log('Final Life Path Number:', result);
  
  return result;
};

export const calculateExpressionNumber = (fullName: string): number => {
  return calculateNameNumber(fullName);
};

export const calculateSoulUrgeNumber = (fullName: string): number => {
  const vowels = fullName.toUpperCase().replace(/[^AEIOU]/g, '');
  return calculateNameNumber(vowels);
};

export const calculatePersonalityNumber = (fullName: string): number => {
  const consonants = fullName.toUpperCase().replace(/[AEIOU\s]/g, '');
  return calculateNameNumber(consonants);
};

export const calculateBirthdayNumber = (birthDate: string): number => {
  // Parse the date string directly to avoid timezone issues
  const dateParts = birthDate.split('-');
  const day = parseInt(dateParts[2], 10);
  
  console.log('Birthday Number Calculation:', { birthDate, day });
  
  return reduceToSingleDigit(day);
};

export const generateNumerologyReport = (name: string, email: string, birthDate: string) => {
  console.log('Generating report for:', { name, email, birthDate });
  
  return {
    name,
    email,
    birthDate,
    lifePathNumber: calculateLifePathNumber(birthDate),
    expressionNumber: calculateExpressionNumber(name),
    soulUrgeNumber: calculateSoulUrgeNumber(name),
    personalityNumber: calculatePersonalityNumber(name),
    birthdayNumber: calculateBirthdayNumber(birthDate)
  };
};
