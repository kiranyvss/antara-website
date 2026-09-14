// Staff data structure to be maintained
// This data can be imported from an Excel file or managed through a database
// Format matches the Excel requirements:
// Column 1: ID, Column 2: Name, Column 3: Qualification, Column 4: Specialization, Column 5: Fee/hour, Column 6: Detailed Info

export const staffData = [
  {
    id: "S001",
    name: "Meenakshi Yellapragada",
    qualifications: "M.A. Clinical Psychology\nCertified Cognitive Behavioral Therapist",
    specializations: "Anxiety Disorders\nDepression\nStress Management",
    feePerHour: 450,
    detailedInfo: "Meenakshi has over 8 years of experience in clinical psychology. She specializes in anxiety disorders and depression using evidence-based therapeutic approaches.",
    photo: "/staff-photos/Meenakshi.jpg"
  },
  {
    id: "S002",
    name: "Geeta",
    qualifications: "M.Sc. Counselling Psychology\nB.A. Psychology\nAccredited by BACP",
    specializations: "Student Support\nCareer Counselling\nPersonal Development",
    feePerHour: 450,
    detailedInfo: "Geeta is an accredited counsellor with expertise in student support and career guidance. He creates a warm environment for clients to explore their challenges.",
    photo: "/staff-photos/michael-chen.jpg"
  },
  {
    id: "S003",
    name: "Placeholder Staff 1",
    qualifications: "[To be filled]\n[Qualifications]",
    specializations: "[To be filled]\n[Specialization]",
    feePerHour: 0,
    detailedInfo: "[Staff details to be added later]",
    photo: "/staff-photos/placeholder-1.jpg"
  },
  {
    id: "S004",
    name: "Placeholder Staff 2",
    qualifications: "[To be filled]\n[Qualifications]",
    specializations: "[To be filled]\n[Specialization]",
    feePerHour: 0,
    detailedInfo: "[Staff details to be added later]",
    photo: "/staff-photos/placeholder-2.jpg"
  }
];

// Function to get staff by service
export const getStaffByService = (service) => {
  // This will filter staff based on their specializations
  // For now, returns all staff - can be updated based on service mapping
  return staffData;
};

// Function to get staff details
export const getStaffDetails = (staffId) => {
  return staffData.find(staff => staff.id === staffId);
};
