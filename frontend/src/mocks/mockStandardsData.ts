import { StandardDetail } from '../types/standards';

export const MOCK_STANDARDS: StandardDetail[] = [
  {
    standard_number: 'IS 14543:2016',
    title: 'Packaged Drinking Water (Other Than Packaged Natural Mineral Water) — Specification',
    status: 'Active',
    publication_year: 2016,
    department: 'Food and Agriculture Division (FAD 14)',
    category: 'Food & Beverages',
    is_mandatory: true,
    qco_reference: 'Packaged Drinking Water (Quality Control) Order, 2001',
    overview:
      'This standard prescribes requirements and methods of sampling and test for packaged drinking water other than packaged natural mineral water, intended for direct human consumption.',
    scope:
      'Covers potable water derived from any source of potable water which is subjected to treatments, namely, decantation, filtration, combination of filtration, aeration, filtration with activated carbon, demineralization, remineralization, reverse osmosis, and packed in clean, sterile, food-grade plastic or glass containers.',
    requirements: [
      {
        section: 'Section 4',
        title: 'Chemical Requirements',
        description: 'TDS (< 500 mg/l), pH (6.5 to 8.5), heavy metals (lead < 0.01 mg/l, arsenic < 0.01 mg/l, cadmium < 0.003 mg/l).',
        clause: 'Clause 4.2, Table 1',
      },
      {
        section: 'Section 4',
        title: 'Microbiological Requirements',
        description: 'Total coliform bacteria, E. coli, Faecal Streptococci, Pseudomonas aeruginosa, and yeast and mould count must be absent in 250 ml.',
        clause: 'Clause 4.3, Table 2',
      },
      {
        section: 'Section 5',
        title: 'Packaging & Marking',
        description: 'Shall be packed in clean, colourless, tamperproof containers with mandatory ISI Mark, batch number, date of packing, and best-before date.',
        clause: 'Clause 5.1',
      },
    ],
    testing_methods: [
      {
        name: 'Determination of Total Dissolved Solids (TDS)',
        clause: 'Clause 4.2 / IS 3025 (Part 16)',
        mandatory: true,
        description: 'Gravimetric method after drying at 180°C.',
      },
      {
        name: 'Heavy Metal Analysis by ICP-MS',
        clause: 'Clause 4.2 / IS 3025 (Part 65)',
        mandatory: true,
        description: 'Inductively coupled plasma mass spectrometry for trace elements.',
      },
      {
        name: 'Membrane Filtration Method for E. Coli',
        clause: 'Clause 4.3 / IS 15185',
        mandatory: true,
        description: 'Filter 250ml water sample through 0.45 micron membrane followed by culture incubation.',
      },
    ],
    certification_schemes: ['Scheme-I (ISI Mark Certification)'],
    related_standards: [
      { standard_number: 'IS 13428:2005', title: 'Packaged Natural Mineral Water', relation_type: 'Complementary' },
      { standard_number: 'IS 10500:2012', title: 'Drinking Water Specification', relation_type: 'Referenced In' },
    ],
    sources: [
      {
        document_title: 'IS 14543:2016 Official Specification Document',
        standard_number: 'IS 14543:2016',
        section: 'Section 4.2',
        clause: 'Clause 4.2',
        snippet: 'The water shall conform to the chemical requirements as given in Table 1. The pH value shall be between 6.5 and 8.5.',
        source_type: 'IS',
      },
    ],
  },
  {
    standard_number: 'IS 17526:2021',
    title: 'Stainless Steel Vacuum Flasks and Insulated Flask Bottles — Specification',
    status: 'Active',
    publication_year: 2021,
    department: 'Mechanical Engineering Division (MED 33)',
    category: 'Consumer Goods & Hardware',
    is_mandatory: true,
    qco_reference: 'Potable Water Bottles (Quality Control) Order, 2023',
    overview:
      'Specifies requirements for double-walled vacuum flasks and insulated bottles made from food-grade stainless steel for household and personal liquid storage.',
    scope:
      'Applies to vacuum-insulated flasks, sports bottles, thermos containers, and food jars having nominal capacity between 250 ml and 3000 ml.',
    requirements: [
      {
        section: 'Section 5',
        title: 'Material Specifications',
        description: 'Inner container in direct contact with liquid must be manufactured from food-grade austenitic stainless steel conforming to IS 6911.',
        clause: 'Clause 5.1',
      },
      {
        section: 'Section 6',
        title: 'Thermal Insulation Retention',
        description: 'Temperature drop shall not exceed 35°C over a period of 6 hours from initial boiling water charge at 95°C.',
        clause: 'Clause 6.4',
      },
      {
        section: 'Section 7',
        title: 'Food Contact Chemical Migration',
        description: 'Extractable heavy metals into 3% acetic acid stimulant must strictly not exceed permissible migration thresholds.',
        clause: 'Clause 7.2',
      },
    ],
    testing_methods: [
      {
        name: 'Insulation Performance Test',
        clause: 'Clause 6.4',
        mandatory: true,
        description: 'Calibrated temperature probe monitoring at 6h and 24h intervals in a temperature-controlled ambient room at 20°C.',
      },
      {
        name: 'Drop Test for Structural Integrity',
        clause: 'Clause 8.1',
        mandatory: true,
        description: 'Free fall drop from 1.2 m height onto hardwood/concrete surface with liquid-filled capacity.',
      },
    ],
    certification_schemes: ['Scheme-I (ISI Mark Certification)'],
    related_standards: [
      { standard_number: 'IS 6911:2017', title: 'Stainless Steel Plate, Sheet and Strip', relation_type: 'Referenced In' },
      { standard_number: 'IS 9845:1998', title: 'Determination of Overall Migration of Food Contact Plastics/Coatings', relation_type: 'Referenced In' },
    ],
    sources: [
      {
        document_title: 'IS 17526:2021 Official Specification',
        standard_number: 'IS 17526:2021',
        section: 'Section 6.4',
        clause: 'Clause 6.4',
        snippet: 'Double-walled vacuum containers shall maintain internal hot liquid at >= 60°C after 6 hours from initial fill at 95°C.',
        source_type: 'IS',
      },
    ],
  },
  {
    standard_number: 'IS 302-2-3:2021',
    title: 'Safety of Household and Similar Electrical Appliances — Part 2-3: Particular Requirements for Electric Irons',
    status: 'Active',
    publication_year: 2021,
    department: 'Electrotechnical Division (ETD 32)',
    category: 'Electrical & Electronics',
    is_mandatory: true,
    qco_reference: 'Electrical Appliances (Quality Control) Order',
    overview:
      'Deals with the electrical, mechanical, and thermal safety of electric dry irons and steam irons intended for domestic and similar smoothing applications.',
    scope:
      'Applicable to electric irons with rated voltage up to 250V AC. Read in conjunction with IS 302-1 (General Safety Requirements).',
    requirements: [
      {
        section: 'Section 11',
        title: 'Heating & Temperature Rise',
        description: 'Operating handle temperature rise shall not exceed 60K for non-metallic handles and 30K for metallic handles.',
        clause: 'Clause 11.8',
      },
      {
        section: 'Section 19',
        title: 'Abnormal Operation & Thermal Cutout',
        description: 'Thermostat failure simulation must not lead to flame, ignition, or excessive soleplate overheating.',
        clause: 'Clause 19.4',
      },
      {
        section: 'Section 25',
        title: 'Supply Connection and External Flexible Cords',
        description: 'Swivel inlet and cord guard must withstand 20,000 flexing cycles under 10N strain without electrical breakdown.',
        clause: 'Clause 25.14',
      },
    ],
    testing_methods: [
      {
        name: 'Dielectric Strength & Insulation Resistance Test',
        clause: 'Clause 13.3 / Clause 16.3',
        mandatory: true,
        description: 'Application of 1500V AC test voltage between live conductors and external accessible metallic parts.',
      },
      {
        name: 'Cord Flexing Endurance Test',
        clause: 'Clause 25.14',
        mandatory: true,
        description: 'Automated oscillation through 90 degree arc at 60 flexings/min under current load.',
      },
    ],
    certification_schemes: ['Scheme-I (ISI Mark Certification)'],
    related_standards: [
      { standard_number: 'IS 302-1:2008', title: 'Safety of Household Appliances — Part 1: General Requirements', relation_type: 'Complementary' },
      { standard_number: 'IS 366:2018', title: 'Electric Irons — Methods for Measuring Performance', relation_type: 'Complementary' },
      { standard_number: 'IS 1293:2019', title: 'Plugs and Socket-Outlets', relation_type: 'Referenced In' },
    ],
    sources: [
      {
        document_title: 'IS 302-2-3:2021 Safety Standards',
        standard_number: 'IS 302-2-3:2021',
        section: 'Section 11',
        clause: 'Clause 11.8',
        snippet: 'During normal operation, the temperature rise of parts held in normal use shall not exceed specified limit values.',
        source_type: 'IS',
      },
    ],
  },
  {
    standard_number: 'IS 1293:2019',
    title: 'Plugs and Socket-Outlets for Domestic and Similar Purposes up to and Including 250V and 16A — Specification',
    status: 'Active',
    publication_year: 2019,
    department: 'Electrotechnical Division (ETD 14)',
    category: 'Electrical & Electronics',
    is_mandatory: true,
    qco_reference: 'Plugs and Socket-Outlets (Quality Control) Order, 2020',
    overview:
      'Specifies dimensions, ratings, safety shutter requirements, and endurance for 2-pin and 3-pin plugs and sockets used in India.',
    scope:
      'Applies to plugs, fixed or portable socket-outlets for AC only, with or without earthing contact, with rated voltage not exceeding 250V.',
    requirements: [
      {
        section: 'Section 9',
        title: 'Dimensional Gauging',
        description: 'Pin diameter, pin spacing, and gauge clearances must accurately fit Indian standard gauges.',
        clause: 'Clause 9.1',
      },
      {
        section: 'Section 13',
        title: 'Resistance to Heat and Fire (Glow Wire Test)',
        description: 'Insulating materials in contact with current-carrying parts must resist glow wire at 850°C.',
        clause: 'Clause 13.3',
      },
    ],
    testing_methods: [
      {
        name: 'Glow Wire Flammability Test',
        clause: 'Clause 13.3',
        mandatory: true,
        description: 'Heated glow-wire probe at 850°C applied for 30s; flames must self-extinguish within 30s.',
      },
    ],
    certification_schemes: ['Scheme-I (ISI Mark Certification)'],
    related_standards: [
      { standard_number: 'IS 60884-1', title: 'Plugs and Socket-Outlets General', relation_type: 'Referenced In' },
    ],
    sources: [],
  },
];
