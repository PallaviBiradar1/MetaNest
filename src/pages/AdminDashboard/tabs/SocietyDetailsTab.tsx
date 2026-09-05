import { useEffect, useState } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BusinessIcon from '@mui/icons-material/Business';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getSociety, getSocietySummary } from '../../../services/apartmentMasterService';
import type { Society, SocietySummary } from '../../../types/apartmentMaster';

// TODO: Managing Committee and Bank Details have no backend fields yet
// (apartment_master.Society only models name/registration/address/contact).
// Keeping these as placeholders until the backend adds support.
const MOCK_COMMITTEE_ROWS = [
  { label: 'Chairman', value: 'Mr. Suresh Mehta' },
  { label: 'Secretary', value: 'Mrs. Priya Sharma' },
  { label: 'Treasurer', value: 'Mr. Vikram Nair' },
];

const MOCK_BANK_ROWS = [
  { label: 'Bank', value: 'HDFC Bank, Baner Branch' },
  { label: 'Account No.', value: '50200067281234' },
  { label: 'IFSC Code', value: 'HDFC001234' },
];

function SocietyDetailsTab() {
  const [society, setSociety] = useState<Society | null>(null);
  const [summary, setSummary] = useState<SocietySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const societyData = await getSociety();
        if (cancelled) return;

        if (!societyData) {
          setError('No society record found. Add one via the admin/API first.');
          return;
        }
        setSociety(societyData);

        const summaryData = await getSocietySummary(societyData.id);
        if (!cancelled) setSummary(summaryData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load society details.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sectionCardSx = {
    flex: 1,
    borderRadius: 3,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    p: 2.4,
    minHeight: 280,
    bgcolor: 'rgba(255,255,255,0.22)',
  };

  const renderRows = (rows: { label: string; value: string }[]) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) auto', rowGap: 2.2, columnGap: 2 }}>
      {rows.map((row) => (
        <Box key={row.label} sx={{ display: 'contents' }}>
          <Typography sx={{ color: '#697386', fontSize: '13.125px', fontWeight: 600, lineHeight: 1.5 }}>
            {row.label}
          </Typography>
          <Typography sx={{ color: '#2f3746', fontSize: '13.125px', fontWeight: 700, textAlign: 'right', lineHeight: 1.5 }}>
            {row.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography sx={{ color: 'error.main', fontWeight: 600 }}>
        {error}
      </Typography>
    );
  }

  if (!society) {
    return null;
  }

  const detailRows = [
    { label: 'Society Name', value: society.name },
    { label: 'Registration No.', value: society.registration_number },
    { label: 'Total Flats', value: String(summary?.total_flats ?? '—') },
    { label: 'Total Wings', value: String(summary?.total_wings ?? '—') },
  ];

  const contactRows = [
    {
      label: 'Address',
      value: [society.address_line1, society.address_line2].filter(Boolean).join(', '),
    },
    { label: 'State / PIN', value: `${society.state} — ${society.pincode}` },
    { label: 'Phone', value: society.contact_phone || '—' },
    { label: 'Email', value: society.contact_email || '—' },
  ];

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#2d3748', lineHeight: 1.15 }}>
        Society Details
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper variant="outlined" sx={sectionCardSx}>
          <Typography sx={{ fontSize: '16.8px', fontWeight: 800, mb: 2.2, display: 'flex', alignItems: 'center', gap: 1, color: '#2d3748' }}>
            <BusinessIcon sx={{ fontSize: 26, color: '#4f46e5' }} />
            Basic Information
          </Typography>
          {renderRows(detailRows)}
        </Paper>

        <Paper variant="outlined" sx={sectionCardSx}>
          <Typography sx={{ fontSize: '16.8px', fontWeight: 800, mb: 2.2, display: 'flex', alignItems: 'center', gap: 1, color: '#2d3748' }}>
            <ContactPhoneIcon sx={{ fontSize: 26, color: '#4f46e5' }} />
            Contact Information
          </Typography>
          {renderRows(contactRows)}
        </Paper>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper variant="outlined" sx={sectionCardSx}>
          <Typography sx={{ fontSize: '16.8px', fontWeight: 800, mb: 2.2, display: 'flex', alignItems: 'center', gap: 1, color: '#2d3748' }}>
            <PeopleAltIcon sx={{ fontSize: 26, color: '#4f46e5' }} />
            Managing Committee
          </Typography>
          {renderRows(MOCK_COMMITTEE_ROWS)}
        </Paper>

        <Paper variant="outlined" sx={sectionCardSx}>
          <Typography sx={{ fontSize: '16.8px', fontWeight: 800, mb: 2.2, display: 'flex', alignItems: 'center', gap: 1, color: '#2d3748' }}>
            <AccountBalanceIcon sx={{ fontSize: 26, color: '#4f46e5' }} />
            Bank Details
          </Typography>
          {renderRows(MOCK_BANK_ROWS)}
        </Paper>
      </Stack>
    </Stack>
  );
}

export default SocietyDetailsTab;