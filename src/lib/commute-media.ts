import type { CommuteType } from "./commute-types";

/** Local lifestyle photos per commute type (served from /public/commute) */
const v = "v2";

export const COMMUTE_IMAGES: Record<
  CommuteType,
  { src: string; alt: string }
> = {
  office: {
    src: `/commute/office.jpg?${v}`,
    alt: "City morning commute to office",
  },
  university: {
    src: `/commute/university.jpg?${v}`,
    alt: "University students together",
  },
  women: {
    src: `/commute/women.jpg?${v}`,
    alt: "Women professionals commuting",
  },
  society: {
    src: `/commute/society.jpg?${v}`,
    alt: "Residential society neighbourhood",
  },
  school: {
    src: `/commute/school.jpg?${v}`,
    alt: "School morning drop-off",
  },
  intercity: {
    src: `/commute/intercity.jpg?${v}`,
    alt: "Highway inter-city road trip",
  },
  airport: {
    src: `/commute/airport.jpg?${v}`,
    alt: "Airport departure",
  },
  event: {
    src: `/commute/event.jpg?${v}`,
    alt: "Stadium event crowd",
  },
};
