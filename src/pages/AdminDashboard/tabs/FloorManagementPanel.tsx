import { useEffect, useMemo, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
import {
  createFloor,
  deleteFloor,
  getFloors,
  getSociety,
  getWings,
  updateFloor,
} from '../../../services/apartmentMasterService';
import type { Floor, Wing } from '../../../types/apartmentMaster';

const FLOOR_LABELS: Record<number, string> = {
  0: 'Ground Floor',
  1: '1st Floor',
  2: '2nd Floor',
  3: '3rd Floor',
};

function floorLabel(floor: Floor): string {
  if (floor.name) return floor.name;
  if (floor.floor_number < 0) return `Basement ${Math.abs(floor.floor_number)}`;
  return FLOOR_LABELS[floor.floor_number] ?? `${floor.floor_number}th Floor`;
}

interface FloorFormState {
  wing: string;
  floor_number: string;
  name: string;
}

const EMPTY_DRAFT: FloorFormState = { wing: '', floor_number: '', name: '' };

function FloorManagementPanel() {
  const [wings, setWings] = useState<Wing[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeWing, setActiveWing] = useState<'all' | number>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<FloorFormState>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

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
        const wingList = await getWings(society.id);
        const floorList = await getFloors();
        if (!cancelled) {
          setWings(wingList);
          setFloors(floorList);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load floors.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filterOptions = useMemo(
    () => [{ id: 'all' as const, label: 'All Wings' }, ...wings.map((w) => ({ id: w.id, label: `Wing ${w.name}` }))],
    [wings],
  );

  const visibleFloors =
    activeWing === 'all' ? floors : floors.filter((f) => f.wing === activeWing);

  const openAdd = () => {
    setEditingId(null);
    setDraft({ ...EMPTY_DRAFT, wing: wings[0] ? String(wings[0].id) : '' });
    setDialogOpen(true);
  };

  const openEdit = (floor: Floor) => {
    setEditingId(floor.id);
    setDraft({ wing: String(floor.wing), floor_number: String(floor.floor_number), name: floor.name });
    setDialogOpen(true);
  };

  const removeFloor = async (id: number) => {
    const previous = floors;
    setFloors((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteFloor(id);
    } catch (err) {
      setFloors(previous);
      setError(err instanceof Error ? err.message : 'Could not delete floor.');
    }
  };

  const save = async () => {
    if (!draft.wing || draft.floor_number.trim() === '' || saving) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        wing: Number(draft.wing),
        floor_number: Number(draft.floor_number),
        name: draft.name.trim(),
      };
      if (editingId) {
        const updated = await updateFloor(editingId, payload);
        setFloors((prev) => prev.map((f) => (f.id === editingId ? updated : f)));
      } else {
        const created = await createFloor(payload);
        setFloors((prev) => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save floor.');
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
            Floor Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage floors across every wing
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={openAdd}
          disabled={wings.length === 0}
          sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
        >
          Add Floor
        </Button>
      </Stack>

      {error ? <Typography sx={{ color: 'error.main', fontWeight: 600 }}>{error}</Typography> : null}

      <Box
        sx={{
          display: 'inline-flex',
          bgcolor: 'rgba(148, 163, 184, 0.12)',
          borderRadius: 3,
          p: 0.5,
          gap: 0.5,
          width: 'fit-content',
        }}
      >
        {filterOptions.map((option) => {
          const isActive = activeWing === option.id;
          return (
            <ButtonBase
              key={option.id}
              onClick={() => setActiveWing(option.id)}
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: 2.5,
                fontSize: '13.125px',
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

      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: 'rgba(148, 163, 184, 0.35)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Wing</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Floor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Flats</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleFloors.map((floor) => {
                const wing = wingsById.get(floor.wing);
                return (
                  <TableRow key={floor.id} hover>
                    <TableCell>
                      <Chip
                        label={wing ? `Wing ${wing.name}` : '—'}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '11.25px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '13.125px' }}>{floorLabel(floor)}</TableCell>
                    <TableCell>{floor.floor_number}</TableCell>
                    <TableCell>{floor.total_flats}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(floor)} aria-label={`Edit ${floorLabel(floor)}`}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => removeFloor(floor.id)}
                        aria-label={`Delete ${floorLabel(floor)}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {visibleFloors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    No floors to show.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingId ? 'Edit Floor' : 'Add Floor'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Select
              fullWidth
              value={draft.wing}
              onChange={(event) => setDraft((prev) => ({ ...prev, wing: event.target.value }))}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Wing
              </MenuItem>
              {wings.map((wing) => (
                <MenuItem key={wing.id} value={String(wing.id)}>
                  Wing {wing.name}
                </MenuItem>
              ))}
            </Select>
            <TextField
              fullWidth
              label="Floor Number (0 = Ground, negative = basement)"
              type="number"
              value={draft.floor_number}
              onChange={(event) => setDraft((prev) => ({ ...prev, floor_number: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Floor Name (optional, e.g. Mezzanine)"
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || !draft.wing || draft.floor_number.trim() === ''}
            sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default FloorManagementPanel;