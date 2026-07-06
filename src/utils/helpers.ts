export const HelperFunctions = {
  // capitalize string 1st letter
  capitalizeString(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
