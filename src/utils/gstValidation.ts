/**
 * Indian GSTIN Validation and State Code Utilities
 * Compliant with GSTN (Goods and Services Tax Network) standards
 */

export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export interface IndianState {
  code: string;
  name: string;
}

export const INDIAN_STATES: IndianState[] = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' },
];

export const STATE_CODE_TO_NAME: Record<string, string> = INDIAN_STATES.reduce(
  (acc, s) => ({ ...acc, [s.code]: s.name }),
  {}
);

export function getStateCodeByName(stateName?: string): string | undefined {
  if (!stateName) return undefined;
  const clean = stateName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const match = INDIAN_STATES.find(
    (s) => s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
  );
  if (match) return match.code;
  // Check if it was already a code
  if (/^\d{2}$/.test(stateName.trim())) {
    return stateName.trim();
  }
  return undefined;
}

export function getStateNameByCode(code?: string): string | undefined {
  if (!code) return undefined;
  const clean = code.trim();
  return STATE_CODE_TO_NAME[clean];
}

export interface GSTINValidationResult {
  isValid: boolean;
  stateCode?: string;
  stateName?: string;
  isUnregistered?: boolean;
  isMismatch?: boolean;
  message?: string;
}

/**
 * Validates 15-digit Indian GSTIN format and optionally checks matching state
 */
export function validateGSTIN(
  gstin?: string | null,
  selectedState?: string
): GSTINValidationResult {
  if (!gstin || gstin.trim() === '' || gstin.trim().toUpperCase() === 'URP') {
    return { isValid: true, isUnregistered: true };
  }

  const cleanGstin = gstin.trim().toUpperCase();

  if (cleanGstin.length !== 15) {
    return {
      isValid: false,
      message: `GSTIN must be exactly 15 characters (currently ${cleanGstin.length}).`,
    };
  }

  if (!GSTIN_REGEX.test(cleanGstin)) {
    return {
      isValid: false,
      message:
        'Invalid GSTIN format. Expected: 2-digit state code + 10-char PAN + entity code + Z + checksum (e.g. 33AAAAA0000A1Z5).',
    };
  }

  const stateCode = cleanGstin.substring(0, 2);
  const registeredStateName = STATE_CODE_TO_NAME[stateCode];

  // If a selected state was provided, check if state code matches
  if (selectedState) {
    const expectedCode = getStateCodeByName(selectedState);
    if (expectedCode && expectedCode !== stateCode) {
      return {
        isValid: false,
        isMismatch: true,
        stateCode,
        stateName: registeredStateName,
        message: `GSTIN state code (${stateCode} - ${
          registeredStateName || 'Unknown'
        }) does not match selected state "${selectedState}".`,
      };
    }
  }

  return {
    isValid: true,
    stateCode,
    stateName: registeredStateName,
  };
}
