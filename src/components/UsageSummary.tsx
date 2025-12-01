import { createSignal, createEffect, onCleanup } from "solid-js";
import { appStore } from "../stores/app";

function formatUptime(startTime: number | null): string {
  if (!startTime) return "—";

  const now = Date.now();
  const diff = Math.floor((now - startTime) / 1000);

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  return `${days}d ${hours}h`;
}

export function UsageSummary() {
  const { proxyStatus, authStatus, proxyStartTime } = appStore;
  const [uptime, setUptime] = createSignal(formatUptime(proxyStartTime()));

  // Update uptime every second when proxy is running
  createEffect(() => {
    if (proxyStatus().running) {
      const interval = setInterval(() => {
        setUptime(formatUptime(proxyStartTime()));
      }, 1000);
      onCleanup(() => clearInterval(interval));
    } else {
      setUptime("—");
    }
  });

  const connectedCount = () => {
    const auth = authStatus();
    return [auth.claude, auth.openai, auth.gemini, auth.qwen].filter(Boolean)
      .length;
  };

  return (
    <div class="grid grid-cols-3 gap-3">
      {/* Proxy Status */}
      <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 mb-1">
          <div
            class={`w-2 h-2 rounded-full ${proxyStatus().running ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
          />
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Status
          </span>
        </div>
        <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {proxyStatus().running ? "Running" : "Stopped"}
        </p>
      </div>

      {/* Uptime */}
      <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 mb-1">
          <svg
            class="w-3 h-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Uptime
          </span>
        </div>
        <p class="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
          {uptime()}
        </p>
      </div>

      {/* Connected Providers */}
      <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 mb-1">
          <svg
            class="w-3 h-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Providers
          </span>
        </div>
        <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {connectedCount()}
          <span class="text-sm font-normal text-gray-500"> / 4</span>
        </p>
      </div>
    </div>
  );
}
