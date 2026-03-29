import { useProfile } from "./useProfile";

const familyTerms = {
  portalTitle: "Parent Dashboard",
  kidsLabel: "My Kids",
  kidSingular: "Kid",
  kidPlural: "Kids",
  addKid: "Add a Kid",
  addKidShort: "+ Add Kid",
  familyLabel: "Family",
  classLabel: "Family",
};

const schoolTerms = {
  portalTitle: "Teacher Portal",
  kidsLabel: "My Class",
  kidSingular: "Student",
  kidPlural: "Students",
  addKid: "Add a Student",
  addKidShort: "+ Add Student",
  familyLabel: "Classroom",
  classLabel: "Classroom",
};

export function useAccountType() {
  const { data: profile } = useProfile();
  const isSchool = profile?.account_type === "school";
  return {
    terms: isSchool ? schoolTerms : familyTerms,
    isSchool,
    isFamily: !isSchool,
    accountType: profile?.account_type ?? "family",
  };
}
