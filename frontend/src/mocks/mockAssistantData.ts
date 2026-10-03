import { StructuredAIResponse } from '../types/assistant';

/**
 * CASE 1: Successful Standard Recommendation
 * Query: "I manufacture stainless steel water bottles for household use. Which BIS standards should I look at?"
 */
export const MOCK_CASE_1_RECOMMENDATION: StructuredAIResponse = {
  query: 'I manufacture stainless steel water bottles for household use. Which BIS standards should I look at?',
  answer:
    'Based on your product description for household stainless steel water bottles, **IS 17526:2021** (Stainless Steel Vacuum Flasks and Bottles) is the primary potentially applicable Indian Standard [1]. In addition, material composition must conform to food-contact steel grades under **IS 6911** [2]. Under the Quality Control Order (QCO), certification under Scheme-I (ISI Mark) is mandatory before commercial distribution.',
  intent: 'PRODUCT_DISCOVERY',
  evidence_status: 'strong',
  product: {
    name: 'Stainless Steel Water Bottle',
    category: 'Domestic Utensils & Food Contact Ware',
    intended_use: 'Household drinking water storage and carriage',
    attributes: [
      { key: 'Material', value: 'Stainless Steel (Food Grade)' },
      { key: 'Application', value: 'Household / Personal Use' },
      { key: 'Type', value: 'Vacuum / Single Walled Bottle' },
    ],
  },
  standards: [
    {
      standard_number: 'IS 17526:2021',
      title: 'Stainless Steel Vacuum Flasks and Insulated Flask Bottles — Specification',
      status: 'Active',
      short_description: 'Covers constructional, chemical, and physical safety requirements for domestic stainless steel flasks and bottles.',
      is_mandatory: true,
      qco_order: 'Potable Water Bottles (Quality Control) Order',
      source_availability: true,
      match_reasons: [
        { category: 'Product Category', label: 'Domestic storage containers', status: 'matched', detail: 'Matches scope in Clause 1' },
        { category: 'Intended Use', label: 'Household potable water', status: 'matched', detail: 'Direct match for consumer bottles' },
        { category: 'Material', label: 'Stainless steel grade', status: 'matched', detail: 'Austenitic food-grade requirement' },
      ],
    },
    {
      standard_number: 'IS 6911:2017',
      title: 'Stainless Steel Plate, Sheet and Strip — Specification',
      status: 'Active',
      short_description: 'Specifies the metallurgical and chemical composition requirements for raw stainless steel sheets used in fabrication.',
      is_mandatory: true,
      source_availability: true,
      match_reasons: [
        { category: 'Raw Material', label: 'Food-contact steel alloy', status: 'matched', detail: 'Referenced as normative input' },
        { category: 'Corrosion Resistance', label: 'Grade 304 / Equivalent', status: 'partial', detail: 'Must be verified via mill test certificate' },
      ],
    },
  ],
  certification: {
    scheme_name: 'Scheme-I (ISI Mark Certification Scheme)',
    scheme_code: 'Scheme-I',
    applicable_standard: 'IS 17526:2021',
    eligibility: 'Domestic and foreign manufacturers with in-house quality control testing facilities.',
    process_steps: [
      {
        step_number: 1,
        name: 'In-house Testing Lab Setup',
        description: 'Establish mandatory testing equipment specified in the Scheme of Inspection and Testing (SIT).',
        timeline: '1-2 weeks',
      },
      {
        step_number: 2,
        name: 'Online Manakonline Application',
        description: 'Submit Form-V on the BIS Manakonline portal with manufacturing unit details and factory layout.',
        timeline: '1-3 days',
      },
      {
        step_number: 3,
        name: 'Factory Audit & Sample Drawing',
        description: 'BIS inspecting officer visits the manufacturing premises to verify manufacturing capability and draw verification samples.',
        timeline: '2-4 weeks',
      },
      {
        step_number: 4,
        name: 'Grant of ISI License',
        description: 'Upon independent laboratory test report conformity, BIS issues the CML (Certification Marks License) number.',
        timeline: '1-2 weeks',
      },
    ],
    required_documents: [
      'Factory registration certificate or MSME Udyam registration',
      'Manufacturing machinery list with calibration certificates',
      'Testing equipment list with calibration records',
      'In-house lab technician qualification documents',
      'Layout plan of factory premises',
      'Brand name authorization / Trademark registration',
    ],
    official_portal_url: 'https://www.manakonline.in',
  },
  testing: [
    {
      id: 'test-1',
      test_name: 'Thermal Insulation Retention Test',
      requirement_description: 'Liquid temperature retention over 6-hour and 24-hour test cycles.',
      status: 'mandatory',
      standard_clause: 'Clause 6.4',
      acceptance_criteria: 'Liquid temperature must remain above 60°C after 6 hours when starting at 95°C.',
    },
    {
      id: 'test-2',
      test_name: 'Leaching of Heavy Metals (Food Contact Safety)',
      requirement_description: 'Chemical migration analysis into simulated food liquids (acetic acid test).',
      status: 'mandatory',
      standard_clause: 'Clause 7.2',
      acceptance_criteria: 'Total lead, cadmium, and nickel migration must be below prescribed limits in IS 9845.',
    },
    {
      id: 'test-3',
      test_name: 'Drop Impact Resistance',
      requirement_description: 'Impact durability when dropped from a height of 1.2 meters on a concrete surface.',
      status: 'mandatory',
      standard_clause: 'Clause 8.1',
      acceptance_criteria: 'No leakage or detachment of protective base.',
    },
    {
      id: 'test-4',
      test_name: 'Handle & Strap Fatigue Resistance',
      requirement_description: 'Oscillation test for attached carrying handles under full load.',
      status: 'conditional',
      standard_clause: 'Clause 8.3',
      acceptance_criteria: 'Applicable only if bottle features an attached carrying loop or strap.',
    },
  ],
  citations: [
    {
      index: 1,
      standard_id: 'IS 17526:2021',
      document_title: 'Stainless Steel Vacuum Flasks and Insulated Flask Bottles',
      section: 'Section 1 — Scope',
      clause: 'Clause 1.1',
      snippet: 'This standard specifies requirements for double-walled vacuum and insulated flasks and bottles made from austenitic stainless steel for domestic usage.',
      url: 'https://standardsbis.bsbedge.com',
    },
    {
      index: 2,
      standard_id: 'IS 6911:2017',
      document_title: 'Stainless Steel Plate, Sheet and Strip — Specification',
      section: 'Section 4 — Chemical Composition',
      clause: 'Table 2',
      snippet: 'Raw material intended for food contact containers shall conform to designated food-grade austenitic stainless steel containing not less than 18% chromium and 8% nickel.',
      url: 'https://standardsbis.bsbedge.com',
    },
  ],
  sources: [
    {
      document_title: 'IS 17526:2021 — Vacuum Flasks and Bottles',
      standard_number: 'IS 17526:2021',
      section: 'Section 1',
      clause: 'Clause 1.1',
      snippet: 'This standard specifies requirements for double-walled vacuum and insulated flasks and bottles made from austenitic stainless steel for domestic usage.',
      source_type: 'IS',
      relevance_score: 0.96,
    },
    {
      document_title: 'IS 6911:2017 — Stainless Steel Materials',
      standard_number: 'IS 6911:2017',
      section: 'Section 4',
      clause: 'Clause 4.2',
      snippet: 'Raw material intended for food contact containers shall conform to designated food-grade austenitic stainless steel.',
      source_type: 'IS',
      relevance_score: 0.88,
    },
    {
      document_title: 'Potable Water Bottles (Quality Control) Order, 2023',
      standard_number: 'QCO-BIS-2023-BOTTLE',
      section: 'Enforcement clause',
      clause: 'Order 3',
      snippet: 'No person shall manufacture, import, distribute or sell potable water bottles except under a valid license bearing the Standard Mark from the Bureau of Indian Standards.',
      source_type: 'QCO',
      relevance_score: 0.94,
    },
  ],
  follow_up_suggestions: [
    'What tests are mandatory under Clause 6.4 of IS 17526:2021?',
    'What is the BIS Scheme-I application fee for MSMEs?',
    'Find recognized testing laboratories for IS 17526 in North India',
    'View the compliance checklist for this standard',
  ],
};

/**
 * CASE 2: Missing Information Flow (Dynamic Clarification)
 * Query: "I want to get a BIS mark for my electric heater."
 */
export const MOCK_CASE_2_MISSING_INFO: StructuredAIResponse = {
  query: 'I want to get a BIS mark for my electric heater.',
  answer:
    'Electric heating appliances fall under different Indian Standards depending on their operating medium and construction (e.g., room radiant heaters, immersion water heaters, or storage water geysers). To identify the exact applicable standard and testing requirements, please provide the following details.',
  intent: 'CLARIFICATION_REQUIRED',
  evidence_status: 'needs_verification',
  needs_clarification: true,
  missing_information: [
    {
      field: 'heater_type',
      label: 'Heater Type',
      input_type: 'select',
      required: true,
      placeholder: 'Select heater category',
      options: [
        'Water Immersion Heater (IS 368)',
        'Storage Electric Water Heater / Geyser (IS 2082)',
        'Electric Room Heater / Radiant Heater (IS 302-2-30)',
        'Instantaneous Electric Water Heater (IS 8978)',
      ],
      help_text: 'Choose the primary design of the heating device.',
    },
    {
      field: 'intended_use',
      label: 'Intended Environment / Use',
      input_type: 'select',
      required: true,
      options: ['Domestic Household (230V Single Phase)', 'Commercial / Industrial (415V Three Phase)'],
      help_text: 'Standards differ between household consumer products and heavy industrial heating systems.',
    },
    {
      field: 'rated_power',
      label: 'Rated Power / Wattage (kW)',
      input_type: 'number',
      required: false,
      placeholder: 'e.g., 2.0',
      help_text: 'Enter heating element power rating.',
    },
  ],
  clarification_questions: [
    'What specific type of electric heater do you manufacture?',
    'Is it intended for domestic household use (230V) or commercial/industrial application?',
  ],
  sources: [
    {
      document_title: 'BIS Certification Scheme for Electrical Heating Appliances',
      standard_number: 'IS 302 Series',
      section: 'Appliance Guide',
      clause: 'Table 1',
      snippet: 'Heating appliances require classification under IS 302-1 general safety requirements read in conjunction with specific Part 2 standards.',
      source_type: 'IS',
    },
  ],
  follow_up_suggestions: [
    'Explain the difference between IS 368 and IS 2082',
    'Are electric heaters under mandatory BIS certification?',
  ],
};

/**
 * CASE 3: Multiple Possible Standards (Comparison)
 * Query: "Which standard applies to domestic electric iron?"
 */
export const MOCK_CASE_3_MULTIPLE_STANDARDS: StructuredAIResponse = {
  query: 'Which standard applies to domestic electric iron?',
  answer:
    'Domestic electric irons are governed jointly by two distinct standards: **IS 302-2-3** governs the specific safety requirements for electric irons [1], while **IS 366** specifies performance, temperature regulation, and soleplate endurance [2]. In addition, **IS 302-1** provides the overarching general safety requirements for all household electrical appliances [3].',
  intent: 'PRODUCT_DISCOVERY',
  evidence_status: 'strong',
  product: {
    name: 'Domestic Electric Iron',
    category: 'Household Electrical Appliances',
    intended_use: 'Domestic smoothing of garments',
    attributes: [
      { key: 'Voltage', value: '230V AC, 50Hz' },
      { key: 'Type', value: 'Dry / Steam Iron' },
      { key: 'Safety Class', value: 'Class I / Class II Appliance' },
    ],
  },
  standards: [
    {
      standard_number: 'IS 302-2-3:2021',
      title: 'Safety of Household and Similar Electrical Appliances — Part 2-3: Particular Requirements for Electric Irons',
      status: 'Active',
      short_description: 'Mandatory safety standard covering insulation, creepage distances, soleplate thermostat cut-off, and thermal burn safety.',
      is_mandatory: true,
      source_availability: true,
      match_reasons: [
        { category: 'Appliance Safety', label: 'Primary Safety Standard', status: 'matched', detail: 'Essential safety standard referenced in Electrical Wires & Appliances QCO' },
        { category: 'Heating Element', label: 'Soleplate thermal safety', status: 'matched', detail: 'Clause 11 heating limit compliance' },
      ],
    },
    {
      standard_number: 'IS 366:2018',
      title: 'Electric Irons — Methods for Measuring Performance',
      status: 'Active',
      short_description: 'Performance standard evaluating steaming rate, soleplate surface finish, temperature distribution, and energy consumption.',
      is_mandatory: false,
      source_availability: true,
      match_reasons: [
        { category: 'Performance', label: 'Ironing efficiency', status: 'matched', detail: 'Covers temperature consistency and soleplate scratch resistance' },
        { category: 'Energy Efficiency', label: 'BEE Rating Alignment', status: 'partial', detail: 'Used as reference for voluntary star labeling' },
      ],
    },
    {
      standard_number: 'IS 302-1:2008',
      title: 'Safety of Household and Similar Electrical Appliances — Part 1: General Requirements',
      status: 'Active',
      short_description: 'General baseline requirements for electrical insulation, cord anchorage, earthing, and moisture resistance.',
      is_mandatory: true,
      source_availability: true,
      match_reasons: [
        { category: 'General Safety', label: 'Harmonized safety baseline', status: 'matched', detail: 'Must be satisfied alongside Part 2-3' },
      ],
    },
  ],
  citations: [
    {
      index: 1,
      standard_id: 'IS 302-2-3:2021',
      document_title: 'Safety of Household Electrical Appliances — Electric Irons',
      section: 'Section 1 — Scope',
      clause: 'Clause 1',
      snippet: 'This standard deals with the safety of electric dry irons and steam irons, including those with a separate water reservoir or boiler having a capacity not exceeding 5L, for household and similar purposes.',
      url: 'https://standardsbis.bsbedge.com',
    },
    {
      index: 2,
      standard_id: 'IS 366:2018',
      document_title: 'Electric Irons — Performance Requirements',
      section: 'Section 5 — Performance Measurement',
      clause: 'Clause 5.1',
      snippet: 'The soleplate temperature variation across the designated ironing zone shall not exceed 15°C when tested under nominal voltage conditions.',
      url: 'https://standardsbis.bsbedge.com',
    },
    {
      index: 3,
      standard_id: 'IS 302-1:2008',
      document_title: 'General Safety of Household Appliances',
      section: 'Section 22 — Construction',
      clause: 'Clause 22.5',
      snippet: 'Appliances provided with a flexible cord for connection to supply mains shall have cord anchorage designed to relieve conductors from strain.',
      url: 'https://standardsbis.bsbedge.com',
    },
  ],
  sources: [
    {
      document_title: 'IS 302-2-3:2021 — Electric Irons Safety',
      standard_number: 'IS 302-2-3:2021',
      clause: 'Clause 1',
      snippet: 'Deals with the safety of electric dry irons and steam irons for household purposes.',
      source_type: 'IS',
    },
    {
      document_title: 'IS 366:2018 — Electric Irons Performance',
      standard_number: 'IS 366:2018',
      clause: 'Clause 5.1',
      snippet: 'Specifies soleplate temperature distribution and measurement methods.',
      source_type: 'IS',
    },
  ],
  follow_up_suggestions: [
    'What tests are required under IS 302-2-3 Clause 19 (Abnormal operation)?',
    'How do I test soleplate temperature uniformity?',
    'Show certification steps for household appliances under Scheme-I',
  ],
};

/**
 * CASE 4: Insufficient Evidence / Uncertainty Experience
 * Query: "What is the BIS standard for quantum computing cryogenic dilution refrigerators?"
 */
export const MOCK_CASE_4_INSUFFICIENT_EVIDENCE: StructuredAIResponse = {
  query: 'What is the BIS standard for quantum computing cryogenic dilution refrigerators?',
  answer:
    'No sufficiently relevant Indian Standard was found in the BIS repository for quantum cryogenic dilution refrigerators. BIS has published standards for conventional domestic and commercial refrigeration (such as IS 15750 and IS 1476), but specialized sub-Kelvin scientific refrigeration systems are currently not standardized by a dedicated Indian Standard. We recommend checking with the Electrotechnical Department (ETD) or Medical/Scientific Equipment Sectional Committee at BIS.',
  intent: 'STANDARD_QUERY',
  evidence_status: 'insufficient_evidence',
  sources: [
    {
      document_title: 'BIS Electrotechnical Division Scope Document',
      standard_number: 'ETD-Overview',
      snippet: 'Covers standardization in fields of power generation, transmission, electrical appliances, and scientific laboratory instrumentation.',
      source_type: 'GENERAL',
    },
  ],
  follow_up_suggestions: [
    'How are new Indian Standards formulated by Sectional Committees?',
    'What standards exist for industrial refrigeration (IS 15750)?',
    'Contact BIS Technical Committee',
  ],
};

/**
 * CASE 5: Backend Error Simulation Helper
 */
export const MOCK_CASE_5_ERROR_RESPONSE = {
  error: {
    code: 'AI_SERVICE_UNAVAILABLE',
    message: 'The BIS AI retrieval service is temporarily unavailable. Please retry in a few moments.',
    details: {
      retry_after_seconds: 5,
      component: 'rag_vector_pipeline',
    },
  },
};
