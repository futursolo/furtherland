import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  ChartsTooltipContainer,
  ChartsTooltipPaper,
  useAxesTooltip,
} from '@mui/x-charts/ChartsTooltip';
import { match } from 'ts-pattern';

import RadarChart from '@@post-components/shared/RadarChart';

export function CustomItemTooltip() {
  const tooltipData = useAxesTooltip<'radar'>();
  if (!tooltipData) {
    return null;
  }

  const axesLabel = tooltipData[0].axisValue.toString() as 'Wi-Fi' | 'ROCm' | 'OS' | 'ZFS';

  const axesRequires = match(axesLabel)
    .with('OS', () => 'Supplied Default Kernel or Latest Kernel')
    .with('Wi-Fi', () => 'Kernel > 6.12')
    .with('ROCm', () => 'Kernel > 6.18')
    .with('ZFS', () => 'Supported Kernel Version')
    .exhaustive();
  const axesConflicts = match(axesLabel)
    .with('OS', () => 'Unsupported Kernel Versions')
    .with('Wi-Fi', () => 'Default Debian kernel')
    .with('ROCm', () => 'LTS Kernels')
    .with('ZFS', () => 'Latest Kernel')
    .exhaustive();

  return (
    <ChartsTooltipContainer>
      <ChartsTooltipPaper sx={{ padding: '0.7rem' }}>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              backgroundColor: 'green',
            }}
          />
          <Typography sx={{ ml: 2 }}>Requires</Typography>
        </Stack>
        <Typography variant="body2">{axesRequires}</Typography>
        <br />
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              backgroundColor: 'red',
            }}
          />
          <Typography sx={{ ml: 2 }}>Conflicts</Typography>
        </Stack>
        <Typography variant="body2">{axesConflicts}</Typography>
      </ChartsTooltipPaper>
    </ChartsTooltipContainer>
  );
}

const Triangle = () => {
  return (
    <RadarChart
      slots={{ tooltip: CustomItemTooltip }}
      height={300}
      shape="circular"
      series={[
        { label: 'NixOS + ZFS + ROCm', data: [50, 70, 100, 0], fillArea: true },
        { label: 'Debian + ZFS + Wi-Fi', data: [30, 60, 0, 100], fillArea: true },
      ]}
      radar={{
        max: 120,
        metrics: ['ZFS', 'OS', 'ROCm', 'Wi-Fi'],
      }}
    />
  );
};

export default Triangle;
