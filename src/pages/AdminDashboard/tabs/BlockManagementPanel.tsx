import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  createWing,
  deleteWing,
  getFlats,
  getFloors,
  getSociety,
  getWings,
  updateWing,
} from '../../../services/apartmentMasterService';
import type { Wing } from '../../../types/apartmentMaster';

// Wing stats (total flats / occupied) have no stored field on the backend --
// they're derived from that wing's Floors and Flats. We fetch and compute them
// per wing rather than storing them as editable inputs.
interface WingWithStats extends Wing {
  totalFlats: number;
  occupiedFlats: number;
}

async function loadWingStats(wing: Wing): Promise<WingWithStats> {
  const floors = await getFloors(wing.id);
  const totalFlats = floors.reduce((sum, floor) => sum + floor.total_flats, 0);

  const flats = await getFlats({ wing: wing.id });
  const occupiedFlats = flats.filter((flat) => flat.occupancy_status?.toLowerCase() === 'occupied').length;

  return { ...wing, totalFlats, occupiedFlats };
}

function WingCard({
  wing,
  onEdit,
  onDelete,
}: {
  wing: WingWithStats;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const occupancyPct = wing.totalFlats > 0 ? Math.round((wing.occupiedFlats / wing.totalFlats) * 100) : 0;

  return (
    <Paper
      variant="outlined"
      sx={{ flex: '1 1 280px', minWidth: 260, borderRadius: 3, borderColor: 'rgba(148, 163, 184, 0.35)', p: 2.5 }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', fontWeight: 800, borderRadius: 2, fontSize: '11.25px' }}>
          {wing.name}
        </Avatar>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={onEdit} aria-label={`Edit Wing ${wing.name}`}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDelete} aria-label={`Delete Wing ${wing.name}`}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Typography sx={{ fontWeight: 800, fontSize: '16.8px' }}>{`Wing ${wing.name}`}</Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 2 }}>
        {[
          { label: 'Floors', value: wing.total_floors },
          { label: 'Total', value: wing.totalFlats },
          { label: 'Occupied', value: wing.occupiedFlats },
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              flex: 1,
              textAlign: 'center',
              bgcolor: 'rgba(148, 163, 184, 0.08)',
              borderRadius: 2,
              py: 1,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: '11.25px' }}>{stat.value}</Typography>
            <Typography sx={{ fontSize: '11.25px', color: 'text.secondary' }}>{stat.label}</Typography>
          </Box>
        ))}
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: '11.25px', color: 'text.secondary' }}>Occupancy</Typography>
        <Typography sx={{ fontSize: '11.25px', fontWeight: 700 }}>{occupancyPct}%</Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={occupancyPct}
        sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(148, 163, 184, 0.2)' }}
      />
    </Paper>
  );
}

function BlockManagementPanel() {
  const [societyId, setSocietyId] = useState<number | null>(null);
  const [wings, setWings] = useState<WingWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [saving, setSaving] = useState(false);

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
        if (cancelled) return;
        setSocietyId(society.id);

        const wingList = await getWings(society.id);
        const withStats = await Promise.all(wingList.map(loadWingStats));
        if (!cancelled) setWings(withStats);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load wings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setNameDraft('');
    setDialogOpen(true);
  };

  const openEdit = (wing: WingWithStats) => {
    setEditingId(wing.id);
    setNameDraft(wing.name);
    setDialogOpen(true);
  };

  const removeWing = async (id: number) => {
    const previous = wings;
    setWings((prev) => prev.filter((w) => w.id !== id));
    try {
      await deleteWing(id);
    } catch (err) {
      setWings(previous);
      setError(err instanceof Error ? err.message : 'Could not delete wing.');
    }
  };

  const save = async () => {
    if (!nameDraft.trim() || !societyId || saving) return;
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const updated = await updateWing(editingId, { name: nameDraft.trim() });
        setWings((prev) => prev.map((w) => (w.id === editingId ? { ...w, ...updated } : w)));
      } else {
        const created = await createWing({ society: societyId, name: nameDraft.trim() });
        setWings((prev) => [...prev, { ...created, totalFlats: 0, occupiedFlats: 0 }]);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save wing.');
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
          <Typography sx={{ fontWeight: 800, fontSize: '22.5px' }}>Block Management</Typography>
          <Typography sx={{ fontSize: '11.25px', color: 'text.secondary' }}>
            Manage wings/blocks within your society
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={openAdd}
          disabled={!societyId}
          sx={{ bgcolor: '#0f172a', fontSize: '11.25px', '&:hover': { bgcolor: '#1e293b' } }}
        >
          Add Block
        </Button>
      </Stack>

      {error ? (
        <Typography sx={{ color: 'error.main', fontWeight: 600, fontSize: '11.25px' }}>{error}</Typography>
      ) : null}

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        {wings.map((wing) => (
          <WingCard
            key={wing.id}
            wing={wing}
            onEdit={() => openEdit(wing)}
            onDelete={() => removeWing(wing.id)}
          />
        ))}
        {wings.length === 0 && !error ? (
          <Typography sx={{ fontSize: '11.25px', color: 'text.secondary' }}>
            No wings yet. Click "Add Block" to create one.
          </Typography>
        ) : null}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '16.8px' }}>
          {editingId ? 'Edit Block' : 'Add Block'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Wing Name (e.g. A)"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              sx={{ '& .MuiInputBase-input': { fontSize: '11.25px' }, '& .MuiInputLabel-root': { fontSize: '11.25px' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontSize: '11.25px' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || !nameDraft.trim()}
            sx={{ bgcolor: '#0f172a', fontSize: '11.25px', '&:hover': { bgcolor: '#1e293b' } }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default BlockManagementPanel;