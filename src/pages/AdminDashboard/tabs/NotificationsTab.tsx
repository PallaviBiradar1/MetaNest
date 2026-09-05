import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { listAdminNotifications, markAllAdminNotificationsRead } from '../../../services/adminSettingsService';

const NOTIFICATIONS = [
  {
    type: 'payment',
    title: 'Payment Received',
    description: '₹3,500 received from Rajesh Kumar for flat A-001 — Jul 2024',
    time: '2 hours ago',
    unread: true,
    iconColor: '#1ca67a',
    icon: <CheckCircleOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    type: 'alert',
    title: 'Overdue Alert',
    description: 'Flat C-003 (Rekha Menon) maintenance overdue by 56 days — ₹4,500 pending',
    time: '1 day ago',
    unread: true,
    iconColor: '#e24a4a',
    icon: <ErrorOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    type: 'society',
    title: 'Society AGM',
    description: 'Annual General Meeting scheduled for July 20, 2024 at 6:00 PM',
    time: '2 days ago',
    unread: false,
    iconColor: '#8b93a3',
    icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    type: 'payment',
    title: 'Payment Received',
    description: '₹4,500 received from Lakshmi Iyer for flat B-002 — Jul 2024',
    time: '2 days ago',
    unread: true,
    iconColor: '#1ca67a',
    icon: <CheckCircleOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    type: 'bill',
    title: 'Bills Generated',
    description: 'Monthly maintenance bills for July 2024 generated for 54 occupied flats',
    time: '3 days ago',
    unread: false,
    iconColor: '#8b93a3',
    icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 22 }} />,
  },
];

function NotificationsTab() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(NOTIFICATIONS.filter((item) => item.unread).length);
  const [error, setError] = useState('');

  useEffect(() => {
    listAdminNotifications()
      .then((response) => {
        setUnreadCount(response.unread_count);
        setNotifications(response.results.map((item) => ({
          type: item.notification_type,
          title: item.title,
          description: item.message,
          time: new Date(item.created_at).toLocaleString(),
          unread: item.is_read === false,
          iconColor: item.is_read ? '#8b93a3' : '#1ca67a',
          icon: item.notification_type === 'PAYMENT_RECEIVED'
            ? <CheckCircleOutlinedIcon sx={{ fontSize: 22 }} />
            : item.notification_type === 'OVERDUE_ALERT'
              ? <ErrorOutlinedIcon sx={{ fontSize: 22 }} />
              : item.notification_type === 'BILLS_GENERATED'
                ? <CalendarTodayOutlinedIcon sx={{ fontSize: 22 }} />
                : <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />,
        })));
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load notifications.'));
  }, []);

  const markAllRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      setUnreadCount(0);
      setNotifications((current) => current.map((item) => ({ ...item, unread: false, iconColor: '#8b93a3' })));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update notifications.');
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d2f38', lineHeight: 1.2 }}>
          Notifications
        </Typography>

        <Button
          variant="contained"
          onClick={markAllRead}
          sx={{
            background: '#f1f3f8',
            color: '#4a5366',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2.5,
            px: 2.2,
            py: 1.1,
            boxShadow: 'none',
            '&:hover': { background: '#e9edf5' },
          }}
        >
          Mark All Read
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2a37' }}>{unreadCount} unread</Typography>
      </Box>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Stack spacing={1.6}>
        {notifications.map((item, index) => (
          <Paper
            key={`${item.title}-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.32)',
              boxShadow: 'none',
              bgcolor: item.unread ? '#f7faff' : '#f5f7fb',
              px: 2.2,
              py: 1.35,
              minHeight: 68,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: item.unread ? '#edf9f3' : '#f1f3f8',
                  color: item.iconColor,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2a37', lineHeight: 1.3 }}>
                  {item.title}
                </Typography>

                <Typography sx={{ fontSize: '1rem', color: '#5d6977', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.description}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
              <Typography sx={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>{item.time}</Typography>
              {item.unread && (
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', background: '#ef5555', display: 'inline-block' }} />
              )}
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

export default NotificationsTab;
