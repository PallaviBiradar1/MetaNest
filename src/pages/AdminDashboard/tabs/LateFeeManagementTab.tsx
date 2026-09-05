import { useEffect, useMemo, useState } from 'react';
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
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { listLateFeeHistory, type LateFeeHistory } from '../../../services/financeService';

function LateFeeManagementTab() {
  const [tab, setTab] = useState<'rules' | 'history'>('rules');
  const [history, setHistory] = useState<LateFeeHistory[]>([]);

  useEffect(() => {
    listLateFeeHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  const rows = useMemo(() => history, [history]);

  return (
    <Stack spacing={2.5} sx={{ minHeight: 560 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mt: 0.5 }}>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d2f38', lineHeight: 1.2 }}>
          Late Fee Management
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.25, width: 'fit-content', p: 0.4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(15, 23, 42, 0.04)' }}>
        <Button
          onClick={() => setTab('rules')}
          variant={tab === 'rules' ? 'contained' : 'text'}
          sx={{
            minWidth: 120,
            borderRadius: 2.5,
            textTransform: 'none',
            fontSize: '1.05rem',
            fontWeight: 700,
            px: 2.5,
            py: 1,
            bgcolor: tab === 'rules' ? '#4f46e5' : 'transparent',
            color: tab === 'rules' ? '#fff' : '#5e6473',
            boxShadow: tab === 'rules' ? 'none' : 'none',
            '&:hover': { bgcolor: tab === 'rules' ? '#4338ca' : 'rgba(79,70,229,0.06)' },
          }}
        >
          Fee Rules
        </Button>
        <Button
          onClick={() => setTab('history')}
          variant={tab === 'history' ? 'contained' : 'text'}
          sx={{
            minWidth: 120,
            borderRadius: 2.5,
            textTransform: 'none',
            fontSize: '1.05rem',
            fontWeight: 700,
            px: 2.5,
            py: 1,
            bgcolor: tab === 'history' ? '#4f46e5' : 'transparent',
            color: tab === 'history' ? '#fff' : '#5e6473',
            '&:hover': { bgcolor: tab === 'history' ? '#4338ca' : 'rgba(79,70,229,0.06)' },
          }}
        >
          History
        </Button>
      </Box>

      {tab === 'rules' ? (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
          <Paper sx={{ flex: 1, borderRadius: 3, border: '1px solid rgba(148, 163, 184, 0.32)', boxShadow: 'none', bgcolor: '#f7f9fb', p: 3, minHeight: 300 }}>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#1f2a37', mb: 2.5 }}>Current Rules</Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 2.2, columnGap: 3, pr: 1 }}>
              <Typography sx={{ fontSize: '1.06rem', color: '#5f6878', fontWeight: 500 }}>Grace Period</Typography>
              <Typography sx={{ fontSize: '1.06rem', fontWeight: 700, color: '#1f2a37', textAlign: 'right' }}>5 days</Typography>

              <Typography sx={{ fontSize: '1.06rem', color: '#5f6878', fontWeight: 500 }}>Late Fee Per Day</Typography>
              <Typography sx={{ fontSize: '1.06rem', fontWeight: 700, color: '#1f2a37', textAlign: 'right' }}>₹10</Typography>

              <Typography sx={{ fontSize: '1.06rem', color: '#5f6878', fontWeight: 500 }}>Maximum Late Fee</Typography>
              <Typography sx={{ fontSize: '1.06rem', fontWeight: 700, color: '#1f2a37', textAlign: 'right' }}>₹1,000</Typography>

              <Typography sx={{ fontSize: '1.06rem', color: '#5f6878', fontWeight: 500 }}>Applies From</Typography>
              <Typography sx={{ fontSize: '1.06rem', fontWeight: 700, color: '#1f2a37', textAlign: 'right' }}>Day 6 after due date</Typography>
            </Box>

            <Box sx={{ mt: 3.5 }}>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 2.4,
                  py: 1.15,
                  bgcolor: '#4f46e5',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.02rem',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#4338ca' },
                }}
              >
                Edit Rules
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ width: { xs: '100%', md: 430 }, borderRadius: 3, border: '1px solid rgba(210, 145, 74, 0.45)', boxShadow: 'none', bgcolor: '#fdf7f0', p: 3, minHeight: 300 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.2 }}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 28, color: '#c97a2f' }} />
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#b8752c' }}>How It Works</Typography>
            </Box>

            <Box component="ul" sx={{ m: 0, pl: 3.2, color: '#a8672f', display: 'grid', gap: 1.4 }}>
              <Box component="li" sx={{ fontSize: '1.02rem', lineHeight: 1.5, color: '#b36d2f' }}>Bills due on the 5th of each month</Box>
              <Box component="li" sx={{ fontSize: '1.02rem', lineHeight: 1.5, color: '#b36d2f' }}>5-day grace period (no fee until day 11)</Box>
              <Box component="li" sx={{ fontSize: '1.02rem', lineHeight: 1.5, color: '#b36d2f' }}>₹10/day charged after grace period</Box>
              <Box component="li" sx={{ fontSize: '1.02rem', lineHeight: 1.5, color: '#b36d2f' }}>Maximum late fee: ₹1,000 per cycle</Box>
              <Box component="li" sx={{ fontSize: '1.02rem', lineHeight: 1.5, color: '#b36d2f' }}>Waivers can be applied case-by-case</Box>
            </Box>
          </Paper>
        </Stack>
      ) : (
        <Paper sx={{ borderRadius: 3, border: '1px solid rgba(148, 163, 184, 0.32)', boxShadow: 'none', bgcolor: '#f7f9fb', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(148, 163, 184, 0.08)' }}>
                  <TableCell sx={{ fontSize: '0.77rem', fontWeight: 800, color: '#5d6676', letterSpacing: '0.08em', textTransform: 'uppercase', py: 1.7 }}>Bill</TableCell>
                  <TableCell sx={{ fontSize: '0.77rem', fontWeight: 800, color: '#5d6676', letterSpacing: '0.08em', textTransform: 'uppercase', py: 1.7 }}>Status</TableCell>
                  <TableCell sx={{ fontSize: '0.77rem', fontWeight: 800, color: '#5d6676', letterSpacing: '0.08em', textTransform: 'uppercase', py: 1.7 }}>Created</TableCell>
                  <TableCell sx={{ fontSize: '0.77rem', fontWeight: 800, color: '#5d6676', letterSpacing: '0.08em', textTransform: 'uppercase', py: 1.7 }}>Principal</TableCell>
                  <TableCell sx={{ fontSize: '0.77rem', fontWeight: 800, color: '#5d6676', letterSpacing: '0.08em', textTransform: 'uppercase', py: 1.7 }}>Late Fee</TableCell>
                  <TableCell sx={{ fontSize: '0.77rem', fontWeight: 800, color: '#5d6676', letterSpacing: '0.08em', textTransform: 'uppercase', py: 1.7 }}>Waived</TableCell>
                  <TableCell sx={{ fontSize: '0.77rem', fontWeight: 800, color: '#5d6676', letterSpacing: '0.08em', textTransform: 'uppercase', py: 1.7 }}>Total</TableCell>
                  <TableCell sx={{ fontSize: '0.77rem', fontWeight: 800, color: '#5d6676', letterSpacing: '0.08em', textTransform: 'uppercase', py: 1.7, textAlign: 'right' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontSize: '1rem', color: '#1f2a37', py: 2.1 }}>{row.bill}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', color: '#1f2a37', py: 2.1 }}>{row.waived_at ? 'Waived' : 'Applied'}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', color: '#1f2a37', py: 2.1 }}>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', color: '#1f2a37', py: 2.1 }}>₹{Number(row.principal_amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', color: '#ef4444', fontWeight: 600, py: 2.1 }}>₹{Number(row.late_fee_amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', color: Number(row.waived_amount) > 0 ? '#16a34a' : '#64748b', py: 2.1, fontWeight: 600 }}>
                      {Number(row.waived_amount) > 0 ? `₹${Number(row.waived_amount).toLocaleString('en-IN')}` : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '1rem', color: '#1f2a37', py: 2.1 }}>₹{Number(row.total_amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell align="right" sx={{ py: 2.1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          borderColor: '#dfe6f2',
                          color: '#4b5563',
                          textTransform: 'none',
                          fontWeight: 700,
                          px: 1.8,
                          minWidth: 0,
                          '&:hover': { borderColor: '#c8d3e2', bgcolor: 'rgba(148,163,184,0.04)' },
                        }}
                      >
                        Waive
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Stack>
  );
}

export default LateFeeManagementTab;
