"use client";
import { ThemeProvider } from "@emotion/react";
import { themeConsts } from "../shared/theme";

type Props = {
  children: React.ReactNode;
};

export const EmotionThemeProvider = ({ children }: Props) => {
  return <ThemeProvider theme={themeConsts}>{children}</ThemeProvider>;
};
