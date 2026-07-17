import type { Dispatch, ReactNode } from "react";

import { ColorPresets } from "./ColorPresets";
import { LogoPicker } from "./LogoPicker";
import { ShapePicker } from "./ShapePicker";

import type { Settings, SettingsAction } from "../../state/settings";

interface Props {
  settings: Settings;
  dispatch: Dispatch<SettingsAction>;
}

export function SettingsContent({ settings, dispatch }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <Section label="цвет модулей">
        <ColorPresets
          value={settings.color}
          onChange={(color) => dispatch({ type: "color", color })}
        />
      </Section>
      <Section label="форма модулей">
        <ShapePicker
          value={settings.shape}
          onChange={(shape) => dispatch({ type: "shape", shape })}
        />
      </Section>
      <Section label="логотип в центре">
        <LogoPicker
          logo={settings.logo}
          onChange={(logo) => dispatch({ type: "logo", logo })}
        />
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-faint">
        {label}
      </h3>
      {children}
    </section>
  );
}
