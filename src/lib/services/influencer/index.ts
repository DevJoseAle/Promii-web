// ═══════════════════════════════════════════════════════════════
// INFLUENCER SERVICES - INDEX
// ═══════════════════════════════════════════════════════════════
// Exportaciones centralizadas de todos los servicios de influencer

// Partnerships
export {
  requestPartnership,
  respondToPartnership,
  getMerchantPartnerships,
  getInfluencerPartnerships,
  cancelPartnershipRequest,
  hasApprovedPartnership,
  type Partnership,
  type PartnershipWithDetails,
  type PartnershipStatus,
  type CreatePartnershipRequest,
  type RespondPartnershipRequest,
} from "./influencer-partnerships.service";

// Assignments
export {
  assignInfluencerToPromii,
  deactivateAssignment,
  reactivateAssignment,
  deleteAssignment,
  getPromiiAssignments,
  getInfluencerAssignments,
  getMerchantAssignments,
  getAssignmentByReferralCode,
  isReferralCodeAvailable,
  type Assignment,
  type AssignmentWithDetails,
  type CommissionType,
  type DiscountType,
  type CreateAssignmentRequest,
} from "./influencer-assignments.service";

// Referral Tracking
export {
  trackReferralVisit,
  trackReferralConversion,
  getAssignmentVisits,
  getAssignmentStats,
  saveReferralCode,
  getReferralCode,
  clearReferralCode,
  type ReferralVisit,
} from "./referral-tracking.service";

// Stats
export {
  getInfluencerOverviewStats,
  getInfluencerAssignmentPerformance,
  getMerchantInfluencersStats,
  getPromiiInfluencerStats,
  type InfluencerOverviewStats,
  type MerchantInfluencerStats,
  type AssignmentPerformance,
} from "./influencer-stats.service";
