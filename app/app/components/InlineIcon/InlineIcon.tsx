import React, { type ReactNode } from 'react';

export const InlineIcon = (props: { children: ReactNode }) => {
  return (
    <span
      style={{
        display: 'inline',
        verticalAlign: 'middle',
      }}
    >
      {props.children}
    </span>
  );
};
