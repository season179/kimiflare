export type ColorName = string;

export interface DimColor {
  color: ColorName;
  dim: boolean;
}

export interface Theme {
  name: string;
  label: string;
  user: ColorName;
  assistant: ColorName | undefined;
  reasoning: DimColor;
  info: DimColor;
  error: ColorName;
  warn: ColorName;
  tool: ColorName;
  spinner: ColorName;
  permission: ColorName;
  queue: DimColor;
  accent: ColorName;
  modeBadge: { plan: ColorName; auto: ColorName; edit: ColorName };
}

const dark: Theme = {
  name: "dark",
  label: "dark (default — for dark terminals)",
  user: "cyan",
  assistant: undefined,
  reasoning: { color: "gray", dim: true },
  info: { color: "gray", dim: true },
  error: "red",
  warn: "yellow",
  tool: "cyan",
  spinner: "yellow",
  permission: "yellow",
  queue: { color: "gray", dim: true },
  accent: "cyan",
  modeBadge: { plan: "blue", auto: "green", edit: "cyan" },
};

const light: Theme = {
  name: "light",
  label: "light (for bright terminal backgrounds)",
  user: "blue",
  assistant: undefined,
  reasoning: { color: "blackBright", dim: false },
  info: { color: "blackBright", dim: false },
  error: "red",
  warn: "magenta",
  tool: "magenta",
  spinner: "blue",
  permission: "magenta",
  queue: { color: "blackBright", dim: false },
  accent: "blue",
  modeBadge: { plan: "blue", auto: "green", edit: "magenta" },
};

const highContrast: Theme = {
  name: "high-contrast",
  label: "high-contrast (bold, bright colors for low-vision)",
  user: "cyanBright",
  assistant: "whiteBright",
  reasoning: { color: "whiteBright", dim: false },
  info: { color: "whiteBright", dim: false },
  error: "redBright",
  warn: "yellowBright",
  tool: "magentaBright",
  spinner: "yellowBright",
  permission: "yellowBright",
  queue: { color: "whiteBright", dim: false },
  accent: "cyanBright",
  modeBadge: { plan: "blueBright", auto: "greenBright", edit: "cyanBright" },
};

const dracula: Theme = {
  name: "dracula",
  label: "dracula (purple & cyan, popular dark)",
  user: "cyanBright",
  assistant: undefined,
  reasoning: { color: "magenta", dim: true },
  info: { color: "gray", dim: true },
  error: "redBright",
  warn: "yellowBright",
  tool: "magentaBright",
  spinner: "cyanBright",
  permission: "yellowBright",
  queue: { color: "gray", dim: true },
  accent: "magentaBright",
  modeBadge: { plan: "blueBright", auto: "greenBright", edit: "magentaBright" },
};

const nord: Theme = {
  name: "nord",
  label: "nord (arctic blue & frost, calm dark)",
  user: "cyan",
  assistant: undefined,
  reasoning: { color: "blue", dim: true },
  info: { color: "blue", dim: true },
  error: "red",
  warn: "yellow",
  tool: "cyan",
  spinner: "cyan",
  permission: "yellow",
  queue: { color: "blue", dim: true },
  accent: "cyan",
  modeBadge: { plan: "blue", auto: "green", edit: "cyan" },
};

const oneDark: Theme = {
  name: "one-dark",
  label: "one-dark (Atom's classic dark)",
  user: "cyan",
  assistant: undefined,
  reasoning: { color: "gray", dim: true },
  info: { color: "gray", dim: true },
  error: "red",
  warn: "yellow",
  tool: "blue",
  spinner: "cyan",
  permission: "yellow",
  queue: { color: "gray", dim: true },
  accent: "blue",
  modeBadge: { plan: "blue", auto: "green", edit: "cyan" },
};

const monokai: Theme = {
  name: "monokai",
  label: "monokai (vibrant magenta & yellow)",
  user: "magentaBright",
  assistant: undefined,
  reasoning: { color: "gray", dim: true },
  info: { color: "gray", dim: true },
  error: "redBright",
  warn: "yellowBright",
  tool: "cyanBright",
  spinner: "yellowBright",
  permission: "yellowBright",
  queue: { color: "gray", dim: true },
  accent: "magentaBright",
  modeBadge: { plan: "blueBright", auto: "greenBright", edit: "magentaBright" },
};

const solarizedDark: Theme = {
  name: "solarized-dark",
  label: "solarized-dark (muted blue & yellow)",
  user: "cyan",
  assistant: undefined,
  reasoning: { color: "blue", dim: true },
  info: { color: "blue", dim: true },
  error: "red",
  warn: "yellow",
  tool: "cyan",
  spinner: "yellow",
  permission: "yellow",
  queue: { color: "blue", dim: true },
  accent: "cyan",
  modeBadge: { plan: "blue", auto: "green", edit: "cyan" },
};

const solarizedLight: Theme = {
  name: "solarized-light",
  label: "solarized-light (light beige & cyan)",
  user: "blue",
  assistant: undefined,
  reasoning: { color: "cyan", dim: false },
  info: { color: "cyan", dim: false },
  error: "red",
  warn: "yellow",
  tool: "blue",
  spinner: "blue",
  permission: "yellow",
  queue: { color: "cyan", dim: false },
  accent: "blue",
  modeBadge: { plan: "blue", auto: "green", edit: "blue" },
};

const tokyoNight: Theme = {
  name: "tokyo-night",
  label: "tokyo-night (deep blue & purple)",
  user: "cyanBright",
  assistant: undefined,
  reasoning: { color: "blue", dim: true },
  info: { color: "blue", dim: true },
  error: "redBright",
  warn: "yellow",
  tool: "magentaBright",
  spinner: "cyanBright",
  permission: "yellow",
  queue: { color: "blue", dim: true },
  accent: "magentaBright",
  modeBadge: { plan: "blueBright", auto: "greenBright", edit: "magentaBright" },
};

const gruvboxDark: Theme = {
  name: "gruvbox-dark",
  label: "gruvbox-dark (warm retro dark)",
  user: "yellow",
  assistant: undefined,
  reasoning: { color: "gray", dim: true },
  info: { color: "gray", dim: true },
  error: "red",
  warn: "yellowBright",
  tool: "cyan",
  spinner: "yellow",
  permission: "yellowBright",
  queue: { color: "gray", dim: true },
  accent: "yellow",
  modeBadge: { plan: "blue", auto: "green", edit: "yellow" },
};

const gruvboxLight: Theme = {
  name: "gruvbox-light",
  label: "gruvbox-light (warm retro light)",
  user: "blue",
  assistant: undefined,
  reasoning: { color: "blackBright", dim: false },
  info: { color: "blackBright", dim: false },
  error: "red",
  warn: "yellow",
  tool: "cyan",
  spinner: "blue",
  permission: "yellow",
  queue: { color: "blackBright", dim: false },
  accent: "blue",
  modeBadge: { plan: "blue", auto: "green", edit: "blue" },
};

const catppuccinMocha: Theme = {
  name: "catppuccin-mocha",
  label: "catppuccin-mocha (pastel pink & lavender)",
  user: "magentaBright",
  assistant: undefined,
  reasoning: { color: "gray", dim: true },
  info: { color: "gray", dim: true },
  error: "redBright",
  warn: "yellow",
  tool: "cyanBright",
  spinner: "cyanBright",
  permission: "yellow",
  queue: { color: "gray", dim: true },
  accent: "magentaBright",
  modeBadge: { plan: "blueBright", auto: "greenBright", edit: "magentaBright" },
};

const rosePine: Theme = {
  name: "rose-pine",
  label: "rose-pine (soft rose & foam)",
  user: "magenta",
  assistant: undefined,
  reasoning: { color: "gray", dim: true },
  info: { color: "gray", dim: true },
  error: "red",
  warn: "yellow",
  tool: "cyan",
  spinner: "magenta",
  permission: "yellow",
  queue: { color: "gray", dim: true },
  accent: "magenta",
  modeBadge: { plan: "blue", auto: "green", edit: "magenta" },
};

export const THEMES: Record<string, Theme> = {
  dark,
  light,
  "high-contrast": highContrast,
  dracula,
  nord,
  "one-dark": oneDark,
  monokai,
  "solarized-dark": solarizedDark,
  "solarized-light": solarizedLight,
  "tokyo-night": tokyoNight,
  "gruvbox-dark": gruvboxDark,
  "gruvbox-light": gruvboxLight,
  "catppuccin-mocha": catppuccinMocha,
  "rose-pine": rosePine,
};

export const DEFAULT_THEME_NAME = "dark";

export function resolveTheme(name: string | undefined): Theme {
  if (!name) return THEMES[DEFAULT_THEME_NAME]!;
  return THEMES[name] ?? THEMES[DEFAULT_THEME_NAME]!;
}

export function themeNames(): string[] {
  return Object.keys(THEMES);
}

export function themeList(): Theme[] {
  return Object.values(THEMES);
}
