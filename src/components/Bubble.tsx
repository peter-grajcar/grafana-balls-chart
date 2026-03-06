import React from 'react';
import { css } from '@emotion/css';
import { useTheme2, useStyles2, Tooltip } from '@grafana/ui';

interface Props {
  text: string;
  colour: string;
  value: number;
  radius: number;
  x: number;
  y: number;
}

export const Bubble: React.FC<Props> = ({ text, colour, value, radius, x, y }) => {
  const theme = useTheme2();

  const textColour = theme.colors.getContrastText(colour);
  const hoverColour = theme.colors.emphasize(colour, 0.2);

  const styles = useStyles2((theme) => ({
    circle: css`
      fill: ${colour};
      transition: fill 0.3s ease-in-out;
      cursor: pointer;

      &:hover {
        fill: ${hoverColour};
      }
    `,
    text: css`
      font-size: ${4 + (2 * radius) / (text.length + 1)}px;
      pointer-events: none;
    `,
  }));

  return (
    <Tooltip content={`${text}: ${value}`} placement="right">
      <g>
        <circle data-testid="simple-panel-circle" className={styles.circle} r={radius} cx={x} cy={y} />
        <text
          data-testid="simple-panel-text"
          x={x}
          y={y}
          textAnchor="middle"
          fill={textColour}
          dominantBaseline="middle"
          className={styles.text}
        >
          {text}
        </text>
      </g>
    </Tooltip>
  );
};
