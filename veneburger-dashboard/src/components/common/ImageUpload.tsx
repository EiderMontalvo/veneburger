import { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

interface ImageUploadProps {
  initialImage?: string | null;
  onImageChange: (file: File | null) => void;
  label?: string;
  folder?: string;
  height?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  initialImage = null, 
  onImageChange, 
  label = "Imagen", 
  folder = "productos",
  height = 200 
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialImage) {
      // Si existe una imagen inicial, mostrarla
      if (initialImage === 'default.png') {
        setPreview('/images/default.png');
      } else {
        setPreview(`/api/uploads/${folder}/${initialImage}`);
      }
    }
  }, [initialImage, folder]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Crear URL para previsualización
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setPreview(fileReader.result as string);
      };
      fileReader.readAsDataURL(selectedFile);
      
      // Notificar al componente padre
      onImageChange(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      
      {preview ? (
        <Box sx={{ position: 'relative', width: 'fit-content' }}>
          <img 
            src={preview} 
            alt="Previsualización" 
            style={{ 
              height: height, 
              maxWidth: '100%', 
              borderRadius: '8px',
              objectFit: 'contain'
            }} 
          />
          <IconButton 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              bgcolor: 'rgba(255,255,255,0.7)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
            onClick={handleRemoveImage}
            size="small"
          >
            <Delete />
          </IconButton>
        </Box>
      ) : (
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUpload />}
          sx={{ mb: 2 }}
        >
          Subir imagen
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </Button>
      )}
    </Box>
  );
};

export default ImageUpload;