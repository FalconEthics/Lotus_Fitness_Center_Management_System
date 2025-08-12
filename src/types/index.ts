// Core data model types
export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  membershipPlanId: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Trial' | 'Suspended';
  renewalCount?: number;
  lastRenewalDate?: string;
}

export interface FitnessClass {
  id: number;
  name: string;
  trainerId: number;
  schedule: {
    dayOfWeek: number; // 0-6 (Sunday to Saturday)
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    duration: number; // minutes
  };
  capacity: number;
  enrolled: number[]; // member IDs
  description?: string;
}

// New entity types
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Owner' | 'Receptionist';
  avatar?: string;
  preferences: {
    theme: string;
    autoSaveInterval: number; // minutes
    defaultView: 'dashboard' | 'members' | 'classes';
    notifications?: boolean;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
  };
}

export interface MembershipPlan {
  id: number;
  name: string;
  duration: number; // days
  cost: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  phone: string;
  expertise: string[]; // Same as specialties in form
  assignedClasses: number[]; // class IDs
  hourlyRate?: number;
  certifications: string[];
  isActive: boolean;
  // Additional fields for complete trainer profile
  hiredDate?: string; // ISO date string
  experience?: number; // years of experience
  bio?: string;
  rating?: number; // 0-5 rating
}

export interface AttendanceRecord {
  id: number;
  memberId: number;
  classId: number;
  date: string; // ISO date string
  status: 'Present' | 'Absent' | 'Late';
  checkedInAt?: string; // ISO datetime string
}

// Dataset type combining all entities
export interface Dataset {
  userProfile: UserProfile;
  members: Member[];
  classes: FitnessClass[];
  membershipPlans: MembershipPlan[];
  trainers: Trainer[];
  attendance: AttendanceRecord[];
}

// Action types for the reducer
export enum DatasetActionType {
  SET_DATASET = 'SET_DATASET',
  UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE',
  ADD_MEMBER = 'ADD_MEMBER',
  UPDATE_MEMBER = 'UPDATE_MEMBER',
  DELETE_MEMBER = 'DELETE_MEMBER',
  ADD_CLASS = 'ADD_CLASS',
  UPDATE_CLASS = 'UPDATE_CLASS',
  DELETE_CLASS = 'DELETE_CLASS',
  ADD_MEMBERSHIP_PLAN = 'ADD_MEMBERSHIP_PLAN',
  UPDATE_MEMBERSHIP_PLAN = 'UPDATE_MEMBERSHIP_PLAN',
  DELETE_MEMBERSHIP_PLAN = 'DELETE_MEMBERSHIP_PLAN',
  ADD_TRAINER = 'ADD_TRAINER',
  UPDATE_TRAINER = 'UPDATE_TRAINER',
  DELETE_TRAINER = 'DELETE_TRAINER',
  ADD_ATTENDANCE = 'ADD_ATTENDANCE',
  UPDATE_ATTENDANCE = 'UPDATE_ATTENDANCE',
  DELETE_ATTENDANCE = 'DELETE_ATTENDANCE',
  IMPORT_DATA = 'IMPORT_DATA',
  RESET_ALL_DATA = 'RESET_ALL_DATA',
}

// Action interfaces
export interface SetDatasetAction {
  type: DatasetActionType.SET_DATASET;
  payload: Dataset;
}

export interface UpdateUserProfileAction {
  type: DatasetActionType.UPDATE_USER_PROFILE;
  payload: UserProfile;
}

export interface AddMemberAction {
  type: DatasetActionType.ADD_MEMBER;
  payload: Member;
}

export interface UpdateMemberAction {
  type: DatasetActionType.UPDATE_MEMBER;
  payload: Member;
}

export interface DeleteMemberAction {
  type: DatasetActionType.DELETE_MEMBER;
  payload: number;
}

export interface AddClassAction {
  type: DatasetActionType.ADD_CLASS;
  payload: FitnessClass;
}

export interface UpdateClassAction {
  type: DatasetActionType.UPDATE_CLASS;
  payload: FitnessClass;
}

export interface DeleteClassAction {
  type: DatasetActionType.DELETE_CLASS;
  payload: number;
}

export interface AddMembershipPlanAction {
  type: DatasetActionType.ADD_MEMBERSHIP_PLAN;
  payload: MembershipPlan;
}

export interface UpdateMembershipPlanAction {
  type: DatasetActionType.UPDATE_MEMBERSHIP_PLAN;
  payload: MembershipPlan;
}

export interface DeleteMembershipPlanAction {
  type: DatasetActionType.DELETE_MEMBERSHIP_PLAN;
  payload: number;
}

export interface AddTrainerAction {
  type: DatasetActionType.ADD_TRAINER;
  payload: Trainer;
}

export interface UpdateTrainerAction {
  type: DatasetActionType.UPDATE_TRAINER;
  payload: Trainer;
}

export interface DeleteTrainerAction {
  type: DatasetActionType.DELETE_TRAINER;
  payload: number;
}

export interface AddAttendanceAction {
  type: DatasetActionType.ADD_ATTENDANCE;
  payload: AttendanceRecord;
}

export interface UpdateAttendanceAction {
  type: DatasetActionType.UPDATE_ATTENDANCE;
  payload: AttendanceRecord;
}

export interface DeleteAttendanceAction {
  type: DatasetActionType.DELETE_ATTENDANCE;
  payload: number;
}

export interface ImportDataAction {
  type: DatasetActionType.IMPORT_DATA;
  payload: Dataset;
}

export interface ResetAllDataAction {
  type: DatasetActionType.RESET_ALL_DATA;
}

// Union type for all dataset actions
export type DatasetAction =
  | SetDatasetAction
  | UpdateUserProfileAction
  | AddMemberAction
  | UpdateMemberAction
  | DeleteMemberAction
  | AddClassAction
  | UpdateClassAction
  | DeleteClassAction
  | AddMembershipPlanAction
  | UpdateMembershipPlanAction
  | DeleteMembershipPlanAction
  | AddTrainerAction
  | UpdateTrainerAction
  | DeleteTrainerAction
  | AddAttendanceAction
  | UpdateAttendanceAction
  | DeleteAttendanceAction
  | ImportDataAction
  | ResetAllDataAction;

// Form input types
export interface FormInputProps {
  type: 'text' | 'email' | 'date' | 'select' | 'range';
  placeholder: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
}

// Component prop types
export interface MemberCardProps {
  member: Member;
}

export interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: number;
}

export interface SidebarItemProps {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ErrorModalProps {
  Error: string;
}

// Context types
export interface DatasetContextType {
  userProfile: UserProfile;
  members: Member[];
  classes: FitnessClass[];
  membershipPlans: MembershipPlan[];
  trainers: Trainer[];
  attendance: AttendanceRecord[];
}

export type DatasetDispatchContextType = React.Dispatch<DatasetAction>;

// HOC types
export interface WithAuthAndDatasetProps {
  [key: string]: unknown;
}

// Status and enum constants
export const MEMBER_STATUSES = ['Active', 'Expired', 'Trial', 'Suspended'] as const;
export type MemberStatus = typeof MEMBER_STATUSES[number];

export const GENDERS = ['Male', 'Female', 'Other'] as const;
export type Gender = typeof GENDERS[number];

export const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late'] as const;
export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number];

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

// Additional component prop types
export interface ClassCardProps {
  class: FitnessClass;
  trainer?: Trainer;
}

export interface TrainerCardProps {
  trainer: Trainer;
}

export interface MembershipPlanCardProps {
  plan: MembershipPlan;
}

// Analytics types
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiringMembers: number;
  totalClasses: number;
  totalTrainers: number;
  todayAttendance: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}