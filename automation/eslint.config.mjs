import recommendedIncremental from "eslint-config-agent/recommended-incremental";

export default [
  { ignores: ["playwright-report/**", "test-results/**", "downloads/**"] },
  ...recommendedIncremental,
];
