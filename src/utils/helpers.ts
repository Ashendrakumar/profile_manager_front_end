import { ROUTES, ROLES } from "@/constants";

export const HelperFunctions = {
  // capitalize string 1st letter
  capitalizeString(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Where to send a user immediately after they authenticate.
   * Admins land on the Dashboard; everyone else on their My Profile page.
   */
  getLandingRoute(role?: string | null): string {
    return role === ROLES.ADMIN ? ROUTES.HOME : ROUTES.PROFILE;
  },

  getInitials(name?: string | null): string {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  },

  formatRole(role?: string | null): string {
    if (!role) return "Guest";
    return role.charAt(0).toUpperCase() + role.slice(1);
  },
};
