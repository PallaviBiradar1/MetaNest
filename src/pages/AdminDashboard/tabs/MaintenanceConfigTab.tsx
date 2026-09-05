import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {
  getMaintenanceConfiguration,
  updateMaintenanceConfiguration,
  type MaintenanceConfiguration,
} from '../../../services/financeService';

const EMPTY_CONFIGURATION: MaintenanceConfiguration = {
  base_charge: 0,
  per_sqft_charge: 0,
  water_charge: 0,
  parking_charge: 0,
  sinking_fund: 0,
  other_charge: 0,
  due_day: 1,
  grace_period_days: 0,
  late_fee_per_day: 0,
  maximum_late_fee: 0,
};

function numberValue(value: string | number): number {
  return Number(value) || 0;
}

function MaintenanceConfigTab() {
  const [configuration, setConfiguration] = useState<MaintenanceConfiguration>(EMPTY_CONFIGURATION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getMaintenanceConfiguration()
      .then(setConfiguration)
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load maintenance configuration.'))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field: keyof MaintenanceConfiguration, value: string) => {
    setConfiguration((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      setConfiguration(await updateMaintenanceConfiguration(configuration));
      setMessage('Maintenance configuration saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save maintenance configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Stack sx={{ alignItems: 'center', py: 8 }}><CircularProgress size={28} /></Stack>;

  return (
    <Stack spacing={2}>
      <Typography sx={{ fontSize: '1.4rem', fontWeight: 800 }}>Maintenance Configuration</Typography>
      {message ? <Alert severity={message.includes('Unable') ? 'error' : 'success'}>{message}</Alert> : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper variant="outlined" sx={{ flex: 1, borderRadius: 3, p: 2.5 }}>
          <Typography sx={{ fontWeight: 800, mb: 1.25 }}>Monthly Charges</Typography>
          <Stack spacing={1.25}>
            <TextField label="Base Charge (₹)" value={configuration.base_charge} onChange={(event) => updateField('base_charge', event.target.value)} />
            <TextField label="Per Sq.Ft (₹)" value={configuration.per_sqft_charge} onChange={(event) => updateField('per_sqft_charge', event.target.value)} />
            <TextField label="Water (₹)" value={configuration.water_charge} onChange={(event) => updateField('water_charge', event.target.value)} />
            <TextField label="Parking (₹)" value={configuration.parking_charge} onChange={(event) => updateField('parking_charge', event.target.value)} />
            <TextField label="Sinking Fund (₹)" value={configuration.sinking_fund} onChange={(event) => updateField('sinking_fund', event.target.value)} />
            <TextField label="Other (₹)" value={configuration.other_charge} onChange={(event) => updateField('other_charge', event.target.value)} />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ width: 420, borderRadius: 3, p: 2.5 }}>
          <Typography sx={{ fontWeight: 800, mb: 1.25 }}>Due Date & Late Fee</Typography>
          <Stack spacing={1.25}>
            <TextField label="Due Day of Month" value={configuration.due_day} onChange={(event) => updateField('due_day', event.target.value)} />
            <TextField label="Grace Period (Days)" value={configuration.grace_period_days} onChange={(event) => updateField('grace_period_days', event.target.value)} />
            <TextField label="Late Fee/Day (₹)" value={configuration.late_fee_per_day} onChange={(event) => updateField('late_fee_per_day', event.target.value)} />
            <TextField label="Max Late Fee (₹)" value={configuration.maximum_late_fee} onChange={(event) => updateField('maximum_late_fee', event.target.value)} />
          </Stack>

          <Box sx={{ mt: 2.5, p: 1.5, bgcolor: 'rgba(79,70,229,0.06)', borderRadius: 2 }}>
            <Typography sx={{ fontWeight: 700, color: '#4f46e5' }}>Sample Bill — 2BHK (1050 sq.ft) + Parking</Typography>
            <Typography sx={{ mt: 1 }}>Base ₹{numberValue(configuration.base_charge).toLocaleString('en-IN')}</Typography>
            <Typography>Area (1050×{numberValue(configuration.per_sqft_charge)}) ₹{(1050 * numberValue(configuration.per_sqft_charge)).toLocaleString('en-IN')}</Typography>
            <Typography>Water ₹{numberValue(configuration.water_charge).toLocaleString('en-IN')}</Typography>
            <Typography>Parking ₹{numberValue(configuration.parking_charge).toLocaleString('en-IN')}</Typography>
            <Typography>Sinking ₹{numberValue(configuration.sinking_fund).toLocaleString('en-IN')}</Typography>
            <Typography sx={{ fontWeight: 800, mt: 1 }}>Total ₹{(numberValue(configuration.base_charge) + 1050 * numberValue(configuration.per_sqft_charge) + numberValue(configuration.water_charge) + numberValue(configuration.parking_charge) + numberValue(configuration.sinking_fund) + numberValue(configuration.other_charge)).toLocaleString('en-IN')}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" onClick={save} disabled={saving} sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}>{saving ? 'Saving...' : 'Save'}</Button>
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}

export default MaintenanceConfigTab;
