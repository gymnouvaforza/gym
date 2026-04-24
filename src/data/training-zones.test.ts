import { getInitialTrainingZone, getOrderedTrainingZones } from "@/data/training-zones";

describe("training zones data", () => {
  it("keeps a deterministic active zone", () => {
    const initialZone = getInitialTrainingZone();

    expect(initialZone.slug).toBe("peso-libre");
  });

  it("keeps fallback seed shape aligned with Supabase fields", () => {
    const zones = getOrderedTrainingZones();

    expect(zones).toHaveLength(5);
    expect(zones.every((zone) => zone.video_url.startsWith("/video/train/"))).toBe(true);
    expect(zones.every((zone) => typeof zone.order_index === "number")).toBe(true);
  });
});
