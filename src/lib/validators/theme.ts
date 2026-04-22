import { z } from "zod";

export const themeConfigSchema = z.object({
  colors: z.object({
    primary: z.string().min(4),
    background: z.string().min(4),
  }).passthrough(),
  custom_css: z.string().optional().default(""),
}).passthrough();

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export const defaultThemeConfig: ThemeConfig = {
  colors: {
    primary: "#d71920",
    background: "#f5f5f0",
  },
  custom_css: ":root {\n  --brand-primary: #d71920;\n  --radius-base: 0px;\n}",
};
