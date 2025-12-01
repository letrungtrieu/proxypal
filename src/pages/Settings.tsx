import { createSignal } from "solid-js";
import { Button, Switch } from "../components/ui";
import { appStore } from "../stores/app";
import { toastStore } from "../stores/toast";
import { saveConfig } from "../lib/tauri";

export function SettingsPage() {
  const { config, setConfig, setCurrentPage, authStatus } = appStore;
  const [saving, setSaving] = createSignal(false);

  const handleConfigChange = async (
    key: keyof ReturnType<typeof config>,
    value: boolean | number,
  ) => {
    const newConfig = { ...config(), [key]: value };
    setConfig(newConfig);

    // Auto-save config
    setSaving(true);
    try {
      await saveConfig(newConfig);
      toastStore.success("Settings saved");
    } catch (error) {
      console.error("Failed to save config:", error);
      toastStore.error("Failed to save settings", String(error));
    } finally {
      setSaving(false);
    }
  };

  const connectedCount = () => {
    const auth = authStatus();
    return [auth.claude, auth.openai, auth.gemini, auth.qwen].filter(Boolean)
      .length;
  };

  return (
    <div class="min-h-screen flex flex-col">
      {/* Header */}
      <header class="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage("dashboard")}
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <h1 class="font-bold text-lg text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          {saving() && (
            <span class="text-xs text-gray-400 ml-2 flex items-center gap-1">
              <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main class="flex-1 p-6 overflow-y-auto">
        <div class="max-w-xl mx-auto space-y-6 animate-stagger">
          {/* General settings */}
          <div class="space-y-4">
            <h2 class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              General
            </h2>

            <div class="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <Switch
                label="Launch at login"
                description="Start ProxyPal automatically when you log in"
                checked={config().launchAtLogin}
                onChange={(checked) =>
                  handleConfigChange("launchAtLogin", checked)
                }
              />

              <div class="border-t border-gray-200 dark:border-gray-700" />

              <Switch
                label="Auto-start proxy"
                description="Start the proxy server when ProxyPal launches"
                checked={config().autoStart}
                onChange={(checked) => handleConfigChange("autoStart", checked)}
              />
            </div>
          </div>

          {/* Proxy settings */}
          <div class="space-y-4">
            <h2 class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Proxy Configuration
            </h2>

            <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <label class="block">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Port
                </span>
                <input
                  type="number"
                  value={config().port}
                  onInput={(e) =>
                    handleConfigChange(
                      "port",
                      parseInt(e.currentTarget.value) || 8317,
                    )
                  }
                  class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth"
                  min="1024"
                  max="65535"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  The port where the proxy server will listen (default: 8317)
                </p>
              </label>
            </div>
          </div>

          {/* Accounts */}
          <div class="space-y-4">
            <h2 class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Connected Accounts
            </h2>

            <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {connectedCount()} of 4 providers connected
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Manage your AI provider connections
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage("dashboard")}
                >
                  Manage
                </Button>
              </div>
            </div>
          </div>

          {/* About */}
          <div class="space-y-4">
            <h2 class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              About
            </h2>

            <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-center">
              <div class="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-3">
                <span class="text-white text-2xl">⚡</span>
              </div>
              <h3 class="font-bold text-gray-900 dark:text-gray-100">
                ProxyPal
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Version 0.1.0
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Built with Tauri, SolidJS, and TailwindCSS
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
