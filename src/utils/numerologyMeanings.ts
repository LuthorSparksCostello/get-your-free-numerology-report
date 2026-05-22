/**
 * Chaldean Numerology Number Meanings & Interpretations
 * Extracted and expanded for the rebuilt report experience.
 */

export interface NumberMeaning {
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  careers: string[];
}

export const numberMeanings: Record<number, NumberMeaning> = {
  1: {
    title: "The Leader",
    description: "Independent, pioneering, and ambitious. Natural born leaders who create their own path and inspire others to follow.",
    strengths: ["Leadership", "Innovation", "Independence", "Determination", "Initiative", "Confidence"],
    challenges: ["Impatience", "Stubbornness", "Self-centeredness", "Dominance", "Intolerance"],
    careers: ["CEO/Executive", "Entrepreneur", "Sales Leader", "Military Officer", "Politician", "Director", "Consultant", "Team Leader", "Project Manager", "Department Head", "Business Owner", "Marketing Director", "Operations Manager", "Creative Director", "Branch Manager"]
  },
  2: {
    title: "The Diplomat",
    description: "Cooperative, sensitive, and peace-loving. Excel at bringing people together and creating harmony in all environments.",
    strengths: ["Cooperation", "Sensitivity", "Diplomacy", "Intuition", "Patience", "Teamwork"],
    challenges: ["Indecisiveness", "Over-sensitivity", "Dependency", "Passivity", "Self-doubt"],
    careers: ["Mediator", "Counselor", "Therapist", "HR Specialist", "Social Worker", "Teacher", "Nurse", "Customer Service", "Administrative Assistant", "Event Coordinator", "Relationship Coach", "Support Staff", "Community Organizer", "Diplomat", "Receptionist"]
  },
  3: {
    title: "The Creative",
    description: "Artistic, expressive, and optimistic. Natural entertainers and communicators who uplift everyone around them.",
    strengths: ["Creativity", "Communication", "Optimism", "Inspiration", "Artistic talent", "Charisma"],
    challenges: ["Scattered energy", "Superficiality", "Mood swings", "Inconsistency", "Lack of focus"],
    careers: ["Artist", "Writer", "Actor", "Designer", "Marketing Specialist", "Public Speaker", "Entertainer", "Journalist", "Creative Director", "Social Media Manager", "Content Creator", "Photographer", "Musician", "Event Planner", "Communications Manager"]
  },
  4: {
    title: "The Builder",
    description: "Practical, hardworking, and reliable. Excel at creating stable foundations and building lasting structures.",
    strengths: ["Organization", "Reliability", "Hard work", "Practicality", "Discipline", "Persistence"],
    challenges: ["Rigidity", "Pessimism", "Resistance to change", "Narrow-mindedness", "Stubbornness"],
    careers: ["Engineer", "Accountant", "Project Manager", "Construction Manager", "Financial Planner", "Systems Analyst", "Quality Controller", "Operations Manager", "Architect", "Contractor", "Database Administrator", "Process Improvement Specialist", "Logistics Coordinator", "Technical Specialist", "Administrative Manager"]
  },
  5: {
    title: "The Adventurer",
    description: "Freedom-loving, versatile, and progressive. Thrive on change, variety, and exploring new frontiers.",
    strengths: ["Adaptability", "Freedom", "Curiosity", "Progressive thinking", "Versatility", "Adventure"],
    challenges: ["Restlessness", "Irresponsibility", "Inconsistency", "Impatience", "Lack of commitment"],
    careers: ["Travel Agent", "Sales Representative", "Journalist", "Marketing Manager", "Event Coordinator", "Freelancer", "Consultant", "Tour Guide", "Flight Attendant", "Real Estate Agent", "Public Relations", "Social Media Influencer", "Adventure Guide", "Import/Export Specialist", "Change Management Consultant"]
  },
  6: {
    title: "The Nurturer",
    description: "Caring, responsible, and community-minded. Natural healers and teachers who serve with unconditional love.",
    strengths: ["Nurturing", "Responsibility", "Healing", "Service", "Compassion", "Family-oriented"],
    challenges: ["Interference", "Worry", "Self-sacrifice", "Perfectionism", "Overprotectiveness"],
    careers: ["Teacher", "Healthcare Worker", "Social Worker", "Counselor", "Childcare Provider", "Veterinarian", "Non-profit Director", "Community Leader", "Family Therapist", "Nutritionist", "Elder Care Specialist", "School Administrator", "Mental Health Professional", "Charity Worker", "Home Designer"]
  },
  7: {
    title: "The Seeker",
    description: "Analytical, spiritual, and introspective. Deep thinkers who seek truth, wisdom, and higher understanding.",
    strengths: ["Analysis", "Spirituality", "Intuition", "Research", "Wisdom", "Independence"],
    challenges: ["Aloofness", "Perfectionism", "Skepticism", "Isolation", "Overthinking"],
    careers: ["Researcher", "Scientist", "Analyst", "Spiritual Advisor", "Writer", "Professor", "Investigator", "Philosopher", "Psychologist", "Data Scientist", "Librarian", "Technical Writer", "Quality Assurance", "Strategic Planner", "Market Research Analyst"]
  },
  8: {
    title: "The Achiever",
    description: "Ambitious, material-focused, and authoritative. Natural business leaders who manifest abundance effortlessly.",
    strengths: ["Business acumen", "Organization", "Material success", "Authority", "Ambition", "Management"],
    challenges: ["Materialism", "Workaholism", "Impatience", "Ruthlessness", "Power struggles"],
    careers: ["Business Executive", "Financial Advisor", "Investment Banker", "Real Estate Developer", "Corporate Lawyer", "Management Consultant", "Business Owner", "Sales Director", "Banking Executive", "Wealth Manager", "Commercial Real Estate", "Venture Capitalist", "Business Analyst", "Corporate Strategist", "Mergers & Acquisitions"]
  },
  9: {
    title: "The Humanitarian",
    description: "Compassionate, generous, and globally-minded. Serve the greater good and inspire universal transformation.",
    strengths: ["Compassion", "Generosity", "Universal love", "Wisdom", "Humanitarian spirit", "Tolerance"],
    challenges: ["Idealism", "Emotional volatility", "Impracticality", "Martyrdom", "Disappointment"],
    careers: ["Non-profit Leader", "International Aid Worker", "Environmental Activist", "Human Rights Advocate", "Global Health Worker", "Peace Corps Volunteer", "Charity Director", "Social Justice Lawyer", "Community Organizer", "Philanthropist", "Cultural Ambassador", "Humanitarian Coordinator", "Policy Advocate", "Global Development Specialist", "Environmental Consultant"]
  },
  11: {
    title: "The Master Intuitive",
    description: "Highly intuitive, spiritual, and inspirational. Master number with extraordinary potential for enlightenment and leadership.",
    strengths: ["Intuition", "Inspiration", "Spiritual insight", "Visionary leadership", "Psychic abilities", "Enlightenment"],
    challenges: ["Nervous tension", "Impracticality", "Emotional extremes", "Overwhelm", "Self-doubt"],
    careers: ["Spiritual Teacher", "Inspirational Speaker", "Healer", "Psychic Advisor", "Life Coach", "Motivational Speaker", "Spiritual Counselor", "Energy Healer", "Meditation Instructor", "Wellness Coach", "Intuitive Consultant", "Transformational Leader", "Consciousness Coach", "Spiritual Writer", "Enlightenment Teacher"]
  },
  22: {
    title: "The Master Builder",
    description: "Combines vision with practical skills to create lasting impact. Master number with potential to build something of great significance.",
    strengths: ["Visionary building", "Practical idealism", "Large-scale thinking", "Material mastery", "System building", "Global impact"],
    challenges: ["Overwhelming pressure", "Self-doubt", "Scattered focus", "Burnout", "Unrealistic expectations"],
    careers: ["Visionary CEO", "Social Entrepreneur", "Global Organization Leader", "Large Project Director", "Systems Architect", "International Business Leader", "Social Impact Investor", "Transformational Change Agent", "Global Initiative Director", "Master Builder", "Social Innovation Leader", "International Development Director", "Large-Scale Consultant", "Global Strategy Director", "World-Changing Entrepreneur"]
  },
  33: {
    title: "The Spiritual Teacher",
    description: "The most influential of all numbers, with extraordinary healing and teaching abilities. Dedicated to uplifting humanity.",
    strengths: ["Spiritual healing", "Universal teaching", "Compassionate service", "Divine guidance", "Unconditional love", "Enlightened wisdom"],
    challenges: ["Overwhelming responsibility", "Emotional sacrifice", "Burnout from giving", "Perfectionism", "Martyrdom complex"],
    careers: ["Spiritual Healer", "Master Teacher", "Humanitarian Leader", "Spiritual Guide", "Divine Channel", "Compassionate Healer", "Universal Teacher", "Enlightened Leader", "Spiritual Counselor", "Sacred Service Provider", "Divine Messenger", "Transformational Healer", "Spiritual Mentor", "Consciousness Facilitator", "Divine Service Leader"]
  },
  44: {
    title: "The Master Teacher",
    description: "Combines spiritual wisdom with material mastery to create transformational systems that benefit humanity on a global scale.",
    strengths: ["System mastery", "Transformational teaching", "Global influence", "Practical spirituality", "Material-spiritual balance", "Universal impact"],
    challenges: ["Overwhelming expectations", "Material-spiritual conflict", "System limitations", "Global pressure", "Perfectionist standards"],
    careers: ["Global Systems Leader", "Transformational Educator", "Universal Teacher", "Master Architect", "Global Change Agent", "System Transformer", "World Teacher", "Universal Builder", "Global Healer", "Master Facilitator", "System Innovator", "Global Mentor", "Universal Guide", "Master Strategist", "Global Visionary"]
  },
  55: {
    title: "The Master Liberator",
    description: "Represents ultimate freedom and liberation, breaking through all limitations to achieve complete spiritual and material mastery.",
    strengths: ["Ultimate freedom", "Liberation mastery", "Limitless potential", "Revolutionary change", "Transcendent wisdom", "Universal liberation"],
    challenges: ["Restless energy", "Revolutionary extremes", "Freedom addiction", "Responsibility avoidance", "Scattered focus"],
    careers: ["Revolutionary Leader", "Freedom Fighter", "Liberation Teacher", "Change Revolutionary", "Freedom Advocate", "Liberation Guide", "Revolutionary Healer", "Freedom Coach", "Liberation Consultant", "Change Catalyst", "Freedom Facilitator", "Revolutionary Mentor", "Liberation Leader", "Freedom Visionary", "Revolutionary Guide"]
  },
  66: {
    title: "The Master Healer",
    description: "Embodies the highest form of nurturing and healing, dedicated to serving humanity through compassionate care and cosmic love.",
    strengths: ["Cosmic healing", "Universal compassion", "Divine nurturing", "Planetary healing", "Sacred service", "Unconditional love"],
    challenges: ["Overwhelming responsibility", "Sacrificial tendencies", "Cosmic burden", "Universal suffering", "Self-neglect"],
    careers: ["Master Healer", "Cosmic Therapist", "Universal Caregiver", "Planetary Healer", "Divine Nurturer", "Sacred Healer", "Cosmic Counselor", "Universal Teacher", "Planetary Caregiver", "Master Therapist", "Divine Healer", "Universal Healer", "Cosmic Caregiver", "Planetary Counselor", "Master Nurturer"]
  },
  77: {
    title: "The Master Mystic",
    description: "Represents the highest spiritual wisdom and mystical knowledge, bridging the divine and earthly realms.",
    strengths: ["Divine wisdom", "Mystical knowledge", "Spiritual mastery", "Cosmic consciousness", "Sacred insight", "Universal truth"],
    challenges: ["Spiritual isolation", "Otherworldly detachment", "Mystical overwhelm", "Reality disconnection", "Sacred loneliness"],
    careers: ["Mystical Teacher", "Spiritual Master", "Divine Guide", "Cosmic Advisor", "Sacred Wisdom Teacher", "Universal Mystic", "Spiritual Guru", "Divine Counselor", "Cosmic Teacher", "Sacred Guide", "Mystical Healer", "Universal Sage", "Spiritual Visionary", "Divine Mystic", "Cosmic Sage"]
  },
  88: {
    title: "The Master Manifestor",
    description: "Combines infinite material and spiritual power to manifest on the highest level, creating lasting impact on a global scale.",
    strengths: ["Infinite manifestation", "Material-spiritual mastery", "Global influence", "Universal success", "Cosmic achievement", "Planetary impact"],
    challenges: ["Overwhelming power", "Material-spiritual balance", "Global responsibility", "Universal pressure", "Cosmic burden"],
    careers: ["Global Leader", "Universal Entrepreneur", "Cosmic Business Leader", "Planetary Influencer", "Master Manifestor", "Universal Builder", "Global Visionary", "Cosmic CEO", "Planetary Leader", "Master Achiever", "Universal Success Coach", "Global Strategist", "Cosmic Innovator", "Planetary CEO", "Master Builder"]
  },
  99: {
    title: "The Master Completion",
    description: "Represents the completion of all spiritual lessons and the highest service to humanity, embodying universal love and wisdom.",
    strengths: ["Universal completion", "Divine service", "Planetary wisdom", "Cosmic love", "Universal healing", "Complete mastery"],
    challenges: ["Ultimate responsibility", "Universal burden", "Completion pressure", "Cosmic overwhelm", "Divine sacrifice"],
    careers: ["Universal Humanitarian", "Planetary Healer", "Cosmic Servant", "Divine Teacher", "Universal Guide", "Master Humanitarian", "Planetary Teacher", "Cosmic Healer", "Universal Leader", "Divine Servant", "Master Wise One", "Planetary Guide", "Cosmic Mentor", "Universal Sage", "Divine Leader"]
  }
};

/** Interpretations for Personal Year cycles */
export const personalYearMeanings: Record<number, { theme: string; focus: string; advice: string }> = {
  1: { theme: "New Beginnings", focus: "Fresh starts, independence, planting seeds for the future", advice: "Take initiative. Start new projects. Step into leadership roles. This is your year to be bold." },
  2: { theme: "Partnerships & Patience", focus: "Cooperation, relationships, diplomacy, subtle growth", advice: "Be patient. Nurture relationships. Collaborate rather than compete. Details matter this year." },
  3: { theme: "Creative Expression", focus: "Self-expression, joy, social connections, artistic pursuits", advice: "Express yourself freely. Socialize. Pursue creative outlets. Let joy guide your decisions." },
  4: { theme: "Building Foundations", focus: "Hard work, structure, stability, practical achievements", advice: "Put in the work. Build solid foundations. Focus on discipline and organization." },
  5: { theme: "Change & Freedom", focus: "Travel, adventure, unexpected changes, personal freedom", advice: "Embrace change. Take calculated risks. Travel if possible. Break free from limitations." },
  6: { theme: "Home & Responsibility", focus: "Family, domestic matters, service, love, community", advice: "Focus on home and family. Accept responsibilities gracefully. Serve others with love." },
  7: { theme: "Introspection & Wisdom", focus: "Spiritual growth, study, reflection, inner development", advice: "Go inward. Study, meditate, reflect. Trust your intuition. Quality over quantity." },
  8: { theme: "Abundance & Power", focus: "Material achievement, business success, recognition, authority", advice: "Think big. Pursue financial goals. Step into your power. Manage resources wisely." },
  9: { theme: "Completion & Release", focus: "Endings, letting go, humanitarian service, preparation for new cycle", advice: "Release what no longer serves you. Give generously. Prepare for a new 9-year cycle." },
};

/** Master Number significance descriptions */
export const masterNumberSignificance: Record<number, string> = {
  11: "As a Master 11, you carry the potential for profound spiritual insight and the ability to inspire others. Your path involves developing your intuitive gifts while staying grounded in practical reality.",
  22: "As a Master 22, you have the rare combination of visionary insight and practical building skills. Your mission is to turn big dreams into tangible reality that benefits humanity.",
  33: "As a Master 33, you are here to serve as a spiritual teacher and healer. Your path involves selfless service, compassionate guidance, and uplifting humanity through your wisdom and love.",
  44: "As a Master 44, you combine spiritual wisdom with material mastery. Your mission is to create transformational systems and teach on a global scale.",
  55: "As a Master 55, you represent ultimate freedom and liberation. Your path involves breaking through all limitations and helping others achieve complete mastery.",
  66: "As a Master 66, you embody the highest form of nurturing and healing, dedicated to serving humanity through compassionate care and cosmic love.",
  77: "As a Master 77, you represent the highest spiritual wisdom and mystical knowledge, bridging the divine and earthly realms.",
  88: "As a Master 88, you combine infinite material and spiritual power to manifest on the highest level, creating lasting impact on a global scale.",
  99: "As a Master 99, you represent the completion of all spiritual lessons and the highest service to humanity, embodying universal love and wisdom.",
};

/** Hidden Passion Number career paths based on Chaldean numerology */
export const hiddenPassionCareers: Record<number, string[]> = {
  1: ["Executive Leadership", "Entrepreneurship", "Creative Direction", "Independent Consulting", "Innovation Management", "Start-up Founder", "Creative Arts Direction", "Personal Brand Building", "Motivational Speaking", "Business Development", "Product Management", "Creative Writing", "Artistic Innovation", "Independent Filmmaking", "Solo Performance Arts"],
  2: ["Collaborative Arts", "Team Facilitation", "Partnership Development", "Diplomatic Services", "Relationship Counseling", "Mediation Services", "Community Building", "Social Coordination", "Group Therapy", "Cultural Bridge-Building", "International Relations", "Cooperative Business", "Supportive Leadership", "Harmony Creation", "Peacekeeping Services"],
  3: ["Creative Expression", "Public Speaking", "Entertainment Industry", "Communication Arts", "Social Media Creation", "Creative Writing", "Performing Arts", "Broadcasting", "Marketing Communications", "Artistic Performance", "Creative Consulting", "Event Entertainment", "Content Creation", "Artistic Direction", "Inspirational Communication"],
  4: ["Systems Building", "Process Optimization", "Project Management", "Technical Implementation", "Quality Assurance", "Methodical Research", "Construction Management", "Operations Excellence", "Systematic Planning", "Infrastructure Development", "Detailed Analysis", "Procedure Development", "Technical Documentation", "Organizational Systems", "Reliability Engineering"],
  5: ["Adventure Tourism", "International Business", "Travel Industry", "Dynamic Sales", "Change Management", "Variety-Based Careers", "Multi-Cultural Work", "Flexible Consulting", "Dynamic Marketing", "Exploration Services", "Progressive Innovation", "Adaptable Leadership", "Freedom-Based Entrepreneurship", "Diverse Project Management", "Global Connectivity"],
  6: ["Healthcare Services", "Community Care", "Family Services", "Educational Support", "Nurturing Leadership", "Home-Based Business", "Care Management", "Healing Arts", "Community Development", "Service-Oriented Business", "Wellness Coaching", "Support Services", "Therapeutic Services", "Humanitarian Work", "Caring Professions"],
  7: ["Spiritual Services", "Research & Analysis", "Investigative Work", "Wisdom Sharing", "Introspective Arts", "Mystical Studies", "Deep Analysis", "Philosophical Work", "Spiritual Counseling", "Metaphysical Services", "Esoteric Studies", "Inner Wisdom Sharing", "Contemplative Arts", "Sacred Studies", "Transformational Work"],
  8: ["Material Achievement", "Business Mastery", "Financial Services", "Power Leadership", "Success Coaching", "Achievement Consulting", "Business Empire Building", "Wealth Management", "Corporate Leadership", "Material Success Guidance", "Power Dynamics", "Achievement Systems", "Success Strategy", "Material Manifestation", "Authority Positions"],
};

/** Pinnacle Number period interpretation */
export const pinnacleMeanings: Record<number, string> = {
  1: "A time of independence, new beginnings, and self-reliance. You'll be called to lead and innovate.",
  2: "A period focused on cooperation, partnerships, and patience. Relationships take center stage.",
  3: "A cycle of creative expression, joy, and social expansion. Your voice and vision are amplified.",
  4: "A time for hard work, building foundations, and establishing security. Discipline is rewarded.",
  5: "A period of change, freedom, and adventure. Expect the unexpected and embrace flexibility.",
  6: "A cycle centered on home, family, and responsibility. Service to others brings deep fulfillment.",
  7: "A time of spiritual growth, introspection, and inner wisdom. Trust your intuition above all.",
  8: "A period of material achievement, authority, and financial growth. Your ambitions can manifest.",
  9: "A cycle of completion, humanitarian service, and releasing the old. Prepare for transformation.",
  11: "A master pinnacle of heightened intuition, spiritual awakening, and inspirational influence.",
  22: "A master pinnacle of visionary building. You can create systems that impact the world.",
  33: "A master pinnacle of spiritual teaching and healing. Your compassion can transform communities.",
};

/** Challenge Number interpretations */
export const challengeMeanings: Record<number, string> = {
  0: "The challenge of choice — you have the freedom and responsibility to choose your own path. All lessons are available to you.",
  1: "The challenge of self-assertion — learning to stand up for yourself without being dominating or submissive.",
  2: "The challenge of sensitivity — finding balance between being too sensitive and being emotionally cold.",
  3: "The challenge of self-expression — overcoming fear of criticism and learning to share your creative gifts.",
  4: "The challenge of discipline — building structure and routine without becoming rigid or resistant to change.",
  5: "The challenge of freedom — learning to handle change constructively without becoming reckless or fearful.",
  6: "The challenge of responsibility — accepting duties without martyrdom and setting healthy boundaries.",
  7: "The challenge of faith — overcoming doubt and cynicism to trust in spiritual truth and inner wisdom.",
  8: "The challenge of material power — learning to handle money and authority without greed or fear of success.",
};
