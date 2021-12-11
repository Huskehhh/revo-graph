import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { FormControlLabel, Switch } from '@mui/material';
import { GymData } from '../GymList/GymList';

export interface GymFormGroupProps {
    gymName: string,
    gymId: number,
    defaultChecked: boolean,
    onToggle: (gymId: number) => void,
};

export default function GymFormGroup(props: GymFormGroupProps) {
    const handleChange = () => {
        props.onToggle(props.gymId)
    };

    return (
        <FormControlLabel control={<Switch defaultChecked={props.defaultChecked} />} label={props.gymName} onChange={handleChange} labelPlacement="top" />
    );
}
