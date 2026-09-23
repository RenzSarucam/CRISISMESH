"use client";

import { useEffect } from "react";

/**
 * Radix portals (Sheet, Dialog, Select, DropdownMenu, Tooltip, ...) render
 * their content as a direct child of <body>, not inside whatever React tree
 * rendered them — so scoping a theme to a wrapper div (the `.cm-dark` class
 * on the dashboard/auth screens) never reaches them. This mirrors that scope
 * onto <body> itself for the lifetime of the screen that needs it, so every
 * portaled popover/dialog picks up the same theme tokens as the page around
 * it, and reverts when the screen unmounts.
 */
export function useBodyTheme(className: string) {
  useEffect(() => {
    const classes = className.split(" ").filter(Boolean);
    document.body.classList.add(...classes);
    return () => {
      document.body.classList.remove(...classes);
    };
  }, [className]);
}
