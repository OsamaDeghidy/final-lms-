import React, { useState } from 'react';
import { Box, Typography, IconButton, Alert } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const BannerContainer = styled(Box)(({ theme, textColor, bgColor }) => ({
  width: '100%',
  backgroundColor: bgColor || '#f5f5f5',
  color: textColor || '#000000',
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  position: 'relative',
  zIndex: theme.zIndex.appBar + 1,
  borderBottom: `1px solid ${textColor || '#000000'}20`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 1.5),
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

const ContentBox = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

const CloseButton = styled(IconButton)(({ textColor }) => ({
  color: textColor || '#000000',
  padding: 4,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
}));

const BannerNotification = ({ notification, onClose }) => {
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed || !notification) {
    return null;
  }

  const handleClose = () => {
    setIsClosed(true);
    if (onClose) {
      onClose(notification.id);
    }
  };

  const handleActionClick = () => {
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <BannerContainer
      textColor={notification.text_color}
      bgColor={notification.background_color}
    >
      <ContentBox>
        {notification.title && (
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: notification.text_color }}
          >
            {notification.title}
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{ color: notification.text_color, lineHeight: 1.6 }}
        >
          {notification.message}
        </Typography>
        {notification.action_url && (
          <Typography
            variant="body2"
            component="a"
            href={notification.action_url}
            onClick={(e) => {
              e.preventDefault();
              handleActionClick();
            }}
            sx={{
              color: notification.text_color,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 600,
              mt: 1,
            }}
          >
            {notification.action_text || 'عرض المزيد'}
          </Typography>
        )}
      </ContentBox>
      <CloseButton
        textColor={notification.text_color}
        onClick={handleClose}
        size="small"
        aria-label="إغلاق"
      >
        <CloseIcon fontSize="small" />
      </CloseButton>
    </BannerContainer>
  );
};

export default BannerNotification;


