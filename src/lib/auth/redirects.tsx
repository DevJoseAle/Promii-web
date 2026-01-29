export type Role = "user" | "merchant" | "influencer" | "admin";

export function redirectForRole(role: Role | null | undefined) {
  switch (role) {
    case "merchant":
      return "/merchant";
    case "influencer":
      return "/influencer";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
