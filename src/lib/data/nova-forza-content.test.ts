import {
  defaultMarketingPlans,
  defaultMarketingScheduleRows,
  defaultMarketingTeamMembers,
} from "@/lib/data/marketing-content";

describe("novaForzaHomeContent", () => {
  it("keeps a featured membership and key public sections", () => {
    expect(defaultMarketingPlans.some((plan) => plan.is_featured)).toBe(true);
    expect(defaultMarketingScheduleRows).toHaveLength(3);
    expect(defaultMarketingTeamMembers).toHaveLength(3);
  });
});
