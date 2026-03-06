import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { BubbleChartPanel } from './components/BubbleChartPanel';

export const plugin = new PanelPlugin<SimpleOptions>(BubbleChartPanel).setPanelOptions((builder) => {
  return builder.addSliderInput({
    path: 'spacing',
    name: 'Spacing',
    description: 'Spacing between bubbles',
    defaultValue: 0.1,
    settings: {
      min: 0,
      max: 1,
      step: 0.01,
    },
  });
});
