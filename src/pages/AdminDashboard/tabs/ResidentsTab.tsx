import { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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

type ResidentType = 'Owner' | 'Tenant';

type Resident = {
  id: string;
  name: string;
  type: ResidentType;
  flat: string;
  phone: string;
  moveIn: string;
  family: number;
  status: 'active';
};

const INITIAL_RESIDENTS: Resident[] = [
  { id: 'r1', name: 'Rajesh Kumar', type: 'Owner', flat: 'A-001', phone: '+91 98765 43210', moveIn: '2018-06-01', family: 4, status: 'active' },
  { id: 'r2', name: 'Sunita Verma', type: 'Owner', flat: 'A-002', phone: '+91 87654 32109', moveIn: '2019-03-15', family: 3, status: 'active' },
  { id: 'r3', name: 'Amit Joshi', type: 'Tenant', flat: 'A-002', phone: '+91 76543 21098', moveIn: '2023-01-15', family: 2, status: 'active' },
  { id: 'r4', name: 'Vikram Singh', type: 'Owner', flat: 'A-101', phone: '+91 65432 10987', moveIn: '2019-03-20', family: 3, status: 'active' },
  { id: 'r5', name: 'Meera Patel', type: 'Owner', flat: 'A-102', phone: '+91 54321 09876', moveIn: '2020-07-10', family: 5, status: 'active' },
  { id: 'r6', name: 'Kavya R', type: 'Tenant', flat: 'A-103', phone: '+91 43210 98765', moveIn: '2022-11-01', family: 1, status: 'active' },
  { id: 'r7', name: 'Anita Desai', type: 'Owner', flat: 'A-104', phone: '+91 32109 87654', moveIn: '2017-09-15', family: 2, status: 'active' },
  { id: 'r8', name: 'Ramesh Gupta', type: 'Owner', flat: 'B-001', phone: '+91 98712 34567', moveIn: '2016-04-01', family: 4, status: 'active' },
  { id: 'r9', name: 'Lakshmi Iyer', type: 'Owner', flat: 'B-002', phone: '+91 87601 23456', moveIn: '2018-01-20', family: 3, status: 'active' },
];

function ResidentsTab() {
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [activeType, setActiveType] = useState<'All' | ResidentType>('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    fullName: '',
    flatNumber: '',
    phone: '',
    email: '',
    moveInDate: '',
    familyMembers: '',
    type: 'Owner' as ResidentType,
  });

  const filteredResidents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return residents.filter((resident) => {
      const typeMatch = activeType === 'All' || resident.type === activeType;
      const textMatch =
        !query ||
        resident.name.toLowerCase().includes(query) ||
        resident.flat.toLowerCase().includes(query) ||
        resident.phone.toLowerCase().includes(query);
      return typeMatch && textMatch;
    });
  }, [activeType, residents, search]);

  const saveResident = () => {
    const nextResident: Resident = {
      id: `r${Date.now()}`,
      name: draft.fullName.trim(),
      type: draft.type,
      flat: draft.flatNumber.trim(),
      phone: draft.phone.trim(),
      moveIn: draft.moveInDate,
      family: Number(draft.familyMembers) || 1,
      status: 'active',
    };

    setResidents((prev) => [nextResident, ...prev]);
    setModalOpen(false);
    setDraft({
      fullName: '',
      flatNumber: '',
      phone: '',
      email: '',
      moveInDate: '',
      familyMembers: '',
      type: 'Owner',
    });
  };

  const summaryCounts: Record<'All' | 'Owner' | 'Tenant', number> = {
    All: residents.length,
    Owner: residents.filter((r) => r.type === 'Owner').length,
    Tenant: residents.filter((r) => r.type === 'Tenant').length,
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d3748', lineHeight: 1.2 }}>
            Resident Management
          </Typography>
          <Typography sx={{ mt: 1, color: '#697386', fontSize: '1.05rem' }}>{residents.length} registered</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{
            bgcolor: '#4f46e5',
            borderRadius: 2.5,
            px: 3,
            py: 1.6,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#4338ca' },
          }}
        >
          + Add Resident
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'inline-flex', gap: 1, bgcolor: 'rgba(148,163,184,0.12)', p: 0.6, borderRadius: 2.5 }}>
          {(['All', 'Owner', 'Tenant'] as const).map((type) => {
            const selected = activeType === type;
            return (
              <Button
                key={type}
                onClick={() => setActiveType(type)}
                variant={selected ? 'contained' : 'text'}
                sx={{
                  minWidth: 100,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: selected ? '#4f46e5' : 'transparent',
                  color: selected ? '#fff' : '#4b5563',
                  '&:hover': { bgcolor: selected ? '#4338ca' : 'rgba(148,163,184,0.08)' },
                }}
              >
                {type} ({summaryCounts[type]})
              </Button>
            );
          })}
        </Box>

        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or flat..."
          size="small"
          sx={{ width: 260, bgcolor: 'rgba(255,255,255,0.35)', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: 'rgba(148, 163, 184, 0.35)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(148,163,184,0.08)' }}>
                <TableCell sx={{ fontWeight: 800, color: '#495469', letterSpacing: '0.05em', fontSize: '0.75rem', py: 1.7 }}>NAME</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#495469', letterSpacing: '0.05em', fontSize: '0.75rem', py: 1.7 }}>TYPE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#495469', letterSpacing: '0.05em', fontSize: '0.75rem', py: 1.7 }}>FLAT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#495469', letterSpacing: '0.05em', fontSize: '0.75rem', py: 1.7 }}>PHONE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#495469', letterSpacing: '0.05em', fontSize: '0.75rem', py: 1.7 }}>MOVE-IN</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#495469', letterSpacing: '0.05em', fontSize: '0.75rem', py: 1.7 }}>FAMILY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#495469', letterSpacing: '0.05em', fontSize: '0.75rem', py: 1.7 }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#495469', letterSpacing: '0.05em', fontSize: '0.75rem', py: 1.7, textAlign: 'right' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResidents.map((resident) => (
                <TableRow key={resident.id} hover sx={{ '& td': { py: 1.8, borderBottom: '1px solid rgba(148,163,184,0.18)' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#2d3748',
                          bgcolor: 'rgba(148,163,184,0.14)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {resident.name[0]}
                      </Box>
                      <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#2f3746' }}>{resident.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resident.type}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: resident.type === 'Owner' ? '#e9e8ff' : '#fef3c7',
                        color: resident.type === 'Owner' ? '#4f46e5' : '#b45309',
                        borderRadius: 1.25,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2f3746' }}>{resident.flat}</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 500 }}>{resident.phone}</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 500 }}>{resident.moveIn}</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 500 }}>{resident.family}</TableCell>
                  <TableCell>
                    <Chip
                      label={resident.status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#d1fae5',
                        color: '#047857',
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <IconButton size="small" aria-label="edit"><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" aria-label="delete"><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '2rem', pb: 1 }}>Add Resident</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 1 }}>
            <TextField label="Full Name" value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} />
            <TextField label="Flat Number" value={draft.flatNumber} onChange={(e) => setDraft({ ...draft, flatNumber: e.target.value })} />
            <TextField label="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            <TextField label="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <TextField
              label="Move-in Date"
              type="date"
              value={draft.moveInDate}
              onChange={(e) => setDraft({ ...draft, moveInDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField label="Family Members" value={draft.familyMembers} onChange={(e) => setDraft({ ...draft, familyMembers: e.target.value })} />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography sx={{ fontWeight: 700, mb: 0.75 }}>Type</Typography>
              <Select fullWidth value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as ResidentType })}>
                <MenuItem value="Owner">Owner</MenuItem>
                <MenuItem value="Tenant">Tenant</MenuItem>
              </Select>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ minWidth: 120, borderRadius: 2, bgcolor: '#e5e7eb', color: '#1f2937', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={saveResident} variant="contained" sx={{ minWidth: 120, borderRadius: 2, bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, fontWeight: 700 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default ResidentsTab;
