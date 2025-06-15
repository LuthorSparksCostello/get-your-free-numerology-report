
// Chaldean numerology mapping
const chaldeanValues: { [key: string]: number } = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
  N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7
};

export const calculateNameNumber = (name: string): number => {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  
  for (const char of cleanName) {
    if (chaldeanValues[char]) {
      sum += chaldeanValues[char];
    }
  }
  
  return reduceToSingleDigit(sum);
};

export const calculateLifePathNumber = (birthDate: string): number => {
  // Parse the date string directly to avoid timezone issues
  const dateParts = birthDate.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);
  
  console.log('Life Path Calculation:', { birthDate, year, month, day });
  
  const daySum = reduceToSingleDigit(day);
  const monthSum = reduceToSingleDigit(month);
  const yearSum = reduceToSingleDigit(year);
  
  console.log('Individual sums:', { daySum, monthSum, yearSum });
  
  const totalSum = daySum + monthSum + yearSum;
  const result = reduceToSingleDigit(totalSum);
  
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

const reduceToSingleDigit = (num: number): number => {
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
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
