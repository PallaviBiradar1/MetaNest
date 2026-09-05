import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { createAdminUser, listAdminUsers, toggleAdminUserStatus, type AdminRole, type AdminUser } from '../../../services/adminUsersService';

interface UserDraft {
  name: string;
  email: string;
  phone: string;
  role: string;
}

const EMPTY_DRAFT: UserDraft = { name: '', email: '', phone: '', role: 'Admin' };

function displayUserName(user: AdminUser) {
  return user.name ?? ([user.first_name, user.last_name].filter(Boolean).join(' ') || user.email);
}

function apiRole(role: string): AdminRole {
  return role.toUpperCase().replace(/\s+/g, '_') as AdminRole;
}

function toTableUser(user: AdminUser) {
  const name = displayUserName(user);
  return {
    ...user,
    name,
    initials: name.charAt(0).toUpperCase(),
    role: user.role.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    status: (user.status ?? (user.is_active === false ? 'inactive' : 'active')).toLowerCase(),
    lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
    accent: '#cfe0ff',
  };
}

const USERS = [
  {
    name: 'Suresh Mehta',
    initials: 'S',
    role: 'Super Admin',
    email: 'suresh@epsilonhomes.in',
    status: 'active',
    lastLogin: '2024-07-03',
    accent: '#a6d0ff',
  },
  {
    name: 'Priya Sharma',
    initials: 'P',
    role: 'Admin',
    email: 'priya@epsilonhomes.in',
    status: 'active',
    lastLogin: '2024-07-02',
    accent: '#b4d1ff',
  },
  {
    name: 'Vikram Nair',
    initials: 'V',
    role: 'Treasurer',
    email: 'vikram@epsilonhomes.in',
    status: 'active',
    lastLogin: '2024-07-01',
    accent: '#cfe0ff',
  },
  {
    name: 'Ananya S',
    initials: 'A',
    role: 'Resident',
    email: 'ananya@email.com',
    status: 'active',
    lastLogin: '2024-07-03',
    accent: '#d5d7ff',
  },
  {
    name: 'Kedar M',
    initials: 'K',
    role: 'Security',
    email: 'kedar@epsilonhomes.in',
    status: 'inactive',
    lastLogin: '2024-06-15',
    accent: '#dfe7ff',
  },
];

const INITIAL_USERS = USERS.map((user, index) => ({ ...user, id: `mock-${index}` }));

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  'Super Admin': { bg: '#fbe0e4', color: '#d53152' },
  Admin: { bg: '#dfe8ff', color: '#4b66d9' },
  Treasurer: { bg: '#fdf0d8', color: '#b77a1a' },
  Resident: { bg: '#dff5ed', color: '#2a8b62' },
  Security: { bg: '#e2e8f0', color: '#4f5d75' },
};

function UsersRolesTab() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<ReturnType<typeof toTableUser>[]>(INITIAL_USERS);
  const [draft, setDraft] = useState<UserDraft>(EMPTY_DRAFT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    listAdminUsers()
      .then((response) => {
        if (mounted && response.length > 0) setUsers(response.map(toTableUser));
      })
      .catch(() => {
        if (mounted) setMessage('Unable to load users. Showing saved demo users.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const updateDraft = (field: keyof UserDraft, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const closeDialog = () => {
    setOpen(false);
    setDraft(EMPTY_DRAFT);
  };

  const saveUser = async () => {
    if (!draft.name.trim() || !draft.email.trim() || !draft.phone.trim() || saving) return;
    const [firstName, ...lastNameParts] = draft.name.trim().split(/\s+/);
    setSaving(true);
    try {
      const created = await createAdminUser({
        first_name: firstName,
        last_name: lastNameParts.join(' '),
        email: draft.email.trim(),
        phone_number: draft.phone.trim(),
        role: apiRole(draft.role),
      });
      setUsers((current) => [toTableUser(created), ...current]);
      closeDialog();
      setMessage('User created successfully.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Users & Roles API is not available')) {
        const localUser: AdminUser = {
          id: `local-${Date.now()}`,
          name: draft.name.trim(),
          email: draft.email.trim(),
          phone_number: draft.phone.trim(),
          role: apiRole(draft.role),
        };
        setUsers((current) => [toTableUser(localUser), ...current]);
        closeDialog();
        setMessage('User added locally. Configure the backend API to persist it.');
      } else {
        setMessage(error instanceof Error ? error.message : 'Unable to create user.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d2f38', lineHeight: 1.2 }}>
          Users &amp; Roles
        </Typography>

        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            py: 1.2,
            background: 'linear-gradient(180deg, #5a56f4 0%, #4c48dd 100%)',
            boxShadow: 'none',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1.05rem',
            '&:hover': { background: 'linear-gradient(180deg, #4c48dd 0%, #403dcf 100%)' },
          }}
        >
          + Add User
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, border: '1px solid rgba(148,163,184,0.35)', boxShadow: 'none', bgcolor: '#f7f9fb', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(148,163,184,0.05)' }}>
                {['Name', 'Role', 'Email', 'Status', 'Last Login', 'Actions'].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontSize: '0.76rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.09em',
                      color: '#5f6878',
                      fontWeight: 800,
                      py: 1.7,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => {
                const roleStyle = ROLE_COLORS[user.role] ?? { bg: '#dfe8ff', color: '#4250d6' };
                const status = user.status === 'active' ? 'active' : 'inactive';
                return (
                  <TableRow key={user.email} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                    <TableCell sx={{ py: 1.7, borderBottom: '1px solid rgba(148,163,184,0.18)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: user.accent, color: '#374151', fontSize: '0.9rem', fontWeight: 700 }}>
                          {user.initials}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, color: '#1f2a37', fontSize: '1rem' }}>{user.name}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.7, borderBottom: '1px solid rgba(148,163,184,0.18)' }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.2,
                          py: 0.4,
                          borderRadius: 1.4,
                          bgcolor: roleStyle.bg,
                          color: roleStyle.color,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {user.role}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.7, borderBottom: '1px solid rgba(148,163,184,0.18)', color: '#49566a', fontWeight: 500 }}>
                      {user.email}
                    </TableCell>

                    <TableCell sx={{ py: 1.7, borderBottom: '1px solid rgba(148,163,184,0.18)' }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.2,
                          py: 0.4,
                          borderRadius: 1.5,
                          bgcolor: status === 'active' ? '#dff6ea' : '#fbe3e5',
                          color: status === 'active' ? '#1c8d5d' : '#d04c4f',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                        }}
                      >
                        {status}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.7, borderBottom: '1px solid rgba(148,163,184,0.18)', color: '#5a6575', fontWeight: 500 }}>
                      {user.lastLogin}
                    </TableCell>

                    <TableCell sx={{ py: 1.7, borderBottom: '1px solid rgba(148,163,184,0.18)' }}>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          sx={{ color: '#4a5366' }}
                          aria-label={`Toggle ${status} user`}
                          onClick={async () => {
                            try {
                              const updated = await toggleAdminUserStatus(user.id);
                              setUsers((current) => current.map((item) => item.id === user.id ? toTableUser(updated) : item));
                              setMessage('User status updated.');
                            } catch (error) {
                              setMessage(error instanceof Error ? error.message : 'Unable to update user status.');
                            }
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#4a5366' }} aria-label="User deletion unavailable">
                          <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={open}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 0.6,
              boxShadow: '0 18px 45px rgba(16, 24, 40, 0.12)',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800, fontSize: '2rem', px: 3, pt: 2.3, pb: 1.8, color: '#2f3746' }}>
          <Box>Add User</Box>
          <IconButton aria-label="close" onClick={closeDialog} sx={{ color: '#667085' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 1.5 }}>
          <Stack spacing={2.1} sx={{ mt: 0.5 }}>
            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2a37', mb: 0.85 }}>Full Name</Typography>
              <TextField fullWidth value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} slotProps={{ htmlInput: { style: { color: '#1f2a37' } } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#f3f6fb', height: 52 } }} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2a37', mb: 0.85 }}>Email</Typography>
              <TextField fullWidth type="email" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} slotProps={{ htmlInput: { style: { color: '#1f2a37' } } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#f3f6fb', height: 52 } }} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2a37', mb: 0.85 }}>Phone</Typography>
              <TextField fullWidth value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} slotProps={{ htmlInput: { style: { color: '#1f2a37' } } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#f3f6fb', height: 52 } }} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2a37', mb: 0.85 }}>Role</Typography>
              <FormControl fullWidth>
                <Select
                  value={draft.role}
                  onChange={(event) => updateDraft('role', event.target.value)}
                  sx={{
                    height: 52,
                    borderRadius: 2,
                    background: '#f3f6fb',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dfe6f2' },
                  }}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Super Admin">Super Admin</MenuItem>
                  <MenuItem value="Treasurer">Treasurer</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Resident">Resident</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.4, pt: 1.4, justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={closeDialog}
            sx={{
              minWidth: 110,
              borderRadius: 2,
              background: '#f4f5f7',
              color: '#4a5262',
              textTransform: 'none',
              fontWeight: 700,
              py: 1.1,
              '&:hover': { background: '#ebedf0' },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={saveUser}
            disabled={saving || !draft.name.trim() || !draft.email.trim() || !draft.phone.trim()}
            variant="contained"
            sx={{
              minWidth: 124,
              borderRadius: 2,
              background: 'linear-gradient(180deg, #5a56f4 0%, #4c48dd 100%)',
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 700,
              py: 1.1,
              '&:hover': { background: 'linear-gradient(180deg, #4c48dd 0%, #403dcf 100%)' },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Alert
        severity={message.startsWith('Unable') ? 'warning' : 'success'}
        onClose={() => setMessage('')}
        sx={{ position: 'fixed', right: 24, bottom: 24, display: message ? 'flex' : 'none' }}
      >
        {message || (loading ? 'Loading users...' : '')}
      </Alert>
    </Box>
  );
}

export default UsersRolesTab;
