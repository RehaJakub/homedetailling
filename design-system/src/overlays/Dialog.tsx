import type { ReactNode } from "react";
import { Eyebrow } from "../typography/Eyebrow";
import { Heading } from "../typography/Heading";

export type DialogProps = {
  /** Nothing renders while `false`. */
  open: boolean;
  /** Small blue label above the title. */
  eyebrow?: string;
  title: string;
  /** Body copy or extra content. */
  children?: ReactNode;
  /** One or two `Button`s; two are laid out side by side. */
  actions?: ReactNode;
  /** Number of action buttons, controls the split layout. */
  actionCount?: 1 | 2;
  /** Render inside the page flow instead of fixed over it (for previews and embedding). */
  inline?: boolean;
};

/**
 * Centered modal panel on a blurred dark backdrop. Used for confirmations and success messages.
 */
export function Dialog({ open, eyebrow, title, children, actions, actionCount = 1, inline = false }: DialogProps) {
  if (!open) return null;
  const titleId = `hd-dialog-${title.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className={inline ? "hd-dialog-backdrop hd-dialog-backdrop--inline" : "hd-dialog-backdrop"} role="presentation">
      <section className="hd-dialog" role="dialog" aria-modal={!inline} aria-labelledby={titleId}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading level={2} size="dialog" id={titleId} className="hd-dialog__title">
          {title}
        </Heading>
        {children && <div className="hd-dialog__body">{children}</div>}
        {actions && (
          <div className={actionCount === 2 ? "hd-dialog__actions hd-dialog__actions--split" : "hd-dialog__actions"}>
            {actions}
          </div>
        )}
      </section>
    </div>
  );
}
