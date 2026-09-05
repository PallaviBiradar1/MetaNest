import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  getBankSettings,
  getBillingSettings,
  getNotificationSettings,
  getSocietySettings,
  updateBankSettings,
  updateBillingSettings,
  updateNotificationSettings,
  updateSocietySettings,
  type BankSettings,
  type BillingSettings,
  type NotificationSettings,
  type SocietySettings,
} from '../../../services/adminSettingsService';

type SettingsTabKey = 'society' | 'bank' | 'billing' | 'notifications';
type NotificationKey = Exclude<keyof NotificationSettings, 'id'>;

const TAB_ITEMS: { key: SettingsTabKey; label: string }[] = [
  { key: 'society', label: 'Society Info' },
  { key: 'bank', label: 'Bank Account' },
  { key: 'billing', label: 'Billing' },
  { key: 'notifications', label: 'Notifications' },
];

const societyFields = [
  { key: 'name', label: 'Society Name' },
  { key: 'registration_no', label: 'Registration No.' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'pin_code', label: 'PIN' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
];

const bankFields = [
  { key: 'bank_name', label: 'Bank Name' },
  { key: 'account_number', label: 'Account Number' },
  { key: 'ifsc_code', label: 'IFSC Code' },
  { key: 'account_type', label: 'Account Type' },
];

const billingFields = [
  { key: 'receipt_prefix', label: 'Receipt Prefix' },
  { key: 'starting_no', label: 'Starting No.' },
  { key: 'bill_prefix', label: 'Bill Prefix' },
  { key: 'financial_year', label: 'Financial Year' },
];

const notificationRows: Array<{ key: NotificationKey; label: string; value: boolean }> = [
  { key: 'sms_notifications', label: 'SMS Notifications', value: true },
  { key: 'email_notifications', label: 'Email Notifications', value: true },
  { key: 'whatsapp_notifications', label: 'WhatsApp Notifications', value: false },
  { key: 'payment_reminders', label: 'Payment Reminders', value: true },
  { key: 'overdue_alerts', label: 'Overdue Alerts', value: true },
];

function SettingsTab() {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('society');
  const [societySettings, setSocietySettings] = useState<SocietySettings>({ name: '', registration_no: '', address: '', city: '', state: '', pin_code: '', phone: '', email: '' });
  const [bankSettings, setBankSettings] = useState<BankSettings>({ bank_name: '', account_number: '', ifsc_code: '', account_type: '' });
  const [billingSettings, setBillingSettings] = useState<BillingSettings>({ receipt_prefix: '', starting_no: 0, bill_prefix: '', financial_year: '' });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    {
      sms_notifications: true,
      email_notifications: true,
      whatsapp_notifications: false,
      payment_reminders: true,
      overdue_alerts: true,
    },
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([getSocietySettings(), getBankSettings(), getBillingSettings(), getNotificationSettings()])
      .then(([society, bank, billing, notifications]) => {
        setSocietySettings(society);
        setBankSettings(bank);
        setBillingSettings(billing);
        setNotificationSettings(notifications);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load settings.'));
  }, []);

  const saveChanges = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (activeTab === 'society') setSocietySettings(await updateSocietySettings(societySettings));
      if (activeTab === 'bank') setBankSettings(await updateBankSettings(bankSettings));
      if (activeTab === 'billing') setBillingSettings(await updateBillingSettings(billingSettings));
      if (activeTab === 'notifications') setNotificationSettings(await updateNotificationSettings(notificationSettings));
      setMessage('Settings saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (activeTab === 'society') {
      return (
        <Paper
          sx={{
            borderRadius: 3,
            border: '1px solid rgba(148,163,184,0.32)',
            boxShadow: 'none',
            bgcolor: '#f7f9fb',
            p: 0,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2.5, display: 'grid', gap: 2.2 }}>
            {societyFields.map((field) => (
              <Box key={field.label}>
                <Typography sx={{ fontSize: '1.04rem', fontWeight: 700, color: '#1f2a37', mb: 0.9 }}>{field.label}</Typography>
                <TextField
                  fullWidth
                  value={String(societySettings[field.key as keyof SocietySettings] ?? '')}
                  onChange={(event) => setSocietySettings((current) => ({ ...current, [field.key]: event.target.value }))}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#eef3f8',
                      borderRadius: 2,
                      height: 52,
                      fontSize: '1.05rem',
                      color: '#1f2a37',
                      '& fieldset': {
                        borderColor: '#dfe5ee',
                      },
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      );
    }

    if (activeTab === 'bank') {
      return (
        <Paper
          sx={{
            borderRadius: 3,
            border: '1px solid rgba(148,163,184,0.32)',
            boxShadow: 'none',
            bgcolor: '#f7f9fb',
            p: 0,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2.5, display: 'grid', gap: 2.2 }}>
            {bankFields.map((field) => (
              <Box key={field.label}>
                <Typography sx={{ fontSize: '1.04rem', fontWeight: 700, color: '#1f2a37', mb: 0.9 }}>{field.label}</Typography>
                <TextField
                  fullWidth
                  value={String(bankSettings[field.key as keyof BankSettings] ?? '')}
                  onChange={(event) => setBankSettings((current) => ({ ...current, [field.key]: event.target.value }))}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#eef3f8',
                      borderRadius: 2,
                      height: 52,
                      fontSize: '1.05rem',
                      color: '#1f2a37',
                      '& fieldset': {
                        borderColor: '#dfe5ee',
                      },
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      );
    }

    if (activeTab === 'billing') {
      return (
        <Paper
          sx={{
            borderRadius: 3,
            border: '1px solid rgba(148,163,184,0.32)',
            boxShadow: 'none',
            bgcolor: '#f7f9fb',
            p: 0,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2.5, display: 'grid', gap: 2.2 }}>
            {billingFields.map((field) => (
              <Box key={field.label}>
                <Typography sx={{ fontSize: '1.04rem', fontWeight: 700, color: '#1f2a37', mb: 0.9 }}>{field.label}</Typography>
                <TextField
                  fullWidth
                  value={String(billingSettings[field.key as keyof BillingSettings] ?? '')}
                  onChange={(event) => setBillingSettings((current) => ({ ...current, [field.key]: event.target.value }))}
                  type={field.key === 'starting_no' ? 'number' : 'text'}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#eef3f8',
                      borderRadius: 2,
                      height: 52,
                      fontSize: '1.05rem',
                      color: '#1f2a37',
                      '& fieldset': {
                        borderColor: '#dfe5ee',
                      },
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      );
    }

    return (
      <Paper
        sx={{
          borderRadius: 3,
          border: '1px solid rgba(148,163,184,0.32)',
          boxShadow: 'none',
          bgcolor: '#f7f9fb',
          p: 0,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, display: 'grid', gap: 1.5 }}>
          {notificationRows.map((row) => (
            <Box
              key={row.label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: row.label === notificationRows[notificationRows.length - 1].label ? 'none' : '1px solid rgba(148,163,184,0.12)',
                py: 1.2,
                px: 0.6,
              }}
            >
              <Typography sx={{ fontSize: '1.06rem', fontWeight: 700, color: '#1f2a37' }}>{row.label}</Typography>
              <Switch
                checked={notificationSettings[row.key]}
                onChange={(event) => setNotificationSettings((current) => ({ ...current, [row.key]: event.target.checked }))}
                sx={{
                  width: 58,
                  height: 32,
                  '& .MuiSwitch-switchBase': {
                    '&.Mui-checked': {
                      transform: 'translateX(26px)',
                      color: '#fff',
                    },
                  },
                  '& .MuiSwitch-thumb': {
                    width: 20,
                    height: 20,
                  },
                  '& .MuiSwitch-track': {
                    borderRadius: 18,
                    backgroundColor: notificationSettings[row.key] ? '#5b56f3' : '#d5dbe5',
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d2f38', lineHeight: 1.2 }}>
          Settings
        </Typography>

        <Button
          variant="contained"
          onClick={saveChanges}
          disabled={saving}
          sx={{
            borderRadius: 2.5,
            px: 2.6,
            py: 1.4,
            background: 'linear-gradient(180deg, #5a56f4 0%, #4c48dd 100%)',
            boxShadow: 'none',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1.05rem',
            '&:hover': { background: 'linear-gradient(180deg, #4c48dd 0%, #403dcf 100%)' },
          }}
        >
          Save Changes
        </Button>
      </Box>

      <Box
        sx={{
          display: 'inline-flex',
          p: 0.5,
          bgcolor: '#edf1f8',
          borderRadius: 3,
          mb: 2.5,
          border: '1px solid rgba(148,163,184,0.2)',
        }}
      >
        {TAB_ITEMS.map((item) => {
          const selected = activeTab === item.key;
          return (
            <Button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              variant={selected ? 'contained' : 'text'}
              sx={{
                minWidth: 135,
                borderRadius: 2.2,
                px: 2.2,
                py: 0.9,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                color: selected ? '#fff' : '#4b5565',
                background: selected ? 'linear-gradient(180deg, #5a56f4 0%, #4c48dd 100%)' : 'transparent',
                boxShadow: 'none',
                '&:hover': {
                  background: selected ? 'linear-gradient(180deg, #4c48dd 0%, #403dcf 100%)' : 'rgba(79,70,229,0.04)',
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>

      {renderContent()}
      {message ? <Alert severity={message.includes('Unable') ? 'error' : 'success'} onClose={() => setMessage('')} sx={{ mt: 2 }}>{message}</Alert> : null}
    </Box>
  );
}

export default SettingsTab;
