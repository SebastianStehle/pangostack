import classNames from 'classnames';
import { ButtonHTMLAttributes } from 'react';

export interface CollapseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // The side of the button.
  side?: 'left' | 'right';

  // Indicates if the button is toggled.
  isToggled?: boolean;

  // The tooltip.
  tooltip?: string;
}

export const CollapseButton = (props: CollapseButtonProps) => {
  const { className, isToggled, side, tooltip, ...other } = props;

  const sharedClass = 'h-3 w-1 rounded-full bg-slate-200 transition-all group-hover/button:bg-black ease-in';

  return (
    <button
      className={classNames(className, 'group/button p-3')}
      {...other}
      data-tooltip-id="default"
      data-tooltip-content={tooltip}
      data-tooltip-place={side === 'left' ? 'right' : 'left'}
    >
      {side === 'left' ? (
        <div className="flex flex-col">
          <div
            className={classNames(
              sharedClass,
              { '-rotate-[20deg]': isToggled, 'group-hover/button:rotate-[20deg]': !isToggled },
              '-trnslate-y-0',
            )}
          ></div>
          <div
            className={classNames(
              sharedClass,
              { 'rotate-[20deg]': isToggled, 'group-hover/button:-rotate-[20deg]': !isToggled },
              '-translate-y-1',
            )}
          ></div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div
            className={classNames(
              sharedClass,
              { 'rotate-[20deg]': isToggled, 'group-hover/button:-rotate-[20deg]': !isToggled },
              '-trnslate-y-0',
            )}
          ></div>
          <div
            className={classNames(
              sharedClass,
              { '-rotate-[20deg]': isToggled, 'group-hover/button:rotate-[20deg]': !isToggled },
              '-translate-y-1',
            )}
          ></div>
        </div>
      )}
    </button>
  );
};
