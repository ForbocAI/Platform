import { ForbocBrandMark } from "./ForbocBrandMark";
import { SettingsMenu } from "./SettingsMenu";

export function AppHeader() {
  return (
    <header className="w-full flex items-center justify-between shrink-0 p-2 sm:p-3 border-b border-palette-border">
      <ForbocBrandMark />
      <SettingsMenu />
    </header>
  );
}
