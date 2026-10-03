import { ROUTES, ROLES } from "@/constants";

/**
 * Normalises the assorted shapes a stored date arrives in (ISO string, Date, a
 * bare year like `Education.passingYear`) to a comparable timestamp. Returns
 * `null` when there is nothing usable to sort on.
 */
const toTime = (value?: string | number | Date | null): number | null => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    // A bare year means "the end of that year" — 2021 must not be read as an
    // epoch offset of 2021ms.
    return value >= 1000 && value <= 9999
      ? new Date(value, 11, 31).getTime()
      : value;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

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

  /**
   * Newest-first ordering — the app's single sort strategy for every dated
   * record (Experience, Education, Certifications, …), so no two screens
   * disagree about what "latest" means.
   *
   * Ongoing entries (a current job) lead the list, then the rest by date
   * descending. Records with no usable date sink to the bottom so a
   * half-filled entry never jumps to the top. Returns a new array.
   */
  sortByRecency<T>(
    items: T[],
    getDate: (item: T) => string | number | Date | null | undefined,
    options?: { isOngoing?: (item: T) => boolean },
  ): T[] {
    return [...items].sort((a, b) => {
      const aOngoing = options?.isOngoing?.(a) ?? false;
      const bOngoing = options?.isOngoing?.(b) ?? false;
      if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;

      const aTime = toTime(getDate(a));
      const bTime = toTime(getDate(b));
      if (aTime === null) return bTime === null ? 0 : 1;
      if (bTime === null) return -1;
      return bTime - aTime;
    });
  },

  /** "Mar 2025" — compact, locale-independent month label for timeline chips. */
  formatMonthYear(date?: string | Date | null): string {
    if (!date) return "";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  },

  /**
   * "Mar 2025 – Present" / "Jun 2022 – Nov 2023". Shared by Experience and
   * Education so every timeline chip in the app reads the same way.
   */
  formatDateRange(
    start?: string | Date | null,
    end?: string | Date | null,
    isOngoing = false,
  ): string {
    const from = HelperFunctions.formatMonthYear(start);
    const to = isOngoing ? "Present" : HelperFunctions.formatMonthYear(end);
    if (!from) return to || "";
    return to ? `${from} – ${to}` : from;
  },
};
