// src/components/common/ImageUpload.tsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  IconButton
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { getImageUrl } from '../../utils/imageUtils';
import { deleteFile } from '../../services/uploadService';

interface ImageUploadProps {
  initialImage?: string | null;
  onImageChange: (file: File | null) => void;
  label?: string;
  folder: 'productos' | 'categorias' | 'comprobantes';
  height?: number;
  width?: string | number;
}

const ImageUpload = ({
  initialImage,
  onImageChange,
  label = 'Subir imagen',
  folder,
  height = 200,
  width = '100%'
}: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Al iniciar o cuando cambia initialImage, actualizar la vista previa
  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(getImageUrl(folder, initialImage));
    } else {
      setPreviewUrl(null);
    }
  }, [initialImage, folder]);
  
  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    
    // Verificar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    
    // Verificar tamaño máximo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB.');
      return;
    }
    
    // Generar vista previa
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Notificar al componente padre
    onImageChange(file);
  };
  
  // Eliminar imagen
  const handleRemoveImage = async () => {
    setIsLoading(true);
    try {
      // Si hay una imagen del servidor (no es una vista previa local)
      if (initialImage && !previewUrl?.startsWith('data:') && !previewUrl?.startsWith('blob:')) {
        console.log('Eliminando imagen:', initialImage);
        await deleteFile(folder, initialImage);
      }
      
      // Limpiar la vista previa y notificar al padre
      setPreviewUrl(null);
      onImageChange(null);
      
      // Resetear el campo de entrada
      const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {label}
      </Typography>
      
      {previewUrl ? (
        <Box sx={{ position: 'relative', mb: 2, width: '100%' }}>
          <img 
            src={previewUrl} 
            alt="Vista previa" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: height,
              width: width,
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(211,47,47,0.8)'
              }
            }}
            onClick={handleRemoveImage}
            size="small"
            disabled={isLoading}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box 
          sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: '4px',
            height: height,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography variant="body2" color="textSecondary" align="center">
            No hay imagen seleccionada
          </Typography>
        </Box>
      )}
      
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUpload />}
        sx={{ width: '100%' }}
      >
        Seleccionar Imagen
        <input
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </Button>
    </Box>
  );
};

export default ImageUpload;