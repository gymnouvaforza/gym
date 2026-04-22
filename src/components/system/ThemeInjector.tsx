import type { ThemeConfig } from "@/lib/validators/theme";

interface ThemeInjectorProps {
  config: ThemeConfig;
}

export default function ThemeInjector({ config }: ThemeInjectorProps) {
  // Combinamos los colores basicos con la hoja de estilos manual
  const css = `
    :root {
      --brand-primary: ${config.colors.primary};
      --surface-background: ${config.colors.background};
    }
    ${config.custom_css || ""}
  `.trim();

  return (
    <style 
      id="dynamic-theme-engine" 
      dangerouslySetInnerHTML={{ __html: css }} 
    />
  );
}
