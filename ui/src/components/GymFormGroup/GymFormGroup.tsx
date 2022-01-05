import * as React from 'react';
import {FormControlLabel, Switch} from '@mui/material';

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
        <FormControlLabel control={<Switch defaultChecked={props.defaultChecked}/>} label={props.gymName}
                          onChange={handleChange} labelPlacement="top"/>
    );
}
