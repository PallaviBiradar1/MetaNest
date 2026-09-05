import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

type ReportTab = 'collection' | 'outstanding' | 'occupancy';

const trendData = [
  { month: 'Feb', value: 115000, outstanding: 55000 },
  { month: 'Mar', value: 136500, outstanding: 52000 },
  { month: 'Apr', value: 152000, outstanding: 41000 },
  { month: 'May', value: 162000, outstanding: 39000 },
  { month: 'Jun', value: 180000, outstanding: 36000 },
  { month: 'Jul', value: 214000, outstanding: 31000 },
];

const summaryData = [
  { label: 'Total Billed', value: '₹2,16,000', color: '#1f2a37' },
  { label: 'Collected', value: '₹1,45,000', color: '#16a34a' },
  { label: 'Outstanding', value: '₹71,000', color: '#ef4444' },
];

const outstandingRows = [
  { flat: 'A-002', resident: 'Sunita Verma', amount: 4500, lateFee: 0, total: 4500, status: 'Due' },
  { flat: 'A-003', resident: 'Deepak Malhotra', amount: 3500, lateFee: 500, total: 4000, status: '26d' },
  { flat: 'B-003', resident: 'Rajiv Kapoor', amount: 3500, lateFee: 500, total: 4000, status: '26d' },
  { flat: 'B-004', resident: 'Nisha Saxena', amount: 2500, lateFee: 0, total: 2500, status: 'Due' },
  { flat: 'C-003', resident: 'Rekha Menon', amount: 3500, lateFee: 1000, total: 4500, status: '56d' },
];

const wingSummary = [
  { wing: 'Wing A', occupied: 21, total: 24, pct: 88 },
  { wing: 'Wing B', occupied: 20, total: 24, pct: 83 },
  { wing: 'Wing C', occupied: 13, total: 16, pct: 81 },
  { wing: 'Overall', occupied: 54, total: 64, pct: 84 },
];

function ReportsTab() {
  const [tab, setTab] = useState<ReportTab>('collection');

  const maxValue = Math.max(...trendData.map((d) => d.value));
  const minValue = Math.min(...trendData.map((d) => d.outstanding));

  const chartPoints = trendData
    .map((point, index) => {
      const x = 70 + (index * 780) / (trendData.length - 1);
      const y = 170 - ((point.value - minValue) / (maxValue - minValue || 1)) * 120;
      return `${x},${y}`;
    })
    .join(' ');

  const outstandingPoints = trendData
    .map((point, index) => {
      const x = 70 + (index * 780) / (trendData.length - 1);
      const y = 170 - ((point.outstanding - minValue) / (maxValue - minValue || 1)) * 120;
      return `${x},${y}`;
    })
    .join(' ');

  const renderContent = () => {
    if (tab === 'outstanding') {
      return (
        <Paper sx={{ borderRadius: 3, border: '1px solid rgba(148,163,184,0.32)', boxShadow: 'none', bgcolor: '#f7f9fb', overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.5 }}>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#1f2a37', mb: 0.5 }}>Outstanding Report — July 2024</Typography>
            <Typography sx={{ fontSize: '0.96rem', fontWeight: 600, color: '#667085', mb: 2 }}>₹19,500 total pending</Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(148,163,184,0.05)' }}>
                  {['Flat', 'Resident', 'Amount', 'Late Fee', 'Total', 'Days Overdue'].map((cell) => (
                    <TableCell key={cell} sx={{ color: '#5d6676', fontWeight: 800, fontSize: '0.76rem', letterSpacing: '0.08em', textTransform: 'uppercase', py: 1.5 }}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {outstandingRows.map((row) => (
                  <TableRow key={row.flat} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2a37', py: 1.6 }}>{row.flat}</TableCell>
                    <TableCell sx={{ color: '#1f2a37', py: 1.6 }}>{row.resident}</TableCell>
                    <TableCell sx={{ color: '#1f2a37', py: 1.6 }}>₹{row.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ color: row.lateFee > 0 ? '#ef4444' : '#1f2a37', py: 1.6 }}>{row.lateFee > 0 ? `₹${row.lateFee}` : '—'}</TableCell>
                    <TableCell sx={{ color: '#1f2a37', py: 1.6 }}>₹{row.total.toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ py: 1.6 }}>
                      <Box sx={{ display: 'inline-flex', px: 1.1, py: 0.35, borderRadius: 1.3, bgcolor: row.status === 'Due' ? '#fef3c7' : '#fee2e2', color: row.status === 'Due' ? '#a16207' : '#b91c1c', fontWeight: 700, fontSize: '0.78rem' }}>
                        {row.status}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      );
    }

    if (tab === 'occupancy') {
      return (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
          <Paper sx={{ flex: 1.6, borderRadius: 3, border: '1px solid rgba(148,163,184,0.32)', boxShadow: 'none', bgcolor: '#f7f9fb', p: 2.2 }}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#1f2a37', mb: 2 }}>Occupancy by Wing</Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', height: 240, px: 1 }}>
              {['Wing A', 'Wing B', 'Wing C'].map((wing, index) => {
                const occupied = [24, 20, 13][index];
                const vacant = [0, 4, 3][index];
                const max = 24;
                return (
                  <Box key={wing} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'end', height: 180, gap: 0.5 }}>
                      <Box sx={{ width: 28, height: `${(occupied / max) * 140}px`, borderRadius: '8px 8px 0 0', bgcolor: '#4f46e5' }} />
                      <Box sx={{ width: 28, height: `${(vacant / max) * 140}px`, borderRadius: '8px 8px 0 0', bgcolor: '#e2e8f0' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', color: '#5d6676', fontWeight: 600 }}>{wing}</Typography>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#4f46e5' }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#4b5565' }}>Occupied</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#e2e8f0' }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#4b5565' }}>Vacant</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ flex: 1, borderRadius: 3, border: '1px solid rgba(148,163,184,0.32)', boxShadow: 'none', bgcolor: '#f7f9fb', p: 2.2 }}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#1f2a37', mb: 2 }}>Wing Summary</Typography>
            <Stack spacing={2}>
              {wingSummary.map((wing) => (
                <Box key={wing.wing}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.96rem', fontWeight: 600, color: '#1f2a37' }}>{wing.wing}</Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#5d6676' }}>{wing.occupied}/{wing.total} · {wing.pct}%</Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 8, bgcolor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                    <Box sx={{ width: `${wing.pct}%`, height: '100%', bgcolor: '#4f46e5', borderRadius: 999 }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      );
    }

    return (
      <Box>
        <Paper sx={{ borderRadius: 3, border: '1px solid rgba(148,163,184,0.32)', boxShadow: 'none', bgcolor: '#f7f9fb', p: 2.2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#1f2a37' }}>Collection Trend</Typography>
          </Box>

          <Box sx={{ height: 230, position: 'relative', px: 1 }}>
            <svg viewBox="0 0 860 220" width="100%" height="100%">
              {[0, 1, 2, 3].map((line) => (
                <line key={line} x1="60" x2="820" y1={25 + line * 40} y2={25 + line * 40} stroke="#dfe6ee" strokeDasharray="4 4" />
              ))}
              <polyline fill="none" stroke="#4f46e5" strokeWidth="3" points={chartPoints} strokeLinejoin="round" strokeLinecap="round" />
              <polyline fill="none" stroke="#d9a84d" strokeWidth="3" strokeDasharray="6 6" points={outstandingPoints} strokeLinejoin="round" strokeLinecap="round" />
              {trendData.map((point, index) => {
                const x = 70 + (index * 780) / (trendData.length - 1);
                const y = 170 - ((point.value - minValue) / (maxValue - minValue || 1)) * 120;
                const y2 = 170 - ((point.outstanding - minValue) / (maxValue - minValue || 1)) * 120;
                return (
                  <g key={point.month}>
                    <circle cx={x} cy={y} r="4" fill="#4f46e5" />
                    <circle cx={x} cy={y2} r="4" fill="#d9a84d" />
                    <text x={x} y="210" textAnchor="middle" fill="#667085" fontSize="12">{point.month}</text>
                  </g>
                );
              })}
            </svg>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4f46e5' }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#4b5565' }}>Collected</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#d9a84d' }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#4b5565' }}>Outstanding</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d2f38', lineHeight: 1.2 }}>
          Reports
        </Typography>

        <Button
          variant="contained"
          sx={{
            borderRadius: 2.5,
            px: 2.4,
            py: 1.1,
            background: '#f2f4fb',
            color: '#3d485d',
            boxShadow: 'none',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { background: '#e9edf8' },
          }}
        >
          Export
        </Button>
      </Box>

      <Box sx={{ display: 'inline-flex', p: 0.6, bgcolor: '#edf1f8', borderRadius: 3, mb: 2.5 }}>
        {['collection', 'outstanding', 'occupancy'].map((tabKey) => {
          const selected = tab === tabKey;
          return (
            <Button
              key={tabKey}
              onClick={() => setTab(tabKey as ReportTab)}
              variant={selected ? 'contained' : 'text'}
              sx={{
                minWidth: 130,
                borderRadius: 2.2,
                px: 1.8,
                py: 0.7,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.97rem',
                color: selected ? '#fff' : '#4b5565',
                bgcolor: selected ? '#4f46e5' : 'transparent',
                boxShadow: 'none',
                '&:hover': { bgcolor: selected ? '#4338ca' : 'rgba(79,70,229,0.04)' },
              }}
            >
              {tabKey === 'collection' ? 'Collection' : tabKey === 'outstanding' ? 'Outstanding' : 'Occupancy'}
            </Button>
          );
        })}
      </Box>

      {tab === 'collection' && (
        <Stack spacing={2.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 2 }}>
            {summaryData.map((item) => (
              <Paper key={item.label} sx={{ borderRadius: 3, border: '1px solid rgba(148,163,184,0.32)', boxShadow: 'none', bgcolor: '#f7f9fb', p: 2.2 }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: item.color, textAlign: 'center' }}>{item.value}</Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#485569', textAlign: 'center', mt: 0.5 }}>{item.label}</Typography>
              </Paper>
            ))}
          </Box>

          {renderContent()}
        </Stack>
      )}

      {tab !== 'collection' && <Box sx={{ mt: 0.5 }}>{renderContent()}</Box>}
    </Box>
  );
}

export default ReportsTab;
