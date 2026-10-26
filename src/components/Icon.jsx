const paths = {
  dashboard: "M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-12h8V3h-8v6Z",
  entries: "M4 5h16M4 12h16M4 19h10",
  categories: "M20.59 13.41 11 3.83V3H4v7h.83L14.41 19.59a2 2 0 0 0 2.82 0l3.36-3.36a2 2 0 0 0 0-2.82ZM7.5 7.5h.01",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0",
  plus: "M12 5v14M5 12h14",
  logout: "M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5",
  wallet: "M3 6h16a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V6Zm0 3h18M16 14h2",
  up: "M12 19V5m0 0-6 6m6-6 6 6",
  down: "M12 5v14m0 0 6-6m-6 6-6-6",
  edit: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z",
  trash: "M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5m4-5v5",
  close: "m6 6 12 12M18 6 6 18",
  menu: "M4 6h16M4 12h16M4 18h16",
  chevron: "m9 18 6-6-6-6",
};

export default function Icon({ name, size = 20, className = "" }) {
  const path = paths[name] || paths.dashboard;
  const fill = name === "dashboard" ? "currentColor" : "none";

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
