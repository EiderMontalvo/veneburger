// src/pages/admin/settings/SpecialDays.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Chip, Tooltip, Button, CircularProgress,
  TextField, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Switch
} from '@mui/material';
import { 
  Add, Edit, Delete, AccessTime, CheckCircle, Cancel
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { daysService, DiaEspecial, DiaEspecialInput } from '../../../services/daysService';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

// Componente principal de Días Especiales
const SpecialDays = () => {
  const [diasEspeciales, setDiasEspeciales] = useState<DiaEspecial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  
  // Estados para diálogo de crear/editar
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentDay, setCurrentDay] = useState<DiaEspecialInput | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Estados para diálogo de confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; dayId: number | null }>({
    open: false,
    dayId: null
  });

  // Cargar días especiales
  const loadSpecialDays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let params: { desde?: string; hasta?: string; activo?: boolean } = {};
      
      // Si hay un mes seleccionado, filtrar por ese mes
      if (filterMonth) {
        const [year, month] = filterMonth.split('-');
        
        // Primer día del mes
        const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
        // Último día del mes
        const lastDay = new Date(parseInt(year), parseInt(month), 0);
        
        params.desde = format(firstDay, 'yyyy-MM-dd');
        params.hasta = format(lastDay, 'yyyy-MM-dd');
      }
      
      const data = await daysService.listarDiasEspeciales(params);
      setDiasEspeciales(data);
    } catch (err) {
      console.error('Error al cargar días especiales:', err);
      setError('No se pudieron cargar los días especiales. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filterMonth]);

  useEffect(() => {
    loadSpecialDays();
  }, [loadSpecialDays]);

  // Manejar cambio de mes para filtro
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterMonth(e.target.value);
  };

  // Abrir diálogo para crear
  const handleCreate = () => {
    // Inicializar con valores por defecto
    setCurrentDay({
      fecha: format(new Date(), 'yyyy-MM-dd'),
      tipo: 'horario_especial',
      hora_apertura: '10:00',
      hora_cierre: '22:00',
      activo: true
    });
    setEditId(null);
    setDialogError(null);
    setDialogOpen(true);
  };

  // Abrir diálogo para editar
  const handleEdit = async (id: number) => {
    try {
      setSaving(true);
      const dia = await daysService.obtenerDiaPorId(id);
      const fechaFormateada = dia.fecha.substring(0, 10);
      
      setCurrentDay({
        fecha: fechaFormateada,
        tipo: dia.tipo,
        hora_apertura: dia.hora_apertura,
        hora_cierre: dia.hora_cierre,
        activo: dia.activo
      });
      
      setEditId(id);
      setDialogError(null);
      setDialogOpen(true);
    } catch (err) {
      console.error('Error al obtener día especial:', err);
      setError('No se pudo cargar la información del día especial.');
    } finally {
      setSaving(false);
    }
  };

  // Guardar día especial (crear o actualizar)
  const handleSave = async () => {
    if (!currentDay) return;
    
    try {
      setSaving(true);
      setDialogError(null);
      
      // Validaciones básicas
      if (!currentDay.fecha) {
        setDialogError('La fecha es obligatoria');
        setSaving(false);
        return;
      }
      
      if (currentDay.tipo === 'horario_especial') {
        if (!currentDay.hora_apertura || !currentDay.hora_cierre) {
          setDialogError('Los horarios de apertura y cierre son obligatorios');
          setSaving(false);
          return;
        }
      }
      
      if (editId) {
        // Actualizar
        await daysService.actualizarDiaEspecial(editId, currentDay);
      } else {
        // Crear nuevo
        await daysService.crearDiaEspecial(currentDay);
      }
      
      // Recargar datos y cerrar diálogo
      loadSpecialDays();
      setDialogOpen(false);
    } catch (err: any) {
      console.error('Error al guardar día especial:', err);
      setDialogError(err.response?.data?.message || 'Ocurrió un error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.dayId) return;
    
    try {
      setLoading(true);
      await daysService.eliminarDiaEspecial(deleteDialog.dayId);
      
      // Recargar datos
      loadSpecialDays();
      // Cerrar diálogo
      setDeleteDialog({ open: false, dayId: null });
    } catch (err: any) {
      console.error('Error al eliminar día especial:', err);
      setError(err.response?.data?.message || 'No se pudo eliminar el día especial');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio en campos del formulario
  const handleDayChange = (field: keyof DiaEspecialInput, value: any) => {
    if (!currentDay) return;
    
    setCurrentDay(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return dateString; // En caso de error, devolver la cadena original
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Días Especiales
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleCreate}
        >
          Nuevo Día Especial
        </Button>
      </Box>

      {/* Filtro por mes */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Filtrar por mes"
            type="month"
            value={filterMonth}
            onChange={handleMonthChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 650 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Horario</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diasEspeciales.length > 0 ? (
                  diasEspeciales.map((dia) => (
                    <TableRow key={dia.id}>
                      <TableCell>{formatDate(dia.fecha)}</TableCell>
                      <TableCell>
                        {dia.tipo === 'horario_especial' ? (
                          <Chip 
                            icon={<AccessTime fontSize="small" />} 
                            label="Horario especial" 
                            color="primary" 
                            variant="outlined" 
                          />
                        ) : (
                          <Chip 
                            icon={<Cancel fontSize="small" />} 
                            label="Cerrado" 
                            color="error" 
                            variant="outlined" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {dia.tipo === 'horario_especial' ? (
                          `${dia.hora_apertura} - ${dia.hora_cierre}`
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No aplica
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={dia.activo ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                          label={dia.activo ? 'Activo' : 'Inactivo'}
                          color={dia.activo ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton 
                            onClick={() => handleEdit(dia.id)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            onClick={() => setDeleteDialog({ open: true, dayId: dia.id })}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No hay días especiales configurados para el período seleccionado
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Diálogo para crear/editar día especial */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editId ? 'Editar Día Especial' : 'Crear Día Especial'}
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {dialogError}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Fecha */}
            <TextField
              label="Fecha"
              type="date"
              value={currentDay?.fecha || ''}
              onChange={(e) => handleDayChange('fecha', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            {/* Tipo de día especial */}
            <FormControl>
              <FormLabel>Tipo de día especial</FormLabel>
              <RadioGroup
                row
                value={currentDay?.tipo || 'horario_especial'}
                onChange={(e) => handleDayChange('tipo', e.target.value)}
              >
                <FormControlLabel 
                  value="horario_especial" 
                  control={<Radio />} 
                  label="Horario especial" 
                />
                <FormControlLabel 
                  value="cerrado" 
                  control={<Radio />} 
                  label="Cerrado" 
                />
              </RadioGroup>
            </FormControl>

            {/* Horarios (solo si es horario especial) */}
            {currentDay?.tipo === 'horario_especial' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Hora de apertura"
                  type="time"
                  value={currentDay.hora_apertura || ''}
                  onChange={(e) => handleDayChange('hora_apertura', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  fullWidth
                />
                <TextField
                  label="Hora de cierre"
                  type="time"
                  value={currentDay.hora_cierre || ''}
                  onChange={(e) => handleDayChange('hora_cierre', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  fullWidth
                />
              </Box>
            )}

            {/* Estado activo/inactivo */}
            <FormControlLabel
              control={
                <Switch
                  checked={currentDay?.activo || false}
                  onChange={(e) => handleDayChange('activo', e.target.checked)}
                  color="primary"
                />
              }
              label="Activo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            disabled={saving}
            onClick={() => setDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : undefined}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, dayId: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar día especial"
        message="¿Estás seguro de eliminar este día especial? Esta acción no se puede deshacer."
        confirmText="Eliminar"
      />
    </Box>
  );
};

export default SpecialDays;