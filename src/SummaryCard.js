import { Card, CardContent, Typography, Box, CardActionArea } from "@mui/material";
import { Link } from "react-router-dom";

function SummaryCard({ title, value, icon, color = "primary.main", bgColor = "primary.light", linkTo }) {
  const innerContent = (
    <CardContent sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: bgColor,
            color: color,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
        {value}
      </Typography>
    </CardContent>
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      {linkTo ? (
        <CardActionArea component={Link} to={linkTo} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          {innerContent}
        </CardActionArea>
      ) : (
        innerContent
      )}
    </Card>
  );
}

export default SummaryCard;
