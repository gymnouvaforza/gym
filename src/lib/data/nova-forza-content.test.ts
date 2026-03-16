import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";

describe("novaForzaHomeContent", () => {
  it("keeps a featured membership and key public sections", () => {
    expect(novaForzaHomeContent.plans.some((plan) => plan.featured)).toBe(true);
    expect(novaForzaHomeContent.operatingHours).toHaveLength(3);
    expect(novaForzaHomeContent.team).toHaveLength(3);
    expect(novaForzaHomeContent.featuredProducts).toHaveLength(4);
    expect(novaForzaHomeContent.testimonials).toHaveLength(3);
  });
});
