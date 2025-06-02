/**
 * Aviation Terms Configuration
 * Comprehensive list of aviation and flight attendant terms based on actual contract content
 */

export interface AviationTerm {
  term: string;
  definition: string;
  category: 'scheduling' | 'pay' | 'benefits' | 'work_rules' | 'operations' | 'safety' | 'equipment';
  importance: 'high' | 'medium' | 'low';
  synonyms?: string[];
  affects?: ('all_flight_attendants' | 'senior_only' | 'reserve_only' | 'international_only')[];
}

export const AVIATION_TERMS: AviationTerm[] = [
  // Core Flight Attendant Terms
  {
    term: "flight attendant",
    definition: "An employee whose duties consist of performing or assisting in the performance of all cabin safety related functions, all en route cabin service or ground cabin service to delayed or canceled passengers in a resourceful manner",
    category: "work_rules",
    importance: "high",
    synonyms: ["cabin crew", "crew member"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "crew member",
    definition: "Any person assigned by the company to duty in an aircraft during flight time",
    category: "work_rules", 
    importance: "high",
    synonyms: ["flight attendant", "cabin crew"],
    affects: ["all_flight_attendants"]
  },

  // Scheduling Terms
  {
    term: "reserve",
    definition: "A flight attendant who has been assigned to be available for flight assignment on short notice, typically with specific availability windows",
    category: "scheduling",
    importance: "high",
    affects: ["reserve_only"]
  },
  {
    term: "standby",
    definition: "A status where a flight attendant is required to remain available for immediate assignment to flights",
    category: "scheduling",
    importance: "high",
    synonyms: ["on call"],
    affects: ["reserve_only"]
  },
  {
    term: "on call",
    definition: "Reserve status requiring immediate availability for flight assignments with minimal notice",
    category: "scheduling",
    importance: "high",
    synonyms: ["standby"],
    affects: ["reserve_only"]
  },
  {
    term: "lineholder",
    definition: "A flight attendant who has been awarded a monthly schedule of specific flight assignments through the bidding process",
    category: "scheduling",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "bid",
    definition: "The process by which flight attendants request their preferred schedules for the upcoming month based on seniority",
    category: "scheduling",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "seniority",
    definition: "A flight attendant's rank based on length of service, determining priority for scheduling, bases, and other benefits",
    category: "work_rules",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "pairing",
    definition: "A sequence of flights assigned together as a unit, typically spanning multiple days with layovers",
    category: "scheduling",
    importance: "medium",
    synonyms: ["trip", "sequence", "rotation"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "sequence",
    definition: "A multi-day series of flights and layovers assigned as a complete unit of work",
    category: "scheduling",
    importance: "medium",
    synonyms: ["pairing", "trip", "rotation"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "trip",
    definition: "A work assignment consisting of one or more flights, may include layovers",
    category: "scheduling",
    importance: "medium",
    synonyms: ["pairing", "sequence", "rotation"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "rotation",
    definition: "A complete cycle of flights and layovers that returns the flight attendant to their home base",
    category: "scheduling",
    importance: "medium",
    synonyms: ["pairing", "trip", "sequence"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "layover",
    definition: "Required rest period between flights when away from home base, including overnight stays",
    category: "scheduling",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "turnaround",
    definition: "The time between arriving on one flight and departing on the next flight at the same location",
    category: "scheduling",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "assignment",
    definition: "Specific flights or duties allocated to a flight attendant for a given period",
    category: "scheduling",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "trip trade",
    definition: "The process of exchanging flight assignments between qualified flight attendants",
    category: "scheduling",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "open time",
    definition: "Uncovered flight assignments available for pickup by qualified flight attendants",
    category: "scheduling",
    importance: "medium",
    synonyms: ["makeup"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "makeup",
    definition: "Additional flight assignments picked up to supplement a flight attendant's schedule",
    category: "scheduling",
    importance: "medium",
    synonyms: ["open time"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "drafted",
    definition: "Assigned to work while off duty, typically in inverse order of seniority when qualified crew is needed",
    category: "scheduling",
    importance: "high",
    affects: ["all_flight_attendants"]
  },

  // Base and Location Terms
  {
    term: "base",
    definition: "A geographic area designated by the company where flight attendants are assigned and report for duty",
    category: "work_rules",
    importance: "high",
    synonyms: ["domicile"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "domicile",
    definition: "The specific base location where a flight attendant is assigned and maintains their crew schedule",
    category: "work_rules",
    importance: "high",
    synonyms: ["base"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "home base",
    definition: "The specific domicile/base where a flight attendant is assigned",
    category: "work_rules",
    importance: "high",
    synonyms: ["home domicile"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "sub-base",
    definition: "A subset of flight attendants at a base, often for specific aircraft types or routes",
    category: "work_rules",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "domestic base",
    definition: "Bases located within the 48 contiguous United States",
    category: "work_rules",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "international base",
    definition: "Bases located outside the 48 contiguous United States",
    category: "work_rules",
    importance: "medium",
    affects: ["international_only"]
  },

  // Duty and Time Terms
  {
    term: "duty time",
    definition: "Time from when a flight attendant reports for an assignment until released from duty, including flight time and ground time",
    category: "scheduling",
    importance: "high",
    synonyms: ["duty period"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "duty period",
    definition: "The continuous period from check-in to release from duty, including all flights and ground time",
    category: "scheduling",
    importance: "high",
    synonyms: ["duty time"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "flight duty period",
    definition: "The period beginning when a crew member reports for duty and ending when the aircraft is parked and engines shut down",
    category: "scheduling",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "minimum rest",
    definition: "The legally required rest period between duty periods to ensure flight attendant alertness and safety",
    category: "scheduling",
    importance: "high",
    synonyms: ["crew rest"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "crew rest",
    definition: "Required rest period for flight attendants between flights or duty periods",
    category: "scheduling",
    importance: "high",
    synonyms: ["minimum rest"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "block time",
    definition: "Actual flight time from aircraft movement at departure gate to arrival gate",
    category: "pay",
    importance: "high",
    synonyms: ["flight time"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "flight time",
    definition: "Time from aircraft movement under its own power until coming to rest at unloading point",
    category: "pay",
    importance: "high",
    synonyms: ["block time"],
    affects: ["all_flight_attendants"]
  },

  // Transportation Terms
  {
    term: "deadhead",
    definition: "Transportation of a flight attendant as a passenger for the purpose of covering or returning from a flight assignment",
    category: "scheduling",
    importance: "high",
    synonyms: ["deadheading"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "deadheading",
    definition: "Traveling as a passenger to or from a work assignment",
    category: "scheduling",
    importance: "high",
    synonyms: ["deadhead"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "ferry",
    definition: "A flight which does not transport revenue passengers, where flight attendants must perform safety duties per FARs",
    category: "operations",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },

  // Pay and Compensation Terms
  {
    term: "per diem",
    definition: "Hourly expense reimbursement for meals and incidental expenses while on duty away from base",
    category: "pay",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "domestic per diem",
    definition: "Hourly expense reimbursement for domestic flights and mixed pairings",
    category: "pay",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "overtime",
    definition: "Additional compensation for work performed beyond normal limits, typically at premium rates",
    category: "pay",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "premium pay",
    definition: "Enhanced compensation rates for specific types of assignments or conditions",
    category: "pay",
    importance: "high",
    synonyms: ["premium"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "compensation",
    definition: "All forms of payment including base pay, overtime, premiums, and allowances",
    category: "pay",
    importance: "high",
    affects: ["all_flight_attendants"]
  },

  // Benefits Terms
  {
    term: "sick leave",
    definition: "Paid time off for illness or medical appointments",
    category: "benefits",
    importance: "high",
    synonyms: ["sick call"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "sick call",
    definition: "Reporting unavailable for duty due to illness",
    category: "benefits",
    importance: "medium",
    synonyms: ["sick leave"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "vacation",
    definition: "Paid time off earned based on length of service",
    category: "benefits",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "holiday",
    definition: "Designated days with special pay provisions, varies by domicile country",
    category: "benefits",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "bereavement",
    definition: "Time off for family emergencies or death in the family",
    category: "benefits",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "jury duty",
    definition: "Time off for mandatory court service with pay protection",
    category: "benefits",
    importance: "low",
    affects: ["all_flight_attendants"]
  },

  // Aircraft and Equipment Terms
  {
    term: "aircraft",
    definition: "The airplane or jet being operated for passenger service",
    category: "equipment",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "cabin",
    definition: "The passenger compartment of the aircraft where flight attendants work",
    category: "equipment",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "galley",
    definition: "The kitchen area of the aircraft where food and beverages are prepared and stored",
    category: "equipment",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "jumpseat",
    definition: "Special seats designated for crew members, used for transportation or when all passenger seats are occupied",
    category: "equipment",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "cabin jumpseat",
    definition: "Crew seats located in the passenger cabin for deadheading or off-duty travel",
    category: "equipment",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },

  // Operational Terms
  {
    term: "departure",
    definition: "The scheduled or actual time an aircraft leaves the gate",
    category: "operations",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "arrival",
    definition: "The scheduled or actual time an aircraft reaches its destination gate",
    category: "operations",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "gate",
    definition: "The designated airport location where passengers board and deplane",
    category: "operations",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "terminal",
    definition: "Airport building containing gates, shops, and passenger services",
    category: "operations",
    importance: "low",
    affects: ["all_flight_attendants"]
  },
  {
    term: "boarding",
    definition: "The process of passengers entering the aircraft before departure",
    category: "operations",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "delay",
    definition: "When a flight departs or arrives later than scheduled",
    category: "operations",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "maintenance",
    definition: "Required inspections, repairs, or servicing of aircraft",
    category: "operations",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },

  // Safety Terms
  {
    term: "safety",
    definition: "All procedures, equipment, and protocols designed to protect passengers and crew",
    category: "safety",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "emergency",
    definition: "Any situation requiring immediate action to ensure safety of passengers and crew",
    category: "safety",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "evacuation",
    definition: "Emergency procedure to rapidly exit passengers from the aircraft",
    category: "safety",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "safety equipment",
    definition: "All devices and materials required for passenger and crew safety",
    category: "safety",
    importance: "high",
    affects: ["all_flight_attendants"]
  },

  // Flight Types
  {
    term: "domestic flight",
    definition: "Flights within the 50 United States, Puerto Rico, Canada, Mexico, Central America, and the Caribbean",
    category: "operations",
    importance: "medium",
    synonyms: ["domestic flying"],
    affects: ["all_flight_attendants"]
  },
  {
    term: "international flight",
    definition: "Flights to and from South America, Europe, Asia, Africa, Australia, Antarctica, Guam and other island countries outside the Caribbean",
    category: "operations",
    importance: "medium",
    synonyms: ["international flying"],
    affects: ["international_only"]
  },

  // Training Terms
  {
    term: "training",
    definition: "Required education and certification programs for flight attendants",
    category: "work_rules",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "qualification",
    definition: "Certification to work specific aircraft types or routes",
    category: "work_rules",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "recurrent",
    definition: "Mandatory annual training to maintain flight attendant certification",
    category: "work_rules",
    importance: "high",
    synonyms: ["recurrent training"],
    affects: ["all_flight_attendants"]
  },

  // Union and Labor Terms
  {
    term: "union",
    definition: "The Association of Flight Attendants-CWA representing flight attendants",
    category: "work_rules",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "grievance",
    definition: "Formal complaint filed regarding contract violations or workplace issues",
    category: "work_rules",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "arbitration",
    definition: "Final binding resolution of disputes by a neutral third party",
    category: "work_rules",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "discipline",
    definition: "Corrective action taken by the company for policy violations",
    category: "work_rules",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "furlough",
    definition: "Temporary layoff due to economic conditions or reduced operations",
    category: "work_rules",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "recall",
    definition: "Return to work after furlough when operations increase",
    category: "work_rules",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "probation",
    definition: "Initial employment period with limited job protection",
    category: "work_rules",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },

  // Additional Important Terms
  {
    term: "no show",
    definition: "Failure to report for assigned duty without proper notification",
    category: "work_rules",
    importance: "high",
    affects: ["all_flight_attendants"]
  },
  {
    term: "uniform",
    definition: "Required professional attire for flight attendants while on duty",
    category: "work_rules",
    importance: "medium",
    affects: ["all_flight_attendants"]
  },
  {
    term: "commute",
    definition: "Personal travel to and from work assignments, typically unpaid",
    category: "scheduling",
    importance: "medium",
    affects: ["all_flight_attendants"]
  }
];

// Helper functions for working with aviation terms
export const getTermsByCategory = (category: AviationTerm['category']) => {
  return AVIATION_TERMS.filter(term => term.category === category);
};

export const getTermsByImportance = (importance: AviationTerm['importance']) => {
  return AVIATION_TERMS.filter(term => term.importance === importance);
};

export const getTermsByAffectedGroup = (group: 'all_flight_attendants' | 'senior_only' | 'reserve_only' | 'international_only') => {
  return AVIATION_TERMS.filter(term => term.affects?.includes(group));
};

export const searchTerms = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return AVIATION_TERMS.filter(term => 
    term.term.toLowerCase().includes(lowerQuery) ||
    term.definition.toLowerCase().includes(lowerQuery) ||
    term.synonyms?.some(synonym => synonym.toLowerCase().includes(lowerQuery))
  );
};

export const getTermDefinition = (term: string) => {
  const found = AVIATION_TERMS.find(t => 
    t.term.toLowerCase() === term.toLowerCase() ||
    t.synonyms?.some(synonym => synonym.toLowerCase() === term.toLowerCase())
  );
  return found?.definition;
};

// Categories for UI filtering
export const AVIATION_CATEGORIES = [
  { id: 'scheduling', label: 'Scheduling', icon: '📅' },
  { id: 'pay', label: 'Pay & Compensation', icon: '💰' },
  { id: 'benefits', label: 'Benefits', icon: '🏥' },
  { id: 'work_rules', label: 'Work Rules', icon: '📋' },
  { id: 'operations', label: 'Operations', icon: '✈️' },
  { id: 'safety', label: 'Safety', icon: '🛡️' },
  { id: 'equipment', label: 'Equipment', icon: '🔧' }
] as const;

// Search terms for chat context extraction
export const CHAT_SEARCH_TERMS = [
  'schedule', 'scheduling', 'pay', 'salary', 'wage', 'benefit', 'vacation', 
  'sick', 'overtime', 'premium', 'base', 'assignment', 'bidding', 'seniority',
  'crew', 'flight', 'duty', 'rest', 'time', 'hours', 'reserve', 'standby',
  'layover', 'deadhead', 'per diem', 'training', 'safety', 'emergency',
  'union', 'grievance', 'discipline', 'furlough', 'recall', 'probation'
]; 