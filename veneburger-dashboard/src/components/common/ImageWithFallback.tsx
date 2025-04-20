import React, { useState } from 'react';
import { Box, BoxProps } from '@mui/material';

interface ImageWithFallbackProps extends Omit<BoxProps, 'component'>{
    src: string;
    alt: string;
    fallbackSrc: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    fallbackSrc,
    sx,
    ...props
}) => {
    const [hasError, setHasError] = useState(false);
    return (
        <Box
        component="img"
        src={hasError ? fallbackSrc : src}
        alt={alt}
        onError={() => setHasError(true)}
        sx={{
          width: 50,
          height: 50,
          objectFit: 'cover',
          borderRadius: 1,
          ...sx
        }}
        {...props}
      /> 
    );
};
export default ImageWithFallback;