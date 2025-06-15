
// Chaldean numerology mapping
const chaldeanValues: { [key: string]: number } = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
  N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7
};

// Helper function to reduce to single digit while preserving master numbers
const reduceWithMasterNumbers = (num: number): number => {
  // First, reduce very large numbers by breaking them down
  while (num > 99) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  
  // Preserve master numbers 11 and 22
  if (num === 11 || num === 22) {
    return num;
  }
  
  // Continue reducing if it's not a master number but still > 9
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    // Check again for master numbers after reduction
    if (num === 11 || num === 22) {
      return num;
    }
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

// Helper function to calculate name-based numbers
const calculateNameValue = (name: string): number => {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  
  console.log('Calculating name value for:', cleanName);
  
  for (const char of cleanName) {
    if (chaldeanValues[char]) {
      sum += chaldeanValues[char];
      console.log(`${char} = ${chaldeanValues[char]}, running sum: ${sum}`);
    }
  }
  
  console.log('Total sum before reduction:', sum);
  return sum;
};

export const calculateLifePathNumber = (birthDate: string): number => {
  // Parse the date string directly to avoid timezone issues
  const dateParts = birthDate.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);
  
  console.log('Life Path Calculation:', { birthDate, year, month, day });
  
  // Chaldean method: Add the full numbers first (month + day + year), then reduce the total
  const totalSum = month + day + year;
  console.log('Total sum before reduction:', totalSum);
  
  const result = reduceWithMasterNumbers(totalSum);
  console.log('Final Life Path Number:', result);
  
  return result;
};

export const calculateExpressionNumber = (fullName: string): number => {
  console.log('Expression Number Calculation for:', fullName);
  const sum = calculateNameValue(fullName);
  const result = reduceWithMasterNumbers(sum);
  console.log('Expression Number result:', result);
  return result;
};

export const calculateSoulUrgeNumber = (fullName: string): number => {
  console.log('Soul Urge (Heart\'s Desire) Number Calculation for:', fullName);
  // Extract only vowels
  const vowels = fullName.toUpperCase().replace(/[^AEIOU]/g, '');
  console.log('Vowels extracted:', vowels);
  
  const sum = calculateNameValue(vowels);
  const result = reduceWithMasterNumbers(sum);
  console.log('Soul Urge Number result:', result);
  return result;
};

export const calculatePersonalityNumber = (fullName: string): number => {
  console.log('Personality Number Calculation for:', fullName);
  // Extract only consonants (remove vowels and spaces)
  const consonants = fullName.toUpperCase().replace(/[AEIOU\s]/g, '');
  console.log('Consonants extracted:', consonants);
  
  const sum = calculateNameValue(consonants);
  const result = reduceWithMasterNumbers(sum);
  console.log('Personality Number result:', result);
  return result;
};

export const calculateBirthdayNumber = (birthDate: string): number => {
  // Parse the date string directly to avoid timezone issues
  const dateParts = birthDate.split('-');
  const day = parseInt(dateParts[2], 10);
  
  console.log('Birthday Number Calculation:', { birthDate, day });
  
  // Birthday number is typically reduced to single digit (no master numbers for birthday)
  const result = reduceToSingleDigit(day);
  console.log('Birthday Number result:', result);
  return result;
};

export const generateNumerologyReport = (name: string, email: string, birthDate: string) => {
  console.log('Generating comprehensive numerology report for:', { name, email, birthDate });
  
  const report = {
    name,
    email,
    birthDate,
    lifePathNumber: calculateLifePathNumber(birthDate),
    expressionNumber: calculateExpressionNumber(name),
    soulUrgeNumber: calculateSoulUrgeNumber(name),
    personalityNumber: calculatePersonalityNumber(name),
    birthdayNumber: calculateBirthdayNumber(birthDate)
  };
  
  console.log('Complete numerology report:', report);
  return report;
};
