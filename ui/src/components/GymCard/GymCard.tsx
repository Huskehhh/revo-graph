import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import './GymCard.css';

export interface GymCardProps {
    title: string,
    gymId: number,
    button: boolean,
};

export default function GymCard(props: GymCardProps) {
    return (
        <div className={"gym-card"}>
            <Card sx={{ minWidth: 275 }}>
                <CardContent>
                    {props.title}
                </CardContent>
                <CardActions>
                    {props.button &&
                        <Link to={"/gym/" + props.gymId}><Button size="small">View graph</Button></Link>}
                </CardActions>
            </Card>
        </div>
    );
}
