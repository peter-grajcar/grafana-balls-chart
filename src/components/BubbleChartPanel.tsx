import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';
import { Bubble } from './Bubble';
import computeBubblePositions from 'bubbles';

interface Props extends PanelProps<SimpleOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
};

export const BubbleChartPanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  const colours = theme.visualization.palette.map((name) => theme.visualization.getColorByName(name));

  const frame = data.series[0];

  const textField = frame.fields.find((field) => field.type === 'string');
  const numberField = frame.fields.find((field) => field.type === 'number');

  const spacing = options.spacing ?? 0;
  const bubblePositions = computeBubblePositions(numberField?.values as number[], spacing);

  // Rescale positions to fit within the panel dimensions, accounting for bubble sizes and spacing
  const bubblesWidth = bubblePositions.x.max() - bubblePositions.x.min() + 2 * bubblePositions.r.max() + spacing;
  const bubblesHeight = bubblePositions.y.max() - bubblePositions.y.min() + 2 * bubblePositions.r.max() + spacing;
  const scaleFactor = Math.min(width / bubblesWidth, height / bubblesHeight);

  bubblePositions.x = bubblePositions.x.scale(scaleFactor);
  bubblePositions.y = bubblePositions.y.scale(scaleFactor);
  bubblePositions.r = bubblePositions.r.scale(scaleFactor);

  const bubbles = Array.from({ length: frame.length }, (_, i) => {
    const text = textField?.values[i] ?? '';
    const size = numberField?.values[i] ?? 0;
    const colour = colours[i % colours.length];

    const x = bubblePositions.x.get(i);
    const y = bubblePositions.y.get(i);
    const r = bubblePositions.r.get(i);

    return <Bubble key={i} text={text} colour={colour} value={size} radius={r} x={x} y={y} />;
  });

  return (
    <svg
      className={styles.svg}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
    >
      {bubbles}
    </svg>
  );
};
