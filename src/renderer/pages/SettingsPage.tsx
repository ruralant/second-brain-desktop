import { useTheme, type ThemePreference } from '../providers/ThemeProvider';

const OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsPage() {
  const { preference, setPreference } = useTheme();

  return (
    <>
      <div className="page-header">
        <h1>Settings</h1>
      </div>
      <div className="page-body" style={{ padding: 20 }}>
        <div style={{ maxWidth: 400 }}>
          <label className="label" style={{ textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.5, marginBottom: 12 }}>
            Appearance
          </label>
          <div className="segmented-control">
            {OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`segment${preference === option.value ? ' active' : ''}`}
                onClick={() => setPreference(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
