import { getInitialTrainingZone, getOrderedTrainingZones } from "@/data/training-zones";

describe("training zones data", () => {
  it("keeps a deterministic active zone", () => {
    const initialZone = getInitialTrainingZone();

    expect(initialZone.slug).toBe("peso-libre");
  });

  it("keeps training videos under the expected folder", () => {
    const zones = getOrderedTrainingZones();

    expect(zones).toHaveLength(5);
    expect(zones.every((zone) => zone.video.startsWith("/video/train/"))).toBe(true);
  });
});
