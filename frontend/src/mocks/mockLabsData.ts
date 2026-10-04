import { LaboratoryInfo } from '../types/laboratory';

export const MOCK_LABORATORIES: LaboratoryInfo[] = [
  {
    id: 'lab-bis-central-sahibabad',
    name: 'BIS Central Laboratory (CL)',
    location: {
      city: 'Sahibabad / Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201010',
      address: 'Plot No. 20/9, Site IV, Sahibabad Industrial Area',
    },
    recognition_status: 'BIS Central Lab',
    capabilities: [
      'Food & Water Microbiological Analysis',
      'Electrical Appliance Safety Testing',
      'Mechanical Durability & Impact',
      'Chemical & Metallurgical Spectroscopy',
    ],
    tested_standards: ['IS 14543:2016', 'IS 302-2-3:2021', 'IS 17526:2021', 'IS 1293:2019', 'IS 302-1:2008'],
    contact: {
      phone: '+91-120-2770200',
      email: 'cl@bis.gov.in',
      website: 'https://www.bis.gov.in/laboratories/central-laboratory',
    },
  },
  {
    id: 'lab-bis-western-mumbai',
    name: 'BIS Western Regional Laboratory (WRL)',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400093',
      address: 'Manakalaya, E9, MIDC, Andheri (East)',
    },
    recognition_status: 'BIS Regional Lab',
    capabilities: [
      'Chemical & Toxicological Leaching',
      'Electrical Domestic Appliances',
      'Packaging & Polymer Integrity',
    ],
    tested_standards: ['IS 14543:2016', 'IS 17526:2021', 'IS 6911:2017', 'IS 302-2-3:2021'],
    contact: {
      phone: '+91-22-28329295',
      email: 'wrl@bis.gov.in',
    },
  },
  {
    id: 'lab-bis-southern-chennai',
    name: 'BIS Southern Regional Laboratory (SRL)',
    location: {
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600113',
      address: 'CIT Campus, IV Cross Road, Taramani',
    },
    recognition_status: 'BIS Regional Lab',
    capabilities: [
      'Potable Water Testing (Physical, Chemical, Biological)',
      'Electrical Motors & Pumps',
      'Steel & Metallurgy',
    ],
    tested_standards: ['IS 14543:2016', 'IS 17526:2021', 'IS 1293:2019'],
    contact: {
      phone: '+91-44-22541442',
      email: 'srl@bis.gov.in',
    },
  },
  {
    id: 'lab-tuv-rheinland-bangalore',
    name: 'TÜV Rheinland India Pvt Ltd (BIS Recognized Lab)',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      address: 'Electronic City Phase 1, Hosur Road',
    },
    recognition_status: 'BIS Recognized',
    capabilities: [
      'Electrical & Electronic Safety Testing (CRS Scheme)',
      'Glow Wire & Flammability Testing',
      'Ingress Protection (IP Ratings)',
      'Cord Flexing & Endurance Simulation',
    ],
    tested_standards: ['IS 302-2-3:2021', 'IS 302-1:2008', 'IS 1293:2019', 'IS 13252'],
    contact: {
      phone: '+91-80-46498000',
      email: 'info-india@tuv.com',
      website: 'https://www.tuv.com/india',
    },
  },
  {
    id: 'lab-shriram-delhi',
    name: 'Shriram Institute for Industrial Research',
    location: {
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110007',
      address: '19, University Road, Timarpur',
    },
    recognition_status: 'BIS Recognized',
    capabilities: [
      'Food Contact Materials Leaching (IS 9845)',
      'Trace Heavy Metal ICP-MS Testing',
      'Thermal Insulation Vacuum Retention',
      'Water Quality Parameter Verification',
    ],
    tested_standards: ['IS 14543:2016', 'IS 17526:2021', 'IS 6911:2017'],
    contact: {
      phone: '+91-11-23841456',
      email: 'sri@shriraminstitute.org',
      website: 'https://www.shriraminstitute.org',
    },
  },
];
