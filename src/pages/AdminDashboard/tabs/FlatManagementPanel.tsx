import { useEffect, useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
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
import StatCard from '../StatCard';
import {
  createFlat,
  deleteFlat,
  getFlatTypes,
  getFlats,
  getFloors,
  getSociety,
  getWings,
  updateFlat,
} from '../../../services/apartmentMasterService';
import type { Flat, FlatType, Floor, Wing } from '../../../types/apartmentMaster';

// ---------------------------------------------------------------------------
// TODO(backend): Flat has no owner/parking/maintenance fields yet -- the model
// docstring says these "belong to other modules" (People/Finance) which aren't
// wired up here. Keeping deterministic mock values per flat.id until then, so
// the UI isn't misleadingly empty -- replace with real data once those
// modules expose a flat-level join.
// ---------------------------------------------------------------------------
const OWNER_POOL = [
  'Rajesh Kumar', 'Sunita Verma', 'Deepak Malhotra', 'Priya Nair', 'Vikram Singh',
  'Meera Patel', 'Suresh Reddy', 'Anita Desai', 'Ramesh Gupta', 'Lakshmi Iyer',
];
const MAINTENANCE_BY_TYPE: Record<string, number> = { '1BHK': 2500, '2BHK': 3500, '3BHK': 4500 };

function mockOwner(flatId: number): string {
  return OWNER_POOL[flatId % OWNER_POOL.length];
}
function mockParking(flat: Flat, floor: Floor | undefined, unitIndexOnFloor: number): string | undefined {
  return floor?.floor_number === 0 && unitIndexOnFloor < 3 ? `P-${String(flat.id).padStart(3, '0')}` : undefined;
}
function mockMaintenance(flatTypeName: string): number {
  return MAINTENANCE_BY_TYPE[flatTypeName] ?? 3000;
}

type StatusFilter = 'all' | 'occupied' | 'vacant';

interface FlatFormState {
  floor: string;
  flat_type: string;
  flat_number: string;
  carpet_area_sqft: string;
  built_up_area_sqft: string;
  facing: string;
}

const EMPTY_DRAFT: FlatFormState = {
  floor: '',
  flat_type: '',
  flat_number: '',
  carpet_area_sqft: '',
  built_up_area_sqft: '',
  facing: '',
};

function FlatManagementPanel() {
  const [wings, setWings] = useState<Wing[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [flatTypes, setFlatTypes] = useState<FlatType[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [wingFilter, setWingFilter] = useState<'all' | number>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<FlatFormState>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const floorsById = useMemo(() => new Map(floors.map((f) => [f.id, f])), [floors]);
  const wingsById = useMemo(() => new Map(wings.map((w) => [w.id, w])), [wings]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const society = await getSociety();
        if (!society) {
          if (!cancelled) setError('No society record found. Create one first under Society Details.');
          return;
        }
        const [wingList, floorList, typeList, flatList] = await Promise.all([
          getWings(society.id),
          getFloors(),
          getFlatTypes(),
          getFlats(),
        ]);
        if (!cancelled) {
          setWings(wingList);
          setFloors(floorList);
          setFlatTypes(typeList);
          setFlats(flatList);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load flats.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const wingOptions = useMemo(
    () => [{ id: 'all' as const, label: 'All' }, ...wings.map((w) => ({ id: w.id, label: `Wing ${w.name}` }))],
    [wings],
  );

  const total = flats.length;
  const occupied = flats.filter((f) => f.occupancy_status?.toLowerCase() === 'occupied').length;
  const vacant = total - occupied;
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  // Index of each flat within its floor (for the ground-floor-parking mock rule)
  const unitIndexByFlatId = useMemo(() => {
    const counters = new Map<number, number>();
    const result = new Map<number, number>();
    for (const flat of flats) {
      const idx = counters.get(flat.floor) ?? 0;
      result.set(flat.id, idx);
      counters.set(flat.floor, idx + 1);
    }
    return result;
  }, [flats]);

  const visibleFlats = flats.filter((flat) => {
    const floor = floorsById.get(flat.floor);
    const matchesWing = wingFilter === 'all' || floor?.wing === wingFilter;
    const matchesStatus = statusFilter === 'all' || flat.occupancy_status?.toLowerCase() === statusFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      flat.flat_number.toLowerCase().includes(query) ||
      mockOwner(flat.id).toLowerCase().includes(query);
    return matchesWing && matchesStatus && matchesSearch;
  });

  const removeFlat = async (id: number) => {
    const previous = flats;
    setFlats((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteFlat(id);
    } catch (err) {
      setFlats(previous);
      setError(err instanceof Error ? err.message : 'Could not delete flat.');
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setDraft({ ...EMPTY_DRAFT, floor: floors[0] ? String(floors[0].id) : '', flat_type: flatTypes[0] ? String(flatTypes[0].id) : '' });
    setDialogOpen(true);
  };

  const openEdit = (flat: Flat) => {
    setEditingId(flat.id);
    setDraft({
      floor: String(flat.floor),
      flat_type: String(flat.flat_type),
      flat_number: flat.flat_number,
      carpet_area_sqft: flat.carpet_area_sqft,
      built_up_area_sqft: flat.built_up_area_sqft ?? '',
      facing: flat.facing,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!draft.floor || !draft.flat_type || !draft.flat_number.trim() || !draft.carpet_area_sqft || saving) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        floor: Number(draft.floor),
        flat_type: Number(draft.flat_type),
        flat_number: draft.flat_number.trim(),
        carpet_area_sqft: Number(draft.carpet_area_sqft),
        built_up_area_sqft: draft.built_up_area_sqft ? Number(draft.built_up_area_sqft) : undefined,
        facing: draft.facing || undefined,
      };
      if (editingId) {
        const updated = await updateFlat(editingId, payload);
        setFlats((prev) => prev.map((f) => (f.id === editingId ? updated : f)));
      } else {
        const created = await createFlat(payload);
        setFlats((prev) => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save flat.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Flat Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {total} flats across {wings.length} wings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={openAdd}
          disabled={floors.length === 0 || flatTypes.length === 0}
          sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
        >
          Add Flat
        </Button>
      </Stack>

      {error ? <Typography sx={{ color: 'error.main', fontWeight: 600 }}>{error}</Typography> : null}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <StatCard label="Total" value={String(total)} footerText={`${wings.length} wings`} />
        <StatCard
          label="Occupied"
          value={String(occupied)}
          valueColor="#1FA971"
          footerText={`${occupancyPct}% occupancy`}
          footerColor="#1FA971"
        />
        <StatCard
          label="Vacant"
          value={String(vacant)}
          valueColor="#B98900"
          footerText={`${100 - occupancyPct}% vacant`}
          footerColor="#B98900"
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
        <TextField
          placeholder="Search flat or owner..."
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: 'inline-flex', bgcolor: 'rgba(148, 163, 184, 0.12)', borderRadius: 3, p: 0.5, gap: 0.5 }}>
          {wingOptions.map((option) => {
            const isActive = wingFilter === option.id;
            return (
              <ButtonBase
                key={option.id}
                onClick={() => setWingFilter(option.id)}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 2.5,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: isActive ? '#fff' : 'text.primary',
                  bgcolor: isActive ? '#0f172a' : 'transparent',
                }}
              >
                {option.label}
              </ButtonBase>
            );
          })}
        </Box>

        <Select
          size="small"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          sx={{ minWidth: 150 }}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="occupied">Occupied</MenuItem>
          <MenuItem value="vacant">Vacant</MenuItem>
        </Select>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: 'rgba(148, 163, 184, 0.35)' }}>
        <TableContainer>
          <Table sx={{ '& .MuiTableCell-root': { fontSize: '11.25px' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Flat No.</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Wing</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Floor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Area</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Parking</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Maint.</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleFlats.map((flat) => {
                const floor = floorsById.get(flat.floor);
                const wing = floor ? wingsById.get(floor.wing) : undefined;
                const unitIndex = unitIndexByFlatId.get(flat.id) ?? 0;
                const parking = mockParking(flat, floor, unitIndex);
                const isOccupied = flat.occupancy_status?.toLowerCase() === 'occupied';

                return (
                  <TableRow key={flat.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{flat.flat_number}</TableCell>
                    <TableCell>
                      <Chip label={wing ? `Wing ${wing.name}` : '—'} size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>{floor?.floor_number ?? '—'}</TableCell>
                    <TableCell>
                      <Chip label={flat.flat_type_name} size="small" color="secondary" variant="outlined" />
                    </TableCell>
                    <TableCell>{flat.carpet_area_sqft}</TableCell>
                    <TableCell>
                      <Chip
                        label={flat.occupancy_status || 'unknown'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: isOccupied ? '#E7F8F0' : 'rgba(148, 163, 184, 0.15)',
                          color: isOccupied ? '#1FA971' : 'text.secondary',
                        }}
                      />
                    </TableCell>
                    <TableCell>{mockOwner(flat.id)}</TableCell>
                    <TableCell>
                      {parking ? (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <DirectionsCarIcon fontSize="inherit" />
                          <span>{parking}</span>
                        </Stack>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>₹{mockMaintenance(flat.flat_type_name).toLocaleString('en-IN')}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(flat)} aria-label={`Edit ${flat.flat_number}`}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => removeFlat(flat.id)}
                        aria-label={`Delete ${flat.flat_number}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {visibleFlats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    No flats match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingId ? 'Edit Flat' : 'Add Flat'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Select
              fullWidth
              value={draft.floor}
              onChange={(event) => setDraft((prev) => ({ ...prev, floor: event.target.value }))}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Floor
              </MenuItem>
              {floors.map((floor) => {
                const wing = wingsById.get(floor.wing);
                return (
                  <MenuItem key={floor.id} value={String(floor.id)}>
                    {wing ? `Wing ${wing.name}` : ''} — Floor {floor.floor_number} {floor.name ? `(${floor.name})` : ''}
                  </MenuItem>
                );
              })}
            </Select>

            <Select
              fullWidth
              value={draft.flat_type}
              onChange={(event) => setDraft((prev) => ({ ...prev, flat_type: event.target.value }))}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Flat Type
              </MenuItem>
              {flatTypes.map((type) => (
                <MenuItem key={type.id} value={String(type.id)}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>

            <TextField
              fullWidth
              label="Flat Number (e.g. 101, 101-A)"
              value={draft.flat_number}
              onChange={(event) => setDraft((prev) => ({ ...prev, flat_number: event.target.value }))}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Carpet Area (sqft)"
                type="number"
                value={draft.carpet_area_sqft}
                onChange={(event) => setDraft((prev) => ({ ...prev, carpet_area_sqft: event.target.value }))}
              />
              <TextField
                fullWidth
                label="Built-up Area (sqft, optional)"
                type="number"
                value={draft.built_up_area_sqft}
                onChange={(event) => setDraft((prev) => ({ ...prev, built_up_area_sqft: event.target.value }))}
              />
            </Stack>

            <Select
              fullWidth
              value={draft.facing}
              onChange={(event) => setDraft((prev) => ({ ...prev, facing: event.target.value }))}
              displayEmpty
            >
              <MenuItem value="">Facing (optional)</MenuItem>
              <MenuItem value="N">North</MenuItem>
              <MenuItem value="S">South</MenuItem>
              <MenuItem value="E">East</MenuItem>
              <MenuItem value="W">West</MenuItem>
              <MenuItem value="NE">North-East</MenuItem>
              <MenuItem value="NW">North-West</MenuItem>
              <MenuItem value="SE">South-East</MenuItem>
              <MenuItem value="SW">South-West</MenuItem>
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || !draft.floor || !draft.flat_type || !draft.flat_number.trim() || !draft.carpet_area_sqft}
            sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default FlatManagementPanel;