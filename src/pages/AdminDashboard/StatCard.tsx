import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
  footerIcon?: ReactNode;
  footerText: string;
  footerColor?: string;
}

function StatCard({ label, value, valueColor, footerIcon, footerText, footerColor }: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        borderColor: 'rgba(148, 163, 184, 0.35)',
        flex: 1,
        minWidth: 0,
      }}
    >
      <Stack spacing={1.25}>
        <Typography sx={{ fontSize: '11.25px', color: 'text.secondary' }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: valueColor ?? 'text.primary' }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {footerIcon}
          <Typography variant="caption" sx={{ fontWeight: 600, color: footerColor ?? 'text.secondary' }}>
            {footerText}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default StatCard;