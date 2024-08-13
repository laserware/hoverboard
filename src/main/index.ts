import {
  enableCustomMenuBuilder,
  type CustomMenuBuilderOptions,
} from "./customMenuBuilder.ts";
import { enableDefaultMenuBuilder } from "./defaultMenuBuilder.ts";

interface ConfigureContextMenusOptions extends CustomMenuBuilderOptions {
  /**
   * Add a default context menu with common clipboard operations and the
   * ability to inspect elements.
   */
  enableDefaultMenu: boolean;
}

/**
 * Adds a listener to build a custom context menu (see {@link enableCustomMenuBuilder})
 * and optionally a default context menu (see {@link enableDefaultMenu}) based
 * on the specified options.
 */
export function configureContextMenus(
  options: ConfigureContextMenusOptions,
): void {
  const {
    appendInspectElementToMenus,
    appendLinkHandlersToMenus,
    enableDefaultMenu,
  } = options;

  if (enableDefaultMenu) {
    enableDefaultMenuBuilder({ appendInspectElementToMenus });
  }

  enableCustomMenuBuilder({
    appendInspectElementToMenus,
    appendLinkHandlersToMenus,
  });
}
